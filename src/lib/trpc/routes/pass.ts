import { PKPass } from 'passkit-generator';
import { S3Client, GetObjectCommand, ListObjectsV2Command } from '@aws-sdk/client-s3';
import { t } from '../t';
import { z } from 'zod';

const s3Client = new S3Client({ region: process.env.AWS_REGION });

/**
 * method to get the certificates needed to create the pass
 *
 * @returns the signer certificates and the passphrase
 */
const getCertificates = async () => {
	const certificates = {
		signerCert: (process.env.SIGNER_CERT || '').replace(/\\n/g, '\n').replace(/_/g, ' '),
		signerKey: (process.env.SIGNER_KEY || '').replace(/\\n/g, '\n').replace(/_/g, ' '),
		wwdr: (process.env.WWDR || '').replace(/\\n/g, '\n').replace(/_/g, ' '),
		signerKeyPassphrase: (process.env.SIGNER_KEY_PASSPHRASE || '').replace(/\\n/g, '\n'),
	};

	if (!certificates.signerCert || !certificates.signerKey || !certificates.wwdr) {
		throw new Error('Missing required certificate environment variables');
	}

	return certificates;
};

/**
 * Fetches all files from the ticket.pass folder in S3
 * @returns Promise<Record<string, Buffer>>
 */
async function fetchModelFilesFromS3(): Promise<Record<string, Buffer>> {
	const listCommand = new ListObjectsV2Command({
		Bucket: process.env.S3_BUCKET,
		Prefix: 'ticket.pass/',
	});

	const listResponse = await s3Client.send(listCommand);

	if (!listResponse.Contents) {
		throw new Error('No files found in ticket.pass folder in S3');
	}

	const modelRecords: Record<string, Buffer> = {};

	// Fetch each file from S3
	for (const object of listResponse.Contents) {
		if (object.Key && !object.Key.endsWith('/')) {
			const getCommand = new GetObjectCommand({
				Bucket: process.env.S3_BUCKET,
				Key: object.Key,
			});

			const getResponse = await s3Client.send(getCommand);

			if (getResponse.Body) {
				// Convert the stream to a buffer using AWS SDK's transformToByteArray
				const buffer = Buffer.from(await getResponse.Body.transformToByteArray());

				// Extract just the filename from the S3 key
				const fileName = object.Key.split('/').pop() || object.Key;
				modelRecords[fileName] = buffer;
			}
		}
	}

	return modelRecords;
}

/**
 * Returns a PKPass object based off of the model files.
 *
 * @returns Promise<PKPass>
 */
const createPass = async (uid: string, group: string) => {
	const [modelRecords, certificates] = await Promise.all([
		fetchModelFilesFromS3(),
		getCertificates(),
	]);

	const pass = new PKPass(modelRecords, {
		wwdr: certificates.wwdr,
		signerCert: certificates.signerCert,
		signerKey: certificates.signerKey,
		signerKeyPassphrase: certificates.signerKeyPassphrase,
	});

	pass.setBarcodes({
		message: uid,
		format: 'PKBarcodeFormatQR',
		messageEncoding: 'iso-8859-1',
	});

	pass.secondaryFields.push({
		key: 'Group',
		label: 'Group',
		value: group,
	});

	return pass;
};

/**
 * Router that returns a the PKPass object using the provided UID
 *
 * @returns Promise<PKPass>
 */
export const passRouter = t.router({
	getPass: t.procedure
		.input(
			z.object({
				uid: z.string().min(1),
				group: z.string().min(1),
			}),
		)
		.mutation(async ({ input }) => {
			const pass = await createPass(input.uid, input.group);
			const buffer = pass.getAsBuffer();
			return {
				data: Array.from(buffer),
				mimeType: 'application/vnd.apple.pkpass',
			};
		}),
});
