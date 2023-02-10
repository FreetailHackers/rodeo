import { hash } from '../hash';
import sgMail from '@sendgrid/mail';
import { initTRPC, type inferAsyncReturnType } from '@trpc/server';
import { z } from 'zod';
import prisma from '$lib/trpc/db';
import { Prisma, Role, Status, type Announcement, type Settings, type User } from '@prisma/client';
import type { Cookies } from '@sveltejs/kit';

export function createContext(cookies: Cookies) {
	return { magicLink: cookies.get('magicLink') ?? '' };
}
type Context = inferAsyncReturnType<typeof createContext>;
export const t = initTRPC.context<Context>().create();

const MAGIC_LINK_LENGTH = 32;
const CHARSET = 'abcdefghijklmnopqrstuvwxyz';

sgMail.setApiKey(process.env.SENDGRID_KEY as string);

const userSchema = z
	.object({
		name: z.string().optional(),
		major: z.string().optional(),
	})
	.strict();
const settingsSchema = z
	.object({
		applicationOpen: z.boolean().optional(),
		rollingAdmissions: z.boolean().optional(),
	})
	.strict();
const defaultSettings: Settings = {
	id: 0,
	applicationOpen: true,
	rollingAdmissions: false,
};

const getSettings = async (): Promise<Settings> => {
	return (await prisma.settings.findUnique({ where: { id: 0 } })) ?? defaultSettings;
};

