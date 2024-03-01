import { Prisma } from '@prisma/client';
import { random, randomElement } from './seed';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';

dayjs.extend(utc);
dayjs.extend(timezone);

// Optional: change to where your development team is located so the schedule times make sense for your event
export const MY_TIMEZONE = 'America/Chicago';

export const firstNames = ['Aditya', 'Christina', 'Daniel', 'Jeongwoo', 'Linh', 'Luis', 'Nikshita'];

export const lastNames = ['Agrawal', 'Go', 'Ting', 'Choi', 'Vu', 'Pabon', 'Kurva'];

export const majors = [
	'Accounting',
	'Acting',
	'Advertising',
	'Aerospace Engineering',
	'African and African Diaspora Studies',
	'American Studies',
	'Ancient History',
	'Anthropology',
	'Applied Movement Science',
	'Architectural Engineering',
	'Architectural Studies',
	'Architecture',
	'Art Education',
	'Art History',
	'Arts and Entertainment Technologies',
	'Asian Cultures and Languages',
	'Asian Studies',
	'Astronomy',
	'Athletic Training',
	'Biochemistry',
	'Biology ',
	'Biomedical Engineering',
	'Business Administration',
	'Business Analytics',
	'Business Honors Program',
	'Chemical Engineering',
	'Chemistry ',
	'Chinese',
	'Civil Engineering',
	'Classical Archaeology',
	'Classical Languages',
	'Classical Studies',
	'Classics',
	'Communication and Leadership',
	'Communication Studies ',
	'Computational Engineering',
	'Computer Science',
	'Dance',
	'Dance Education',
	'Design',
	'Economics',
	'Education',
	'Electrical and Computer Engineering',
	'English',
	'Environmental Engineering ',
	'Environmental Science',
	'Ethnic Studies ',
	'European Studies',
	'Exercise Science',
	'Finance',
	'French Studies',
	'General Geology',
	'Geography',
	'Geological Sciences',
	'Geophysics',
	'Geosystems Engineering and Hydrogeology',
	'German',
	'Government',
	'Greek',
	'Health & Society',
	'Health Promotion and Behavioral Science',
	'Hindi/Urdu',
	'History',
	'Human Development and Family Sciences ',
	'Human Dimensions of Organizations',
	'Human Ecology',
	'Humanities',
	'Hydrogeology',
	'Informatics',
	'Interior Design',
	'International Business',
	'International Relations and Global Studies',
	'Italian',
	'Japanese',
	'Jazz',
	'Jewish Studies',
	'Journalism',
	'Korean',
	'Latin',
	'Latin American Studies',
	'Linguistics',
	'Malayalam',
	'Management',
	'Management Information Systems',
	'Marketing',
	'Mathematics ',
	'Mechanical Engineering',
	'Medical Laboratory Science',
	'Middle Eastern Studies',
	'Music',
	'Music Composition ',
	'Music Performance',
	'Music Studies',
	'Neuroscience',
	'Nursing',
	'Nutrition ',
	'Petroleum Engineering',
	'Pharmacy',
	'Philosophy',
	'Physical Culture and Sports',
	'Physics ',
	'Plan II Honors Program',
	'Portuguese ',
	'Pre-Pharmacy',
	'Psychology',
	'Public Health',
	'Public Relations',
	'Race, Indigeneity, and Migration',
	'Radio-Television-Film',
	'Religious Studies',
	'Rhetoric and Writing',
	'Russian, East European and Eurasian Studies',
	'Sanskrit',
	'Science and Technology Management',
	'Social Work',
	'Sociology',
	'Spanish',
	'Speech, Language, and Hearing Sciences ',
	'Sport Management',
	'Statistics and Data Science',
	'Studio Art',
	'Supply Chain Management',
	'Sustainability Studies',
	'Tamil',
	'Textiles and Apparel ',
	'Theatre and Dance',
	'Theatre Education',
	'Undeclared (Communication)',
	'Undeclared (Liberal Arts)',
	'Undeclared (Natural Sciences)',
	'Urban Studies',
	'Women’s and Gender Studies',
	'Youth and Community Studies',
];

export const questions: (Prisma.QuestionCreateInput & { generate: () => unknown })[] = [
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
		multiple: false,
		custom: false,
		required: true,
		options: ['Freshman', 'Sophomore', 'Junior', 'Senior', 'Graduate'],
		generate: () => randomElement(['Freshman', 'Sophomore', 'Junior', 'Senior', 'Graduate']),
	},
	{
		order: 2,
		label: 'Major',
		type: 'DROPDOWN',
		multiple: true,
		custom: true,
		options: majors,
		required: true,
		generate: () => [randomElement(majors)],
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
		min: 0,
		step: 1,
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
		generate: () => undefined,
	},
	{
		order: 7,
		label: 'Shirt size',
		type: 'RADIO',
		required: true,
		options: ['XS', 'S', 'M', 'L', 'XL', 'XXL'],
		generate: () => randomElement(['XS', 'S', 'M', 'L', 'XL', 'XXL']),
	},
];

