import { Prisma } from '@prisma/client';
import { random, randomElement } from './seed';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';

dayjs.extend(utc);
dayjs.extend(timezone);

// Optional: change to where your development team is located so the schedule times make sense for your event
export const MY_TIMEZONE = 'America/Chicago';

export const firstNames = [
	'Aditya',
	'Christina',
	'Daniel',
	'Jeongwoo',
	'Linh',
	'Luis',
	'Nikshita',
	'Khang',
	'Nathan',
];

export const lastNames = ['Agrawal', 'Go', 'Ting', 'Choi', 'Vu', 'Pabon', 'Kurva', 'Tran', 'Cheng'];

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
		hideAdmission: true,
		options: ['XS', 'S', 'M', 'L', 'XL', 'XXL'],
		generate: () => randomElement(['XS', 'S', 'M', 'L', 'XL', 'XXL']),
	},
];

export const events: Prisma.EventCreateInput[] = [
	{
		name: 'Opening Ceremony',
		start: dayjs.tz('2025-10-18T10:30:00', MY_TIMEZONE).toDate(),
		end: dayjs.tz('2025-10-18T11:30:00', MY_TIMEZONE).toDate(),
		location: 'Shirley Bird Perry Ballroom (UNB)',
		description: 'Kick off HackTX 2025 with opening remarks, announcements, and sponsor intros!',
		type: 'Key-Event',
	},
	{
		name: 'Hacking Starts',
		start: dayjs.tz('2025-10-18T11:30:00', MY_TIMEZONE).toDate(),
		end: dayjs.tz('2025-10-18T11:30:00', MY_TIMEZONE).toDate(),
		location: 'Async',
		description: 'The hacking period officially begins—start building your project!',
		type: 'Key-Event',
	},
	{
		name: 'Hacking Ends',
		start: dayjs.tz('2025-10-19T11:30:00', MY_TIMEZONE).toDate(),
		end: dayjs.tz('2025-10-19T11:30:00', MY_TIMEZONE).toDate(),
		location: 'Async',
		description: 'All submissions are due. Stop hacking and get ready to demo!',
		type: 'Key-Event',
	},
	{
		name: 'Judging',
		start: dayjs.tz('2025-10-19T14:00:00', MY_TIMEZONE).toDate(),
		end: dayjs.tz('2025-10-19T17:00:00', MY_TIMEZONE).toDate(),
		location: 'WEL 1.316, WEL 2.246, WEL 2.306, WEL 2.310',
		description: 'Teams present their projects to judges for evaluation.',
		type: 'Key-Event',
	},
	{
		name: 'Judging Deliberations',
		start: dayjs.tz('2025-10-19T17:00:00', MY_TIMEZONE).toDate(),
		end: dayjs.tz('2025-10-19T17:30:00', MY_TIMEZONE).toDate(),
		location: 'WEL 2.246',
		description: 'Judges deliberate and decide on the winning teams.',
		type: 'Regular-Event',
	},
	{
		name: 'Pitching',
		start: dayjs.tz('2025-10-19T17:30:00', MY_TIMEZONE).toDate(),
		end: dayjs.tz('2025-10-19T18:00:00', MY_TIMEZONE).toDate(),
		location: 'WEL 2.224',
		description: 'Finalist teams pitch their projects to the full audience and judges.',
		type: 'Key-Event',
	},
	{
		name: 'Closing Ceremony',
		start: dayjs.tz('2025-10-19T18:00:00', MY_TIMEZONE).toDate(),
		end: dayjs.tz('2025-10-19T19:00:00', MY_TIMEZONE).toDate(),
		location: 'Shirley Bird Perry Ballroom (UNB)',
		description: 'Celebrate the winners and wrap up HackTX 2025!',
		type: 'Key-Event',
	},
];