export const router = t.router({
	/**
	 * Gets the logged in user.
	 */
	getUser: t.procedure.query(async (req): Promise<User | null> => {
		return await prisma.user.findUnique({
			where: {
				magicLink: await hash(req.ctx.magicLink),
			},
		});
	}),

	/**
	 * Sets the logged in user to the given data. If the user has finished
	 * their application, they will be un-applied.
	 */
	setUser: t.procedure.input(userSchema).mutation(async (req): Promise<void> => {
		const user = await prisma.user.findUniqueOrThrow({
			where: { magicLink: await hash(req.ctx.magicLink) },
		});
		if (!(await getSettings()).applicationOpen) {
			throw new Error('Sorry, applications are closed.');
		}
		// Only let verified users that haven't received a decision update their info
		if (user.status === Status.VERIFIED || user.status === Status.APPLIED) {
			await prisma.user.update({
				where: {
					magicLink: await hash(req.ctx.magicLink),
				},
				// "Un-apply" the user if they're already applied
				data: { ...req.input, status: Status.VERIFIED },
			});
		}
	}),

	/**
	 * Attempts to submit the user's application. Returns a dictionary
	 * containing questions with validation errors, if any.
	 */
	submitApplication: t.procedure.mutation(async (req): Promise<Record<string, string>> => {
		// Ensure applications are open and the user has not received a decision yet
		const user = await prisma.user.findUniqueOrThrow({
			where: { magicLink: await hash(req.ctx.magicLink) },
		});
		if (!(await getSettings()).applicationOpen) {
			throw new Error('Sorry, applications are closed.');
		}
		if (user.status !== Status.VERIFIED) {
			throw new Error('You have already submitted your application.');
		}

		// Validate the user's data
		const errors: Record<string, string> = {};
		if (user.name === null || user.name.trim() === '') {
			errors.name = 'Please enter your name.';
		}
		if (user.major === null || user.major.trim() === '') {
			errors.major = 'Please enter your major.';
		}

		// Update status to applied if there are no errors
		if (Object.keys(errors).length == 0) {
			await prisma.user.update({
				where: { magicLink: await hash(req.ctx.magicLink) },
				data: { status: Status.APPLIED },
			});
		}
		return errors;
	}),

	/**
	 * Creates a new user with the given email. Returns the success
	 * status as a string.
	 */
	createUser: t.procedure.input(z.string()).mutation(async (req): Promise<string> => {
		const email = req.input;

		if (!email.match(/^\S+@\S+\.\S+$/)) {
			return 'Please enter a valid email address.';
		}

		// Generate a magic link
		const chars = new Uint8Array(MAGIC_LINK_LENGTH);
		crypto.getRandomValues(chars);
		const magicLink = Array.from(chars)
			.map((n) => CHARSET[n % CHARSET.length])
			.join('');

		// Send email with magic link
		const link = `${process.env.DOMAIN_NAME}/login/${magicLink}`;
		const msg = {
			to: email,
			from: 'hello@freetailhackers.com',
			subject: 'Welcome to Rodeo!',
			text: `Please click on this link to log in to Rodeo: ${link}`,
			html: `<p>Please click on this link to log in to Rodeo: <a href="${link}">${link}</a></p>`,
		};

		// Create user and email magic link only if not already registered with this email
		const user = await prisma.user.findUnique({ where: { email: email } });
		if (user === null) {
			try {
				await prisma.user.create({
					data: {
						email: email,
						magicLink: await hash(magicLink),
					},
				});
				await sgMail.send(msg);
				return 'We sent a magic login link to your email!';
			} catch (error) {
				console.error(error);
				return 'An unknown error occurred. Please try again later.';
			}
		}
		return 'You are already registered with this email.';
	}),

	/**
	 * Verify a user.
	 */
	verifyUser: t.procedure.mutation(async (req): Promise<void> => {
		const user = await prisma.user.findUniqueOrThrow({
			where: {
				magicLink: await hash(req.ctx.magicLink),
			},
		});
		if (user.status === Status.CREATED) {
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
	 * Bulk accepts, rejects, or waitlists a list of IDs of users with
	 * submitted applications. User must be an admin.
	 */
	decideUsers: t.procedure
		.input(
			z.object({
				decision: z.enum(['ACCEPTED', 'REJECTED', 'WAITLISTED']),
				ids: z.array(z.number()),
			})
		)
		.mutation(async (req): Promise<void> => {
			const user = await prisma.user.findUniqueOrThrow({
				where: {
					magicLink: await hash(req.ctx.magicLink),
				},
			});
			if (user.role !== Role.ADMIN) {
				throw new Error('You have insufficient permissions to perform this action.');
			}
			for (const id of req.input.ids) {
				const user = await prisma.user.findUniqueOrThrow({
					where: {
						id: id,
					},
				});
				if (user.status === Status.APPLIED || user.status === Status.WAITLISTED) {
					await prisma.decision.upsert({
						where: {
							userId: id,
						},
						create: {
							userId: id,
							status: req.input.decision,
						},
						update: {
							status: req.input.decision,
						},
					});
				}
			}
		}),

	/**
	 * Gets all decisions. User must be an admin.
	 */
	getDecisions: t.procedure.query(
		async (
			req
		): Promise<{
			accepted: Prisma.DecisionGetPayload<{ include: { user: true } }>[];
			rejected: Prisma.DecisionGetPayload<{ include: { user: true } }>[];
			waitlisted: Prisma.DecisionGetPayload<{ include: { user: true } }>[];
		}> => {
			const user = await prisma.user.findUniqueOrThrow({
				where: {
					magicLink: await hash(req.ctx.magicLink),
				},
			});
			if (user.role !== Role.ADMIN) {
				throw new Error('You have insufficient permissions to perform this action.');
			}
			return {
				accepted: await prisma.decision.findMany({
					where: { status: Status.ACCEPTED },
					include: { user: true },
				}),
				rejected: await prisma.decision.findMany({
					where: { status: Status.REJECTED },
					include: { user: true },
				}),
				waitlisted: await prisma.decision.findMany({
					where: { status: Status.WAITLISTED },
					include: { user: true },
				}),
			};
		}
	),

	/**
	 * Releases all decisions. User must be an admin. This will empty
	 * the decisions table, apply all pending decisions to the users
	 * table, and send out email notifications.
	 */
	releaseAllDecisions: t.procedure.mutation(async (req): Promise<void> => {
		const user = await prisma.user.findUniqueOrThrow({
			where: {
				magicLink: await hash(req.ctx.magicLink),
			},
		});
		if (user.role !== Role.ADMIN) {
			throw new Error('You have insufficient permissions to perform this action.');
		}
		const decisions = await prisma.decision.findMany();
		for (const decision of decisions) {
			const updateStatus = prisma.user.update({
				where: {
					id: decision.userId,
					status: { in: [Status.APPLIED, Status.WAITLISTED] },
				},
				data: {
					status: decision.status,
				},
			});
			const deleteDecision = prisma.decision.delete({
				where: {
					id: decision.id,
				},
			});
			await prisma.$transaction([updateStatus, deleteDecision]);
		}
	}),

	/**
	 * Bulk releases a list of pending decisions by user ID. User must
	 * be an admin. This will send out email notifications.
	 */
	releaseDecisions: t.procedure.input(z.array(z.number())).mutation(async (req): Promise<void> => {
		const user = await prisma.user.findUniqueOrThrow({
			where: {
				magicLink: await hash(req.ctx.magicLink),
			},
		});
		if (user.role !== Role.ADMIN) {
			throw new Error('You have insufficient permissions to perform this action.');
		}
		for (const id of req.input) {
			const decision = await prisma.decision.findUniqueOrThrow({
				where: {
					userId: id,
				},
			});
			const updateStatus = prisma.user.update({
				where: {
					id: decision.userId,
					status: { in: [Status.APPLIED, Status.WAITLISTED] },
				},
				data: {
					status: decision.status,
				},
			});
			const deleteDecision = prisma.decision.delete({
				where: {
					id: decision.id,
				},
			});
			await prisma.$transaction([updateStatus, deleteDecision]);
		}
	}),

	/**
	 * Bulk removes a list of pending decisions by user ID. User must be
	 * an admin.
	 */
	removeDecisions: t.procedure.input(z.array(z.number())).mutation(async (req): Promise<void> => {
		const user = await prisma.user.findUniqueOrThrow({
			where: {
				magicLink: await hash(req.ctx.magicLink),
			},
		});
		if (user.role !== Role.ADMIN) {
			throw new Error('You have insufficient permissions to perform this action.');
		}
		await prisma.decision.deleteMany({
			where: {
				userId: { in: req.input },
			},
		});
	}),

	/**
	 * Gets all users. User must be an admin.
	 */
	getUsers: t.procedure.query(
		async (req): Promise<Prisma.UserGetPayload<{ include: { decision: true } }>[]> => {
			const user = await prisma.user.findUniqueOrThrow({
				where: {
					magicLink: await hash(req.ctx.magicLink),
				},
			});
			if (user.role !== Role.ADMIN) {
				throw new Error('You have insufficient permissions to perform this action.');
			}
			return await prisma.user.findMany({ orderBy: [{ id: 'asc' }], include: { decision: true } });
		}
	),

	/**
	 * Gets one user that has submitted their application. User must be an admin.
	 */
	getAppliedUser: t.procedure.query(
		async (req): Promise<Prisma.UserGetPayload<{ include: { decision: true } }> | null> => {
			const user = await prisma.user.findUniqueOrThrow({
				where: {
					magicLink: await hash(req.ctx.magicLink),
				},
			});
			if (user.role !== Role.ADMIN) {
				throw new Error('You have insufficient permissions to perform this action.');
			}
			return await prisma.user.findFirst({
				where: {
					status: { in: [Status.APPLIED, Status.WAITLISTED] },
					decision: null,
				},
				include: { decision: true },
			});
		}
	),

	/**
	 * Gets all announcements.
	 */
	getAnnouncements: t.procedure.query(async (): Promise<Announcement[]> => {
		return await prisma.announcement.findMany({
			orderBy: [{ published: 'desc' }],
		});
	}),

	/**
	 * Creates a new announcement. User must be an admin.
	 */
	createAnnouncement: t.procedure.input(z.string().min(1)).mutation(async (req): Promise<void> => {
		const user = await prisma.user.findUniqueOrThrow({
			where: {
				magicLink: await hash(req.ctx.magicLink),
			},
		});
		if (user.role !== Role.ADMIN) {
			throw new Error('You have insufficient permissions to perform this action.');
		}
		await prisma.announcement.create({ data: { body: req.input } });
	}),

	/**
	 * Deletes an announcement by ID. User must be an admin.
	 */
	deleteAnnouncement: t.procedure.input(z.number()).mutation(async (req): Promise<void> => {
		const user = await prisma.user.findUniqueOrThrow({
			where: {
				magicLink: await hash(req.ctx.magicLink),
			},
		});
		if (user.role !== Role.ADMIN) {
			throw new Error('You have insufficient permissions to perform this action.');
		}
		await prisma.announcement.delete({ where: { id: req.input } });
	}),

	/**
	 * Returns whether applications are open.
	 */
	getApplicationOpen: t.procedure.query(async (): Promise<boolean> => {
		return (await getSettings()).applicationOpen;
	}),

	/**
	 * Get all settings. User must be an admin.
	 */
	getSettings: t.procedure.query(async (req): Promise<Settings> => {
		const user = await prisma.user.findUniqueOrThrow({
			where: {
				magicLink: await hash(req.ctx.magicLink),
			},
		});
		if (user.role !== Role.ADMIN) {
			throw new Error('You have insufficient permissions to perform this action.');
		}
		return await getSettings();
	}),

	/**
	 * Sets the given settings to the given values. User must be an admin.
	 */
	setSettings: t.procedure.input(settingsSchema).mutation(async (req): Promise<void> => {
		const user = await prisma.user.findUniqueOrThrow({
			where: {
				magicLink: await hash(req.ctx.magicLink),
			},
		});
		if (user.role !== Role.ADMIN) {
			throw new Error('You have insufficient permissions to perform this action.');
		}
		await prisma.settings.upsert({
			where: { id: 0 },
			update: req.input,
			create: { id: 0, ...req.input },
		});
	}),
});

export function trpc(cookies: Cookies) {
	return router.createCaller(createContext(cookies));
}

export type Router = typeof router;
