// import path from 'node:path';
// import fs from 'node:fs/promises';
import { PKPass } from 'passkit-generator';
import { t } from '../t';
import { z } from 'zod';
// import { fileURLToPath } from 'node:url';
// import { test } from './modelRecords';
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
 * Returns an object containing the parsed fileName
 * from a path along with its content.
 *
 * @param filePath
 * @param content
 * @param depthFromEnd - used to preserve localization lproj content
 * @returns
 */
// function getObjectFromModelFile(filePath: string, content: Buffer, depthFromEnd: number) {
// 	const fileComponents = filePath.split(path.sep);
// 	const fileName = fileComponents.slice(fileComponents.length - depthFromEnd).join('/');

// 	return { [fileName]: content };
// }

/**
 * Returns a PKPass object based off of the model files.
 *
 * @returns Promise<PKPass>
 */
const createPass = async (uid: string, group: string, modelRecords: Record<string, Buffer>) => {
	// Get the directory of the current file and resolve the ticket.pass path relative to it
	const [certificates] = await Promise.all([getCertificates()]);

	// Use relative paths from the current file location
	// const modelFilesList = [
	// 	'./ticket/icon.png',
	// 	'./ticket/pass.json',
	// 	'./ticket/strip.png',
	// 	'./ticket/logo.png',
	// 	'./ticket/icon@2x.png',
	// ];

	// const modelRecords = (
	// 	await Promise.all(
	// 		modelFilesList.map(async (filePath) => {
	// 			console.log(filePath);
	// 			// Use import.meta.resolve to get the correct path
	// 			const resolvedPath = new URL(filePath, import.meta.url).pathname;
	// 			return fs
	// 				.readFile(resolvedPath)
	// 				.then((content) => getObjectFromModelFile(filePath, content, 1));
	// 		})
	// 	)
	// ).reduce((acc, current) => ({ ...acc, ...current }), {});
	// console.log('modelRecords');
	// console.log(modelRecords["icon.png"]);

	// Convert base64 strings back to Buffers
	// const modelRecordsFromJson: Record<string, Buffer> = {};
	// for (const [key, value] of Object.entries(test)) {
	// 	console.log(key);
	// 	if (key !== 'pass.json') {
	// 		if (typeof value === 'string' && key.endsWith('.png')) {
	// 			modelRecordsFromJson[key] = Buffer.from(value, 'base64');
	// 		} else if (typeof value === 'string') {
	// 			modelRecordsFromJson[key] = Buffer.from(value, 'utf-8');
	// 		}
	// 	} else {
	// 		modelRecordsFromJson[key] = Buffer.from(JSON.stringify(value), 'utf-8');
	// 	}
	// }
	//console.log(modelRecordsFromJson);
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
				modelRecords: z.record(z.any()).nullable(),
			})
		)
		.mutation(async ({ input }) => {
			const pass = await createPass(input.uid, input.group, input.modelRecords || {});
			const buffer = pass.getAsBuffer();
			return {
				data: Array.from(buffer),
				mimeType: 'application/vnd.apple.pkpass',
			};
		}),
});
