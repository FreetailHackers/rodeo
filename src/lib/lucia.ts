import { lucia } from 'lucia';
import { generateRandomString } from 'lucia/utils';
import { google } from '@lucia-auth/oauth/providers';
import { github } from '@lucia-auth/oauth/providers';
import { prisma as prismaAdapter } from '@lucia-auth/adapter-prisma';
import { dev } from '$app/environment';
import { prisma } from './trpc/db';
import { sveltekit } from 'lucia/middleware';

export const auth = lucia({
	adapter: prismaAdapter(prisma, {
		user: 'authUser',
		session: 'authSession',
		key: 'authKey',
	}),
	env: dev ? 'DEV' : 'PROD',
	middleware: sveltekit(),
	getUserAttributes: (user) => ({
		...user,
		email: user.email,
		roles: user.roles,
		status: user.status,
		verifiedEmail: user.verifiedEmail,
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

/**
 * Barebones reimplementation of deprecated @lucia-auth/tokens
 */
class TokenType {
	constructor(private purpose: string, private expiresIn: number) {}

	/**
	 * Invalidates all previously issued tokens for a given user and
	 * issues a new one.
	 */
	async issue(user_id: string): Promise<string> {
		await prisma.singleUseKey.deleteMany({
			where: { user_id, purpose: this.purpose },
		});
		const token = generateRandomString(32);
		await prisma.singleUseKey.create({
			data: {
				user_id,
				id: token,
				purpose: this.purpose,
				expires: new Date(Date.now() + this.expiresIn * 1000),
			},
		});
		return token;
	}

	/**
	 * Validates a token and returns the user ID it belongs to. Throws
	 * an error if the token is invalid. Also invalidates all previously
	 * issued tokens for the same user.
	 */
	async validate(token: string): Promise<string> {
		const singleUseKey = await prisma.singleUseKey.findUnique({
			where: { id: token },
		});
		if (
			singleUseKey === null ||
			singleUseKey.purpose !== this.purpose ||
			singleUseKey.expires < new Date()
		) {
			throw new Error('Invalid token');
		}
		await prisma.singleUseKey.deleteMany({
			where: { user_id: singleUseKey.user_id, purpose: this.purpose },
		});
		return singleUseKey.user_id;
	}
}

export const emailVerificationToken = new TokenType('email-verification', 7 * 24 * 60 * 60);
export const resetPasswordToken = new TokenType('reset-password', 10 * 60);

export type Auth = typeof auth;
