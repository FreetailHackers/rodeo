import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
	// Create example user and admin
	await prisma.user.create({
		data: {
			email: 'email@example.com',
			magicLink: '5e884898da28047151d0e56f8dc6292773603d0d6aabbdd62a11ef721d1542d8', // SHA-256 hash of 'password'
		},
	});
	await prisma.user.create({
		data: {
			email: 'admin@freetailhackers.com',
			magicLink: '8c6976e5b5410415bde908bd4dee15dfb167a9c873fc4bb8a81f6f2ab448a918', // SHA-256 hash of 'admin'
		},
	});
	// Create example announcement
	await prisma.announcement.create({
		data: {
			title: 'Applications are open!',
			body: 'We are now accepting applications for Hack the Future! The submission deadline is Friday, February 10th at 11:59 PM.',
		},
	});
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
