import { Google } from 'arctic';

if (!process.env.GOOGLE_CLIENT_ID || !process.env.GOOGLE_CLIENT_SECRET) {
	throw new Error('Google OAuth client ID or client secret is not set in environment variables.');
}

export const google = new Google(
	process.env.GOOGLE_CLIENT_ID,
	process.env.GOOGLE_CLIENT_SECRET,
	'http://localhost:5173/login/oauth/google/callback',
);
