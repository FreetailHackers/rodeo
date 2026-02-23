import { Resend } from 'resend';
import nodemailer from 'nodemailer';
import { marked } from 'marked';
import { prisma } from './db';

function personalize(template: string, name: string): string {
    // replaces all instances of "name" with the hacker's actual name
    return template.replace(/{name}/g, name);
}

function getResend() {
	if (!process.env.RESEND_API_KEY) {
		throw new Error('RESEND_API_KEY is not set');
	}
	return new Resend(process.env.RESEND_API_KEY);
}

const transporter = nodemailer.createTransport({
	host: process.env.EMAIL_HOST,
	port: Number(process.env.EMAIL_PORT),
	secure: true,
	auth: {
		user: process.env.EMAIL_USER,
		pass: process.env.EMAIL_PASS,
	},
});

export const sendEmail = async (
	recipient: string,
	subject: string,
	message: string,
	isHTML: boolean,
	recipientName?: string,
): Promise<number> => {
	// Preface with warning if not in production
	const settings = await prisma.settings.findUnique({ where: { id: 0 } });
    // set up sender fallbacks
	const fromName = settings?.emailFromName || 'Freetail Hackers';
    const fromAddress = settings?.emailFromAddress || 'hello@freetailhackers.com';

	let warning = '';
	if (process.env.VERCEL_ENV !== 'production') {
		if (process.env.VERCEL_ENV === 'preview' && !recipient.endsWith('@yopmail.com')) {
			console.log('Only @yopmail.com addresses are allowed on staging.');
			return 0;
		}
		warning = `<h1>
				WARNING: This email was sent from a testing environment.
				Be careful when opening any links or attachments!
				This message cannot be guaranteed to come from Freetail Hackers.
				</h1>`;
	}

	let finalContent = isHTML ? message : await marked.parse(message);
    if (recipientName) {
        finalContent = personalize(finalContent, recipientName);
    }

	try {
		// Send emails to each recipient
		const email = {
			to: recipient,
            from: `${fromName} <${fromAddress}>`,
            subject: subject,
            html: `${warning}${finalContent}`,
		};

		if (process.env.RESEND_API_KEY) {
			const resend = getResend();
			await resend.emails.send(email);
		} else {
			await transporter.sendMail(email);
		}

		return 1;
	} catch (error) {
		console.error(error);
		console.error(`To: ${recipient}, Subject: ${subject}, Message: ${message}`);
		return 0;
	}
};
