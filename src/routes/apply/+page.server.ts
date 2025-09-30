import { authenticate } from '$lib/authenticate';
import { trpc } from '$lib/trpc/router';
import type { Question, Role } from '@prisma/client';
import { redirect } from '@sveltejs/kit';

export const load = async (event) => {
	await authenticate(event.locals.session, [
		'UNDECLARED',
		'HACKER',
		'MENTOR',
		'JUDGE',
		'VOLUNTEER',
		'SPONSOR',
	]);
	const settings = await trpc(event).settings.getPublic();
	const deadline = await trpc(event).users.getRSVPDeadline();

	return {
		user: await trpc(event).users.get(),
		appliedDate: await trpc(event).users.getAppliedDate(),
		rsvpDeadline: deadline,
		questions: await trpc(event).questions.get(),
		settings: settings,
		canApply: await trpc(event).admissions.checkIfBlacklisted(),
	};
};

function formToApplication(questions: Question[], formData: FormData) {
	const application: Record<string, any> = {};
	for (const question of questions) {
		if (
			question.type === 'SENTENCE' ||
			question.type === 'PARAGRAPH' ||
			question.type === 'RADIO' ||
			question.type === 'FILE'
		) {
			application[question.id] = formData.get(question.id);
		} else if (question.type === 'NUMBER') {
			application[question.id] = Number(formData.get(question.id));
			if (isNaN(application[question.id])) {
				application[question.id] = undefined;
			}
		} else if (question.type === 'CHECKBOX') {
			application[question.id] = formData.get(question.id) === 'on';
		} else if (question.type === 'DROPDOWN') {
			const selected = formData.get(question.id) as string;
			try {
				application[question.id] = JSON.parse(selected);
			} catch (ignore) {
				// empty try-catch needed because JSON.parse on an empty string errors
			}
		}
	}
	application['selectedRole'] = formData.get('group_applied');
	if (application['selectedRole'] === null) {
		application['selectedRole'] = 'UNDECLARED';
	}
	return application;
}

export const actions = {
	save: async (event) => {
		await trpc(event).users.update(
			formToApplication(await trpc(event).questions.get(), await event.request.formData()),
		);
	},

	finish: async (event) => {
		if (!(await trpc(event).admissions.checkIfBlacklisted())) {
			throw redirect(301, '/apply');
		}
		const formData = await event.request.formData();
		const selectedRole = formData.get('group_applied');
		const allowedRoles = ['HACKER', 'MENTOR', 'JUDGE', 'VOLUNTEER'] as const;

		await trpc(event).users.update(formToApplication(await trpc(event).questions.get(), formData));
		if (allowedRoles.includes(selectedRole as any)) {
			const application = await trpc(event).users.submitApplication(
				selectedRole as (typeof allowedRoles)[number],
			);
			return application;
		} else {
			return new Response('Invalid role selected', { status: 400 });
		}
	},

	withdraw: async (event) => {
		if (!(await trpc(event).admissions.checkIfBlacklisted())) {
			return new Response(null, {
				status: 301,
				headers: { location: '/apply' },
			});
		}

		const user = await trpc(event).users.get();
		const originalRole = user.authUser.roles[0] || 'UNDECLARED';

		await trpc(event).users.withdrawApplication();

		await trpc(event).users.update({ selectedRole: originalRole });
	},

	confirm: async (event) => {
		await trpc(event).users.rsvp('CONFIRMED');
	},

	decline: async (event) => {
		await trpc(event).users.rsvp('DECLINED');
	},
};
