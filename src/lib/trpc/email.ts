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
	message: string,
	isHTML: boolean
): Promise<number> => {
	// Preface with warning if not in production
	let warning = '';
	message = isHTML ? message : marked.parse(message);
	if (process.env.VERCEL_ENV !== 'production') {
		if (process.env.VERCEL_ENV === 'preview' && recipient.endsWith('@yopmail.com')) {
			// Only allow emails to YOPmail on staging
			console.log('Only @yopmail.com addresses are allowed on staging.');
			return 0;
		}
		warning = `<h1>
				WARNING: This email was sent from a testing environment.
				Be careful when opening any links or attachments!
				This message cannot be guaranteed to come from Freetail Hackers.
				</h1>`;
	}

	try {
		// Send emails to each recipient
		const email = {
			to: recipient,
			from: 'hello@freetailhackers.com',
			subject: subject,
			html: `
				${warning}
				${message}`,
		};

		if (process.env.SENDGRID_KEY) {
			await sgMail.send(email);
		} else {
			await transporter.sendMail(email);
		}

		console.log(`Email successfully sent to ${recipient}!`);
		return 1;
	} catch (error) {
		console.error(error);
		console.error(`To: ${recipient}, Subject: ${subject}, Message: ${message}`);
		return 0;
	}
};
