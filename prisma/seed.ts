import { firstNames, lastNames, majors } from './data';
import { hash } from '../src/lib/hash';
import { PrismaClient, Role, Status, type User, type Decision } from '@prisma/client';
const prisma = new PrismaClient();

/**
 * This script is used to seed the database with example data.
 * WARNING: This script will delete all data in the database before seeding.
 * To use it, run `prisma db seed`
 */
async function main() {
	// Reset database
	await prisma.decision.deleteMany();
	await prisma.announcement.deleteMany();
	await prisma.settings.deleteMany();
	await prisma.user.deleteMany();

	// Create example hacker and admin
	await prisma.user.create({
		data: {
			email: 'hacker@yopmail.com',
			magicLink: await hash('hacker'),
			fullName: 'J. Random Hacker',
			preferredName: 'John',
			major: 'Computer Science',
			status: Status.VERIFIED,
		},
	});
	await prisma.user.create({
		data: {
			email: 'admin@yopmail.com',
			magicLink: await hash('admin'),
			fullName: 'J. Random Administrator',
			preferredName: 'Jane',
			role: Role.ADMIN,
		},
	});

	// Create example announcement
	await prisma.announcement.deleteMany();
	await prisma.announcement.create({
		data: {
			body: 'We are now accepting applications for Hack the Future! The submission deadline is Friday, February 10th at 11:59 PM.',
		},
	});

	// Generate 1000 random hackers with a seeded random number generator for reproducibility
	const hackers: Omit<User, 'id'>[] = [];
	for (let i = 0; i < 1000; i++) {
		const firstName = firstNames[Math.floor(random() * firstNames.length)];
		const lastName = lastNames[Math.floor(random() * lastNames.length)];
		const major = majors[Math.floor(random() * majors.length)];
		hackers.push({
			email: `${firstName.toLowerCase()}.${lastName.toLowerCase()}.${i}@yopmail.com`,
			magicLink: await hash('hacker' + i),
			fullName: `${firstName} ${lastName}`,
			preferredName: firstName,
			gender: ['Male', 'Female'][Math.floor(random() * 2)],
			race: [
				[
					'American Indian or Alaskan Native',
					'Asian',
					'Black or African American',
					'Hispanic',
					'Native Hawaiian or Pacific Islander',
					'White',
					'Other',
				][Math.floor(random() * 7)],
			],
			pronouns: ['He/him', 'She/her', 'They/them', 'Other', 'Prefer not to say'][
				Math.floor(random() * 5)
			],
			photoReleaseAgreed: true,
			liabilityWaiverAgreed: true,
			codeOfConductAgreed: true,
			major,
			classification: ['Freshman', 'Sophomore', 'Junior', 'Senior', 'Masters', 'Doctorate'][
				Math.floor(random() * 6)
			],
			graduation: [
				'Spring 2023',
				'Fall 2023',
				'Spring 2024',
				'Fall 2024',
				'Spring 2025',
				'Fall 2025',
				'Spring 2026',
				'Other',
			][Math.floor(random() * 8)],
			firstGeneration: Math.random() < 0.5,
			international: Math.random() < 0.5,
			hackathonsAttended: Math.floor(random() * 10),
			workshops: [],
			referrer: ['Social Media', 'Tabling', 'Friends', 'Professor/Department', 'HackTX', 'Other'][
				Math.floor(random() * 6)
			],
			excitedAbout: 'I am excited to learn new things and meet new people!',
			resume: 'https://rodeo-staging.s3.amazonaws.com/' + i + '/resume.pdf',
			github: 'https://github.com/username',
			linkedin: 'https://linkedin.com/in/username',
			website: 'https://example.com',
			lunch: true,
			dietaryRestrictions: [
				['No pork', 'Vegetarian', 'Vegan', 'No dairy', 'No nuts', 'No beef', 'Gluten free'][
					Math.floor(random() * 7)
				],
			],
			allergies: '',
			accommodations: '',
			other: '',
			role: Role.HACKER,
			status: Status[Object.keys(Status)[Math.floor(random() * Object.keys(Status).length)]],
		});
	}
	await prisma.user.createMany({ data: hackers });

	// Generate up to 100 decisions (not randomized so I don't have to worry about duplicates)
	const decisions: Omit<Decision, 'id'>[] = [];
	for (let i = 0; i < 100; i++) {
		// Only decide on hackers with status APPLIED or WAITLISTED
		if (hackers[i].status !== Status.APPLIED && hackers[i].status !== Status.WAITLISTED) {
			continue;
		}
		decisions.push({
			userId: (await prisma.user.findUniqueOrThrow({ where: { email: hackers[i].email } })).id,
			status: [Status.ACCEPTED, Status.REJECTED, Status.WAITLISTED][Math.floor(random() * 3)],
		});
	}
	await prisma.decision.createMany({ data: decisions });

	// Create default settings
	await prisma.settings.create({ data: {} });
}

// Quick and dirty seedable random number generator taken from https://stackoverflow.com/a/19303725/16458492
let seed = 0;
function random() {
	const x = Math.sin(seed++) * 10000;
	return x - Math.floor(x);
}

main()
	.then(async () => {
		await prisma.$disconnect();
	})
	.catch(async (e) => {
		console.error(e);
		await prisma.$disconnect();
		process.exit(1);
	});
