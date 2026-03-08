import { Prisma, Role, Status } from '@prisma/client';
import { z } from 'zod';
import { prisma } from '../db';
import { sendEmail } from '../email';
import { authenticate } from '../middleware';
import { t } from '../t';
import { getQuestions } from './questions';
import { getSettings } from './settings';
import type { AuthSession, User, AuthUser, StatusChange } from '@prisma/client';
import {
	DeleteObjectCommand,
	PutObjectCommand,
	S3Client,
	GetObjectCommand,
} from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';
import { removeInvalidTeamMembers } from './team';
import natural from 'natural';
const { WordTokenizer } = natural;
import { removeStopwords } from 'stopword';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';
import { hash } from '@node-rs/argon2';
import * as auth from '$lib/authenticate';
import { IDENTITY_QUESTION } from '$lib/constants';
import { canApply } from './admissions';
import path from 'path';

dayjs.extend(utc);
dayjs.extend(timezone);

const s3Client = new S3Client({ region: process.env.AWS_REGION });

export const usersRouter = t.router({
	/**
	 * Gets all data on the user with the given ID. User must be an
	 * admin. If no ID is given, returns the logged in user's data, or
	 * throws an error if the user is not logged in.
	 *
	 * NOTE: If you only need authentication/authorization info, use
	 * `locals.auth.validateUser()` instead. This will save you a
	 * database query.
	 */
	get: t.procedure
		.input(z.string().optional())
		.query(
			async (
				req,
			): Promise<Prisma.UserGetPayload<{ include: { authUser: true; decision: true } }>> => {
				const { session, user } = await auth.validateSessionToken(
					req.ctx.cookies.get('session') ?? '',
				);
				if (session === null) {
					throw new Error('Unauthorized');
				}

				if (req.input === undefined) {
					return await prisma.user.findUniqueOrThrow({
						where: { authUserId: user.id },
						include: { authUser: true, decision: true },
					});
				} else {
					if (!user.roles.includes('ADMIN') && !user.roles.includes('ORGANIZER')) {
						throw new Error('Forbidden');
					}
					return await prisma.user.findUniqueOrThrow({
						where: { authUserId: req.input },
						include: { authUser: true, decision: true },
					});
				}
			},
		),

	/**
	 * Gets the date when the logged-in user submitted their application.
	 * Returns null if the user has never submitted an application.
	 */
	getAppliedDate: t.procedure
		.use(authenticate(['UNDECLARED', 'HACKER', 'MENTOR', 'JUDGE', 'VOLUNTEER']))
		.query(async (req): Promise<Date | null> => {
			const userId = (
				await prisma.user.findUniqueOrThrow({
					where: { authUserId: req.ctx.user.id },
					select: { authUserId: true },
				})
			).authUserId;

			const appliedDate = await prisma.statusChange.findFirst({
				where: { userId: userId, newStatus: 'APPLIED' },
				orderBy: { id: 'desc' },
				select: { timestamp: true },
			});

			if (!appliedDate?.timestamp) {
				return null;
			}

			return dayjs
				.utc(new Date(appliedDate.timestamp))
				.tz((await getSettings()).timezone, false)
				.toDate();
		}),

	/**
	 * Sets the logged in user to the given data. If the user has
	 * finished their application, they will be un-applied.
	 *
	 * NOTE: This function does not perform any input validations.
	 * Maybe it should?
	 */
	update: t.procedure
		.use(authenticate(['HACKER', 'UNDECLARED', 'MENTOR', 'JUDGE', 'VOLUNTEER']))
		.input(z.record(z.any()))
		.mutation(async (req): Promise<void> => {
			if (!(await canApply()) || req.ctx.user.status !== 'CREATED') {
				return;
			}
			// Validate application
			const questions = await getQuestions();
			// eslint-disable-next-line @typescript-eslint/no-explicit-any
			const application: Record<string, any> = {};
			const oldApplication = (
				await prisma.user.findUniqueOrThrow({
					where: { authUserId: req.ctx.user.id },
				})
			).application as Record<string, unknown>;
			for (const question of questions) {
				if (question.type === 'FILE') {
					// Get previously uploaded file and delete it
					if (
						req.input[question.id] instanceof File &&
						req.input[question.id].size > 0 &&
						req.input[question.id].size <= question.maxSizeMB * 1024 * 1024
					) {
						const key = `${req.ctx.user.id}/${question.id}`;
						const deleteObjectCommand = new DeleteObjectCommand({
							Bucket: process.env.S3_BUCKET,
							Key: key,
						});
						await s3Client.send(deleteObjectCommand);
						const putObjectCommand = new PutObjectCommand({
							Bucket: process.env.S3_BUCKET,
							Key: key,
							Body: Buffer.from(await req.input[question.id].arrayBuffer()),
							ContentType: req.input[question.id].type,
						});
						await s3Client.send(putObjectCommand);
						application[question.id] = req.input[question.id].name;
					} else {
						application[question.id] = oldApplication[question.id];
					}
				} else {
					application[question.id] = req.input[question.id];
				}
			}
			await prisma.user.update({
				where: { authUserId: req.ctx.user.id },
				data: { application },
			});
			// Remove user from pending decision pool
			await prisma.decision.deleteMany({
				where: { userId: req.ctx.user.id },
			});
		}),

	/**
	 * Attempts to submit the user's application. Returns a dictionary
	 * containing questions with validation errors, if any.
	 */
	submitApplication: t.procedure
		.use(authenticate(['UNDECLARED', 'HACKER', 'MENTOR', 'JUDGE', 'VOLUNTEER']))
		.input(z.enum(['HACKER', 'MENTOR', 'JUDGE', 'VOLUNTEER']))
		.mutation(async (req): Promise<Record<string, string>> => {
			// Ensure applications are open and the user has not received a decision yet
			if (!(await canApply()) || req.ctx.user.status !== 'CREATED') {
				return {};
			}
			// Validate the user's data
			// TODO: We assume the data is the correct type here. Maybe we should validate it?
			// Better yet, we can validate it in trpc.users.update
			const errors: Record<string, string> = {};
			const questions = await prisma.question.findMany();
			const user = await prisma.user.findUniqueOrThrow({
				where: { authUserId: req.ctx.user.id },
			});
			// eslint-disable-next-line @typescript-eslint/no-explicit-any
			const application = user.application as Record<string, any>;
			for (const question of questions) {
				const answer = application[question.id];
				if (answer === undefined || answer === null || answer === false || answer === '') {
					if (
						question.required &&
						(question.targetGroup.includes(req.input) || question.targetGroup.length === 0)
					) {
						errors[question.id] = 'This field is required.';
					}
					// Must skip validation for unanswered questions, not only to avoid type errors,
					// but also because it doesn't make sense to validate an unanswered question
					// (for example, telling the user their file doesn't end in the right extension
					// when they haven't uploaded a file yet)
					continue;
				} else if (
					(question.type === 'SENTENCE' || question.type === 'PARAGRAPH') &&
					question.regex !== null
				) {
					if (!new RegExp(question.regex).test(answer)) {
						errors[question.id] = 'This field must match the given pattern: ' + question.regex;
					}
				} else if (question.type === 'NUMBER') {
					if (question.min !== null && answer < question.min) {
						errors[question.id] = `This field must be at least ${question.min}.`;
					} else if (question.max !== null && answer > question.max) {
						errors[question.id] = `This field must be at most ${question.max}.`;
					}
					// Possible TODO: Also check step? I invoke YAGNI for now
					// If you're a future programmer and you need step validation,
					// do be mindful of floating point imprecision
				} else if (question.type === 'DROPDOWN') {
					if (
						question.multiple &&
						!question.custom &&
						answer.some((item: string) => !question.options.includes(item))
					) {
						errors[question.id] = 'This field must be one of the given options.';
					} else if (!question.multiple && !question.custom && !question.options.includes(answer)) {
						errors[question.id] = 'This field must be one of the given options.';
					}
				} else if (question.type === 'RADIO') {
					if (!question.options.includes(answer)) {
						errors[question.id] = 'This field must be one of the given options.';
					}
				} else if (question.type === 'FILE') {
					if (
						question.accept !== '' &&
						!question.accept
							.replaceAll(' ', '')
							.split(',')
							.some((type) => new RegExp(type + '$').test(answer))
					) {
						errors[question.id] =
							'This file must end with one of the following extensions: ' + question.accept;
					}
				}
			}
			// Update status to applied if there are no errors
			if (Object.keys(errors).length === 0) {
				await prisma.authUser.update({
					where: { id: req.ctx.user.id },
					data: { status: 'APPLIED', roles: [req.input] },
				});
				// Auto-tag based on hard-coded student identity question
				const tagMap: Record<string, { isOOS: boolean; isTexas: boolean; isUT: boolean }> = {
					'UT Student': { isUT: true, isOOS: false, isTexas: false },
					'In-State Texas Student': { isTexas: true, isOOS: false, isUT: false },
					'OOS Student': { isOOS: true, isTexas: false, isUT: false },
				};
				const tags = tagMap[application[IDENTITY_QUESTION.id]] ?? {
					isOOS: false,
					isTexas: false,
					isUT: false,
				};
				await prisma.user.update({
					where: { authUserId: req.ctx.user.id },
					data: tags,
				});
				// notify user through their email on successful application submission
				const subject = 'Thanks for submitting!';
				const settings = await getSettings();
				await sendEmail(
					req.ctx.user.email,
					subject,
					settings.submitTemplate,
					settings.submitIsHTML,
				);
			}
			return errors;
		}),

	/**
	 * Withdraws the logged in user's application. Throws an error if
	 * user has not submitted their application yet.
	 */
	withdrawApplication: t.procedure
		.use(authenticate(['UNDECLARED', 'HACKER', 'MENTOR', 'JUDGE', 'VOLUNTEER']))
		.mutation(async (req): Promise<void> => {
			if (!(await canApply()) || req.ctx.user.status !== 'APPLIED') {
				return;
			}
			await prisma.authUser.update({
				where: { id: req.ctx.user.id },
				data: { status: 'CREATED' },
			});
			const subject = 'Application Withdrawal Warning';
			const settings = await getSettings();
			await sendEmail(
				req.ctx.user.email,
				subject,
				settings.withdrawalWarningTemplate,
				settings.withdrawIsHTML,
			);
		}),

	/**
	 * Gets the RSVP deadline for the logged-in user based on their acceptance date.
	 * Returns null if no deadline is set or user was not accepted.
	 */
	getRSVPDeadline: t.procedure
		.use(authenticate(['HACKER', 'UNDECLARED', 'MENTOR', 'JUDGE', 'VOLUNTEER']))
		.query(async (req): Promise<Date | null> => {
			return await getRSVPDeadline(req.ctx.user);
		}),

	/**
	 * Confirms or declines the logged in user's acceptance.
	 */
	rsvp: t.procedure
		.use(authenticate(['HACKER', 'UNDECLARED', 'MENTOR', 'JUDGE', 'VOLUNTEER']))
		.input(z.enum(['CONFIRMED', 'DECLINED']))
		.mutation(async (req): Promise<void> => {
			const deadline = await getRSVPDeadline(req.ctx.user);
			if (req.input === 'CONFIRMED') {
				// Hackers should only be able to confirm before deadline
				if (req.ctx.user.status === 'ACCEPTED' && (deadline === null || new Date() < deadline)) {
					const settings = await getSettings();
					await prisma.authUser.update({
						where: { id: req.ctx.user.id },
						data: { status: 'CONFIRMED' },
					});
					await sendEmail(
						req.ctx.user.email,
						'Thanks for your RSVP!',
						settings.confirmTemplate,
						settings.confirmIsHTML,
					);
				}
			} else {
				// Hackers should be able to decline after accepting and/or the deadline
				if (req.ctx.user.status === 'ACCEPTED' || req.ctx.user.status === 'CONFIRMED') {
					const settings = await getSettings();
					await prisma.authUser.update({
						where: { id: req.ctx.user.id },
						data: { status: 'DECLINED' },
					});
					await sendEmail(
						req.ctx.user.email,
						'Thanks for your RSVP!',
						settings.declineTemplate,
						settings.declineIsHTML,
					);
				}
			}
		}),

	/**
	 * Creates a new user with the given email and password. Returns
	 * the resulting session or null if the user already exists.
	 */
	register: t.procedure
		.input(z.object({ email: z.string().trim().toLowerCase(), password: z.string().min(8) }))
		.mutation(async (req): Promise<AuthSession | null> => {
			try {
				const passwordHash = await auth.hashPassword(req.input.password);
				const user = await prisma.authUser.create({
					data: {
						id: crypto.randomUUID(),
						email: req.input.email,
						hashedPassword: passwordHash,
						roles: ['UNDECLARED'],
						status: 'CREATED',
					},
				});
				const session = await auth.createSession(user.id);
				auth.setSessionTokenCookie(req.ctx, session.id, session.expiresAt);

				return session;
			} catch (e) {
				if (e instanceof PrismaClientKnownRequestError && e.code === 'P2002') {
					// Email already exists
					return null;
				}
				throw e;
			}
		}),

	/**
	 * Creates a new user with the given GitHub ID and username. Returns
	 * the resulting session or null if the user already exists.
	 * This is used for GitHub OAuth login.
	 */
	registerGitHub: t.procedure
		.input(z.object({ id: z.number(), username: z.string(), email: z.string().optional() }))
		.mutation(async (req): Promise<AuthSession | null> => {
			try {
				const email = req.input.email || '';
				const user = await prisma.authUser.create({
					data: {
						id: crypto.randomUUID(),
						email: email,
						githubId: req.input.id,
						githubUsername: req.input.username,
						roles: ['UNDECLARED'],
						status: 'CREATED',
						verifiedEmail: true,
					},
				});
				const session = await auth.createSession(user.id);
				auth.setSessionTokenCookie(req.ctx, session.id, session.expiresAt);

				return session;
			} catch (e) {
				if (e instanceof PrismaClientKnownRequestError && e.code === 'P2002') {
					return null;
				}
				throw e;
			}
		}),

	/**
	 * Gets the user with the given GitHub ID, or null if no such user exists.
	 **/
	getUserFromGitHubId: t.procedure
		.input(z.number())
		.query(async (req): Promise<AuthUser | null> => {
			try {
				const user = await prisma.authUser.findFirst({
					where: { githubId: req.input },
				});
				return user;
			} catch (e) {
				return null;
			}
		}),

	/**
	 * Creates a new user with the given Google ID, username, and email. Returns
	 * the resulting session or null if the user already exists.
	 * This is used for Google OAuth login.
	 */
	registerGoogle: t.procedure
		.input(z.object({ id: z.string(), username: z.string(), email: z.string().optional() }))
		.mutation(async (req): Promise<AuthSession | null> => {
			try {
				const email = req.input.email || '';
				const user = await prisma.authUser.create({
					data: {
						id: crypto.randomUUID(),
						email: email,
						googleId: req.input.id,
						goodleUsername: req.input.username,
						roles: ['UNDECLARED'],
						status: 'CREATED',
						verifiedEmail: true,
					},
				});
				const session = await auth.createSession(user.id);
				auth.setSessionTokenCookie(req.ctx, session.id, session.expiresAt);
				return session;
			} catch (e) {
				if (e instanceof PrismaClientKnownRequestError && e.code === 'P2002') {
					return null;
				}
				throw e;
			}
		}),

	/**
	 * Gets the user with the given Google ID, or null if no such user exists.
	 */
	getUserFromGoogleId: t.procedure
		.input(z.string())
		.query(async (req): Promise<AuthUser | null> => {
			try {
				const user = await prisma.authUser.findFirst({
					where: { googleId: req.input },
				});
				return user;
			} catch (e) {
				return null;
			}
		}),

	/**
	 * Sends an email verification link to the logged in user.
	 * Invalidates all other email verification tokens for the user.
	 * Throws an error if the user is already verified.
	 */
	sendVerificationEmail: t.procedure.use(authenticate()).mutation(async (req): Promise<void> => {
		if (req.ctx.user.verifiedEmail) {
			return;
		}
		const token = await auth.emailVerificationToken.issue(req.ctx.user.id);
		let link = `${process.env.DOMAIN_NAME}/login/verify-email/${token}`;
		link = `<a href="${link}">${link}</a>`;
		const body =
			'Click on the following link to verify your email address:<br><br>' +
			link +
			'<br><br>If you did not request this email, please ignore it.';
		await sendEmail(req.ctx.user.email, 'Email Verification', body, true);
	}),

	/**
	 * Sends a password reset email to the given email address.
	 * Invalidates all other password reset tokens for the user.
	 */
	sendPasswordResetEmail: t.procedure
		.input(z.object({ email: z.string().trim().toLowerCase() }))
		.mutation(async (req): Promise<void> => {
			const user = await prisma.authUser.findUnique({
				where: { email: req.input.email },
			});
			if (user !== null) {
				const token = await auth.resetPasswordToken.issue(user.id);
				let link = `${process.env.DOMAIN_NAME}/login/reset-password?token=${token}`;
				link = `<a href="${link}">${link}</a>`;
				const body =
					'Click on the following link to reset your password (valid for 10 minutes):<br><br>' +
					link;
				await sendEmail(user.email, 'Password Reset', body, true);
			}
		}),

	/**
	 * Verifies the email address for the given user, invalidating all
	 * other email verification tokens. Throws an error if the token is
	 * invalid or expired.
	 */
	verifyEmail: t.procedure.input(z.string()).mutation(async (req): Promise<void> => {
		const userId = await auth.emailVerificationToken.validate(req.input);
		await prisma.authUser.update({
			where: { id: userId },
			data: { verifiedEmail: true },
		});
	}),

	/**
	 * Resets the password for the given user, invalidating all other
	 * sessions and password reset tokens. Returns a new session. Throws
	 * an error if the token is invalid or expired.
	 */
	resetPassword: t.procedure
		.input(z.object({ token: z.string(), password: z.string().min(8) }))
		.mutation(async (req): Promise<AuthSession> => {
			const userId = await auth.resetPasswordToken.validate(req.input.token);
			const user = await prisma.authUser.findUniqueOrThrow({
				where: { id: userId },
			});
			await auth.invalidateAllSessions(user.id);
			const passwordHash = await auth.hashPassword(req.input.password);
			try {
				await prisma.authUser.updateMany({
					where: {
						id: user.id,
					},
					data: {
						hashedPassword: passwordHash,
					},
				});
			} catch (e) {
				// If the user doesn't have a password (because they
				// signed up through a third-party provider), create one
				await prisma.authUser.create({
					data: {
						id: crypto.randomUUID(),
						hashedPassword: passwordHash,
						email: user.email,
						roles: ['UNDECLARED'],
						status: 'CREATED',
					},
				});
			}
			return await auth.createSession(user.id);
		}),

	/**
	 * Logs out the logged in user by invalidating their session.
	 */
	logout: t.procedure.mutation(async (req): Promise<void> => {
		const { session } = await auth.validateSessionToken(req.ctx.cookies.get('session') ?? '');

		if (session !== null) {
			await auth.invalidateSession(session.id);
		}
	}),

	/**
	 * Scan a user's Hacker ID for the given action. Logged-in user must
	 * be an organizer or admin.
	 */
	scan: t.procedure
		.use(authenticate(['ORGANIZER', 'ADMIN']))
		.input(z.object({ id: z.string(), action: z.string() }))
		.mutation(async (req): Promise<void> => {
			const scanCount = (
				await prisma.user.findUniqueOrThrow({
					where: {
						authUserId: req.input.id,
					},
				})
			).scanCount as Prisma.JsonObject;
			const scans = Number(scanCount[req.input.action] ?? 0);
			await prisma.$transaction([
				prisma.user.update({
					where: { authUserId: req.input.id },
					data: { scanCount: { ...scanCount, [req.input.action]: scans + 1 } },
				}),
				prisma.scan.create({
					data: {
						action: req.input.action,
						user: { connect: { authUserId: req.input.id } },
					},
				}),
			]);
		}),

	/**
	 * Returns the number of users who have scanned for the given action
	 * at least once. Logged-in user must be an organizer or
	 * admin.
	 */
	getScanCount: t.procedure
		.use(authenticate(['ORGANIZER', 'ADMIN']))
		.input(z.string())
		.query(async (req): Promise<number> => {
			return await prisma.user.count({
				where: {
					scanCount: {
						path: [req.input],
						gt: 0,
					},
				},
			});
		}),

	/**
	 * Returns a log of all scans ordered in increasing timestamp. User
	 * must be an admin or organizer.
	 */
	getScanLog: t.procedure
		.use(authenticate(['ORGANIZER', 'ADMIN']))
		.input(z.string())
		.query(async (req): Promise<Prisma.ScanGetPayload<{ include: { user: true } }>[]> => {
			return await prisma.scan.findMany({
				include: { user: true },
				where: { action: req.input },
				orderBy: { timestamp: 'asc' },
			});
		}),

	/**
	 * Searches all users by email. User must be an admin or sponsor.
	 */
	search: t.procedure
		.use(authenticate(['ADMIN', 'SPONSOR']))
		.input(
			z.object({
				key: z.string(),
				search: z.string(),
				searchFilter: z.string(),
				limit: z.number().transform((limit) => (limit === 0 ? Number.MAX_SAFE_INTEGER : limit)),
				page: z.number().transform((page) => page - 1),
				oos: z.boolean().optional(),
				texas: z.boolean().optional(),
				ut: z.boolean().optional(),
			}),
		)
		.query(
			async (
				req,
			): Promise<{
				pages: number;
				start: number;
				count: number;
				users: Prisma.UserGetPayload<{ include: { authUser: true; decision: true } }>[];
			}> => {
				let questions = await getQuestions();
				const where = await getWhereCondition(
					req.input.key,
					req.input.searchFilter,
					req.input.search,
					req.ctx.user.roles,
					req.input.oos,
					req.input.texas,
					req.input.ut,
				);
				const count = await prisma.user.count({ where });
				const users = await prisma.user.findMany({
					include: { authUser: true, decision: true },
					where,
					skip: req.input.page * req.input.limit,
					take: req.input.limit,
					orderBy: { authUser: { email: 'asc' } },
				});
				// Remove questions that should not be visible to sponsors
				if (!req.ctx.user.roles.includes('ADMIN')) {
					questions = questions.filter((question) => !question.sponsorView);
					users.forEach((user) => {
						// eslint-disable-next-line @typescript-eslint/no-explicit-any
						const applicationData = user.application as Record<string, any>;
						questions.forEach((question) => {
							delete applicationData[question.id];
						});
						user.decision = null;
						user.scanCount = null;
					});
				}
				return {
					pages: Math.ceil(count / req.input.limit),
					start: req.input.page * req.input.limit + 1,
					count,
					users: users,
				};
			},
		),

	/**
	 * Gets URLS for all files uploaded by the users matching the given
	 * search criteria. User must be an admin or sponsor.
	 *
	 * (This is called directly in the frontend, because sending the
	 * files themselves wouldn't fit within Vercel's 4 MB payload limit)
	 */
	files: t.procedure
		.use(authenticate(['ADMIN', 'SPONSOR']))
		.input(
			z.object({
				key: z.string(),
				search: z.string(),
				searchFilter: z.string(),
			}),
		)
		.query(async (req): Promise<{ path: string; url: string }[]> => {
			let questions = (await getQuestions()).filter((question) => question.type === 'FILE');
			if (!req.ctx.user.roles.includes('ADMIN')) {
				questions = questions.filter((question) => question.sponsorView);
			}
			const where = await getWhereCondition(
				req.input.key,
				req.input.searchFilter,
				req.input.search,
				req.ctx.user.roles,
			);
			const users = await prisma.user.findMany({ include: { authUser: true }, where });
			// Remove questions that should not be visible to sponsors
			const files: { path: string; url: string }[] = [];
			users.forEach((user) => {
				// eslint-disable-next-line @typescript-eslint/no-explicit-any
				const applicationData = user.application as Record<string, any>;
				questions.forEach((question) => {
					if (applicationData[question.id]) {
						files.push({
							path: `${user.authUser.email}-${question.id}-${applicationData[question.id]}`,
							url: `${user.authUserId}/${question.id}`,
						});
					}
				});
			});
			return files;
		}),

	/**
	 * Gets statistics on the given users for the given questions. User
	 * must be an admin or sponsor.
	 */
	getStats: t.procedure
		.use(authenticate(['ADMIN', 'SPONSOR']))
		.input(
			z.object({
				key: z.string(),
				search: z.string(),
				searchFilter: z.string(),
			}),
		)
		.query(async (req) => {
			let questions = await getQuestions();
			const where = await getWhereCondition(
				req.input.key,
				req.input.searchFilter,
				req.input.search,
				req.ctx.user.roles,
			);
			const users = await prisma.user.findMany({ where });

			if (!req.ctx.user.roles.includes('ADMIN')) {
				questions = questions.filter((question) => question.sponsorView);
			}

			const responses: Record<string, Record<string, number | [number, number]>> = {};
			users.forEach((user) => {
				// eslint-disable-next-line @typescript-eslint/no-explicit-any
				const applicationData = user.application as Record<string, any>;

				questions.forEach((question) => {
					const answer = applicationData[question.id];

					if (!responses[question.id]) {
						responses[question.id] = {};
					}

					if (question.type === 'DROPDOWN') {
						if (!question.multiple) {
							const key = answer ?? 'No answer given';
							const answerData = responses[question.id];
							answerData[key] = ((answerData[key] ?? 0) as number) + 1;
						} else if (Array.isArray(answer)) {
							answer.forEach((response) => {
								const key = response ?? 'No answer given';
								const answerData = responses[question.id];
								answerData[key] = ((answerData[key] ?? 0) as number) + 1;
							});
						}
					} else if (question.type === 'SENTENCE' || question.type === 'PARAGRAPH') {
						if (answer) {
							const seen = new Set<string>();
							const tokenized = new WordTokenizer().tokenize(answer) || [];
							const tokens = removeStopwords(tokenized);
							const answerData = responses[question.id];
							tokens.forEach((token: string) => {
								const lowercasedToken = token.toLowerCase();
								seen.add(lowercasedToken);
								answerData[lowercasedToken] ||= [0, 0];
								(answerData[lowercasedToken] as [number, number])[0] += 1;
							});
							for (const token of seen) {
								(answerData[token] as [number, number])[1] += 1;
							}
						}
					} else if (question.type === 'CHECKBOX') {
						const key = answer ?? false;
						const answerData = responses[question.id];
						answerData[key] = ((answerData[key] ?? 0) as number) + 1;
					} else if (question.type === 'FILE') {
						const key = answer ? 'File uploaded' : 'No file uploaded';
						const answerData = responses[question.id];
						answerData[key] = ((answerData[key] ?? 0) as number) + 1;
					} else if (question.type === 'RADIO') {
						const key = answer ?? 'No answer given';
						const answerData = responses[question.id];
						answerData[key] = ((answerData[key] ?? 0) as number) + 1;
					} else if (question.type === 'NUMBER') {
						if (answer !== undefined && answer !== null) {
							const answerData = responses[question.id];
							answerData[answer] = ((answerData[answer] ?? 0) as number) + 1;
						}
					}
				});
			});
			return responses;
		}),

	doesEmailExist: t.procedure
		.use(authenticate(['ADMIN', 'HACKER', 'UNDECLARED']))
		.input(z.string())
		.query(async (req): Promise<boolean> => {
			return (
				(await prisma.authUser.findUnique({
					where: { email: req.input },
				})) !== null
			);
		}),

	/**
	 * Bulk sets the status of all the users. User must be an admin.
	 */
	setStatuses: t.procedure
		.use(authenticate(['ADMIN']))
		.input(
			z.object({
				status: z.nativeEnum(Status),
				ids: z.array(z.string()),
			}),
		)
		.mutation(async (req): Promise<void> => {
			const updateStatuses = prisma.authUser.updateMany({
				where: { id: { in: req.input.ids } },
				data: { status: req.input.status },
			});
			const deleteDecisions = prisma.decision.deleteMany({
				where: { userId: { in: req.input.ids } },
			});
			if (req.input.status == 'CONFIRMED') {
				const groups = await prisma.group.findMany();
				if (groups.length > 0) {
					const updateGroups = prisma.user.updateMany({
						where: {
							authUserId: { in: req.input.ids },
							groupId: null,
						},
						data: { groupId: groups[Math.floor(Math.random() * groups.length)].id },
					});
					await prisma.$transaction([updateStatuses, deleteDecisions, updateGroups]);
				} else {
					await prisma.$transaction([updateStatuses, deleteDecisions]);
				}
			} else {
				await prisma.$transaction([updateStatuses, deleteDecisions]);
			}
		}),

	/**
	 * Bulk adds a role to all users. User must be an admin.
	 */
	addRole: t.procedure
		.use(authenticate(['ADMIN']))
		.input(
			z.object({
				role: z.nativeEnum(Role),
				ids: z.array(z.string()),
			}),
		)
		.mutation(async (req): Promise<void> => {
			if (req.input.ids.includes(req.ctx.user.id)) {
				throw new Error('You cannot change your own role.');
			}

			const users = await prisma.authUser.findMany({
				where: { id: { in: req.input.ids } },
				select: { id: true, roles: true },
			});

			for (const user of users) {
				if (!user.roles.includes(req.input.role)) {
					const updatedRoles = [...user.roles, req.input.role];
					await prisma.authUser.update({
						where: { id: user.id },
						data: { roles: { set: updatedRoles } },
					});
				}
			}
		}),

	/**
	 * Bulk removes a role from all users. The user must be an admin.
	 */
	removeRole: t.procedure
		.use(authenticate(['ADMIN']))
		.input(
			z.object({
				role: z.nativeEnum(Role),
				ids: z.array(z.string()),
			}),
		)
		.mutation(async (req): Promise<void> => {
			if (req.input.ids.includes(req.ctx.user.id)) {
				throw new Error('You cannot change your own roles.');
			}

			const users = await prisma.authUser.findMany({
				where: { id: { in: req.input.ids } },
				select: { id: true, roles: true },
			});

			for (const user of users) {
				const updatedRoles = user.roles.filter((role) => role !== req.input.role);
				await prisma.authUser.update({
					where: { id: user.id },
					data: { roles: { set: updatedRoles } },
				});
			}
		}),

	getStatusChanges: t.procedure
		.use(authenticate(['ADMIN']))
		.query(async (): Promise<StatusChange[]> => {
			return await prisma.statusChange.findMany({
				orderBy: { timestamp: 'asc' },
			});
		}),

	sendEmailHelper: t.procedure
		.use(authenticate(['ADMIN']))
		.input(
			z.object({
				emails: z.string(),
				subject: z.string(),
				emailBody: z.string(),
				isHTML: z.boolean(),
			}),
		)
		.mutation(async (req): Promise<number> => {
			return await sendEmail(
				req.input.emails,
				req.input.subject,
				req.input.emailBody,
				req.input.isHTML,
			);
		}),

	emails: t.procedure
		.use(authenticate(['ADMIN', 'SPONSOR']))
		.input(
			z.object({
				key: z.string(),
				search: z.string(),
				searchFilter: z.string(),
				oos: z.boolean().optional(),
				texas: z.boolean().optional(),
				ut: z.boolean().optional(),
			}),
		)
		.query(async (req): Promise<string[]> => {
			const where = await getWhereCondition(
				req.input.key,
				req.input.searchFilter,
				req.input.search,
				req.ctx.user.roles,
				req.input.oos,
				req.input.texas,
				req.input.ut,
			);
			return await prisma.user
				.findMany({
					select: { authUser: { select: { email: true } } },
					where,
				})
				.then((users) => users.map((user) => user.authUser.email));
		}),

	splitGroups: t.procedure
		.use(authenticate(['ADMIN']))
		.input(z.array(z.string()))
		.mutation(async ({ input }): Promise<User[][]> => {
			// Update all teams before group assignments, as all statuses have been finalized.
			await Promise.all(
				(await prisma.team.findMany()).map(async (team) => {
					const members = await prisma.user.findMany({
						where: { teamId: team.id },
						include: { authUser: true },
					});
					await removeInvalidTeamMembers({ ...team, members });
				}),
			);

			const confirmedUsers = await prisma.user.findMany({
				where: {
					authUser: {
						status: 'CONFIRMED',
					},
				},
				include: { team: true, authUser: true },
			});

			const numGroups = input.length;

			const groups: User[][] = Array.from({ length: numGroups }, () => []);
			const teamDictionary: Record<number, User[]> = {};
			const nonTeamUsers: User[] = [];

			confirmedUsers.forEach((user) => {
				if (user.teamId) {
					(teamDictionary[user.teamId] ||= []).push(user);
				} else {
					nonTeamUsers.push(user);
				}
			});

			// Distribute non-team users across groups, then distribute team members
			nonTeamUsers.forEach((user, index) => groups[index % numGroups].push(user));
			Object.values(teamDictionary)
				.sort((a, b) => b.length - a.length)
				.forEach((teamMembers, index) => {
					groups[index % numGroups].push(...teamMembers);
				});

			await prisma.$transaction(
				groups.map((group, index) =>
					prisma.user.updateMany({
						where: { authUserId: { in: group.map((user) => user.authUserId) } },
						data: { groupId: input[index] },
					}),
				),
			);

			return groups;
		}),

	// Returns the group of the user
	getGroup: t.procedure.use(authenticate(['HACKER'])).query(async (req): Promise<string | null> => {
		return (
			(
				await prisma.user.findUnique({
					where: { authUserId: req.ctx.user.id },
					select: { groupId: true },
				})
			)?.groupId ?? null
		);
	}),

	/**
	 * Gets the user from their email address. User must be an admin, hacker, or undeclared.
	 * Returns null if the user does not exist.
	 */
	getUserFromEmail: t.procedure.input(z.string()).query(async (req): Promise<AuthUser | null> => {
		return await prisma.authUser.findUnique({
			where: { email: req.input },
		});
	}),

	/**
	 * Logs in a user with the given email and password. If the credentials are valid,
	 * a new session is created and the session token is set as a cookie in the
	 * response context. Returns `true` if the login is successful, or `false`
	 * if the credentials are invalid or the user does not exist.
	 */
	login: t.procedure
		.input(z.object({ email: z.string().trim().toLowerCase(), password: z.string() }))
		.mutation(async (req): Promise<boolean> => {
			try {
				const user = await prisma.authUser.findUnique({
					where: { email: req.input.email },
					select: { id: true, hashedPassword: true },
				});
				if (!user || !user.hashedPassword) {
					return false;
				}
				const isValid = await auth.verifyPassword(user.hashedPassword, req.input.password);
				if (isValid) {
					const session = await auth.createSession(user.id);
					auth.setSessionTokenCookie(req.ctx, session.id, session.expiresAt);
				}
				return isValid;
			} catch (error) {
				console.error('Error verifying password:', error);
				return false;
			}
		}),

	updateAdminTags: t.procedure
		.use(authenticate(['ADMIN']))
		.input(
			z.object({
				userId: z.string(),
				tag: z.enum(['isOOS', 'isTexas', 'isUT']),
				value: z.boolean(),
			}),
		)
		.mutation(async ({ input }) => {
			const data: Record<string, boolean> = { [input.tag]: input.value };
			if (input.value) {
				if (input.tag === 'isOOS') {
					data.isTexas = false;
					data.isUT = false;
				}
				if (input.tag === 'isTexas') {
					data.isOOS = false;
					data.isUT = false;
				}
				if (input.tag === 'isUT') {
					data.isOOS = false;
					data.isTexas = false;
				}
			}
			return await prisma.user.update({
				where: { authUserId: input.userId },
				data,
			});
		}),
});

