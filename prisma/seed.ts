/**
 * This script is used to seed the database with example data.
 * WARNING: This script will reset the database before seeding.
 * To use it, run `npx prisma db seed`
 *
 * You can then log in to some test accounts with the following emails
 * (password is the same as the email):
 *
 * hacker@yopmail.com (sample hacker account)
 * admin@yopmail.com (sample admin account)
 */

import lucia from 'lucia-auth';
import 'lucia-auth/polyfill/node';
import { firstNames, lastNames, majors } from './data';
import { PrismaClient, Status, Prisma } from '@prisma/client';
import prismaAdapter from '@lucia-auth/adapter-prisma';
import { node } from 'lucia-auth/middleware';
const prisma = new PrismaClient();

const auth = lucia({ adapter: prismaAdapter(new PrismaClient()), middleware: node(), env: 'DEV' });

async function register(email: string, password: string): Promise<string> {
	const user = await auth.createUser({
		primaryKey: null,
		attributes: {
			email: email,
			roles: ['HACKER'],
			status: 'VERIFIED',
		},
	});
	// XXX: Since we didn't define transformDatabaseUser in the lucia() config,
	// Lucia returns the ID in the user.userId property by default
	// (as opposed to the rest of the codebase, which uses user.id)
	await auth.createKey(user.userId, {
		type: 'persistent',
		providerId: 'email',
		providerUserId: email,
		password: password,
	});
	await prisma.user.create({
		data: {
			authUserId: user.userId,
		},
	});
	return user.userId;
}

