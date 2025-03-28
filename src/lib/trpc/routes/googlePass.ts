// import { google } from 'googleapis';
// import jwt from 'jsonwebtoken';
// import { t } from '../t';
// import { authenticate } from '$lib/trpc/middleware';
// import { z } from 'zod';
//
// /**
//  * Google Wallet API Authentication
//  */
// const issuerID = '3388000000022880544';
// const classID = 'recordHacks-pass';
// const baseURL = 'https://walletobjects.googleapis.com/walletobjects/v1';
//
// if (!process.env.GOOGLE_APPLICATIONS_CREDENTIALS) {
// 	throw new Error('Missing credentials');
// }
//
// const credentials = JSON.parse(process.env.GOOGLE_APPLICATIONS_CREDENTIALS);
//
// const auth = new google.auth.GoogleAuth({
// 	keyFile: credentials,
// 	scopes: ['https://www.googleapis.com/auth/wallet_object.issuer'],
// });
//
// const client = google.walletobjects({ version: 'v1', auth });
//
// /**
//  * Create pass class for hacker IDs
//  */
// async function createGenericPassClass() {
// 	const genericClass = {
// 		id: `${issuerID}.${classID}`,
// 		classId: `${issuerID}.${classID}`,
// 		issuerName: 'Hacker Organization',
// 		header: {
// 			backgroundColor: '#FCFAF1',
// 			logo: {
// 				sourceUri: {
// 					uri: 'https://lh3.googleusercontent.com/d/1XUJSnNPKRlgmBiXuozhLzIP-uWE8On4j',
// 				},
// 			},
// 		},
// 		heroImage: {
// 			sourceUri: {
// 				uri: 'https://lh3.googleusercontent.com/d/1dZi5Znwz4c0TRz7ADt5mYbLA3kP_NiK6',
// 			},
// 		},
// 		backgroundColor: '#FCFAF1',
// 		textModulesData: [
// 			{
// 				header: 'Hacker Name',
// 				body: 'A cool hacker',
// 			},
// 		],
// 	};
//
// 	try {
// 		// Check if the class already exists
// 		await client.genericclass.get({ resourceId: `${issuerID}.${classID}` });
// 		console.log(`Class ${classID} already exists!`);
// 	} catch (error) {
// 		// Create the class if it doesn't exist
// 		const response = await client.genericclass.insert({ requestBody: genericClass });
// 		console.log('Created new generic class', response);
// 	}
//
// 	return `${issuerID}.${classID}`;
// }
//
// /**
//  * Update pass class
//  */
// async function updateGenericPassClass() {
// 	try {
// 		const response = await client.genericclass.get({ resourceId: `${issuerID}.${classID}` });
// 		const updatedData = response.data;
//
// 		// TODO: Modify `updatedData` as needed
//
// 		await client.genericclass.update({
// 			resourceId: `${issuerID}.${classID}`,
// 			requestBody: updatedData,
// 		});
//
// 		return `${issuerID}.${classID}`;
// 	} catch (error) {
// 		console.log("Class doesn't exist");
// 	}
// }
//
// /**
//  * Patch pass class
//  */
// async function patchGenericPassClass() {
// 	try {
// 		const response = await client.genericclass.get({ resourceId: `${issuerID}.${classID}` });
// 		const patchData = response.data;
//
// 		// TODO: Modify `patchData` as needed
//
// 		await client.genericclass.patch({
// 			resourceId: `${issuerID}.${classID}`,
// 			requestBody: patchData,
// 		});
//
// 		return `${issuerID}.${classID}`;
// 	} catch (error) {
// 		console.log("Class doesn't exist");
// 	}
// }
//
// /**
//  * Create a generic pass object
//  */
// async function createGenericObject(userID, qrCodeValue, user, lunchGroup) {
// 	const genericObject = {
// 		id: `${issuerID}.${userID}`,
// 		classId: `${issuerID}.${classID}`,
// 		issuerName: 'Freetail Hackers',
// 		state: 'ACTIVE',
// 		barcode: {
// 			type: 'QR_CODE',
// 			value: qrCodeValue,
// 		},
// 		subheader: {
// 			defaultValue: {
// 				language: 'en-US',
// 				value: 'Hacker Name',
// 			},
// 		},
// 		header: {
// 			defaultValue: {
// 				language: 'en-US',
// 				value: user,
// 			},
// 		},
// 		textModulesData: [
// 			{
// 				id: 'lunch-group',
// 				header: 'Lunch Group',
// 				body: lunchGroup,
// 			},
// 		],
// 	};
//
// 	return client.genericobject.insert({ requestBody: genericObject });
// }
//
// /**
//  * Generate a Google Wallet save URL
//  */
// async function downloadPass(genericObject: JSON) {
// 	const claims = {
// 		iss: credentials.client_email,
// 		aud: 'google',
// 		origins: [],
// 		typ: 'savetowallet',
// 		payload: {
// 			genericObjects: [genericObject],
// 		},
// 	};
//
// 	const token = jwt.sign(claims, credentials.private_key, { algorithm: 'RS256' });
// 	return `https://pay.google.com/gp/v/save/${token}`;
// }
//
// export const googleWalletPassRouter = t.router ({
// 	createClass: t.procedure
// 		.use(authenticate(["ADMIN"]))
// 		.mutation(async (): Promise<void> => {
// 			await createGenericPassClass();
// 		}),
//
// 	updateClass: t.procedure
// 		.use(authenticate(['ADMIN']))
// 		.mutation(async (): Promise<void> => {
// 		await updateGenericPassClass();
// 	}),
//
// 	patchClass: t.procedure
// 		.use(authenticate(['ADMIN']))
// 		.mutation(async (): Promise<void> => {
// 			await patchGenericPassClass();
// 		}),
//
// 	crateObject: t.procedure
// 		.input(z.object({ userId: z.string(), lunchGroup: z.string(), qrCode: z.string(), user: z.string() }))
// 		.mutation(async (req): Promise<void> => {
// 		await createGenericObject(req.input.userId, req.input.qrCode, req.input.user, req.input.lunchGroup );
// 	})
// })
