import sgMail from '@sendgrid/mail';
import nodemailer from 'nodemailer';
import { marked } from 'marked';
/** @type {import('@sveltejs/adapter-vercel').Config} */

export const config = {
	runtime: 'nodejs18.x',
};

sgMail.setApiKey(process.env.SENDGRID_KEY as string);
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
	name: string | null
): Promise<string> => {
	// Preface with warning if not in production
	let warning = '';
	message = marked.parse(message);
	if (process.env.VERCEL_ENV !== 'production') {
		// Only allow emails to YOPmail on staging
		if (process.env.VERCEL_ENV === 'preview' && !recipient.endsWith('@yopmail.com')) {
			return 'Only @yopmail.com addresses are allowed on staging.';
		}
		warning = `<h1>
			WARNING: This email was sent from a testing environment.
			Be careful when opening any links or attachments!
			This message cannot be guaranteed to come from Freetail Hackers.
			</h1>`;
	}
	const greeting = name ? `Hi ${name},` : 'Hi,';

	const email = {
		to: recipient,
		from: 'hello@freetailhackers.com',
		subject: subject,
		html: `
			${warning}
			${greeting}
			${message}
			If you have any questions, you may email us at <a href="mailto:tech@freetailhackers.com">tech@freetailhackers.com</a>.
			<br>
			<br>
			Best,
			<br>
			Freetail Hackers`,
	};
	try {
		if (process.env.SENDGRID_KEY) {
			await sgMail.send(email);
		} else {
			await transporter.sendMail(email);
		}
		return 'We sent an email to ' + recipient + '!';
	} catch (error) {
		console.error(error);
		console.error(`To: ${recipient}, Subject: ${subject}, Message: ${message}`);
		return 'There was an error sending the email. Please try again later.';
	}
};
