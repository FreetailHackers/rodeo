import { PKPass } from 'passkit-generator';
import {
	S3Client,
	GetObjectCommand,
	ListObjectsV2Command,
	PutObjectCommand,
} from '@aws-sdk/client-s3';
import { t } from '../t';
import { z } from 'zod';
import sharp from 'sharp';
/**
 * APPLE & GOOGLE WALLET PASS GENERATION DOCUMENTATION
 *
 * library used: https://github.com/alexandercerutti/passkit-generator
 * apple wallet pass docs: https://developer.apple.com/library/archive/documentation/UserExperience/Conceptual/PassKit_PG/Creating.html#//apple_ref/doc/uid/TP40012195-CH4-SW5
 *
 * how this works:
 * 	pkpass
 * 		- the pkpass is a zip file that contains all of our pass data (logo, background, etc.)
 * 			we use the pkpass library to create the zip file
 *  aws
 *     - we use aws s3 to store all the pkpass files. we store it in the "ticket.pass" folder.
 *     - these files must be stored in a seperate enviornment (ie: supabase or aws)
 * 	   - here's a quick overview of the files in this folder:
 *       - pass.json: this holds the main metadata for the pass (ie. event name, bg color, etc)
 * 	       the current pass.json file is pretty straight forward, but for more info look at the apple docs.
 *       - icon.png/icon@2x.png (deprecated in our usecase)
 *       - logo.png: the image in the top left
 *       - strip.png: the image in the center
 *     - you can either update these files manually or use a script to update them.
 *
 * 	certificates (DO NOT LEAK THESE)
 * 		- for apple wallet we're required to use a certificate to sign the pass.
 *         this is done by being apart of the apple developer program & creating a certificate
 *         which we then use to sign the pass. we currently use Ali Vayani's apple developer account
 *         so if any future issues occur hit him up.
 *     - the certificates are SIGNER_CERT, SIGNER_KEY, WWDR, SIGNER_KEY_PASSPHRASE. DO NOT LEAK THESE.
 *
 *  google vs apple wallet
 * 		- google wallet is a lot nicer to work with than apple wallet. pkpass is backwards compatible
 *        with android so we just use the same pass for both. android can't take full advantage of
 *        the pkpass though so it's more bear bones. potentially look into googles wallet docs for future
 *        improvements.
 *      - apple wallet is a lot more finnicky and requires a lot more work to get it to work. certificates are
 *        a must & there are limitations to design. currently we are using an "event" pass type.
 *
 *  overall
 * 		- there are a lot of cool things we can do with pass integration, but this is the current
 *        implementation
 *
 */

const s3Client = new S3Client({ region: process.env.AWS_REGION });

/**
 * method to get the certificates needed to create the pass
 *
 * @returns the signer certificates and the passphrase
 */
const getCertificates = async () => {
	// Helper function to properly format certificate strings
	const formatCert = (cert: string) => {
		if (!cert) return '';
		// Handle both literal \n in strings and actual newlines
		// Also fix em dashes that sometimes get copied instead of regular dashes
		let formatted = cert
			.replace(/\\n/g, '\n')
			.replace(/_/g, ' ')
			.replace(/—/g, '-') // Replace em dashes with regular dashes
			.trim();

		formatted = formatted.replace(/-+BEGIN ([A-Z ]+)-+/g, '-----BEGIN $1-----');
		formatted = formatted.replace(/-+END ([A-Z ]+)-+/g, '-----END $1-----');

		return formatted;
	};

	const certificates = {
		signerCert: formatCert(process.env.SIGNER_CERT || ''),
		signerKey: formatCert(process.env.SIGNER_KEY || ''),
		wwdr: formatCert(process.env.WWDR || ''),
		signerKeyPassphrase: (process.env.SIGNER_KEY_PASSPHRASE || '').replace(/\\n/g, '\n'),
	};

	if (!certificates.signerCert || !certificates.signerKey || !certificates.wwdr) {
		throw new Error('Missing required certificate environment variables');
	}

	return certificates;
};

/**
 * Fetches all files from the specified prefix in S3
 * @param prefix - The S3 prefix to use (defaults to 'ticket.pass/')
 * @returns Promise<Record<string, Buffer>>
 */
async function fetchModelFilesFromS3(prefix?: string): Promise<Record<string, Buffer>> {
	const prefixToUse = prefix || 'ticket.pass/';
	const listCommand = new ListObjectsV2Command({
		Bucket: process.env.S3_BUCKET,
		Prefix: prefixToUse,
	});

	const listResponse = await s3Client.send(listCommand);

	if (!listResponse.Contents) {
		console.warn(
			'Pass feature disabled: no files found in ticket.pass folder in S3, bucket:',
			process.env.S3_BUCKET,
		);
		// Return an empty record to signal that the pass feature is effectively disabled
		return {};
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
 * @param uid - User ID for the pass
 * @param group - Group name for the pass
 * @param prefix - Optional S3 prefix (defaults to 'ticket.pass/')
 * @returns Promise<PKPass>
 */
const createPass = async (uid: string, group: string, prefix?: string) => {
	const [modelRecords, certificates] = await Promise.all([
		fetchModelFilesFromS3(prefix),
		getCertificates(),
	]);

	// If no model files are available, disable the feature gracefully
	if (Object.keys(modelRecords).length === 0) {
		console.warn('Pass feature is disabled because no model files were loaded from S3.');
		return null;
	}

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
				prefix: z.string().optional(),
			}),
		)
		.mutation(async ({ input }) => {
			const pass = await createPass(input.uid, input.group, input.prefix);

			// If the feature is disabled, return a null payload instead of throwing
			if (!pass) {
				return {
					data: null,
					mimeType: null,
				};
			}

			const buffer = pass.getAsBuffer();
			return {
				data: Array.from(buffer),
				mimeType: 'application/vnd.apple.pkpass',
			};
		}),
});