export const faq: Prisma.FAQCreateInput[] = [
	{
		question: 'What is HackTX?',
		answer:
			'HackTX is our beginner friendly spring hackathon only open to the University of Texas at Austin and Austin Community College students. No prior experience required and all majors welcome!',
	},
	{
		question: 'Where is HackTX?',
		answer:
			'HackTX will take place on the University of Texas at Austin campus! Hacking, judging, mini-events, and more will occur fully in-person!',
	},
	{
		question: 'When is HackTX?',
		answer: 'HackTX starts on March 22st, 2024 and ends on March 23rd, 2024.',
	},
	{
		question: 'When is the application deadline?',
		answer:
			'Applications will close on March 18th 11:59PM CDT. However, please apply early since we will be releasing decisions in waves!',
	},
	{
		question: 'What can I do if I missed the application deadline or got rejected?',
		answer:
			'We will have walk-in registration on Friday, March 22nd. The specific closing time for walk-in registration will be announced on our website during the event week, so be on the lookout! This is first come, first serve until we hit capacity. Admission to the event is not guaranteed so we advise non-Austin attendees to not travel for walk-in registration.',
	},
	{
		question: 'How much money will this cost me?',
		answer:
			"Zero. Zip. Zilch. Nada. Nothing. Gratis. It's free. Freetail Hackers provides students with Wi-Fi, meals, swag, workspace, and prizes for all of our events!",
	},
	{
		question: 'What’s the schedule?',
		answer:
			'We’ll release a more detailed schedule in the coming weeks, but our event will start roughly around 9am on Friday, March 22nd and end around 6-7pm on March 23rd.',
	},
	{
		question: 'Will there be prizes?',
		answer:
			'Yes! We will have prizes for our challenges as well as smaller activities and mini-events! Specific details will be revealed at the opening ceremony!',
	},
	{
		question: 'What do I wear?',
		answer:
			'Wear whatever you are most comfortable in! No need to wear anything professional. However, we do require you to be within the MLH Code of Conduct.',
	},
	{
		question: 'Any rules?',
		answer:
			"All work must be done at the event. You can't demo something you didn't build. Don't talk about Fight Club. All attendees (hackers, supporters, mentors, volunteers, etc.) must abide by the MLH Code of Conduct.",
	},
	{
		question: 'How do teams work?',
		answer:
			"Teams can be up to 4 members. If you don't have a team, don't worry! Joining a team of new friends is the best part of a hackathon. We will have team matching available for everyone on the day of the event, but if you would like to create a team beforehand, that works too!",
	},
	{
		question: 'What should I bring?',
		answer:
			'Yourself, your valid university ID, a form of ID proving you are over 18 years old, a laptop, chargers, or anything else you might need within the 24 hours. Firearms, weapons, alcohol, illegal drugs, and power tools are not allowed. Smiles and high-fives are welcome.',
	},
	{
		question: 'How do I volunteer?',
		answer:
			'We are always looking for mentors to answer student questions or workshop suggestions, as well as general volunteers to help run our event. If you want to help out at our event, shoot us an email at hello@freetailhackers.com!',
	},
	{
		question: "Do y'all give travel reimbursements?",
		answer:
			'Unfortunately, we will not be able to provide travel reimbursements this year. We encourage you to look at low-cost transportation methods such as Amtrak, Flixbus, and Redcoach.',
	},
	{
		question: 'I have more questions. Who do I contact?',
		answer:
			"If you have further questions for us, don't hesitate to reach out to hello@freetailhackers.com",
	},
];

export const challenges: Prisma.ChallengeCreateInput[] = [
	{
		title: 'Sustainability Challenge',
		prize: 'iPhone 16',
		description:
			'Explore ways to promote sustainable practices and reduce environmental impact through innovative solutions. Address issues such as waste management, renewable energy, and conservation efforts to create a more sustainable future.',
	},
	{
		title: 'Health & Safety Challenge',
		description:
			'Focus on improving health and safety standards in various environments, including workplaces, communities, and public spaces. Develop strategies to prevent accidents, mitigate risks, and enhance overall well-being for individuals and society.',
	},
	{
		title: 'Blockchain & Security Challenge',
		prize: 'Apple Watch Series 10',
		description:
			'Dive into the world of blockchain technology and cybersecurity to tackle emerging threats and vulnerabilities. Explore encryption methods, decentralized systems, and secure data storage to ensure the integrity and confidentiality of digital transactions and information.',
	},
	{
		title: 'Human Computer Interaction Challenge',
		prize: 'Macbook Pro',
		description:
			'Enhance user experiences and interactions with technology by designing intuitive interfaces and user-friendly applications. Explore human-centered design principles to create engaging and accessible digital experiences for diverse audiences.',
	},
	{
		title: 'Efficiency Challenge',
		description:
			"#Efficiency fuels progress in our fast-paced world. If you're a problem solver with a passion for streamlining processes and maximizing productivity, then the Efficiency Boosters Hackathon is the perfect platform for you. Join forces with like-minded individuals to develop innovative solutions that optimize workflows, enhance resource management, and boost overall efficiency across various domains. Your ingenuity could revolutionize industries, so let's hack for a more efficient future!",
	},
	{
		title: 'Earth & Space Challenge',
		prize: 'SpaceX Starship Ticket',
		description:
			"Embark on a journey beyond our planet and explore the vastness of both Earth and Space in this hackathon track. From addressing environmental challenges on our home planet to pioneering new frontiers in space exploration, this track welcomes visionaries and problem solvers who are eager to make a significant impact on our world, both near and far. Whether you're interested in climate solutions, space technology, or protecting our planet, this hackathon is your launchpad to innovation.",
	},
];
