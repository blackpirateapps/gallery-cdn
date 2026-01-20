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

  const publicId = body?.publicId;
  if (publicId && typeof publicId !== 'string') {
    return NextResponse.json({ error: 'Invalid public id' }, { status: 400 });
  }

  const visibility = body?.visibility;
  const allowedVisibility =
    visibility === 'private' || visibility === 'unlisted' || visibility === 'public' ? visibility : 'public';

  try {
    const result = await createAlbum({
      title,
      description: body?.description ? String(body.description) : undefined,
      tag: body?.tag ? String(body.tag) : undefined,
      publicId: publicId ? String(publicId) : undefined,
      visibility: allowedVisibility
    });

    return NextResponse.json({ ok: true, albumId: result.id, publicId: result.publicId });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to create album';
    return NextResponse.json({ error: message }, { status: 409 });
  }
}
