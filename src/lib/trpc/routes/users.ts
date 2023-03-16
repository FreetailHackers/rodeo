import { hash } from '$lib/hash';
import { PutObjectCommand, S3Client } from '@aws-sdk/client-s3';
import { Prisma, Role, Status, type User } from '@prisma/client';
import { z } from 'zod';
import prisma from '../db';
import { sendEmail } from '../email';
import { authenticate } from '../middleware';
import { t } from '../t';
import { getSettings } from './settings';

const MAGIC_LINK_LENGTH = 32;
const CHARSET = 'abcdefghijklmnopqrstuvwxyz';
const FILE_SIZE_LIMIT = 1 * 1024 * 1024; // 1 MB

const userSchema = z
	.object({
		fullName: z.string().optional(),
		preferredName: z.string().optional(),
		gender: z.string().optional(),
		race: z.array(z.string()).optional(),
		pronouns: z.string().optional(),
		photoReleaseAgreed: z.boolean().optional(),
		liabilityWaiverAgreed: z.boolean().optional(),
		codeOfConductAgreed: z.boolean().optional(),
		major: z.string().optional(),
		classification: z.string().optional(),
		graduation: z.string().optional(),
		firstGeneration: z.boolean().optional(),
		international: z.boolean().optional(),
		hackathonsAttended: z.number().optional(),
		workshops: z.array(z.string()).optional(),
		referrer: z.string().optional(),
		excitedAbout: z.string().optional(),
		resume: z.any(),
		github: z.string().optional(),
		linkedin: z.string().optional(),
		website: z.string().optional(),
		lunch: z.boolean().optional(),
		dietaryRestrictions: z.array(z.string()).optional(),
		allergies: z.string().optional(),
		accommodations: z.string().optional(),
		other: z.string().optional(),
	})
	.strict();

const client = new S3Client({ region: 'us-east-1' });