async function getWhereCondition(
	key: string,
	searchFilter: string,
	search: string,
	roles: Role[],
	oos: boolean = false,
	texas: boolean = false,
	ut: boolean = false,
): Promise<Prisma.UserWhereInput> {
	if (!roles.includes('ADMIN')) {
		return {
			AND: [
				{ authUser: { roles: { has: 'HACKER' } } },
				await getWhereConditionHelper(key, searchFilter, search, roles, oos, texas, ut),
			],
		};
	}
	return await getWhereConditionHelper(key, searchFilter, search, roles, oos, texas, ut);
}

async function getWhereConditionHelper(
	key: string,
	searchFilter: string,
	search: string,
	roles: Role[],
	oos: boolean = false,
	texas: boolean = false,
	ut: boolean = false,
): Promise<Prisma.UserWhereInput> {
	const questions = await getQuestions();
	const scanActions = (await getSettings()).scanActions;

	const filters: Prisma.UserWhereInput[] = [];

	if (oos) filters.push({ isOOS: true });
	if (texas) filters.push({ isTexas: true });
	if (ut) filters.push({ isUT: true });

	if (key === 'email') {
		filters.push({ authUser: { email: { contains: search, mode: 'insensitive' } } });
	} else if (key === 'status' && roles.includes('ADMIN')) {
		filters.push({ authUser: { status: search as Status } });
	} else if (key === 'role' && roles.includes('ADMIN')) {
		filters.push({ authUser: { roles: { has: search as Role } } });
	} else if (key === 'decision' && roles.includes('ADMIN')) {
		filters.push({ decision: { status: search as 'ACCEPTED' | 'REJECTED' | 'WAITLISTED' } });
	} else if (scanActions.includes(key) && roles.includes('ADMIN')) {
		filters.push(buildScanFilter(key, searchFilter, search));
	} else {
		const question = questions.find((q) => q.id === key);
		if (question && (roles.includes('ADMIN') || question.sponsorView)) {
			filters.push(buildQuestionFilter(question, searchFilter, search));
		}
	}

	if (filters.length === 1) return filters[0];
	return { AND: filters };
}

