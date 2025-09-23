import { GitHub } from 'arctic';

if (!process.env.GITHUB_CLIENT_ID) {
	throw new Error('GitHub OAuth client ID is not set in environment variables.');
}

if (!process.env.GITHUB_CLIENT_SECRET) {
	throw new Error('GitHub client secret is not set in environment variables.');
}

// GitHub OAuth apps only allow one redirect URI per app
const PRIMARY_DOMAIN = 'rodeo.freetailhackers.com';

export function createGitHubClient(): GitHub {
	const redirectUri = `https://${PRIMARY_DOMAIN}/login/oauth/github/callback`;

	return new GitHub(process.env.GITHUB_CLIENT_ID!, process.env.GITHUB_CLIENT_SECRET!, redirectUri);
}

export const github = createGitHubClient();
