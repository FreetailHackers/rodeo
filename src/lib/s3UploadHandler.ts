import { DeleteObjectCommand, PutObjectCommand, S3Client } from '@aws-sdk/client-s3';
const s3Client = new S3Client({ region: process.env.AWS_REGION });

/*
 * Uploads a file to s3. A folder name and key is needed!
 */
export async function s3UploadHandler(key: string, file: File): Promise<void> {
	//Ensure that there is no copy
	const deleteObjectCommand = new DeleteObjectCommand({
		Bucket: process.env.S3_BUCKET,
		Key: `${key}`,
	});
	await s3Client.send(deleteObjectCommand);

	const putObjectCommand = new PutObjectCommand({
		Bucket: process.env.S3_BUCKET,
		Key: `${key}`,
		Body: Buffer.from(await file.arrayBuffer()),
		ContentType: file.type,
	});
	await s3Client.send(putObjectCommand);
}
