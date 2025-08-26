import { GitHub } from 'arctic';

if (!process.env.GITHUB_CLIENT_ID || !process.env.GITHUB_CLIENT_SECRET) {
	throw new Error('GitHub OAuth client ID or client secret is not set in environment variables.');
}

// Create GitHub client with dynamic redirect URI based on current hostname
export function createGitHubClient(hostname?: string): GitHub {
	let redirectUri: string;

	if (hostname) {
		redirectUri = `https://${hostname}/login/oauth/github/callback`;
	} else {
		// Fallback to environment variable for server-side rendering
		redirectUri = `${process.env.DOMAIN_NAME}/login/oauth/github/callback`;
	}

	return new GitHub(process.env.GITHUB_CLIENT_ID!, process.env.GITHUB_CLIENT_SECRET!, redirectUri);
}

// Default export for backward compatibility
export const github = createGitHubClient();
