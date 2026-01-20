import { NextResponse } from 'next/server';
import { isAuthed } from '@/lib/auth';
import { createAlbum, listAlbumsAll } from '@/lib/db';

export async function GET() {
  if (!isAuthed()) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const albums = await listAlbumsAll();
  return NextResponse.json({ albums });
}

export async function POST(request: Request) {
  if (!isAuthed()) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = await request.json().catch(() => null);
  const title = body?.title;
  if (!title || typeof title !== 'string') {
    return NextResponse.json({ error: 'Missing title' }, { status: 400 });
  }

  const visibility = body?.visibility;
  const allowedVisibility =
    visibility === 'private' || visibility === 'unlisted' || visibility === 'public' ? visibility : 'public';

  const result = await createAlbum({
    title,
    description: body?.description ? String(body.description) : undefined,
    tag: body?.tag ? String(body.tag) : undefined,
    visibility: allowedVisibility
  });

  return NextResponse.json({ ok: true, albumId: result.id, publicId: result.publicId });
}
