import lucia from 'lucia-auth';
import { github } from '@lucia-auth/oauth/providers';
import { sveltekit } from 'lucia-auth/middleware';
import prismaAdapter from '@lucia-auth/adapter-prisma';
import { dev } from '$app/environment';
import { prisma } from './trpc/db';

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

// Abuse IIFE to conditionally export the GitHub OAuth provider hehe
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
			scope: ['user:email'],
		});
	}
})();

export type Auth = typeof auth;
