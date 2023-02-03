import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
	// Create example hacker and admin
	await prisma.user.deleteMany();
	await prisma.user.create({
		data: {
			email: 'email@example.com',
			magicLink: '5e884898da28047151d0e56f8dc6292773603d0d6aabbdd62a11ef721d1542d8', // SHA-256 hash of 'password'
			name: 'Example Hacker',
			major: 'Computer Science',
		},
	});
	await prisma.user.create({
		data: {
			email: 'admin@freetailhackers.com',
			magicLink: '8c6976e5b5410415bde908bd4dee15dfb167a9c873fc4bb8a81f6f2ab448a918', // SHA-256 hash of 'admin'
			name: 'Example Administrator',
			role: 'ADMIN',
		},
	});
	// Create example announcement
	await prisma.announcement.deleteMany();
	await prisma.announcement.create({
		data: {
			body: 'We are now accepting applications for Hack the Future! The submission deadline is Friday, February 10th at 11:59 PM.',
		},
	});
	// More example hackers. All of these are hashed with their email as the magic link.
	await prisma.user.create({
		data: {
			email: 'kennethsvickers@example.com',
			magicLink: '386c340644a7ae29a334762afbbb79c370fb0c78b31b8c1aa5987729763937ed',
			name: 'Kenneth S. Vickers',
			major: 'Liberal Arts',
		},
	});
	await prisma.user.create({
		data: {
			email: 'marvinrriley@example.com',
			magicLink: 'b283871b0feba2c00d5beb48e57acbbbe206ed1c6f84980250e8822b808bebbd',
			name: 'Marvin R. Riley',
			major: 'Engineering',
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
