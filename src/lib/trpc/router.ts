import { initTRPC, type inferAsyncReturnType } from '@trpc/server';
import { z } from 'zod';
import prisma from '$lib/trpc/db';

export async function createContext() {
	return {};
}
type Context = inferAsyncReturnType<typeof createContext>;
export const t = initTRPC.context<Context>().create();

const MAGIC_LINK_LENGTH = 32;
const CHARSET = 'abcdefghijklmnopqrstuvwxyz';

export const router = t.router({
	getUser: t.procedure.input(z.string().optional()).query(async (req) => {
		const magicLink = req.input;
		if (magicLink === undefined) {
			return null;
		}
		return await prisma.user.findUnique({
			where: {
				magicLink,
			},
		});
	}),

	setUser: t.procedure
		.input(
			z.object({
				magicLink: z.string(),
				data: z.object({ name: z.string().optional() }),
			})
		)
		.mutation(async (req) => {
			await prisma.user.update({
				where: {
					magicLink: req.input.magicLink,
				},
				data: req.input.data,
			});
		}),

	generateMagicLink: t.procedure.input(z.string()).mutation(async (req) => {
		const email = req.input;

		if (!email.match(/^\S+@\S+\.\S+$/)) {
			return 'Please enter a valid email address.';
		}

		const chars = new Uint8Array(MAGIC_LINK_LENGTH);
		crypto.getRandomValues(chars);
		const magicLink = Array.from(chars)
			.map((n) => CHARSET[n % CHARSET.length])
			.join('');

		// Create user if not already registered with this email
		await prisma.user.upsert({
			where: {
				email: email,
			},
			update: {},
			create: {
				email: email,
				magicLink: magicLink,
			},
		});
		return `We sent a magic login link to ${email}.`;
	}),

	getAnnouncements: t.procedure.query(async () => {
		return await prisma.announcement.findMany();
	}),
});

export function trpc() {
	return router.createCaller({});
}

export type Router = typeof router;
