import path from 'node:path';
import fs from 'node:fs/promises';
import { PKPass } from 'passkit-generator';
import { t } from '../t';
import { z } from 'zod';

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
function getObjectFromModelFile(filePath: string, content: Buffer, depthFromEnd: number) {
	const fileComponents = filePath.split(path.sep);
	const fileName = fileComponents.slice(fileComponents.length - depthFromEnd).join('/');

	return { [fileName]: content };
}

/**
 * Returns a PKPass object based off of the model files.
 *
 * @returns Promise<PKPass>
 */
const createPass = async (uid: string, group: string) => {
	console.log(process.cwd());

	async function traverseDirectory(dirPath: string, depth = 0) {
		try {
			const files = await fs.readdir(dirPath);
			for (const file of files) {
				const fullPath = path.join(dirPath, file);
				try {
					const stat = await fs.stat(fullPath);
					if (stat.isDirectory() && !file.includes('node_modules') && !file.startsWith('.')) {
						console.log(''.padStart(depth * 2) + '📁 ' + file);
						await traverseDirectory(fullPath, depth + 1);
					} else if (stat.isFile()) {
						console.log(''.padStart(depth * 2) + '📄 ' + file);
					}
				} catch (error) {
					console.error(`Error accessing ${fullPath}:`, error);
				}
			}
		} catch (error) {
			console.error(`Error reading directory ${dirPath}:`, error);
		}
	}

	await traverseDirectory('/var/');

	const modelPath = path.resolve(process.cwd() + '/src/lib/ticket.pass');
	const [modelFilesList, certificates] = await Promise.all([
		fs.readdir(modelPath),
		getCertificates(),
	]);

	const modelRecords = (
		await Promise.all(
			modelFilesList.map(async (fileOrDirectoryPath) => {
				const fullPath = path.resolve(modelPath, fileOrDirectoryPath);
				return fs
					.readFile(fullPath)
					.then((content) => getObjectFromModelFile(fullPath, content, 1));
			})
		)
	).reduce((acc, current) => ({ ...acc, ...current }), {});

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
			})
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
