import type { RequestHandler } from './$types';
import prisma from './db';

const MAGIC_LINK_LENGTH = 32;
const CHARSET = 'abcdefghijklmnopqrstuvwxyz';

export const GET = (async ({ cookies }) => {
	const magicLink = cookies.get('magicLink');
	if (magicLink === undefined) {
		return new Response('Unauthorized', { status: 401 });
	}
	const user = await prisma.user.findUnique({
		where: {
			magicLink: magicLink,
		},
	});
	return new Response(JSON.stringify(user));
}) satisfies RequestHandler;

export const POST = (async ({ request }) => {
	const email = await request.text();

	if (email === '' || !email.match(/^\S+@\S+\.\S+$/)) {
		return new Response('Please enter a valid email address.');
	}

	const chars = new Uint8Array(MAGIC_LINK_LENGTH);
	crypto.getRandomValues(chars);
	const magicLink = Array.from(chars)
		.map((n) => CHARSET[n % CHARSET.length])
		.join('');

	await prisma.user.upsert({
		where: {
			email: email,
		},
		update: {
			magicLink: magicLink,
		},
		create: {
			email: email,
			magicLink: magicLink,
		},
	});
	return new Response(`We sent a magic login link to ${email}.`);
}) satisfies RequestHandler;
