import type { Actions } from './$types';
import { uploadWalletPassFiles, getCurrentPass } from '$lib/trpc/routes/pass';

export const actions: Actions = {
	upload: async ({ request }) => {
		try {
			const formData = await request.formData();

			const files = formData.getAll('files') as File[];

			let stripFile: File | null = null;
			let passFile: File | null = null;

			for (const file of files) {
				if (file.name === 'strip.png') {
					stripFile = file;
				} else if (file.name === 'pass.json') {
					passFile = file;
				}
			}

			const result = await uploadWalletPassFiles({
				stripFile,
				passFile,
			});

			return {
				success: true,
				message: result.message,
			};
		} catch (err) {
			console.error('Upload error:', err);

			return {
				success: false,
				message: err instanceof Error ? err.message : 'Upload failed',
			};
		}
	},
};
