import type { Role, AuthSession, AuthUser } from '.prisma/client';
import { redirect } from '@sveltejs/kit';
import type { RequestEvent } from '@sveltejs/kit';
import { prisma } from './trpc/db';
import { GitHub, Google } from 'arctic';
import { hash, verify } from '@node-rs/argon2';

export const sessionCookieName = 'session';

/**
 * Authenticates and authorizes a user, redirecting to the login page if
 * they are not logged in or are not one of the specified roles. Returns
 * the user object if successful.
 *
 * NOTE: This is intended for use in Svelte/SvelteKit files like
 * +page.server.ts, not in TRPC routes. Use `authenticate` from
 * src/lib/trpc/middleware instead.
 */
export async function authenticate(sessionInput: AuthSession, roles?: Role[]): Promise<AuthUser> {
	// Changed return type
	if (!sessionInput) {
		redirect(303, '/login/?unauthenticated');
	}

	// Now, sessionInput is guaranteed to be AuthSession
	const { user } = await validateSessionToken(sessionInput.id);

	if (user === null) {
		redirect(303, '/login/?unauthenticated');
	}

	// user is now AuthUser
	if (roles !== undefined && !hasAnyRole(user.roles, roles)) {
		redirect(303, '/?forbidden');
	}

	// For all protected routes, we should make sure the user has
	// verified their email. Note that this is not currently enforced
	// in the backend; this is just a convenience to prevent users
	// from using an account with a typo'd address.
	if (!user.verifiedEmail) {
		if (user.email && user.email.trim() !== '') {
			redirect(303, '/unverified');
		} else {
			redirect(303, '/login');
		}
	}
	return user;
}

/**
 * Creates a new session for the user with the given userId.
 */
export async function createSession(userId: string) {
	const token = crypto.randomUUID();
	const session = await prisma.authSession.create({
		data: {
			id: token,
			userId,
			expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
		},
	});
	return session;
}

/**
 * Validates a session token and returns the session and user if valid.
 */
export async function validateSessionToken(sessionId: string): Promise<SessionValidationResult> {
	const session = await prisma.authSession.findUnique({
		where: { id: sessionId },
		include: {
			authUser: true,
		},
	});

	if (session === null) {
		return { session: null, user: null };
	}

	const { authUser, ...sessionData } = session;
	if (Date.now() >= sessionData.expiresAt.getTime()) {
		await prisma.authSession.delete({ where: { id: sessionId } });
		return { session: null, user: null };
	}

	let sessionRenewed = false;
	if (Date.now() >= session.expiresAt.getTime() - 15 * 24 * 60 * 60 * 1000) {
		sessionData.expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
		await prisma.authSession.update({
			where: { id: sessionId },
			data: { expiresAt: sessionData.expiresAt },
		});
		sessionRenewed = true;
	}

	return { session: sessionData, user: authUser, sessionRenewed };
}

/**
 * Invalidates a session by deleting it from the database.
 */
export async function invalidateSession(sessionId: string): Promise<void> {
	await prisma.authSession.delete({ where: { id: sessionId } });
}

/**
 * Invalidates all sessions for a given user by deleting them from the database.
 */
export async function invalidateAllSessions(userId: string): Promise<void> {
	await prisma.authSession.deleteMany({
		where: {
			userId: userId,
		},
	});
}

/**
 * Sets a cookie in the current browser session.
 */
export function setSessionTokenCookie(event: RequestEvent, token: string, expiresAt: Date) {
	const isProduction = process.env.NODE_ENV === 'production' || event.url.hostname !== 'localhost';

	event.cookies.set(sessionCookieName, token, {
		httpOnly: true,
		sameSite: isProduction ? 'none' : 'lax',
		secure: isProduction,
		expires: expiresAt,
		path: '/',
	});
}

/**
 * Deletes the session token cookie from the current browser session.
 */
export function deleteSessionTokenCookie(event: RequestEvent) {
	const isProduction = process.env.NODE_ENV === 'production' || event.url.hostname !== 'localhost';

	event.cookies.delete(sessionCookieName, {
		httpOnly: true,
		sameSite: isProduction ? 'none' : 'lax',
		secure: isProduction,
		maxAge: 0,
		path: '/',
	});
}

/**
 * Checks if the user has any of the allowed roles.
 * If no roles are specified, it allows access.
 */
function hasAnyRole(userRoles: Role[], allowedRoles: Role[]): boolean {
	if (allowedRoles.length === 0) {
		return true; // If no roles are specified, allow access
	}
	return userRoles.some((userRole) => allowedRoles.includes(userRole));
}

/**
 * WARNING: function might move location in the future
 */
export async function verifyPassword(
	hashedPassword: string,
	inputPassword: string,
): Promise<boolean> {
	return await verify(hashedPassword, inputPassword);
}

