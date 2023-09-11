import sgMail from '@sendgrid/mail';
import nodemailer from 'nodemailer';
import { marked } from 'marked';

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
	message: string
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

	const email = {
		to: recipient,
		from: 'hello@freetailhackers.com',
		subject: subject,
		html: `
			${warning}
			${message}`,
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

export const sendManyEmails = async (
	recipients: string[],
	subject: string,
	message: string
): Promise<string> => {
	// Preface with warning if not in production
	let warning = '';
	message = marked.parse(message);
	if (process.env.VERCEL_ENV !== 'production') {
		// Only allow emails to YOPmail on staging
		if (process.env.VERCEL_ENV === 'preview') {
			recipients = recipients.filter((recipient) => recipient.endsWith('@yopmail.com'));
			if (recipients.length === 0) {
				return 'Only @yopmail.com addresses are allowed on staging.';
			}
		}
		warning = `<h1>
			WARNING: This email was sent from a testing environment.
			Be careful when opening any links or attachments!
			This message cannot be guaranteed to come from Freetail Hackers.
			</h1>`;
	}

	try {
		// Send emails to each recipient
		const emailPromises = recipients.map(async (recipient) => {
			const email = {
				to: recipient,
				from: 'hello@freetailhackers.com',
				subject: subject,
				html: `
					${warning}
					${message}`,
			};

			if (process.env.SENDGRID_KEY) {
				sgMail.send(email);
			} else {
				transporter.sendMail(email);
			}

			return 'We sent an email to ' + recipient + '!';
		});

		await Promise.allSettled(emailPromises);
		return `Emails sent to ${recipients.join(', ')}!`;
	} catch (error) {
		console.error(error);
		console.error(`To: ${recipients.join(', ')}, Subject: ${subject}, Message: ${message}`);
		return 'There was an error sending the emails. Please try again later.';
	}
};
