import { firstNames, lastNames, majors } from './data';
import { hash } from '../src/lib/hash';
import { PrismaClient, Role, Status, type User } from '@prisma/client';
const prisma = new PrismaClient();

/**
 * This script is used to seed the database with example data.
 * WARNING: This script will delete all data in the database before seeding.
 * To use it, run `prisma db seed`
 */
async function main() {
	// Create example hacker and admin
	await prisma.user.deleteMany();
	await prisma.user.create({
		data: {
			id: 0,
			email: 'hacker@example.com',
			magicLink: await hash('hacker'),
			name: 'Example Hacker',
			major: 'Computer Science',
		},
	});
	await prisma.user.create({
		data: {
			id: 1,
			email: 'admin@freetailhackers.com',
			magicLink: await hash('admin'),
			name: 'Example Administrator',
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
	const users: User[] = [];
	for (let i = 0; i < 1000; i++) {
		const firstName = firstNames[Math.floor(random() * firstNames.length)];
		const lastName = lastNames[Math.floor(random() * lastNames.length)];
		const major = majors[Math.floor(random() * majors.length)];
		users.push({
			id: i + 2,
			email: `${firstName.toLowerCase()}.${lastName.toLowerCase()}.${i + 2}@example.com`,
			magicLink: await hash('' + i + 2),
			name: `${firstName} ${lastName}`,
			major,
			role: Role.HACKER,
			status: Status.CREATED,
		});
	}
	await prisma.user.createMany({ data: users });
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
