import { NextResponse } from 'next/server';
import { isAuthed } from '@/lib/auth';
import { addImagesToAlbum } from '@/lib/db';

export async function POST(request: Request) {
  if (!isAuthed()) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = await request.json().catch(() => null);
  const albumId = Number(body?.albumId);
  const imageIds = Array.isArray(body?.imageIds) ? body.imageIds.map((id: unknown) => Number(id)) : [];

  if (!Number.isFinite(albumId) || imageIds.length === 0 || imageIds.some((id: number) => !Number.isFinite(id))) {
    return NextResponse.json({ error: 'Invalid album or images' }, { status: 400 });
  }

  await addImagesToAlbum(albumId, imageIds);
  return NextResponse.json({ ok: true });
}