export const events: Prisma.EventCreateInput[] = [
	{
		name: 'Opening Ceremony',
		start: dayjs.tz('2021-09-24T09:00:00', MY_TIMEZONE).toDate(),
		end: dayjs.tz('2021-09-24T09:30:00', MY_TIMEZONE).toDate(),
		location: 'GDC Auditorium (2.216)',
		description: 'Welcome to HackTX 2021!',
		type: 'Key-Event',
	},
	{
		name: 'Hacking Begins',
		start: dayjs.tz('2021-09-24T10:00:00', MY_TIMEZONE).toDate(),
		end: dayjs.tz('2021-09-24T10:00:00', MY_TIMEZONE).toDate(),
		location: 'GDC',
		description: 'Start hacking!',
		type: 'Key-Event',
	},
	{
		name: 'Intro to Svelte',
		start: dayjs.tz('2021-09-24T10:30:00', MY_TIMEZONE).toDate(),
		end: dayjs.tz('2021-09-24T11:00:00', MY_TIMEZONE).toDate(),
		location: 'GDC 6.302',
		description: 'Learn how to use Svelte, the hottest and most-loved framework in town!',
		type: 'Workshop',
	},
	{
		name: 'Lunch',
		start: dayjs.tz('2021-09-24T12:00:00', MY_TIMEZONE).toDate(),
		end: dayjs.tz('2021-09-24T13:00:00', MY_TIMEZONE).toDate(),
		location: 'GDC Courtyard',
		description: 'Delicious Chinese food from 99 Ranch!',
		type: 'Regular-Event',
	},
	{
		name: 'Dinner',
		start: dayjs.tz('2021-09-24T18:00:00', MY_TIMEZONE).toDate(),
		end: dayjs.tz('2021-09-24T19:00:00', MY_TIMEZONE).toDate(),
		location: 'GDC Courtyard',
		description: 'Delicious Indian food from Sangam Chettinad!',
		type: 'Regular-Event',
	},
	{
		name: 'Midnight Snack',
		// Cross date boundaries so we can test that it shows up on both days
		start: dayjs.tz('2021-09-24T23:45:00', MY_TIMEZONE).toDate(),
		end: dayjs.tz('2021-09-25T00:15:00', MY_TIMEZONE).toDate(),
		location: 'GDC',
		description: 'Free food!',
		type: 'Regular-Event',
	},
	{
		name: 'Breakfast',
		start: dayjs.tz('2021-09-25T08:00:00', MY_TIMEZONE).toDate(),
		end: dayjs.tz('2021-09-25T09:00:00', MY_TIMEZONE).toDate(),
		location: 'GDC Courtyard',
		description: 'Delicious pizza from DeSano!',
		type: 'Regular-Event',
	},
	{
		name: 'Hacking Ends',
		start: dayjs.tz('2021-09-25T10:00:00', MY_TIMEZONE).toDate(),
		end: dayjs.tz('2021-09-25T10:00:00', MY_TIMEZONE).toDate(),
		location: 'GDC',
		description: 'Stop hacking!',
		type: 'Key-Event',
	},
	{
		name: '5BLD with Feet Bench Press',
		start: dayjs.tz('2021-09-25T10:00:00', MY_TIMEZONE).toDate(),
		end: dayjs.tz('2021-09-25T11:00:00', MY_TIMEZONE).toDate(),
		location: 'Gregory Gym Basement',
		description:
			"Who can bench press the most weight while solving a 5x5 Rubik's cube with their feet blindfolded?",
		type: 'Fun-Event',
	},
	{
		name: 'Judging',
		start: dayjs.tz('2021-09-25T11:00:00', MY_TIMEZONE).toDate(),
		end: dayjs.tz('2021-09-25T12:00:00', MY_TIMEZONE).toDate(),
		location: 'WCP Ballroom',
		description: 'Show off your hard work!',
		type: 'Key-Event',
	},
	{
		name: 'Closing Ceremony',
		start: dayjs.tz('2021-09-25T12:00:00', MY_TIMEZONE).toDate(),
		end: dayjs.tz('2021-09-25T12:30:00', MY_TIMEZONE).toDate(),
		location: 'GDC Auditorium (2.216)',
		description: 'Goodbye!',
		type: 'Key-Event',
	},
];

export const otherCategoriesEvents: Prisma.OtherCategoriesCreateInput[] = [
	{
		title: 'Where is Formula Hacks?',
		response:
			'Formula Hacks will take place on the University of Texas at Austin campus! Hacking, judging, mini-events, and more will occur fully in-person!',
		category: 'FAQ',
	},
	{
		title: 'Are there sleeping accomodations?',
		response:
			"We have one room, but we recommend getting somewhere to sleep since it's going to be crammed",
		category: 'FAQ',
	},
	{
		title: 'What is Formula Hacks?',
		response:
			'Formula Hacks is our beginner friendly spring hackathon only open to the University of Texas at Austin and Austin Community College students. No prior experience required and all majors welcome!',
		category: 'FAQ',
	},
	{
		title: 'First Place Intermediate',
		response: 'VISIO TVs!',
		category: 'PRIZE',
	},
	{
		title: 'Second Place Intermediate',
		response: 'Mechanical Keyboard',
		category: 'PRIZE',
	},
	{
		title: 'Third Place Intermediate',
		response: 'Apple Keyboard',
		category: 'PRIZE',
	},
];