/**
 * Uploads wallet pass asset files (strip.png and/or pass.json) to S3.
 *
 * Validates provided files and overwrites existing assets in the configured S3 bucket.
 * Supports partial updates (image only, JSON only, or both).
 *
 * @param stripFile - Optional PNG image for the wallet pass strip (must be named 'strip.png', <=5MB, ~3.83:1 aspect ratio)
 * @param passFile - Optional JSON file defining the wallet pass structure (must be named 'pass.json' and contain required fields)
 * @returns Promise<{ success: boolean; message: string }>
 */

export async function uploadWalletPassFiles({
	stripFile,
	passFile,
}: {
	stripFile?: File | null;
	passFile?: File | null;
}) {
	try {
		//ensure at least one file is provided
		if (!stripFile && !passFile) {
			throw new Error('At least one file must be uploaded');
		}

		const uploads: Promise<any>[] = [];

		// -----------------------------
		// HANDLE strip.png (optional)
		// -----------------------------
		if (stripFile) {
			if (stripFile.name !== 'strip.png') {
				throw new Error('Image must be named strip.png');
			}

			const stripBuffer = Buffer.from(await stripFile.arrayBuffer());

			const meta = await sharp(stripBuffer).metadata();

			if (meta.format !== 'png') {
				throw new Error('strip.png must be a PNG');
			}

			if (!meta.width || !meta.height) {
				throw new Error('Invalid image dimensions');
			}

			const ratio = meta.width / meta.height;

			if (Math.abs(ratio - 3.83) > 0.05) {
				throw new Error('Aspect ratio must be ~3.83:1 (e.g., 375x98)');
			}

			if (stripBuffer.length > 5 * 1024 * 1024) {
				throw new Error('Image exceeds 5MB limit');
			}

			uploads.push(
				s3Client.send(
					new PutObjectCommand({
						Bucket: process.env.S3_BUCKET,
						Key: 'rodeo-staging/strip.png',
						Body: stripBuffer,
						ContentType: 'image/png',
					}),
				),
			);
		}

		// -----------------------------
		// HANDLE pass.json (optional)
		// -----------------------------
		if (passFile) {
			if (passFile.name !== 'pass.json') {
				throw new Error('JSON must be named pass.json');
			}

			const passBuffer = Buffer.from(await passFile.arrayBuffer());

			let parsedJson: any;

			try {
				parsedJson = JSON.parse(passBuffer.toString());
			} catch {
				throw new Error('Invalid JSON format');
			}

			if (!parsedJson.formatVersion) {
				throw new Error('pass.json missing formatVersion');
			}

			if (!parsedJson.passTypeIdentifier) {
				throw new Error('pass.json missing passTypeIdentifier');
			}

			if (!parsedJson.teamIdentifier) {
				throw new Error('pass.json missing teamIdentifier');
			}

			uploads.push(
				s3Client.send(
					new PutObjectCommand({
						Bucket: process.env.S3_BUCKET,
						Key: 'rodeo-staging/pass.json',
						Body: passBuffer,
						ContentType: 'application/json',
					}),
				),
			);
		}

		// -----------------------------
		// Execute uploads
		// -----------------------------
		await Promise.all(uploads);

		return {
			success: true,
			message: 'Wallet pass files updated successfully',
		};
	} catch (err) {
		console.error('uploadWalletPassFiles error:', err);

		throw new Error(err instanceof Error ? err.message : 'Upload failed');
	}
}

/**
 * Uploads wallet pass asset files (strip.png and/or pass.json) to S3.
 *
 * Validates provided files and overwrites existing assets in the configured S3 bucket.
 * Supports partial updates (image only, JSON only, or both).
 *
 * @param stripFile - Optional PNG image for the wallet pass strip (must be named 'strip.png', <=5MB, ~3.83:1 aspect ratio)
 * @param passFile - Optional JSON file defining the wallet pass structure (must be named 'pass.json' and contain required fields)
 * @returns Promise<{ success: boolean; message: string }>
 */

export async function getCurrentPass() {
	try {
		const response = await s3Client.send(
			new GetObjectCommand({
				Bucket: process.env.S3_BUCKET,
				Key: 'rodeo-staging/pass.json',
			}),
		);

		if (!response.Body) {
			throw new Error('No pass.json found');
		}

		// Convert stream → buffer
		const stream = response.Body as any;
		const chunks: Uint8Array[] = [];

		for await (const chunk of stream) {
			chunks.push(chunk);
		}

		const buffer = Buffer.concat(chunks);

		return {
			success: true,
			file: buffer,
		};
	} catch (err) {
		console.error('getCurrentPass error:', err);
		throw new Error(err instanceof Error ? err.message : 'Failed to download pass.json');
	}
}
