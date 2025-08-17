import type { Sponsor } from '@prisma/client';
import { z } from 'zod';
import { prisma } from '../db';
import { authenticate } from '../middleware';
import { t } from '../t';
import { S3Client, GetObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { s3Delete } from '../../s3Handler';

const s3Client = new S3Client({ region: process.env.AWS_REGION });

// Schema for the Sponsor model
const sponsorSchema = z
	.object({
		name: z.string(),
		imageKey: z.string(),
		url: z.string().nullable(),
	})
	.strict();

export const sponsorsRouter = t.router({
	/**
	 * Gets all the Sponsor records in the table
	 */
	getAll: t.procedure.query(async (): Promise<Sponsor[]> => {
		return await prisma.sponsor.findMany({
			orderBy: { id: 'asc' },
		});
	}),

	/**
	 * Gets a record by ID.
	 */
	get: t.procedure.input(z.number()).query(async (req): Promise<Sponsor | null> => {
		return await prisma.sponsor.findUnique({ where: { id: req.input } });
	}),

	/**
	 * Adds a record to the table. User must be an admin.
	 */
	create: t.procedure
		.use(authenticate(['ADMIN']))
		.input(sponsorSchema)
		.mutation(async (req): Promise<void> => {
			await prisma.sponsor.create({ data: { ...req.input } });
		}),

	/**
	 * Updates a record in the table by ID. User must be an admin.
	 */
	update: t.procedure
		.use(authenticate(['ADMIN']))
		.input(sponsorSchema.merge(z.object({ id: z.number() })))
		.mutation(async (req): Promise<void> => {
			await prisma.sponsor.update({
				where: { id: req.input.id },
				data: { ...req.input },
			});
		}),

	/**
	 * Deletes a Sponsor record from the table by ID. User must be an admin.
	 */
	delete: t.procedure
		.use(authenticate(['ADMIN']))
		.input(z.number())
		.mutation(async (req): Promise<void> => {
			await prisma.sponsor.delete({ where: { id: req.input } });
		}),

	/**
	 * Deletes all Sponsors. User must be an admin.
	 */
	deleteAll: t.procedure.use(authenticate(['ADMIN'])).mutation(async (): Promise<void> => {
		const imageKeys = await prisma.sponsor.findMany({
			select: { imageKey: true },
		});

		await Promise.all(
			imageKeys.map(async (sponsor) => {
				await s3Delete(sponsor.imageKey);
			}),
		);

		await prisma.sponsor.deleteMany();
	}),

	/**
	 * Gets a Sponsor record with the image URL signed by the S3 client.
	 */
	getSponsorWithImageValue: t.procedure
		.input(z.number())
		.query(async (req): Promise<Sponsor & { imageUrl: string | null }> => {
			const sponsor = await prisma.sponsor.findUnique({ where: { id: req.input } });

			if (!sponsor) {
				throw new Error('Sponsor not found');
			}

			try {
				const url = await getSignedUrl(
					s3Client,
					new GetObjectCommand({
						Bucket: process.env.S3_BUCKET,
						Key: `${sponsor.imageKey}`,
					}),
				);
				return {
					...sponsor,
					imageUrl: url,
				};
			} catch (error) {
				console.error(`Error fetching signed URL for ${sponsor.name}:`, error);
				return {
					...sponsor,
					imageUrl: null,
				};
			}
		}),

	/**
	 * Gets all the Sponsor records in the table with image
	 * URLs signed by the S3 client.
	 */
	getSponsorsWithImageValues: t.procedure.query(
		async (): Promise<(Sponsor & { imageUrl: string | null })[]> => {
			const sponsors = await prisma.sponsor.findMany({
				orderBy: { id: 'asc' },
			});

			if (!sponsors) return [];

			// Map sponsors and include signed URLs
			const sponsorsWithUrls = await Promise.all(
				sponsors.map(async (sponsor) => {
					try {
						const url = await getSignedUrl(
							s3Client,
							new GetObjectCommand({
								Bucket: process.env.S3_BUCKET,
								Key: `${sponsor.imageKey}`,
							}),
						);
						return {
							...sponsor,
							imageUrl: url,
						};
					} catch (error) {
						console.error(`Error fetching signed URL for ${sponsor.name}:`, error);
						return {
							...sponsor,
							imageUrl: null,
						};
					}
				}),
			);

			return sponsorsWithUrls;
		},
	),
});
