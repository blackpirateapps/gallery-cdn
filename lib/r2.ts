import { S3Client, PutObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3';

let client: S3Client | null = null;

export function getR2Client() {
  if (!client) {
    const endpoint = process.env.R2_ENDPOINT;
    const accessKeyId = process.env.R2_ACCESS_KEY_ID;
    const secretAccessKey = process.env.R2_SECRET_ACCESS_KEY;
    if (!endpoint || !accessKeyId || !secretAccessKey) {
      throw new Error('R2_ENDPOINT or R2_ACCESS_KEY_ID or R2_SECRET_ACCESS_KEY is not set');
    }
    client = new S3Client({
      region: 'auto',
      endpoint,
      credentials: { accessKeyId, secretAccessKey }
    });
  }
  return client;
}

export function getBucket() {
  const bucket = process.env.R2_BUCKET;
  if (!bucket) {
    throw new Error('R2_BUCKET is not set');
  }
  return bucket;
}

export function getPublicUrl(key: string) {
  const base = process.env.R2_PUBLIC_URL;
  if (!base) {
    throw new Error('R2_PUBLIC_URL is not set');
  }
  return `${base.replace(/\/$/, '')}/${key}`;
}

export async function uploadImage(key: string, body: Uint8Array, contentType: string) {
  const s3 = getR2Client();
  await s3.send(
    new PutObjectCommand({
      Bucket: getBucket(),
      Key: key,
      Body: body,
      ContentType: contentType
    })
  );
}

export async function removeImage(key: string) {
  const s3 = getR2Client();
  await s3.send(
    new DeleteObjectCommand({
      Bucket: getBucket(),
      Key: key
    })
  );
}
