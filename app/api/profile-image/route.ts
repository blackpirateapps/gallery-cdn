import { NextResponse } from 'next/server';
import { isAuthed } from '@/lib/auth';
import { getProfileImage, setProfileImage } from '@/lib/db';
import { removeImage } from '@/lib/r2';

export async function GET() {
  const profileImage = await getProfileImage();
  return NextResponse.json({ profileImage });
}

export async function POST(request: Request) {
  if (!isAuthed()) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = await request.json().catch(() => null);
  const key = body?.key;
  const url = body?.url;
  if (!key || !url) {
    return NextResponse.json({ error: 'Missing key or url' }, { status: 400 });
  }

  const existing = await getProfileImage();
  if (existing && existing.key && existing.key !== key) {
    await removeImage(existing.key);
  }

  await setProfileImage({ key: String(key), url: String(url) });
  return NextResponse.json({ ok: true });
}
