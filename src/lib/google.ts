import { Google } from 'arctic';

export function createGoogleClient(redirectUri: string) {
	return new Google(process.env.GOOGLE_CLIENT_ID!, process.env.GOOGLE_CLIENT_SECRET!, redirectUri);
}

export const google = new Google(
	process.env.GOOGLE_CLIENT_ID!,
	process.env.GOOGLE_CLIENT_SECRET!,
	`${process.env.DOMAIN_NAME || 'http://localhost:5173'}/login/oauth/google/callback`,
);
