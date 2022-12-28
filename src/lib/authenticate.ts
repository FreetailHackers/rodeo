import { redirect, type Cookies } from '@sveltejs/kit';
import { trpc } from './trpc/router';

export default async function authenticate(cookies: Cookies) {
	const magicLink = cookies.get('magicLink');
	if (magicLink === undefined) {
		throw redirect(303, '/');
	}
	const user = await trpc().getUser(magicLink);
	if (user === null) {
		throw redirect(303, '/');
	}
	return user;
}
