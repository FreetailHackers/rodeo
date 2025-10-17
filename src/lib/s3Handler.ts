import { PutObjectCommand, S3Client, DeleteObjectCommand } from '@aws-sdk/client-s3';
import { error } from '@sveltejs/kit';

const s3Client = new S3Client({ region: process.env.AWS_REGION });

/*
 *  Deletes a file from s3. A key is needed!
 */
export async function s3Delete(key: string | undefined): Promise<void> {
	if (key) {
		const deleteObjectCommand = new DeleteObjectCommand({
			Bucket: process.env.S3_BUCKET,
			Key: key,
		});
		await s3Client.send(deleteObjectCommand);
	}
}

/*
 *  Uploads a file to s3. A key is needed!
 */
export async function s3Upload(key: string, file: File): Promise<void> {
	// Ensure that there is no copy
	s3Delete(key);

	const putObjectCommand = new PutObjectCommand({
		Bucket: process.env.S3_BUCKET,
		Key: `${key}`,
		Body: Buffer.from(await file.arrayBuffer()),
		ContentType: file.type,
	});
	const result = await s3Client.send(putObjectCommand);
}
