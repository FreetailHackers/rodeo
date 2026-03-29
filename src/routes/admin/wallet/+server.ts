import { getCurrentPass } from '$lib/trpc/routes/pass';

export async function GET() {
	try {
		const result = await getCurrentPass();

		return new Response(result.file, {
			headers: {
				'Content-Type': 'application/json',
				'Content-Disposition': 'attachment; filename=pass.json',
			},
		});
	} catch (err) {
		console.error('Download error:', err);

		return new Response('Failed to download pass.json', {
			status: 500,
		});
	}
}
