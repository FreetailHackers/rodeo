import { verify } from '@node-rs/argon2';
import { redirect } from '@sveltejs/kit';
import * as auth from '$lib/authenticate';
import { prisma } from '$lib/trpc/db';

export const load = async (event) => {
	if (event.locals.user) {
		return redirect(303, '/');
	}

	return {
		user: null, // No user is logged in
		providers: {
			google: auth.googleAuth !== null,
			github: auth.githubAuth !== null,
		},
	};
};

export const actions = {
	login: async (event) => {
		const formData = await event.request.formData();
		const email = formData.get('email') as string;
		const password = formData.get('password') as string;

		const user = await prisma.authUser.findUnique({
			where: { email },
		});

		if (!user) {
			return { error: 'Invalid email or password.' };
		}

		// Logic for yopmail users (DEV ONLY)
		if (email.includes('@yopmail.com') && !password) {
			console.log('YOPmail user login detected, skipping password check.');
			const session = await auth.createSession(user.id);
			auth.setSessionTokenCookie(event, session.id, session.expiresAt);
			throw redirect(303, '/');
		}

		// Logic for email/password based login
		if (!password || !user.password) {
			return { error: 'Password is required for login.' };
		}

		const validPassword = await verify(user.password, password, {
			memoryCost: 19456,
			timeCost: 2,
			outputLen: 32,
			parallelism: 1,
		});
		if (!validPassword) {
			return { error: 'Invalid email or password.' };
		}

		const session = await auth.createSession(user.id);
		auth.setSessionTokenCookie(event, session.id, session.expiresAt);

		return redirect(303, '/');
	},
};