export type SessionValidationResult =
	| { session: AuthSession; user: AuthUser; sessionRenewed?: boolean }
	| { session: null; user: null; sessionRenewed?: boolean };

class TokenType {
	constructor(
		private purpose: string,
		private expiresIn: number,
	) {}

	/**
	 * Invalidates all previously issued tokens for a given user and
	 * issues a new one.
	 */
	async issue(userId: string): Promise<string> {
		await prisma.singleUseKey.deleteMany({
			where: { userId, purpose: this.purpose },
		});
		const token = crypto.randomUUID();
		await prisma.singleUseKey.create({
			data: {
				userId,
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
		const sesh = await prisma.authSession.findUnique({
			where: { id: token },
		});
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
			where: { userId: singleUseKey.userId, purpose: this.purpose },
		});
		return singleUseKey.userId;
	}
}

export const emailVerificationToken = new TokenType('email-verification', 7 * 24 * 60 * 60);
export const resetPasswordToken = new TokenType('reset-password', 10 * 60);
export const inviteToTeamToken = new TokenType('invite-to-team', 7 * 24 * 60 * 60);

/**
 * Helper function to find user using their GitHub ID.
 */
export async function getUserFromGitHubId(githubId: number): Promise<AuthUser | null> {
	// WARNING: This function might return multiple users if the GitHub ID is not unique.
	// TODO: fix ^
	const users = await prisma.authUser.findMany({
		where: { githubId: githubId },
	});
	return users.length > 0 ? users[0] : null;
}

/**
 * Creates a new user in the database with the given GitHub ID, username, and email.
 */
export async function createGitHubUser(
	githubId: number,
	githubUsername: string,
	email: string,
): Promise<AuthUser> {
	const existingUserByEmail = await prisma.authUser.findUnique({
		where: { email },
		include: { user: true },
	});

	if (existingUserByEmail) {
		if (!existingUserByEmail.githubId) {
			const updatedUser = await prisma.authUser.update({
				where: { email },
				data: {
					githubId: githubId,
					githubUsername: githubUsername,
				},
			});

			if (!existingUserByEmail.user) {
				try {
					await prisma.user.create({
						data: {
							authUserId: existingUserByEmail.id,
							application: {},
							scanCount: {},
						},
					});
				} catch (error: any) {
					if (error.code !== 'P2002') {
						throw error;
					}
				}
			}

			return updatedUser;
		} else {
			throw new Error(
				`User with email ${email} already exists and is linked to a different GitHub account.`,
			);
		}
	}

	const userId = crypto.randomUUID();

	const newUser = await prisma.authUser.create({
		data: {
			id: userId,
			email: email,
			githubId: githubId,
			githubUsername: githubUsername,
			roles: ['UNDECLARED'],
			status: 'CREATED',
			verifiedEmail: false,
		},
	});

	try {
		await prisma.user.create({
			data: {
				authUserId: newUser.id,
				application: {},
				scanCount: {},
			},
		});
	} catch (error: any) {
		if (error.code !== 'P2002') {
			throw error;
		}
	}

	return newUser;
}

/**
 * Verifies if the provided email is valid and meets basic criteria.
 * Returns true if valid, false otherwise.
 */
export function verifyEmailInput(email: string): boolean {
	return /^.+@.+\..+$/.test(email) && email.length < 256;
}

/**
 * Hashes a password using Argon2 with specific parameters.
 * Returns the hashed password as a string.
 */
export async function hashPassword(password: string): Promise<string> {
	return await hash(password, {
		memoryCost: 19456,
		timeCost: 2,
		outputLen: 32,
		parallelism: 1,
	});
}

/**
 * GitHub OAuth client instance.
 */
export const github =
	process.env.NODE_ENV === 'production'
		? new GitHub(
				process.env.GITHUB_CLIENT_ID!,
				process.env.GITHUB_CLIENT_SECRET!,
				`${process.env.DOMAIN_NAME}/login/oauth/github/callback`,
			)
		: null;

/**
 * Google OAuth client instance.
 */
export const google = new Google(
	process.env.GOOGLE_CLIENT_ID!,
	process.env.GOOGLE_CLIENT_SECRET!,
	`${process.env.DOMAIN_NAME}/login/oauth/google/callback`,
);

export function createGitHubClient(redirectUri: string) {
	return new GitHub(process.env.GITHUB_CLIENT_ID!, process.env.GITHUB_CLIENT_SECRET!, redirectUri);
}

export function createGoogleClient(redirectUri: string) {
	return new Google(process.env.GOOGLE_CLIENT_ID!, process.env.GOOGLE_CLIENT_SECRET!, redirectUri);
}
