import { Prisma, Role, Status, type StatusChange } from '@prisma/client';
import { z } from 'zod';
import { prisma } from '../db';
import { sendEmail } from '../email';
import { authenticate } from '../middleware';
import { t } from '../t';
import { getQuestions } from './questions';
import { getSettings } from './settings';
import { auth, emailVerificationToken, resetPasswordToken } from '$lib/lucia';
import type { Session } from 'lucia-auth';
import { DeleteObjectCommand, PutObjectCommand, S3Client } from '@aws-sdk/client-s3';

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
	 *
	 * XXX: It is very important that you use this function instead of
	 * querying the users table directly because this function will
	 * create the row in the users table if it does not exist.
	 * Alternatively, make sure to create the row in the users table
	 * after every call to `auth.createUser()`.
	 */
	get: t.procedure
		.input(z.string().optional())
		.query(
			async (
				req
			): Promise<Prisma.UserGetPayload<{ include: { authUser: true; decision: true } }>> => {
				const { user } = await req.ctx.validateUser();
				if (user === null) {
					throw new Error('Unauthorized');
				}
				if (req.input === undefined) {
					try {
						return await prisma.user.findUniqueOrThrow({
							where: { authUserId: user.id },
							include: { authUser: true, decision: true },
						});
					} catch (e) {
						// If no row in users is linked to the authUser, create one
						return await prisma.user.create({
							data: { authUserId: user.id },
							include: { authUser: true, decision: true },
						});
					}
				} else {
					if (!user.roles.includes('ADMIN')) {
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
			if (!(await getSettings()).applicationOpen || req.ctx.user.status !== 'VERIFIED') {
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
			if (!(await getSettings()).applicationOpen || req.ctx.user.status !== 'VERIFIED') {
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
				await prisma.statusChange.create({
					data: { newStatus: 'APPLIED', userId: req.ctx.user.id },
				});
				// notify user through their email on successful application submission
				const subject = 'Thanks for submitting!';
				await sendEmail(req.ctx.user.email, subject, (await getSettings()).submitTemplate, null);
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
			if (!(await getSettings()).applicationOpen || req.ctx.user.status !== 'APPLIED') {
				return;
			}
			await prisma.authUser.update({
				where: { id: req.ctx.user.id },
				data: { status: 'VERIFIED' },
			});
			await prisma.statusChange.create({
				data: { newStatus: 'VERIFIED', userId: req.ctx.user.id },
			});
		}),

	/**
	 * Confirms or declines the logged in user's acceptance.
	 */
	rsvp: t.procedure
		.use(authenticate(['HACKER']))
		.input(z.enum(['CONFIRMED', 'DECLINED']))
		.mutation(async (req): Promise<void> => {
			const deadline = (await getSettings()).confirmBy;
			if (req.input === 'CONFIRMED') {
				// Hackers should only be able to confirm before deadline
				if (req.ctx.user.status === 'ACCEPTED' && (deadline === null || new Date() < deadline)) {
					await prisma.authUser.update({
						where: { id: req.ctx.user.id },
						data: { status: 'CONFIRMED' },
					});
					await prisma.statusChange.create({
						data: { newStatus: 'CONFIRMED', userId: req.ctx.user.id },
					});
					await sendEmail(
						req.ctx.user.email,
						'Thanks for your RSVP!',
						(
							await getSettings()
						).confirmTemplate,
						null
					);
				}
			} else {
				// Hackers should be able to decline after accepting and/or the deadline
				if (req.ctx.user.status === 'ACCEPTED' || req.ctx.user.status === 'CONFIRMED') {
					await prisma.authUser.update({
						where: { id: req.ctx.user.id },
						data: { status: 'DECLINED' },
					});
					await prisma.statusChange.create({
						data: { newStatus: 'DECLINED', userId: req.ctx.user.id },
					});
					await sendEmail(
						req.ctx.user.email,
						'Thanks for your RSVP!',
						(
							await getSettings()
						).declineTemplate,
						null
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
					primaryKey: null,
					attributes: {
						email: req.input.email,
						roles: ['HACKER'],
						status: 'CREATED',
					},
				});
				await auth.createKey(user.id, {
					type: 'persistent',
					providerId: 'email',
					providerUserId: req.input.email,
					password: req.input.password,
				});
				await prisma.statusChange.create({
					data: { newStatus: 'CREATED', userId: user.id },
				});
				return await auth.createSession(user.id);
			} catch (e) {
				return null;
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
			return await auth.createSession(key.userId);
		}),

	/**
	 * Sends an email verification link to the logged in user.
	 * Invalidates all other email verification tokens for the user.
	 * Throws an error if the user is already verified.
	 */
	sendVerificationEmail: t.procedure.use(authenticate()).mutation(async (req): Promise<void> => {
		if (req.ctx.user.status !== 'CREATED') {
			return;
		}
		await emailVerificationToken.invalidateAllUserTokens(req.ctx.user.id);
		const token = await emailVerificationToken.issue(req.ctx.user.id);
		let link = `${process.env.DOMAIN_NAME}/login/verify-email/${token}`;
		link = `<a href="${link}">${link}</a>`;
		const body =
			'Click on the following link to verify your email address:<br><br>' +
			link +
			'<br><br>If you did not request this email, please ignore it.';
		await sendEmail(req.ctx.user.email, 'Email Verification', body, null);
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
				await resetPasswordToken.invalidateAllUserTokens(user.id);
				const token = await resetPasswordToken.issue(user.id);
				let link = `${process.env.DOMAIN_NAME}/login/reset-password?token=${token}`;
				link = `<a href="${link}">${link}</a>`;
				const body =
					'Click on the following link to reset your password (valid for 10 minutes):<br><br>' +
					link;
				await sendEmail(user.email, 'Password Reset', body, null);
			}
		}),

	/**
	 * Verifies the email address for the given user, invalidating all
	 * other email verification tokens. Throws an error if the token is
	 * invalid or expired.
	 */
	verifyEmail: t.procedure.input(z.string()).mutation(async (req): Promise<void> => {
		const token = await emailVerificationToken.validate(req.input);
		await emailVerificationToken.invalidateAllUserTokens(token.userId);
		await prisma.authUser.update({
			where: { id: token.userId },
			data: { status: 'VERIFIED' },
		});
		await prisma.statusChange.create({
			data: { newStatus: 'VERIFIED', userId: token.userId },
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
			const token = await resetPasswordToken.validate(req.input.token);
			const user = await auth.getUser(token.userId);
			await auth.invalidateAllUserSessions(user.id);
			await resetPasswordToken.invalidateAllUserTokens(user.id);
			try {
				await auth.updateKeyPassword('email', user.email, req.input.password);
			} catch (e) {
				// If the user doesn't have a password (because they
				// signed up through a third-party provider), create one
				await auth.createKey(user.id, {
					type: 'persistent',
					providerId: 'email',
					providerUserId: user.email,
					password: req.input.password,
				});
			}
			return await auth.createSession(user.id);
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
			await prisma.user.update({
				where: { authUserId: req.input.id },
				data: { scanCount: { ...scanCount, [req.input.action]: scans + 1 } },
			});
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
	 * Searches all users by email. User must be an admin.
	 */
	search: t.procedure
		.use(authenticate(['ADMIN']))
		.input(
			z.object({
				key: z.string(),
				search: z.string(),
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
				// Convert key to Prisma where filter
				let where: Prisma.UserWhereInput = {};
				if (req.input.key === 'email') {
					where = { authUser: { email: { contains: req.input.search } } };
				} else if (req.input.key === 'status') {
					where = { authUser: { status: req.input.search as Status } };
				} else if (req.input.key === 'role') {
					where = { authUser: { roles: { has: req.input.search as Role } } };
				} else if (req.input.key === 'decision') {
					where = {
						decision: { status: req.input.search as 'ACCEPTED' | 'REJECTED' | 'WAITLISTED' },
					};
				}
				const count = await prisma.user.count({ where });
				return {
					pages: Math.ceil(count / req.input.limit),
					start: req.input.page * req.input.limit + 1,
					count,
					users: await prisma.user.findMany({
						include: { authUser: true, decision: true },
						where,
						skip: req.input.page * req.input.limit,
						take: req.input.limit,
						orderBy: { authUser: { email: 'asc' } },
					}),
				};
			}
		),

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
			for (const id of req.input.ids) {
				await prisma.statusChange.create({
					data: { newStatus: req.input.status, userId: id },
				});
			}
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

	// Update the getAnswersForQuestions procedure
	getAnswersForQuestions: t.procedure
		.use(authenticate(['ADMIN']))
		.input(
			z.array(
				z.object({
					label: z.string(),
					id: z.string(),
				})
			)
		)
		.query(async (req) => {
			const questionPairs = req.input;
			const users = await prisma.user.findMany({
				select: {
					application: true,
				},
			});

			const questionAnswerCounts: Record<string, Record<string, number>> = {};

			users.forEach((user) => {
				const applicationData = user.application as Record<string, any>;
				questionPairs.forEach(({ id: questionId, label: questionLabel }) => {
					const answer = applicationData[questionId];
					if (answer !== null) {
						if (!questionAnswerCounts[questionLabel]) {
							questionAnswerCounts[questionLabel] = {};
						}
						if (!questionAnswerCounts[questionLabel][answer]) {
							questionAnswerCounts[questionLabel][answer] = 1;
						} else {
							questionAnswerCounts[questionLabel][answer]++;
						}
					}
				});
			});

			const result = Object.entries(questionAnswerCounts).map(([label, answerCounts]) => ({
				label,
				pairs: Object.entries(answerCounts).filter(([, count]) => count >= 1),
			}));

			return result;
		}),
});
