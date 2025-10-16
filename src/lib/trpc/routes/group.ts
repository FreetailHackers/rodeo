import type { Prisma } from '@prisma/client';
import { z } from 'zod';
import { prisma } from '../db';
import { authenticate } from '../middleware';
import { t } from '../t';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { GetObjectCommand, S3Client } from '@aws-sdk/client-s3';

const s3Client = new S3Client({ region: process.env.AWS_REGION });

export const groupRouter = t.router({
	/**
	 * Creates new groups by first deleting all existing groups and then creating new ones
	 * Used for splitting hackers into lunch/meal groups
	 * @param input - Array of group names/IDs
	 * @returns Promise<void>
	 * @access ADMIN only
	 */
	createGroups: t.procedure
		.use(authenticate(['ADMIN']))
		.input(z.array(z.string()))
		.mutation(async ({ input }): Promise<void> => {
			await prisma.group.deleteMany({});

			await prisma.group.createMany({
				data: input.map((group) => ({ id: group })),
			});
		}),

	/**
	 * Updates or creates QR code styling configuration for a specific group
	 * Uses upsert to create group if it doesn't exist or update existing configuration
	 * @param input - Group ID and QR code style settings (colors, dots type, image key)
	 * @returns Promise<void>
	 * @access ADMIN only
	 */
	updateQRCode: t.procedure
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
				const group = await prisma.group.upsert({
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
			} catch (error) {
				console.error('Failed to update QR code style:', error);
			}
		}),

	/**
	 * Retrieves all groups with their QR code styling configurations
	 * Returns group IDs and their associated QR code style settings
	 * @returns Promise<Array<{id: string, qrCodeStyle: JsonValue}>>
	 * @access ADMIN only
	 */
	getGroups: t.procedure
		.use(authenticate(['ADMIN']))
		.query(async (req): Promise<{ id: string; qrCodeStyle: Prisma.JsonValue }[]> => {
			const groups = await prisma.group.findMany({
				select: { id: true, qrCodeStyle: true },
			});
			return groups;
		}),

	/**
	 * Retrieves QR code styling configuration for a specific group
	 * Used to get customized QR code appearance settings for display
	 * @param input - Group ID to lookup
	 * @returns Promise<JsonValue | null> - QR code style configuration or null if not found
	 * @access HACKER and ADMIN
	 */
	getQRCode: t.procedure
		.use(authenticate(['HACKER', 'ADMIN']))
		.input(z.string())
		.query(async ({ input }): Promise<Prisma.JsonValue | null> => {
			return (
				(
					await prisma.group.findUnique({
						where: { id: input },
					})
				)?.qrCodeStyle ?? null
			);
		}),

	/**
	 * Generates a signed URL for accessing QR code images stored in S3
	 * Creates temporary authenticated URLs for displaying QR code background images
	 * @param input - S3 object key/path for the image
	 * @returns Promise<string | null> - Signed URL for image access or null if error
	 * @access No authentication required (public access)
	 */
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
