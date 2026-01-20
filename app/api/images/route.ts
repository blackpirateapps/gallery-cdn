import { NextResponse } from 'next/server';
import crypto from 'crypto';
import { isAuthed } from '@/lib/auth';
import { insertImage, listImages } from '@/lib/db';
import { getPublicUrl, uploadImage } from '@/lib/r2';

export async function GET() {
  const images = await listImages();
  return NextResponse.json({ images });
}

export async function POST(request: Request) {
  if (!isAuthed()) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const formData = await request.formData();
  const file = formData.get('file');
  if (!file || !(file instanceof File)) {
    return NextResponse.json({ error: 'Missing file' }, { status: 400 });
  }

  const arrayBuffer = await file.arrayBuffer();
  const key = `${Date.now()}-${crypto.randomUUID()}-${file.name}`;
  const body = new Uint8Array(arrayBuffer);
  const contentType = file.type || 'application/octet-stream';

  await uploadImage(key, body, contentType);
  const url = getPublicUrl(key);
  await insertImage(key, url);

  return NextResponse.json({ ok: true, url });
}
