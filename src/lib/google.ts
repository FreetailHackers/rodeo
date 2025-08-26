import { Google } from 'arctic';

if (!process.env.GOOGLE_CLIENT_ID || !process.env.GOOGLE_CLIENT_SECRET) {
	throw new Error('Google OAuth client ID or client secret is not set in environment variables.');
}

// Create a function to get Google client with dynamic redirect URI
export function createGoogleClient(redirectUri: string) {
	return new Google(process.env.GOOGLE_CLIENT_ID!, process.env.GOOGLE_CLIENT_SECRET!, redirectUri);
}

// Default export for backwards compatibility (using environment DOMAIN_NAME)
export const google = new Google(
	process.env.GOOGLE_CLIENT_ID,
	process.env.GOOGLE_CLIENT_SECRET,
	`${process.env.DOMAIN_NAME || 'http://localhost:5173'}/login/oauth/google/callback`,
);
