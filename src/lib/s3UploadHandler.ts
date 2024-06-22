import { PutObjectCommand, S3Client } from '@aws-sdk/client-s3';
import { s3DeleteHandler } from '$lib/s3DeleteHandler';
const s3Client = new S3Client({ region: process.env.AWS_REGION });

/*
 *  Uploads a file to s3. A key is needed!
 */
export async function s3UploadHandler(key: string, file: File): Promise<void> {
	// Ensure that there is no copy
	s3DeleteHandler(key);

	const putObjectCommand = new PutObjectCommand({
		Bucket: process.env.S3_BUCKET,
		Key: `${key}`,
		Body: Buffer.from(await file.arrayBuffer()),
		ContentType: file.type,
	});
	await s3Client.send(putObjectCommand);
}
