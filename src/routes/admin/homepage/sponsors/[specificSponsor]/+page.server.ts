import { authenticate } from '$lib/authenticate';
import { trpc } from '$lib/trpc/router';
import { error, redirect } from '@sveltejs/kit';

import { writeFileSync, unlinkSync } from 'fs';

export const load = async ({ locals, params }) => {
	await authenticate(locals.auth, ['ADMIN']);
	if (Number.isNaN(Number(params.specificSponsor))) {
		throw error(404, 'Sponsor not found');
	}
	const sponsor = await trpc(locals.auth).infoBox.get(Number(params.specificSponsor));
	if (sponsor !== null) {
		return {
			sponsor,
		};
	}
	throw error(404, 'Sponsor not found');
};

export const actions = {
	edit: async ({ locals, request }) => {
		const formData = await request.formData();

		const sponsorLogo: File | null | undefined = formData.get('sponsorLogo') as
			| File
			| null
			| undefined;
		const sponsorLink: string = formData.get('sponsorLink') as string;

		let fileName: string | null = null;

		if (sponsorLogo && sponsorLogo?.size !== 0) {
			try {
				const existingSponsor = await trpc(locals.auth).infoBox.get(
					Number(formData.get('id') as string)
				);

				// Delete the existing file only if the sponsor record exists and deletion is successful
				if (existingSponsor) {
					await unlinkSync(`static/Sponsors/${existingSponsor.title}`);
				}
			} catch (err) {
				console.error('Error editing sponsor:', err);
				throw error(500, 'Error saving sponsor');
			}

			const imageUrl = `static/Sponsors/${sponsorLogo.name.replace(/[^\w.-]+/g, '')}`;
			fileName = sponsorLogo.name.replace(/[^\w.-]+/g, '');

			await writeFileSync(imageUrl, Buffer.from(await sponsorLogo?.arrayBuffer()));
		} else {
			try {
				const existingSponsor = await trpc(locals.auth).infoBox.get(
					Number(formData.get('id') as string)
				);
				fileName = existingSponsor?.title ?? '';
			} catch (err) {
				console.error('Error editing sponsor:', err);
				throw error(500, 'Error saving sponsor');
			}
		}

		await trpc(locals.auth).infoBox.update({
			id: Number(formData.get('id') as string),
			title: fileName,
			response: sponsorLink,
			category: 'SPONSOR',
		});

		return 'Saved sponsor!';
	},

	delete: async ({ locals, request }) => {
		const formData = await request.formData();

		//Deleting uploaded image
		try {
			const existingSponsor = await trpc(locals.auth).infoBox.get(
				Number(formData.get('id') as string)
			);

			// Delete the existing file only if the sponsor record exists and deletion is successful
			if (existingSponsor) {
				await unlinkSync(`static/Sponsors/${existingSponsor.title}`);
			}
		} catch (err) {
			console.error('Error deleting sponsor:', err);
			throw error(500, 'Error deleting sponsor');
		}

		await trpc(locals.auth).infoBox.delete(Number(formData.get('id') as string));
		throw redirect(303, '/');
	},
};
