import lucia from 'lucia-auth';
import { google } from '@lucia-auth/oauth/providers';
import { github } from '@lucia-auth/oauth/providers';
import { sveltekit } from 'lucia-auth/middleware';
import prismaAdapter from '@lucia-auth/adapter-prisma';
import { dev } from '$app/environment';
import { prisma } from './trpc/db';
import { idToken } from '@lucia-auth/tokens';

export const auth = lucia({
	adapter: prismaAdapter(prisma),
	env: dev ? 'DEV' : 'PROD',
	middleware: sveltekit(),
	transformDatabaseUser: (user) => ({
		...user,
		email: user.email,
		role: user.role,
		status: user.status,
	}),
});

// Abuse IIFEs to conditionally export OAuth providers hehe

export const googleAuth = (() => {
	if (
		process.env.GOOGLE_CLIENT_ID === undefined ||
		process.env.GOOGLE_CLIENT_SECRET === undefined
	) {
		return null;
	} else {
		return google(auth, {
			clientId: process.env.GOOGLE_CLIENT_ID,
			clientSecret: process.env.GOOGLE_CLIENT_SECRET,
			redirectUri: process.env.DOMAIN_NAME + '/login/oauth/google',
			scope: ['email'],
		});
	}
})();

export const githubAuth = (() => {
	if (
		process.env.GITHUB_CLIENT_ID === undefined ||
		process.env.GITHUB_CLIENT_SECRET === undefined
	) {
		return null;
	} else {
		return github(auth, {
			clientId: process.env.GITHUB_CLIENT_ID,
			clientSecret: process.env.GITHUB_CLIENT_SECRET,
			redirectUri: process.env.DOMAIN_NAME + '/login/oauth/github',
			scope: ['user:email'],
		});
	}
})();

export const resetPasswordToken = idToken(auth, 'reset-password', { expiresIn: 10 * 60 });

export type Auth = typeof auth;