export const usersRouter = t.router({
	/**
	 * Gets the logged in user, or a user by their *HASHED* magic link.
	 */
	get: t.procedure.input(z.string().optional()).query(async (req): Promise<User | null> => {
		return await prisma.user.findUnique({
			where: {
				magicLink: req.input ?? (await hash(req.ctx.magicLink)),
			},
		});
	}),

	/**
	 * Sets the logged in user to the given data. If the user has
	 * finished their application, they will be un-applied.
	 */
	update: t.procedure
		.use(authenticate)
		.input(userSchema)
		.mutation(async (req): Promise<void> => {
			if (req.ctx.user.role !== Role.HACKER) {
				throw new Error('You have insufficient permissions to perform this action.');
			}
			if (!(await getSettings()).applicationOpen) {
				throw new Error('Sorry, applications are closed.');
			}
			// Upload resume to S3
			if (
				req.input.resume instanceof Blob &&
				req.input.resume.size > 0 &&
				req.input.resume.size < FILE_SIZE_LIMIT
			) {
				await client.send(
					new PutObjectCommand({
						Bucket: process.env.S3_BUCKET,
						Key: `${req.ctx.user.id}/${req.input.resume.name}`,
						Body: Buffer.from(await req.input.resume.arrayBuffer()),
					})
				);
				req.input.resume = `https://s3.amazonaws.com/${process.env.S3_BUCKET}/${req.ctx.user.id}/${req.input.resume.name}`;
			} else {
				req.input.resume = undefined;
			}
			// Only let verified users that haven't received a decision update their info
			if (req.ctx.user.status === Status.VERIFIED || req.ctx.user.status === Status.APPLIED) {
				await prisma.user.update({
					where: {
						magicLink: await hash(req.ctx.magicLink),
					},
					// "Un-apply" the user if they're already applied
					data: { ...req.input, status: Status.VERIFIED },
				});
			}
			// Remove user from pending decision pool
			await prisma.decision.deleteMany({
				where: {
					userId: req.ctx.user.id,
				},
			});
		}),

	/**
	 * Attempts to submit the user's application. Returns a dictionary
	 * containing questions with validation errors, if any.
	 */
	submitApplication: t.procedure
		.use(authenticate)
		.mutation(async (req): Promise<Record<string, string>> => {
			if (req.ctx.user.role !== Role.HACKER) {
				throw new Error('You have insufficient permissions to perform this action.');
			}
			// Ensure applications are open and the user has not received a decision yet
			if (!(await getSettings()).applicationOpen) {
				throw new Error('Sorry, applications are closed.');
			}
			if (req.ctx.user.status !== Status.VERIFIED) {
				throw new Error('You have already submitted your application.');
			}

			// Validate the user's data
			const errors: Record<string, string> = {};
			if (req.ctx.user.fullName === null || req.ctx.user.fullName.trim() === '') {
				errors.name = 'Please enter your full name.';
			}
			if (req.ctx.user.preferredName === null || req.ctx.user.preferredName.trim() === '') {
				errors.name = 'Please enter your preferred name.';
			}
			if (req.ctx.user.gender === null) {
				errors.gender = 'Please specify your gender.';
			}
			if (!req.ctx.user.photoReleaseAgreed) {
				errors.photoReleaseAgreed = 'You must agree to the photo release to participate.';
			}
			if (!req.ctx.user.liabilityWaiverAgreed) {
				errors.liabilityWaiverAgreed = 'You must agree to the liability waiver to participate.';
			}
			if (!req.ctx.user.codeOfConductAgreed) {
				errors.codeOfConductAgreed = 'You must agree to the code of conduct to participate.';
			}
			if (req.ctx.user.major === null || req.ctx.user.major.trim() === '') {
				errors.major = 'Please provide your major.';
			}
			if (req.ctx.user.classification === null) {
				errors.classification = 'Please specify your classification.';
			}
			if (req.ctx.user.graduation === null) {
				errors.graduationYear = 'Please specify your graduation year.';
			}
			if (req.ctx.user.hackathonsAttended === null) {
				errors.hackathonsAttended = 'Please specify the number of hackathons you have attended.';
			}
			if (req.ctx.user.referrer === null) {
				errors.referrer = 'Please specify how you heard about HackTX.';
			}
			if (req.ctx.user.excitedAbout === null || req.ctx.user.excitedAbout.trim() === '') {
				errors.excitedAbout = 'Please tell us what you are excited about.';
			}
			try {
				if (req.ctx.user.website !== null && req.ctx.user.website.trim() !== '') {
					new URL(req.ctx.user.website);
				}
			} catch (e) {
				errors.website = 'Please enter a valid URL.';
			}
			if (req.ctx.user.dietaryRestrictions === null) {
				errors.dietaryRestrictions = 'Please specify your dietary restrictions.';
			}
			// Update status to applied if there are no errors
			if (Object.keys(errors).length == 0) {
				await prisma.user.update({
					where: { magicLink: await hash(req.ctx.magicLink) },
					data: { status: Status.APPLIED },
				});
			}
			return errors;
		}),

	/**
	 * Confirms or declines the logged in user's acceptance.
	 */
	rsvp: t.procedure
		.use(authenticate)
		.input(z.enum(['CONFIRMED', 'DECLINED']))
		.mutation(async (req): Promise<void> => {
			if (req.ctx.user.role !== Role.HACKER) {
				throw new Error('You have insufficient permissions to perform this action.');
			}
			const deadline = (await getSettings()).confirmBy;
			if (req.input === 'CONFIRMED') {
				// Hackers should only be able to confirm before deadline
				if (
					req.ctx.user.status === Status.ACCEPTED &&
					(deadline === null || new Date() < deadline)
				) {
					await prisma.user.update({
						where: { magicLink: await hash(req.ctx.magicLink) },
						data: { status: Status.CONFIRMED },
					});
				}
			} else {
				// Hackers should be able to decline after accepting and/or the deadline
				if (req.ctx.user.status === Status.ACCEPTED || req.ctx.user.status === Status.CONFIRMED) {
					await prisma.user.update({
						where: { magicLink: await hash(req.ctx.magicLink) },
						data: { status: Status.DECLINED },
					});
				}
			}
		}),

	/**
	 * Creates a new user with the given email, or generates a new magic
	 * link if they already exist. Returns the success status as a
	 * string.
	 */
	register: t.procedure.input(z.string()).mutation(async (req): Promise<string> => {
		const email = req.input.trim().toLowerCase();

		if (!email.match(/^\S+utexas.edu$/)) {
			return 'Please use your utexas.edu email address.';
		}

		// Generate a magic link
		const chars = new Uint8Array(MAGIC_LINK_LENGTH);
		crypto.getRandomValues(chars);
		const magicLink = Array.from(chars)
			.map((n) => CHARSET[n % CHARSET.length])
			.join('');

		// Create user and email magic link only if not already registered with this email
		await prisma.user.upsert({
			where: { email },
			create: {
				email: email,
				magicLink: await hash(magicLink),
			},
			update: {
				magicLink: await hash(magicLink),
			},
		});

		// Send email with magic link
		const link = `${process.env.DOMAIN_NAME}/login/${magicLink}`;
		const message = `Please click on this link to log in to Rodeo: <a href="${link}">${link}</a>
			<br>
			<br>
			Keep this email safe as anyone with this link can log in to your account.
			If you misplace this email, you can always request a new link by registering again with this same email address.
			Note that this will invalidate your previous link.`;
		return await sendEmail(email, 'Welcome to Rodeo!', message, null);
	}),

	/**
	 * Creates a new user with the given email. Logged-in user must be
	 * an admin.
	 */
	create: t.procedure
		.use(authenticate)
		.input(
			z.object({
				fullName: z.string(),
				email: z
					.string()
					.trim()
					.transform((email) => email.toLowerCase()),
				role: z.nativeEnum(Role),
			})
		)
		.mutation(async (req): Promise<string> => {
			if (req.ctx.user.role !== Role.ADMIN) {
				throw new Error('You have insufficient permissions to perform this action.');
			}
			// Generate a magic link
			const chars = new Uint8Array(MAGIC_LINK_LENGTH);
			crypto.getRandomValues(chars);
			const magicLink = Array.from(chars)
				.map((n) => CHARSET[n % CHARSET.length])
				.join('');

			// Create user and email magic link
			try {
				await prisma.user.create({
					data: { magicLink: await hash(magicLink), ...req.input },
				});
			} catch (e) {
				if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === 'P2002') {
					return 'User with this email already exists.';
				}
			}

			// Send email with magic link
			const link = `${process.env.DOMAIN_NAME}/login/${magicLink}`;
			const message = `Please click on this link to log in to Rodeo: <a href="${link}">${link}</a>
			<br>
			<br>
			Keep this email safe as anyone with this link can log in to your account.
			If you misplace this email, you can always request a new link by registering again with this same email address.
			Note that this will invalidate your previous link.`;
			return await sendEmail(req.input.email, 'Welcome to Rodeo!', message, null);
		}),

	/**
	 * Verify a user.
	 */
	verify: t.procedure.use(authenticate).mutation(async (req): Promise<void> => {
		if (req.ctx.user.status === Status.CREATED) {
			await prisma.user.update({
				where: {
					magicLink: await hash(req.ctx.magicLink),
				},
				data: {
					status: Status.VERIFIED,
				},
			});
		}
	}),

	/**
	 * Scan a user's Hacker ID for the given action. Logged-in user must
	 * be an organizer or admin.
	 */
	scan: t.procedure
		.use(authenticate)
		.input(z.object({ magicLink: z.string(), action: z.string() }))
		.mutation(async (req): Promise<void> => {
			if (req.ctx.user.role !== Role.ORGANIZER && req.ctx.user.role !== Role.ADMIN) {
				throw new Error('You have insufficient permissions to perform this action.');
			}
			const scanCount = (
				await prisma.user.findUniqueOrThrow({
					where: {
						magicLink: req.input.magicLink,
					},
				})
			).scanCount as Prisma.JsonObject;
			const scans = Number(scanCount[req.input.action] ?? 0);
			await prisma.user.update({
				where: {
					magicLink: req.input.magicLink,
				},
				data: {
					scanCount: { ...scanCount, [req.input.action]: scans + 1 },
				},
			});
		}),

	/**
	 * Returns the number of hackers who have scanned for the given
	 * action at least once. Logged-in user must be an organizer or
	 * admin.
	 */
	getScanCount: t.procedure
		.use(authenticate)
		.input(z.string())
		.query(async (req): Promise<number> => {
			if (req.ctx.user.role !== Role.ORGANIZER && req.ctx.user.role !== Role.ADMIN) {
				throw new Error('You have insufficient permissions to perform this action.');
			}
			return await prisma.user.count({
				where: {
					AND: [
						{
							role: Role.HACKER,
						},
						{
							scanCount: {
								path: [req.input],
								gt: 0,
							},
						},
					],
				},
			});
		}),

	/**
	 * Gets all users. User must be an admin.
	 */
	getAll: t.procedure
		.use(authenticate)
		.query(async (req): Promise<Prisma.UserGetPayload<{ include: { decision: true } }>[]> => {
			if (req.ctx.user.role !== Role.ADMIN) {
				throw new Error('You have insufficient permissions to perform this action.');
			}
			return await prisma.user.findMany({ orderBy: [{ id: 'asc' }], include: { decision: true } });
		}),
});
