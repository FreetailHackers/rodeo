import { GitHub } from 'arctic';

if (!process.env.GITHUB_CLIENT_ID || !process.env.GITHUB_CLIENT_SECRET) {
	throw new Error('GitHub OAuth client ID or client secret is not set in environment variables.');
}
export const github = new GitHub(
	process.env.GITHUB_CLIENT_ID,
	process.env.GITHUB_CLIENT_SECRET,
	`${process.env.DOMAIN_NAME}login/oauth/github/callback`,
);
