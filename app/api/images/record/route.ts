import { NextResponse } from 'next/server';
import { isAuthed } from '@/lib/auth';
import { insertImage } from '@/lib/db';

export async function POST(request: Request) {
  if (!isAuthed()) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = await request.json().catch(() => null);
  const key = body?.key;
  const url = body?.url;
  const title = body?.title;
  const description = body?.description;
  const tag = body?.tag;
  const location = body?.location;
  const exif = body?.exif;

  if (!key || !url) {
    return NextResponse.json({ error: 'Missing key or url' }, { status: 400 });
  }

  await insertImage({
    key: String(key),
    url: String(url),
    title: title ? String(title) : undefined,
    description: description ? String(description) : undefined,
    tag: tag ? String(tag) : undefined,
    location: location ? String(location) : undefined,
    exifJson: exif ? JSON.stringify(exif) : undefined
  });
  return NextResponse.json({ ok: true });
}
