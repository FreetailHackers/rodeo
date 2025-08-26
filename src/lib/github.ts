import { GitHub } from 'arctic';

if (!process.env.GITHUB_CLIENT_ID || !process.env.GITHUB_CLIENT_SECRET) {
	throw new Error('GitHub OAuth client ID or client secret is not set in environment variables.');
}

// Create a function to get GitHub client with dynamic redirect URI
export function createGitHubClient(redirectUri: string) {
	return new GitHub(process.env.GITHUB_CLIENT_ID!, process.env.GITHUB_CLIENT_SECRET!, redirectUri);
}

// Default export for backwards compatibility (using environment DOMAIN_NAME)
export const github = new GitHub(
	process.env.GITHUB_CLIENT_ID,
	process.env.GITHUB_CLIENT_SECRET,
	`${process.env.DOMAIN_NAME}/login/oauth/github/callback`,
);
