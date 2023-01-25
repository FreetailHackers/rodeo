import sgMail from '@sendgrid/mail';
import { initTRPC, type inferAsyncReturnType } from '@trpc/server';
import { z } from 'zod';
import prisma from '$lib/trpc/db';
import type { User } from '@prisma/client';

export async function createContext() {
	return {};
}
type Context = inferAsyncReturnType<typeof createContext>;
export const t = initTRPC.context<Context>().create();

const MAGIC_LINK_LENGTH = 32;
const CHARSET = 'abcdefghijklmnopqrstuvwxyz';

sgMail.setApiKey(process.env.SENDGRID_KEY as string);

async function hash(input: string): Promise<string> {
	const hashBuffer = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(input));
	const hashHex = Array.from(new Uint8Array(hashBuffer))
		.map((b) => b.toString(16).padStart(2, '0'))
		.join('');
	return hashHex;
}

export const router = t.router({
	/**
	 * Gets the user with the given magic link. Returns null if no user
	 * with the given magic link exists.
	 */
	getUser: t.procedure.input(z.string().optional()).query(async (req): Promise<User | null> => {
		const magicLink = req.input;
		if (magicLink === undefined) {
			return null;
		}
		return await prisma.user.findUnique({
			where: {
				magicLink: await hash(magicLink),
			},
		});
	}),

	/**
	 * Sets the user with the given magic link to the given data.
	 */
	setUser: t.procedure
		.input(
			z.object({
				magicLink: z.string(),
				data: z.object({ name: z.string().optional() }),
			})
		)
		.mutation(async (req): Promise<void> => {
			await prisma.user.update({
				where: {
					magicLink: req.input.magicLink,
				},
				data: req.input.data,
			});
		}),

	/**
	 * Create a new user with the given email. Returns the success
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

	getAnnouncements: t.procedure.query(async () => {
		return await prisma.announcement.findMany();
	}),
});

export function trpc() {
	return router.createCaller({});
}

export type Router = typeof router;