async function main() {
	// Reset database
	await prisma.announcement.deleteMany();
	await prisma.decision.deleteMany();
	await prisma.event.deleteMany();
	await prisma.question.deleteMany();
	await prisma.settings.deleteMany();
	await prisma.user.deleteMany();
	await prisma.authUser.deleteMany();
	await prisma.authSession.deleteMany();
	await prisma.authKey.deleteMany();

	// Create example hacker and admin
	await register('hacker@yopmail.com', 'hacker@yopmail.com');
	const adminId = await register('admin@yopmail.com', 'admin@yopmail.com');
	await prisma.authUser.update({ where: { id: adminId }, data: { roles: ['ADMIN'] } });

	// Create example announcement
	await prisma.announcement.deleteMany();
	await prisma.announcement.create({
		data: {
			body: 'We are now accepting applications for HackTX! The deadline is Friday, September 17th at 11:59 PM.',
		},
	});

	// Create example questions
	const questions: (Prisma.QuestionCreateInput & { generate: () => unknown })[] = [
		{
			order: 0,
			label: 'Name',
			type: 'SENTENCE',
			required: true,
			placeholder: 'J. Random Hacker',
			generate: () => `${randomElement(firstNames)} ${randomElement(lastNames)}`,
		},
		{
			order: 1,
			label: 'Classification',
			type: 'DROPDOWN',
			required: true,
			options: ['Freshman', 'Sophomore', 'Junior', 'Senior', 'Graduate'],
			generate: () => randomElement(['Freshman', 'Sophomore', 'Junior', 'Senior', 'Graduate']),
		},
		{
			order: 2,
			label: 'Major',
			type: 'MULTISELECT',
			options: majors,
			required: true,
			generate: () => randomElement(majors),
		},
		{
			order: 3,
			label: 'I agree to sell my data.',
			type: 'CHECKBOX',
			required: true,
			generate: () => true,
		},
		{
			order: 4,
			label: 'How many hackathons have you attended?',
			type: 'NUMBER',
			required: true,
			placeholder: '0',
			generate: () => Math.floor(random() * 10),
		},
		{
			order: 5,
			label: 'Why do you want to attend HackTX?',
			type: 'PARAGRAPH',
			required: true,
			placeholder: 'I love hackathons!',
			generate: () => 'I want to attend HackTX because I love hackathons!',
		},
		{
			order: 6,
			label: 'Resume',
			type: 'FILE',
			required: false,
			accept: '.doc, .docx, .pdf',
			maxSizeMB: 1,
			generate: () => 'https://example.com/resume.pdf',
		},
		{
			order: 7,
			label: 'Shirt size',
			type: 'RADIO',
			required: true,
			generate: () => randomElement(['XS', 'S', 'M', 'L', 'XL', 'XXL']),
		},
	];
	// Remove the generate function (used when creating dummy users) before creating questions
	// eslint-disable-next-line @typescript-eslint/no-unused-vars
	await prisma.question.createMany({ data: questions.map(({ generate, ...keep }) => keep) });

	const createdQuestions = await prisma.question.findMany();

	// Create example events
	const events: Prisma.EventCreateInput[] = [
		{
			name: 'Opening Ceremony',
			start: new Date('2021-09-24T18:00:00.000Z'),
			end: new Date('2021-09-24T19:00:00.000Z'),
			location: 'GDC Auditorium (2.216)',
			description: 'Welcome to HackTX 2021!',
			type: 'Key-Event',
		},
		{
			name: 'Hacking Begins',
			start: new Date('2021-09-24T19:00:00.000Z'),
			end: new Date('2021-09-25T19:00:00.000Z'),
			location: 'GDC',
			description: 'Start hacking!',
			type: 'Key-Event',
		},
		{
			name: 'Intro to Svelte',
			start: new Date('2021-09-24T19:30:00.000Z'),
			end: new Date('2021-09-24T20:30:00.000Z'),
			location: 'GDC 6.302',
			description: 'Learn how to use Svelte, the hottest and most-loved framework in town!',
			type: 'Workshop',
		},
		{
			name: 'Midnight Snack',
			start: new Date('2021-09-24T23:00:00.000Z'),
			end: new Date('2021-09-25T00:00:00.000Z'),
			location: 'GDC',
			description: 'Free food!',
			type: 'Regular-Event',
		},
		{
			name: 'Hacking Ends',
			start: new Date('2021-09-25T19:00:00.000Z'),
			end: new Date('2021-09-25T20:00:00.000Z'),
			location: 'GDC',
			description: 'Stop hacking!',
			type: 'Key-Event',
		},
		{
			name: '5BLD with Feet Bench Press',
			start: new Date('2021-09-25T19:30:00.000Z'),
			end: new Date('2021-09-25T20:00:00.000Z'),
			location: 'Gregory Gym Basement',
			description:
				"Who can bench press the most weight while solving a 5x5 Rubik's cube with their feet blindfolded?",
			type: 'Fun-Event',
		},
		{
			name: 'Closing Ceremony',
			start: new Date('2021-09-25T20:00:00.000Z'),
			end: new Date('2021-09-25T21:00:00.000Z'),
			location: 'GDC Auditorium (2.216)',
			description: 'Goodbye!',
			type: 'Key-Event',
		},
	];
	await prisma.event.createMany({ data: events });

	// Generate 10 random hackers with a seeded random number generator for reproducibility
	// XXX: Used to be 1000, but auth.createUser seems to be prohibitively slow
	const ids: string[] = [];
	for (let i = 0; i < 10; i++) {
		// Generate a completed application for each hacker
		const application = {};
		for (const question of createdQuestions) {
			// IMPORTANT: This assumes that the questions variable is ordered by the order field!!
			application[question.id] = questions[question.order].generate();
		}
		const email = `hacker${i}@yopmail.com`;
		const id = await register(email, email);
		ids.push(id);
		// Give each hacker a random status
		await prisma.authUser.update({
			where: { id },
			data: {
				status: Status[Object.keys(Status)[Math.floor(random() * Object.keys(Status).length)]],
			},
		});
		await prisma.user.update({ where: { authUserId: id }, data: { application } });
	}

	// Generate up to 10 decisions (not randomized so I don't have to worry about duplicates)
	const decisions: Prisma.DecisionCreateManyInput[] = [];
	for (const id of ids) {
		// Only decide on hackers with status APPLIED or WAITLISTED
		const hacker = await prisma.authUser.findUniqueOrThrow({ where: { id } });
		if (hacker.status !== 'APPLIED' && hacker.status !== 'WAITLISTED') {
			continue;
		}
		decisions.push({
			userId: hacker.id,
			status: randomElement(['ACCEPTED', 'REJECTED', 'WAITLISTED']),
		});
		if (decisions.length >= 10) break;
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

function randomElement<T>(array: T[]): T {
	return array[Math.floor(random() * array.length)];
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
