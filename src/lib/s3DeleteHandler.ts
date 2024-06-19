import { DeleteObjectCommand, S3Client } from '@aws-sdk/client-s3';
const s3Client = new S3Client({ region: process.env.AWS_REGION });

/*
 *  Deletes a file from s3. A key is needed!
 */
export async function s3DeleteHandler(key: string | undefined): Promise<void> {
	if (key) {
		const deleteObjectCommand = new DeleteObjectCommand({
			Bucket: process.env.S3_BUCKET,
			Key: key,
		});
		await s3Client.send(deleteObjectCommand);
	}
}
