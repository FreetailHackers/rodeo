import path from 'node:path';
import { fileURLToPath } from 'node:url';
import fs from 'node:fs/promises';
import { PKPass } from 'passkit-generator';
import { t } from '../t';
import { z } from 'zod';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

/**
 * method to get the certificates needed to create the pass
 *
 * @returns the signer certificates and the passphrase
 */
const getCertificates = async () => {
	const certificates = {
		signerCert: (process.env.SIGNER_CERT || '').replace(/\\n/g, '\n'),
		signerKer: (process.env.SIGNER_KEY || '').replace(/\\n/g, '\n'),
		wwdr: (process.env.WWDR || '').replace(/\\n/g, '\n'),
		signerKeyPassphrase: (process.env.SIGNER_KEY_PASSPHRASE || '').replace(/\\n/g, '\n'),
	};

	if (!certificates.signerCert || !certificates.signerKer || !certificates.wwdr) {
		throw new Error('Missing required certificate environment variables');
	}

	return certificates;
};

/**
 * Removes hidden files from a list (those starting with dot)
 *
 * @params from - list of file names
 * @return
 */
export function removeHidden(from: Array<string>): Array<string> {
	return from.filter((e) => e.charAt(0) !== '.');
}

/**
 * Returns an object containing the parsed fileName
 * from a path along with its content.
 *
 * @param filePath
 * @param content
 * @param depthFromEnd - used to preserve localization lproj content
 * @returns
 */
function getObjectFromModelFile(filePath: string, content: Buffer, depthFromEnd: number) {
	const fileComponents = filePath.split(path.sep);
	const fileName = fileComponents.slice(fileComponents.length - depthFromEnd).join('/');

	return { [fileName]: content };
}

/**
 * Reads a directory and returns all the files in it
 * as an Array<Promise>
 *
 * @param filePath
 * @returns Promise<Array<Promise>>
 */
async function readDirectory(filePath: string) {
	const dirContent = await fs.readdir(filePath).then(removeHidden);

	return dirContent.map(async (fileName) => {
		const content = await fs.readFile(path.resolve(filePath, fileName));
		return getObjectFromModelFile(path.resolve(filePath, fileName), content, 2);
	});
}

/**
 * Reads a file or a directory and returns its content
 * as an Object.
 *
 * @param filePath
 * @returns Promise<Object>
 */
async function readFileOrDirectory(filePath: string) {
	if ((await fs.lstat(filePath)).isDirectory()) {
		return Promise.all(await readDirectory(filePath));
	} else {
		return fs.readFile(filePath).then((content) => getObjectFromModelFile(filePath, content, 1));
	}
}

/**
 * Returns a PKPass object based off of the model files.
 *
 * @returns Promise<PKPass>
 */
const createPassTemplate = async () => {
	const modelPath = path.resolve(__dirname, '../../../routes/account/ticket.pass');
	const [modelFilesList, certificates] = await Promise.all([
		fs.readdir(modelPath),
		getCertificates(),
	]);

	const modelRecords = (
		await Promise.all(
			modelFilesList.map((fileOrDirectoryPath) => {
				const fullPath = path.resolve(modelPath, fileOrDirectoryPath);

				return readFileOrDirectory(fullPath);
			})
		)
	)
		.flat(1)
		.reduce((acc, current) => ({ ...acc, ...current }), {});

	return new PKPass(modelRecords, {
		wwdr: certificates.wwdr,
		signerCert: certificates.signerCert,
		signerKey: certificates.signerKer,
		signerKeyPassphrase: certificates.signerKeyPassphrase,
	});
};

const passTemplate = createPassTemplate();

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
			})
		)
		.mutation(async ({ input }) => {
			const pass = await passTemplate;
			pass.setBarcodes({
				message: input.uid,
				format: 'PKBarcodeFormatQR',
				messageEncoding: 'iso-8859-1',
			});
			pass.secondaryFields.push({
				key: 'Group',
				label: 'Group',
				value: input.group,
			});
			const buffer = pass.getAsBuffer();
			return {
				data: Array.from(buffer),
				mimeType: 'application/vnd.apple.pkpass',
			};
		}),
});
