import { hash } from '../hash';
import sgMail from '@sendgrid/mail';
import { initTRPC, type inferAsyncReturnType } from '@trpc/server';
import { z } from 'zod';
import prisma from '$lib/trpc/db';
import { Role, type Announcement, type Settings, type User } from '@prisma/client';
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
	})
	.strict();
const defaultSettings: Settings = {
	id: 0,
	applicationOpen: true,
};

export const router = t.router({
	/**
	 * Gets the user with the given magic link.
	 */
	getUser: t.procedure.query(async (req): Promise<User | null> => {
		return await prisma.user.findUnique({
			where: {
				magicLink: await hash(req.ctx.magicLink),
			},
		});
	}),

	/**
	 * Sets the user with the given magic link to the given data.
	 */
	setUser: t.procedure.input(userSchema).mutation(async (req): Promise<void> => {
		await prisma.user.update({
			where: {
				magicLink: await hash(req.ctx.magicLink),
			},
			data: req.input,
		});
	}),

	/**
	 * Creates a new user with the given email. Returns the success
	 * status as a string.
	 */
	createUser: t.procedure
		.input(z.string())
		.mutation(
			async (req): Promise<'EMAIL_INVALID' | 'EMAIL_TAKEN' | 'EMAIL_FAILURE' | 'EMAIL_SENT'> => {
				const email = req.input;

				if (!email.match(/^\S+@\S+\.\S+$/)) {
					return 'EMAIL_INVALID';
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
						await sgMail.send(msg);
						await prisma.user.create({
							data: {
								email: email,
								magicLink: await hash(magicLink),
							},
						});
						return 'EMAIL_SENT';
					} catch (error) {
						return 'EMAIL_FAILURE';
					}
				} else {
					return 'EMAIL_TAKEN';
				}
			}
		),

	/**
	 * Gets all users. User must be an admin.
	 */
	getUsers: t.procedure.query(async (req): Promise<User[]> => {
		const user = await prisma.user.findUnique({
			where: {
				magicLink: await hash(req.ctx.magicLink),
			},
		});
		if (user === null || user.role !== Role.ADMIN) {
			throw new Error('User is not an admin');
		}
		return await prisma.user.findMany();
	}),

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
		const user = await prisma.user.findUnique({
			where: {
				magicLink: await hash(req.ctx.magicLink),
			},
		});
		if (user === null || user.role !== Role.ADMIN) {
			throw new Error('User is not an admin');
		}
		await prisma.announcement.create({
			data: {
				body: req.input,
			},
		});
	}),

	/**
	 * Returns whether applications are open.
	 */
	getApplicationOpen: t.procedure.query(async (): Promise<boolean> => {
		const settings = (await prisma.settings.findUnique({ where: { id: 0 } })) ?? defaultSettings;
		return settings.applicationOpen;
	}),

	/**
	 * Get all settings. User must be an admin.
	 */
	getSettings: t.procedure.query(async (req): Promise<Settings> => {
		const user = await prisma.user.findUnique({
			where: {
				magicLink: await hash(req.ctx.magicLink),
			},
		});
		if (user === null || user.role !== Role.ADMIN) {
			throw new Error('User is not an admin');
		}
		return (await prisma.settings.findUnique({ where: { id: 0 } })) ?? defaultSettings;
	}),

	/**
	 * Sets the given settings to the given values. User must be an admin.
	 */
	setSettings: t.procedure.input(settingsSchema).mutation(async (req): Promise<void> => {
		const user = await prisma.user.findUnique({
			where: {
				magicLink: await hash(req.ctx.magicLink),
			},
		});
		if (user === null || user.role !== Role.ADMIN) {
			throw new Error('User is not an admin');
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
