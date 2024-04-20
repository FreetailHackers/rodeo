import { Prisma, Role, Status, type StatusChange } from '@prisma/client';
import { z } from 'zod';
import { prisma } from '../db';
import { sendEmails } from '../email';
import { authenticate } from '../middleware';
import { t } from '../t';
import { getQuestions } from './questions';
import { getSettings } from './settings';
import { auth, emailVerificationToken, resetPasswordToken } from '$lib/lucia';
import type { Session, User } from 'lucia';
import { DeleteObjectCommand, PutObjectCommand, S3Client } from '@aws-sdk/client-s3';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';
import { canApply } from './admissions';
import natural from 'natural';
const { WordTokenizer } = natural;
import { removeStopwords } from 'stopword';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';

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
				req
			): Promise<Prisma.UserGetPayload<{ include: { authUser: true; decision: true } }>> => {
				const session = await req.ctx.validate();
				if (session === null) {
					throw new Error('Unauthorized');
				}
				const user = session.user;
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
			}
		),

	/**
	 * Sets the logged in user to the given data. If the user has
	 * finished their application, they will be un-applied.
	 *
	 * NOTE: This function does not perform any input validations.
	 * Maybe it should?
	 */
	update: t.procedure
		.use(authenticate(['HACKER']))
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
		.use(authenticate(['HACKER']))
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
					if (question.required) {
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
					data: { status: 'APPLIED' },
				});
				// notify user through their email on successful application submission
				const subject = 'Thanks for submitting!';
				await sendEmails([req.ctx.user.email], subject, (await getSettings()).submitTemplate);
			}
			return errors;
		}),

	/**
	 * Withdraws the logged in user's application. Throws an error if
	 * user has not submitted their application yet.
	 */
	withdrawApplication: t.procedure
		.use(authenticate(['HACKER']))
		.mutation(async (req): Promise<void> => {
			if (!(await canApply()) || req.ctx.user.status !== 'APPLIED') {
				return;
			}
			await prisma.authUser.update({
				where: { id: req.ctx.user.id },
				data: { status: 'CREATED' },
			});
		}),

	getRSVPDeadline: t.procedure
		.use(authenticate(['HACKER']))
		.query(async (req): Promise<Date | null> => {
			return await getRSVPDeadline(req.ctx.user);
		}),

	/**
	 * Confirms or declines the logged in user's acceptance.
	 */
	rsvp: t.procedure
		.use(authenticate(['HACKER']))
		.input(z.enum(['CONFIRMED', 'DECLINED']))
		.mutation(async (req): Promise<void> => {
			const deadline = await getRSVPDeadline(req.ctx.user);
			if (req.input === 'CONFIRMED') {
				// Hackers should only be able to confirm before deadline
				if (req.ctx.user.status === 'ACCEPTED' && (deadline === null || new Date() < deadline)) {
					await prisma.authUser.update({
						where: { id: req.ctx.user.id },
						data: { status: 'CONFIRMED' },
					});
					await sendEmails(
						[req.ctx.user.email],
						'Thanks for your RSVP!',
						(
							await getSettings()
						).confirmTemplate
					);
				}
			} else {
				// Hackers should be able to decline after accepting and/or the deadline
				if (req.ctx.user.status === 'ACCEPTED' || req.ctx.user.status === 'CONFIRMED') {
					await prisma.authUser.update({
						where: { id: req.ctx.user.id },
						data: { status: 'DECLINED' },
					});
					await sendEmails(
						[req.ctx.user.email],
						'Thanks for your RSVP!',
						(
							await getSettings()
						).declineTemplate
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
		.mutation(async (req): Promise<Session | null> => {
			try {
				const user = await auth.createUser({
					key: {
						providerId: 'email',
						providerUserId: req.input.email,
						password: req.input.password,
					},
					attributes: {
						email: req.input.email,
						roles: ['HACKER'],
						status: 'CREATED',
					},
				});
				return await auth.createSession({ userId: user.userId, attributes: {} });
			} catch (e) {
				if (e instanceof PrismaClientKnownRequestError && e.code === 'P2002') {
					// Email already exists
					return null;
				}
				throw e;
			}
		}),

	/**
	 * Logs in a user with the given email and password. Returns the
	 * resulting session, or throws an error if the credentials are
	 * invalid.
	 */
	login: t.procedure
		.input(z.object({ email: z.string().trim().toLowerCase(), password: z.string() }))
		.mutation(async (req): Promise<Session> => {
			const key = await auth.useKey('email', req.input.email, req.input.password);
			return await auth.createSession({ userId: key.userId, attributes: {} });
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
		const token = await emailVerificationToken.issue(req.ctx.user.id);
		let link = `${process.env.DOMAIN_NAME}/login/verify-email/${token}`;
		link = `<a href="${link}">${link}</a>`;
		const body =
			'Click on the following link to verify your email address:<br><br>' +
			link +
			'<br><br>If you did not request this email, please ignore it.';
		await sendEmails([req.ctx.user.email], 'Email Verification', body);
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
				const token = await resetPasswordToken.issue(user.id);
				let link = `${process.env.DOMAIN_NAME}/login/reset-password?token=${token}`;
				link = `<a href="${link}">${link}</a>`;
				const body =
					'Click on the following link to reset your password (valid for 10 minutes):<br><br>' +
					link;
				await sendEmails([user.email], 'Password Reset', body);
			}
		}),

	/**
	 * Verifies the email address for the given user, invalidating all
	 * other email verification tokens. Throws an error if the token is
	 * invalid or expired.
	 */
	verifyEmail: t.procedure.input(z.string()).mutation(async (req): Promise<void> => {
		const userId = await emailVerificationToken.validate(req.input);
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
		.mutation(async (req): Promise<Session> => {
			const userId = await resetPasswordToken.validate(req.input.token);
			const user = await auth.getUser(userId);
			await auth.invalidateAllUserSessions(user.id);
			try {
				await auth.updateKeyPassword('email', user.email, req.input.password);
			} catch (e) {
				// If the user doesn't have a password (because they
				// signed up through a third-party provider), create one
				await auth.createKey({
					userId: user.id,
					providerId: 'email',
					providerUserId: user.email,
					password: req.input.password,
				});
			}
			return await auth.createSession({ userId: user.id, attributes: {} });
		}),

	/**
	 * Logs out the logged in user by invalidating their session.
	 */
	logout: t.procedure.mutation(async (req): Promise<void> => {
		const session = await req.ctx.validate();
		if (session !== null) {
			await auth.invalidateSession(session.sessionId);
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
			})
		)
		.query(
			async (
				req
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
					req.ctx.user.roles
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
			}
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
			})
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
				req.ctx.user.roles
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
							url: `/files/${user.authUserId}/${question.id}`,
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
			})
		)
		.query(async (req) => {
			let questions = await getQuestions();
			const where = await getWhereCondition(
				req.input.key,
				req.input.searchFilter,
				req.input.search,
				req.ctx.user.roles
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

	/**
	 * Bulk sets the status of all the users. User must be an admin.
	 */
	setStatuses: t.procedure
		.use(authenticate(['ADMIN']))
		.input(
			z.object({
				status: z.nativeEnum(Status),
				ids: z.array(z.string()),
			})
		)
		.mutation(async (req): Promise<void> => {
			const updateStatuses = prisma.authUser.updateMany({
				where: { id: { in: req.input.ids } },
				data: { status: req.input.status },
			});
			const deleteDecisions = prisma.decision.deleteMany({
				where: { userId: { in: req.input.ids } },
			});
			await prisma.$transaction([updateStatuses, deleteDecisions]);
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
			})
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
			})
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

	sendEmailByStatus: t.procedure
		.use(authenticate(['ADMIN']))
		.input(z.object({ status: z.nativeEnum(Status), subject: z.string(), emailBody: z.string() }))
		.mutation(async (req): Promise<string> => {
			const emailArray = (
				await prisma.authUser.findMany({
					where: { status: req.input.status },
					select: { email: true },
				})
			).map((user) => user.email);
			return sendEmails(emailArray, req.input.subject, req.input.emailBody);
		}),
});

async function getWhereCondition(
	key: string,
	searchFilter: string,
	search: string,
	roles: Role[]
): Promise<Prisma.UserWhereInput> {
	if (!roles.includes('ADMIN')) {
		return {
			AND: [
				{ authUser: { roles: { has: 'HACKER' } } },
				await getWhereConditionHelper(key, searchFilter, search, roles),
			],
		};
	}
	return await getWhereConditionHelper(key, searchFilter, search, roles);
}

// Converts key to Prisma where filter
async function getWhereConditionHelper(
	key: string,
	searchFilter: string,
	search: string,
	roles: Role[]
): Promise<Prisma.UserWhereInput> {
	const questions = await getQuestions();
	const scanActions = (await getSettings()).scanActions;
	if (key === 'email') {
		return { authUser: { email: { contains: search, mode: 'insensitive' } } };
	} else if (key === 'status' && roles.includes('ADMIN')) {
		return { authUser: { status: search as Status } };
	} else if (key === 'role' && roles.includes('ADMIN')) {
		return { authUser: { roles: { has: search as Role } } };
	} else if (key === 'decision' && roles.includes('ADMIN')) {
		return {
			decision: { status: search as 'ACCEPTED' | 'REJECTED' | 'WAITLISTED' },
		};
	} else if (scanActions.includes(key) && roles.includes('ADMIN')) {
		if (searchFilter === 'greater') {
			return { scanCount: { path: [key], gt: Number(search) } };
		} else if (searchFilter === 'greater_equal') {
			if (Number(search) === 0) {
				return {
					OR: [
						{ scanCount: { path: [key], gte: Number(search) } },
						{ scanCount: { path: [key], equals: Prisma.DbNull } },
					],
				};
			}
			return { scanCount: { path: [key], gte: Number(search) } };
		} else if (searchFilter === 'less') {
			if (Number(search) !== 0) {
				return {
					OR: [
						{ scanCount: { path: [key], lt: Number(search) } },
						{ scanCount: { path: [key], equals: Prisma.DbNull } },
					],
				};
			}
			return { scanCount: { path: [key], lt: Number(search) } };
		} else if (searchFilter === 'less_equal') {
			return {
				OR: [
					{ scanCount: { path: [key], lte: Number(search) } },
					{ scanCount: { path: [key], equals: Prisma.DbNull } },
				],
			};
		} else if (searchFilter === 'equal') {
			if (Number(search) === 0) {
				return {
					OR: [
						{ scanCount: { path: [key], equals: Number(search) } },
						{ scanCount: { path: [key], equals: Prisma.DbNull } },
					],
				};
			}
			return { scanCount: { path: [key], equals: Number(search) } };
		} else if (searchFilter === 'not_equal') {
			if (Number(search) === 0) {
				return {
					OR: [
						{ scanCount: { path: [key], not: Number(search) } },
						{ scanCount: { path: [key], not: Prisma.DbNull } },
					],
				};
			}
			return {
				OR: [
					{ scanCount: { path: [key], not: Number(search) } },
					{ scanCount: { path: [key], equals: Prisma.DbNull } },
				],
			};
		}
	} else {
		for (const question of questions) {
			if (key === question.id) {
				if (!roles.includes('ADMIN') && !question.sponsorView) {
					return {};
				}
				if (question.type === 'SENTENCE' || question.type === 'PARAGRAPH') {
					if (searchFilter === 'exact') {
						return { application: { path: [question.id], equals: search } };
					} else if (searchFilter === 'contains') {
						return { application: { path: [question.id], string_contains: search } };
					} else if (searchFilter === 'unanswered') {
						return {
							OR: [
								{
									application: { path: [question.id], equals: '' },
								},
								{
									application: { path: [question.id], equals: Prisma.DbNull },
								},
							],
						};
					}
				} else if (question.type === 'NUMBER') {
					if (searchFilter === 'greater') {
						return { application: { path: [key], gt: Number(search) } };
					} else if (searchFilter === 'greater_equal') {
						return { application: { path: [key], gte: Number(search) } };
					} else if (searchFilter === 'less') {
						return { application: { path: [key], lt: Number(search) } };
					} else if (searchFilter === 'less_equal') {
						return { application: { path: [key], lte: Number(search) } };
					} else if (searchFilter === 'equal') {
						return { application: { path: [key], equals: Number(search) } };
					} else if (searchFilter === 'not_equal') {
						return { application: { path: [key], not: Number(search) } };
					}
				} else if (question.type === 'DROPDOWN') {
					// look to see if searchFilter is unanswered
					if (searchFilter !== 'unanswered') {
						try {
							const parsed = JSON.parse(search);
							// Special case: if the user is searching for an empty array, treat that as "return all"
							// (since all responses vacuously contain the empty array)
							if (parsed === '') {
								return {};
							}

							// check if question allows multiple responses
							if (question.multiple) {
								if (searchFilter === 'contains') {
									return { application: { path: [question.id], array_contains: parsed } };
								} else if (searchFilter === 'exactly') {
									return { application: { path: [question.id], equals: parsed } };
								}
							} else {
								// searchDictArray is a string
								if (searchFilter === 'is') {
									return { application: { path: [question.id], equals: parsed } };
								} else if (searchFilter === 'is_not') {
									return { application: { path: [question.id], not: parsed } };
								} else if (searchFilter === 'unanswered') {
									return { application: { path: [question.id], equals: Prisma.DbNull } };
								}
							}
						} catch (e) {
							// In case of malformed JSON, just return all users
							return {};
						}
					} else {
						return { application: { path: [question.id], equals: Prisma.DbNull } };
					}
				} else if (question.type === 'CHECKBOX') {
					if (searchFilter === 'true') {
						return { application: { path: [question.id], equals: true } };
					} else if (searchFilter === 'false') {
						return {
							OR: [
								{
									application: { path: [question.id], equals: false },
								},
								{
									application: { path: [question.id], equals: Prisma.DbNull },
								},
							],
						};
					}
				} else if (question.type === 'RADIO') {
					if (searchFilter === 'is') {
						return { application: { path: [question.id], equals: search } };
					} else if (searchFilter === 'is_not') {
						return { application: { path: [question.id], not: search } };
					} else if (searchFilter === 'unanswered') {
						return { application: { path: [question.id], equals: Prisma.DbNull } };
					}
				} else if (question.type === 'FILE') {
					if (searchFilter === 'uploaded') {
						return { application: { path: [question.id], not: Prisma.DbNull } };
					} else if (searchFilter === 'not_uploaded') {
						return { application: { path: [question.id], equals: Prisma.DbNull } };
					}
				}
			}
		}
	}
	return {};
}

async function getRSVPDeadline(user: User) {
	const daysToConfirmBy = (
		await prisma.statusChange.findFirstOrThrow({
			where: { userId: user.authUserId },
			orderBy: { timestamp: 'desc' },
		})
	).timestamp;

	const settings = await getSettings();
	const daysToRSVP = settings.daysToRSVP;

	if (daysToRSVP !== null) {
		const timeOfAcceptance = dayjs.utc(new Date(daysToConfirmBy)).tz(settings.timezone, false);
		return timeOfAcceptance.add(daysToRSVP, 'days').endOf('day').toDate();
	}

	return null;
}
