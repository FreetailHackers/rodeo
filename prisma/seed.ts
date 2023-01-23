import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
	// Create example user
	await prisma.user.create({
		data: {
			email: 'email@example.com',
			magicLink: 'magicLink',
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
