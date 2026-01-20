import { NextResponse } from 'next/server';
import crypto from 'crypto';
import { PutObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { isAuthed } from '@/lib/auth';
import { getBucket, getPublicUrl, getR2Client } from '@/lib/r2';

export const runtime = 'nodejs';

export async function POST(request: Request) {
  try {
    if (!isAuthed()) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json().catch(() => null);
    const filename = body?.filename;
    const contentType = body?.contentType || 'application/octet-stream';
    if (!filename || typeof filename !== 'string') {
      return NextResponse.json({ error: 'Missing filename' }, { status: 400 });
    }

    const key = `${Date.now()}-${crypto.randomUUID()}-${filename}`;
    const command = new PutObjectCommand({
      Bucket: getBucket(),
      Key: key,
      ContentType: contentType
    });

    const uploadUrl = await getSignedUrl(getR2Client(), command, { expiresIn: 60 });
    const publicUrl = getPublicUrl(key);

    return NextResponse.json({ key, uploadUrl, publicUrl });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ error: 'Presign failed', detail: message }, { status: 500 });
  }
}
