import { error, type Cookies } from '@sveltejs/kit';
import { trpc } from './trpc/router';

export default async function authenticate(cookies: Cookies) {
	const magicLink = cookies.get('magicLink');
	if (magicLink === undefined) {
		throw error(401, 'Unauthorized');
	}
	const user = await trpc().getUser(magicLink);
	if (user === null) {
		throw error(401, 'Unauthorized');
	}
	return user;
}
