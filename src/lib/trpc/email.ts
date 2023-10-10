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

export const sendEmails = async (
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
			recipients = recipients.filter((recipient) => !recipient.endsWith('@yopmail.com'));
			if (recipients.length !== 0) {
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
				return sgMail.send(email);
			} else {
				return transporter.sendMail(email);
			}
		});

		const emailResults = await Promise.allSettled(emailPromises);
		const failedRecipients = emailResults
			.filter((result) => result.status === 'rejected')
			.map((result, index) => recipients[index]);
		if (failedRecipients.length > 0) {
			return (
				failedRecipients.length +
				' emails unsuccessfully sent to ' +
				failedRecipients.join(', ') +
				'.'
			);
		} else {
			return `All emails successfully sent to ${recipients.join(', ')}!`;
		}
	} catch (error) {
		console.error(error);
		console.error(`To: ${recipients.join(', ')}, Subject: ${subject}, Message: ${message}`);
		return 'There was an error sending the emails. Please try again later.';
	}
};
