import { Google } from 'arctic';

if (!process.env.GOOGLE_CLIENT_ID || !process.env.GOOGLE_CLIENT_SECRET) {
	console.error('Google OAuth environment variables missing:', {
		hasClientId: !!process.env.GOOGLE_CLIENT_ID,
		hasClientSecret: !!process.env.GOOGLE_CLIENT_SECRET,
		domainName: process.env.DOMAIN_NAME,
	});
	throw new Error('Google OAuth client ID or client secret is not set in environment variables.');
}

// Create a function to get Google client with dynamic redirect URI
export function createGoogleClient(redirectUri: string) {
	return new Google(process.env.GOOGLE_CLIENT_ID!, process.env.GOOGLE_CLIENT_SECRET!, redirectUri);
}

// Default export for backwards compatibility (using environment DOMAIN_NAME)
console.log('Google OAuth configuration:', {
	clientId: process.env.GOOGLE_CLIENT_ID?.substring(0, 10) + '...',
	redirectUri: `${process.env.DOMAIN_NAME}/login/oauth/google/callback`,
});

export const google = new Google(
	process.env.GOOGLE_CLIENT_ID,
	process.env.GOOGLE_CLIENT_SECRET,
	`${process.env.DOMAIN_NAME}/login/oauth/google/callback`,
);
