import { error } from '@sveltejs/kit';

export const GET = async ({ url }: { url: URL }) => {
	const imageUrl = url.searchParams.get('url');
	if (!imageUrl) throw error(400, 'Missing image URL');

	const response = await fetch(imageUrl);
	if (!response.ok) throw error(404, 'Image not found');

	const contentType = response.headers.get('content-type') || 'image/png';
	const buffer = await response.arrayBuffer();

	return new Response(buffer, {
		headers: {
			'Content-Type': contentType,
			'Cache-Control': 'public, max-age=3600',
		},
	});
};
