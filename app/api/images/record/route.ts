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

  if (!key || !url) {
    return NextResponse.json({ error: 'Missing key or url' }, { status: 400 });
  }

  await insertImage(String(key), String(url));
  return NextResponse.json({ ok: true });
}
