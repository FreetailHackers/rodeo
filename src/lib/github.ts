import { GitHub } from 'arctic';

// TODO: Update redirect URI
if (!process.env.GITHUB_CLIENT_ID || !process.env.GITHUB_CLIENT_SECRET) {
	throw new Error('GitHub OAuth client ID or client secret is not set in environment variables.');
}
export const github = new GitHub(
	process.env.GITHUB_CLIENT_ID,
	process.env.GITHUB_CLIENT_SECRET,
	'http://localhost:5173/login/oauth/github/callback',
);
