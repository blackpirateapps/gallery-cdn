import { NextResponse } from 'next/server';
import { isAuthed } from '@/lib/auth';
import { deleteAlbum, updateAlbum } from '@/lib/db';

export async function PATCH(request: Request, { params }: { params: { id: string } }) {
  if (!isAuthed()) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const id = Number(params.id);
  if (!Number.isFinite(id)) {
    return NextResponse.json({ error: 'Invalid id' }, { status: 400 });
  }

  const body = await request.json().catch(() => null);
  const visibility = body?.visibility;
  const allowedVisibility =
    visibility === 'private' || visibility === 'unlisted' || visibility === 'public' ? visibility : 'public';
  const publicId = body?.publicId;
  if (publicId && typeof publicId !== 'string') {
    return NextResponse.json({ error: 'Invalid public id' }, { status: 400 });
  }

  try {
    await updateAlbum(id, {
      title: body?.title ?? null,
      description: body?.description ?? null,
      tag: body?.tag ?? null,
      publicId: publicId ? String(publicId) : null,
      visibility: allowedVisibility
    });

    return NextResponse.json({ ok: true });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to update album';
    return NextResponse.json({ error: message }, { status: 409 });
  }
}

export async function DELETE(_request: Request, { params }: { params: { id: string } }) {
  if (!isAuthed()) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const id = Number(params.id);
  if (!Number.isFinite(id)) {
    return NextResponse.json({ error: 'Invalid id' }, { status: 400 });
  }

  await deleteAlbum(id);
  return NextResponse.json({ ok: true });
}
