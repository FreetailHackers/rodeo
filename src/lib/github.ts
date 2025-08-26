import { GitHub } from 'arctic';

if (!process.env.GITHUB_CLIENT_ID || !process.env.GITHUB_CLIENT_SECRET) {
	throw new Error('GitHub OAuth client ID or client secret is not set in environment variables.');
}

// GitHub OAuth apps only allow one redirect URI per app
// So we always use the primary domain for GitHub OAuth
const PRIMARY_DOMAIN = 'rodeo.freetailhackers.com';

// Create GitHub client with consistent redirect URI
export function createGitHubClient(): GitHub {
	const redirectUri = `https://${PRIMARY_DOMAIN}/login/oauth/github/callback`;

	console.log(`[GitHub Client] Creating client with redirect URI: ${redirectUri}`);

	return new GitHub(process.env.GITHUB_CLIENT_ID!, process.env.GITHUB_CLIENT_SECRET!, redirectUri);
}

// Default export for backward compatibility
export const github = createGitHubClient();
