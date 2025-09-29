import type { Prisma } from '@prisma/client';
import { z } from 'zod';
import { prisma } from '../db';
import { authenticate } from '../middleware';
import { t } from '../t';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { GetObjectCommand, S3Client } from '@aws-sdk/client-s3';

const s3Client = new S3Client({ region: process.env.AWS_REGION });

export const QrCodeStyleRouter = t.router({
	update: t.procedure
		.use(authenticate(['ADMIN']))
		.input(
			z.object({
				group: z.string(),
				imageKey: z.string().optional(),
				dotsOptions: z.object({
					color: z.string(),
					type: z.string(),
				}),
				backgroundOptions: z.object({
					color: z.string(),
				}),
			}),
		)
		.mutation(async ({ input }): Promise<void> => {
			try {
				const group = await prisma.qrCodeStyle.upsert({
					where: {
						id: input.group,
					},
					update: {
						qrCodeStyle: {
							imageKey: input.imageKey,
							dotsOptions: input.dotsOptions,
							backgroundOptions: input.backgroundOptions,
						},
					},
					create: {
						id: input.group,
						qrCodeStyle: {
							imageKey: input.imageKey,
							dotsOptions: input.dotsOptions,
							backgroundOptions: input.backgroundOptions,
						},
					},
				});

				console.log(group);
			} catch (error) {
				console.error('Failed to update QR code style:', error);
			}
		}),

	get: t.procedure
		.use(authenticate(['HACKER', 'ADMIN']))
		.input(z.string())
		.query(async ({ input }): Promise<Prisma.JsonValue | null> => {
			return (
				(
					await prisma.qrCodeStyle.findUnique({
						where: { id: input },
					})
				)?.qrCodeStyle ?? null
			);
		}),

	getImageUrl: t.procedure.input(z.string()).query(async (req): Promise<string | null> => {
		const imageKey = req.input;

		try {
			const url = await getSignedUrl(
				s3Client,
				new GetObjectCommand({
					Bucket: process.env.S3_BUCKET,
					Key: imageKey,
				}),
			);
			return url;
		} catch (error) {
			console.error(`Error fetching signed URL for qr-code image`, error);
			return null;
		}
	}),
});