function buildScanFilter(key: string, searchFilter: string, search: string): Prisma.UserWhereInput {
	const n = Number(search);
	const nullOrBelow = (op: object) => ({
		OR: [{ scanCount: op }, { scanCount: { path: [key], equals: Prisma.DbNull } }],
	});
	switch (searchFilter) {
		case 'greater':
			return { scanCount: { path: [key], gt: n } };
		case 'greater_equal':
			return n === 0
				? nullOrBelow({ path: [key], gte: n })
				: { scanCount: { path: [key], gte: n } };
		case 'less':
			return n !== 0 ? nullOrBelow({ path: [key], lt: n }) : { scanCount: { path: [key], lt: n } };
		case 'less_equal':
			return nullOrBelow({ path: [key], lte: n });
		case 'equal':
			return n === 0
				? nullOrBelow({ path: [key], equals: n })
				: { scanCount: { path: [key], equals: n } };
		case 'not_equal':
			return nullOrBelow({ path: [key], not: n });
		default:
			return {};
	}
}

function buildQuestionFilter(
	question: { id: string; type: string; multiple?: boolean | null },
	searchFilter: string,
	search: string,
): Prisma.UserWhereInput {
	const path = [question.id];
	switch (question.type) {
		case 'SENTENCE':
		case 'PARAGRAPH':
			switch (searchFilter) {
				case 'exact':
					return { application: { path, equals: search } };
				case 'contains':
					return { application: { path, string_contains: search } };
				case 'unanswered':
					return {
						OR: [
							{ application: { path, equals: '' } },
							{ application: { path, equals: Prisma.DbNull } },
						],
					};
				default:
					return {};
			}
		case 'NUMBER': {
			const n = Number(search);
			switch (searchFilter) {
				case 'greater':
					return { application: { path, gt: n } };
				case 'greater_equal':
					return { application: { path, gte: n } };
				case 'less':
					return { application: { path, lt: n } };
				case 'less_equal':
					return { application: { path, lte: n } };
				case 'equal':
					return { application: { path, equals: n } };
				case 'not_equal':
					return { application: { path, not: n } };
				default:
					return {};
			}
		}
		case 'DROPDOWN': {
			if (searchFilter === 'unanswered') return { application: { path, equals: Prisma.DbNull } };
			try {
				const parsed = JSON.parse(search);
				if (parsed === '') return {};
				if (question.multiple) {
					switch (searchFilter) {
						case 'contains':
							return { application: { path, array_contains: parsed } };
						case 'exactly':
							return { application: { path, equals: parsed } };
						default:
							return {};
					}
				} else {
					switch (searchFilter) {
						case 'is':
							return { application: { path, equals: parsed } };
						case 'is_not':
							return { application: { path, not: parsed } };
						default:
							return {};
					}
				}
			} catch {
				return {};
			}
		}
		case 'CHECKBOX':
			switch (searchFilter) {
				case 'true':
					return { application: { path, equals: true } };
				case 'false':
					return {
						OR: [
							{ application: { path, equals: false } },
							{ application: { path, equals: Prisma.DbNull } },
						],
					};
				default:
					return {};
			}
		case 'RADIO':
			switch (searchFilter) {
				case 'is':
					return { application: { path, equals: search } };
				case 'is_not':
					return { application: { path, not: search } };
				case 'unanswered':
					return { application: { path, equals: Prisma.DbNull } };
				default:
					return {};
			}
		case 'FILE':
			switch (searchFilter) {
				case 'uploaded':
					return { application: { path, not: Prisma.DbNull } };
				case 'not_uploaded':
					return { application: { path, equals: Prisma.DbNull } };
				default:
					return {};
			}
		default:
			return {};
	}
}

async function getRSVPDeadline(user: AuthUser): Promise<Date | null> {
	const daysToConfirmBy = (
		await prisma.statusChange.findFirstOrThrow({
			where: { userId: user.id },
			orderBy: { timestamp: 'desc' },
		})
	).timestamp;

	const settings = await getSettings();
	const daysToRSVP = settings.daysToRSVP;

	if (daysToRSVP !== null) {
		const rsvpDeadline = dayjs
			.utc(new Date(daysToConfirmBy))
			.tz(settings.timezone, false)
			.add(daysToRSVP, 'days')
			.endOf('day')
			.toDate();
		if (settings.hackathonStartDate !== null) {
			const hackathonStartDate = dayjs
				.utc(new Date(settings.hackathonStartDate))
				.tz(settings.timezone, false)
				.toDate();

			if (hackathonStartDate < rsvpDeadline) {
				return hackathonStartDate;
			}
		}
		return rsvpDeadline;
	}

	return null;
}
