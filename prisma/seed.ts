/**
 * This script is used to seed the database with example data.
 * WARNING: This script will reset the database before seeding.
 * To use it, run `npx prisma db seed`
 *
 * You can then log in to some test accounts with:
 *
 * http://localhost:5173/login/hacker (sample hacker account)
 * http://localhost:5173/login/admin (sample admin account)
 */

import { firstNames, lastNames, majors } from './data';
import { hash } from '../src/lib/hash';
import { PrismaClient, Role, Status, Prisma, QuestionType } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
	// Reset database
	await prisma.announcement.deleteMany();
	await prisma.decision.deleteMany();
	await prisma.event.deleteMany();
	await prisma.question.deleteMany();
	await prisma.settings.deleteMany();
	await prisma.user.deleteMany();

	// Create example hacker and admin
	await prisma.user.create({
		data: {
			email: 'hacker@yopmail.com',
			magicLink: await hash('hacker'),
			status: Status.CREATED,
		},
	});
	await prisma.user.create({
		data: {
			email: 'admin@yopmail.com',
			magicLink: await hash('admin'),
			role: Role.ADMIN,
		},
	});

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
			type: QuestionType.SENTENCE,
			required: true,
			placeholder: 'J. Random Hacker',
			generate: () => `${randomElement(firstNames)} ${randomElement(lastNames)}`,
		},
		{
			order: 1,
			label: 'Classification',
			type: QuestionType.DROPDOWN,
			required: true,
			generate: () => randomElement(['Freshman', 'Sophomore', 'Junior', 'Senior', 'Graduate']),
		},
		{
			order: 2,
			label: 'Major',
			type: QuestionType.MULTISELECT,
			required: true,
			generate: () => randomElement(majors),
		},
		{
			order: 3,
			label: 'I agree to sell my data.',
			type: QuestionType.CHECKBOXES,
			required: true,
			generate: () => true,
		},
		{
			order: 4,
			label: 'How many hackathons have you attended?',
			type: QuestionType.NUMBER,
			required: true,
			placeholder: '0',
			generate: () => Math.floor(random() * 10),
		},
		{
			order: 5,
			label: 'Why do you want to attend HackTX?',
			type: QuestionType.PARAGRAPH,
			required: true,
			placeholder: 'I love hackathons!',
			generate: () => 'I want to attend HackTX because I love hackathons!',
		},
		{
			order: 6,
			label: 'Resume',
			type: QuestionType.FILE,
			required: false,
			generate: () => 'https://example.com/resume.pdf',
		},
		{
			order: 7,
			label: 'Shirt size',
			type: QuestionType.RADIO,
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

	// Generate 1000 random hackers with a seeded random number generator for reproducibility
	const hackers: Prisma.UserCreateInput[] = [];
	for (let i = 0; i < 1000; i++) {
		const application = {};
		for (const question of createdQuestions) {
			// IMPORTANT: This assumes that the questions variable is ordered by the order field!!
			application[question.id] = questions[question.order].generate();
		}
		hackers.push({
			email: `hacker${i}@yopmail.com`,
			magicLink: await hash('hacker' + i),
			application,
			role: Role.HACKER,
			status: Status[Object.keys(Status)[Math.floor(random() * Object.keys(Status).length)]],
		});
	}
	await prisma.user.createMany({ data: hackers });

	// Generate up to 100 decisions (not randomized so I don't have to worry about duplicates)
	const decisions: Prisma.DecisionCreateManyInput[] = [];
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
