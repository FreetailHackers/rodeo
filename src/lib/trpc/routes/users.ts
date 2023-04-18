import { hash } from '$lib/hash';
import { Prisma, Role, Status, type User } from '@prisma/client';
import { group } from 'console';
import { z } from 'zod';
import prisma from '../db';
import { sendEmail, sendEmailWithBody } from '../email';
import { authenticate } from '../middleware';
import { t } from '../t';
import { getQuestions } from './questions';
import { getSettings } from './settings';

const MAGIC_LINK_LENGTH = 32;
const CHARSET = 'abcdefghijklmnopqrstuvwxyz';

export const usersRouter = t.router({
	/**
	 * Gets the logged in user, or a user by their *HASHED* magic link.
	 */
	get: t.procedure.input(z.string().optional()).query(async (req): Promise<User | null> => {
		return await prisma.user.findUnique({
			where: {
				magicLink: req.input ?? (await hash(req.ctx.magicLink)),
			},
		});
	}),

	/**
	 * Sets the logged in user to the given data. If the user has
	 * finished their application, they will be un-applied.
	 */
	update: t.procedure
		.use(authenticate)
		.input(z.record(z.string(), z.string()))
		.mutation(async (req): Promise<void> => {
			if (req.ctx.user.role !== Role.HACKER) {
				throw new Error('You have insufficient permissions to perform this action.');
			}
			if (!(await getSettings()).applicationOpen) {
				throw new Error('Sorry, applications are closed.');
			}
			if (req.ctx.user.status !== Status.VERIFIED) {
				throw new Error('You have already submitted your application.');
			}

			// Validate application
			const questions = await getQuestions();
			// eslint-disable-next-line @typescript-eslint/no-explicit-any
			const application: Record<string, any> = {};
			for (const question of questions) {
				application[question.id] = req.input[question.id];
			}
			// Only let verified users that haven't received a decision update their info
			await prisma.user.update({
				where: {
					magicLink: await hash(req.ctx.magicLink),
				},
				data: { application },
			});
			// Remove user from pending decision pool
			await prisma.decision.deleteMany({
				where: {
					userId: req.ctx.user.id,
				},
			});
		}),

	/**
	 * Attempts to submit the user's application. Returns a dictionary
	 * containing questions with validation errors, if any.
	 */
	submitApplication: t.procedure
		.use(authenticate)
		.mutation(async (req): Promise<Record<string, string>> => {
			if (req.ctx.user.role !== Role.HACKER) {
				throw new Error('You have insufficient permissions to perform this action.');
			}
			// Ensure applications are open and the user has not received a decision yet
			if (!(await getSettings()).applicationOpen) {
				throw new Error('Sorry, applications are closed.');
			}
			if (req.ctx.user.status !== Status.VERIFIED) {
				throw new Error('You have already submitted your application.');
			}

			// Validate the user's data
			const errors: Record<string, string> = {};
			const questions = await prisma.question.findMany();
			const application = req.ctx.user.application as Record<string, string>;
			for (const question of questions) {
				const answer = application[question.id];
				if (
					question.required &&
					(answer === undefined || answer === null || answer.trim() === '')
				) {
					errors[question.label] = 'This field is required.';
				}
			}
			// Update status to applied if there are no errors
			if (Object.keys(errors).length == 0) {
				await prisma.user.update({
					where: { magicLink: await hash(req.ctx.magicLink) },
					data: { status: Status.APPLIED },
				});

				// notify user through their email on successful application submission
				const subject = 'Thanks for Submitting!';
				await sendEmail(req.ctx.user.email, subject, (await getSettings()).submitTemplate, null);
			}
			return errors;
		}),

	/**
	 * Withdraws the logged in user's application. Throws an error if
	 * user has not submitted their application yet.
	 */
	withdrawApplication: t.procedure.use(authenticate).mutation(async (req): Promise<void> => {
		if (req.ctx.user.role !== Role.HACKER) {
			throw new Error('You have insufficient permissions to perform this action.');
		}
		if (req.ctx.user.status !== Status.APPLIED) {
			throw new Error('You have not submitted your application yet.');
		}
		await prisma.user.update({
			where: { magicLink: await hash(req.ctx.magicLink) },
			data: { status: Status.VERIFIED },
		});
	}),

	/**
	 * Confirms or declines the logged in user's acceptance.
	 */
	rsvp: t.procedure
		.use(authenticate)
		.input(z.enum(['CONFIRMED', 'DECLINED']))
		.mutation(async (req): Promise<void> => {
			if (req.ctx.user.role !== Role.HACKER) {
				throw new Error('You have insufficient permissions to perform this action.');
			}
			const deadline = (await getSettings()).confirmBy;
			if (req.input === 'CONFIRMED') {
				// Hackers should only be able to confirm before deadline
				if (
					req.ctx.user.status === Status.ACCEPTED &&
					(deadline === null || new Date() < deadline)
				) {
					await prisma.user.update({
						where: { magicLink: await hash(req.ctx.magicLink) },
						data: { status: Status.CONFIRMED },
					});

					// notify user through email on confirming there RSVP
					const subject = 'Thanks for Confirming!';
					await sendEmail(req.ctx.user.email, subject, (await getSettings()).RSVPTemplate, null);
				}
			} else {
				// Hackers should be able to decline after accepting and/or the deadline
				if (req.ctx.user.status === Status.ACCEPTED || req.ctx.user.status === Status.CONFIRMED) {
					await prisma.user.update({
						where: { magicLink: await hash(req.ctx.magicLink) },
						data: { status: Status.DECLINED },
					});

					// notify user through email on successful withdrawal
					const subject = 'Application Withdrawal Confirmation';
					await sendEmail(
						req.ctx.user.email,
						subject,
						(
							await getSettings()
						).withdrawTemplate,
						null
					);
				}
			}
		}),

	/**
	 * Creates a new user with the given email, or generates a new magic
	 * link if they already exist. Returns the success status as a
	 * string.
	 */
	register: t.procedure.input(z.string()).mutation(async (req): Promise<string> => {
		const email = req.input.trim().toLowerCase();

		if (!email.match(/^\S+utexas.edu$/)) {
			return 'Please use your utexas.edu email address.';
		}

		// Generate a magic link
		const chars = new Uint8Array(MAGIC_LINK_LENGTH);
		crypto.getRandomValues(chars);
		const magicLink = Array.from(chars)
			.map((n) => CHARSET[n % CHARSET.length])
			.join('');

		// Create user and email magic link only if not already registered with this email
		await prisma.user.upsert({
			where: { email },
			create: {
				email: email,
				magicLink: await hash(magicLink),
			},
			update: {
				magicLink: await hash(magicLink),
			},
		});

		// Send email with magic link
		const link = `${
			process.env.DOMAIN_NAME ?? 'https://' + process.env.VERCEL_URL
		}/login/${magicLink}`;
		const message = `Please click on this link to log in to Rodeo: <a href="${link}">${link}</a>
			<br>
			<br>
			Keep this email safe as anyone with this link can log in to your account.
			If you misplace this email, you can always request a new link by registering again with this same email address.
			Note that this will invalidate your previous link.`;
		return await sendEmail(email, 'Welcome to Rodeo!', message, null);
	}),

	/**
	 * Creates a new user with the given email. Logged-in user must be
	 * an admin.
	 */
	create: t.procedure
		.use(authenticate)
		.input(
			z.object({
				fullName: z.string(),
				email: z
					.string()
					.trim()
					.transform((email) => email.toLowerCase()),
				role: z.nativeEnum(Role),
			})
		)
		.mutation(async (req): Promise<string> => {
			if (req.ctx.user.role !== Role.ADMIN) {
				throw new Error('You have insufficient permissions to perform this action.');
			}
			// Generate a magic link
			const chars = new Uint8Array(MAGIC_LINK_LENGTH);
			crypto.getRandomValues(chars);
			const magicLink = Array.from(chars)
				.map((n) => CHARSET[n % CHARSET.length])
				.join('');

			// Create user and email magic link
			try {
				await prisma.user.create({
					data: { magicLink: await hash(magicLink), ...req.input },
				});
			} catch (e) {
				if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === 'P2002') {
					return 'User with this email already exists.';
				}
			}

			// Send email with magic link
			const link = `${
				process.env.DOMAIN_NAME ?? 'https://' + process.env.VERCEL_URL
			}/login/${magicLink}`;
			const message = `Please click on this link to log in to Rodeo: <a href="${link}">${link}</a>
			<br>
			<br>
			Keep this email safe as anyone with this link can log in to your account.
			If you misplace this email, you can always request a new link by registering again with this same email address.
			Note that this will invalidate your previous link.`;
			return await sendEmail(req.input.email, 'Welcome to Rodeo!', message, null);
		}),

	/**
	 * Creates a new user with the given email. Logged-in user must be
	 * an admin.
	 */
	sendUserEmails: t.procedure
		.use(authenticate)
		.input(
			z.object({
				subject: z.string(),
				body: z.string(),
				group: z.array(z.string()),
			})
		)
		.mutation(async (req): Promise<void> => {
			if (req.ctx.user.role !== Role.ADMIN) {
				throw new Error('You have insufficient permissions to perform this action.');
			}

			const statusList: Status[] = req.input.group as Status[];

			for (const status of statusList) {
				const users = await prisma.decision.findMany({
					where: {
						status: status,
					},
				});
				for (const user of users) {
					const hacker = await prisma.user.findUnique({
						where: {
							id: user.id,
						},
					});
					if (hacker) {
						await sendEmailWithBody(hacker?.email, req.input.subject, req.input.body);
					}
				}
			}
		}),

	/**
	 * Verify a user.
	 */
	verify: t.procedure.use(authenticate).mutation(async (req): Promise<void> => {
		if (req.ctx.user.status === Status.CREATED) {
			await prisma.user.update({
				where: {
					magicLink: await hash(req.ctx.magicLink),
				},
				data: {
					status: Status.VERIFIED,
				},
			});
		}
	}),

	/**
	 * Scan a user's Hacker ID for the given action. Logged-in user must
	 * be an organizer or admin.
	 */
	scan: t.procedure
		.use(authenticate)
		.input(z.object({ magicLink: z.string(), action: z.string() }))
		.mutation(async (req): Promise<void> => {
			if (req.ctx.user.role !== Role.ORGANIZER && req.ctx.user.role !== Role.ADMIN) {
				throw new Error('You have insufficient permissions to perform this action.');
			}
			const scanCount = (
				await prisma.user.findUniqueOrThrow({
					where: {
						magicLink: req.input.magicLink,
					},
				})
			).scanCount as Prisma.JsonObject;
			const scans = Number(scanCount[req.input.action] ?? 0);
			await prisma.user.update({
				where: {
					magicLink: req.input.magicLink,
				},
				data: {
					scanCount: { ...scanCount, [req.input.action]: scans + 1 },
				},
			});
		}),

	/**
	 * Returns the number of hackers who have scanned for the given
	 * action at least once. Logged-in user must be an organizer or
	 * admin.
	 */
	getScanCount: t.procedure
		.use(authenticate)
		.input(z.string())
		.query(async (req): Promise<number> => {
			if (req.ctx.user.role !== Role.ORGANIZER && req.ctx.user.role !== Role.ADMIN) {
				throw new Error('You have insufficient permissions to perform this action.');
			}
			return await prisma.user.count({
				where: {
					AND: [
						{
							role: Role.HACKER,
						},
						{
							scanCount: {
								path: [req.input],
								gt: 0,
							},
						},
					],
				},
			});
		}),

	/**
	 * Gets all users. User must be an admin.
	 */
	getAll: t.procedure
		.use(authenticate)
		.query(async (req): Promise<Prisma.UserGetPayload<{ include: { decision: true } }>[]> => {
			if (req.ctx.user.role !== Role.ADMIN) {
				throw new Error('You have insufficient permissions to perform this action.');
			}
			return await prisma.user.findMany({ orderBy: [{ id: 'asc' }], include: { decision: true } });
		}),
});
