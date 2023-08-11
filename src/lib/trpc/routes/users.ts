import { Prisma, Role, Status } from '@prisma/client';
import { z } from 'zod';
import { prisma } from '../db';
import { sendEmail } from '../email';
import { authenticate } from '../middleware';
import { t } from '../t';
import { getQuestions } from './questions';
import { getSettings } from './settings';
import { auth, emailVerificationToken, resetPasswordToken } from '$lib/lucia';
import type { Session } from 'lucia-auth';

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
	 */
	update: t.procedure
		.use(authenticate(['HACKER']))
		.input(z.record(z.any()))
		.mutation(async (req): Promise<void> => {
			if (!(await getSettings()).applicationOpen) {
				throw new Error('Sorry, applications are closed.');
			}
			if (req.ctx.user.status !== 'VERIFIED') {
				throw new Error('You have already submitted your application.');
			}

			// Validate application
			const questions = await getQuestions();
			// eslint-disable-next-line @typescript-eslint/no-explicit-any
			const application: Record<string, any> = {};
			for (const question of questions) {
				application[question.id] = req.input[question.id];
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
			if (!(await getSettings()).applicationOpen) {
				throw new Error('Sorry, applications are closed.');
			}
			if (req.ctx.user.status !== 'VERIFIED') {
				throw new Error('You have already submitted your application.');
			}

			// Validate the user's data
			const errors: Record<string, string> = {};
			const questions = await prisma.question.findMany();
			const user = await prisma.user.findUniqueOrThrow({
				where: { authUserId: req.ctx.user.id },
			});
			// eslint-disable-next-line @typescript-eslint/no-explicit-any
			const application = user.application as Record<string, any>;
			for (const question of questions) {
				const answer = application[question.id];
				if (
					question.required &&
					(answer === undefined || answer === null || answer === false || answer === '')
				) {
					errors[question.label] = 'This field is required.';
				} else if (
					(question.type === 'SENTENCE' || question.type === 'PARAGRAPH') &&
					question.regex !== null
				) {
					if (!new RegExp(question.regex).test(answer)) {
						errors[question.label] = 'This field must match the given pattern: ' + question.regex;
					}
				} else if (question.type === 'NUMBER') {
					if (question.min !== null && answer < question.min) {
						errors[question.label] = `This field must be at least ${question.min}.`;
					} else if (question.max !== null && answer > question.max) {
						errors[question.label] = `This field must be at most ${question.max}.`;
					}
				} else if (question.type === 'DROPDOWN') {
					if (!question.options.includes(answer)) {
						errors[question.label] = 'This field must be one of the given options.';
					}
				}
			}
			// Update status to applied if there are no errors
			if (Object.keys(errors).length == 0) {
				await prisma.authUser.update({
					where: { id: req.ctx.user.id },
					data: { status: 'APPLIED' },
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
			if (!(await getSettings()).applicationOpen) {
				throw new Error('Sorry, applications are closed.');
			}
			if (req.ctx.user.status !== 'APPLIED') {
				throw new Error('You have not submitted your application yet.');
			}
			await prisma.authUser.update({
				where: { id: req.ctx.user.id },
				data: { status: 'VERIFIED' },
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
			throw new Error('Your email is already verified.');
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
	 * Gets all users. User must be an admin.
	 */
	getAll: t.procedure
		.use(authenticate(['ADMIN']))
		.query(
			async (): Promise<
				Prisma.UserGetPayload<{ include: { authUser: true; decision: true } }>[]
			> => {
				return await prisma.user.findMany({
					include: { authUser: true, decision: true },
				});
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
});
