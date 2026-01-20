import { NextResponse } from 'next/server';
import { isAuthed } from '@/lib/auth';
import { deleteImage, getImageById } from '@/lib/db';
import { removeImage } from '@/lib/r2';

export async function DELETE(_request: Request, { params }: { params: { id: string } }) {
  if (!isAuthed()) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const id = Number(params.id);
  if (!Number.isFinite(id)) {
    return NextResponse.json({ error: 'Invalid id' }, { status: 400 });
  }

  const image = await getImageById(id);
  if (!image) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }

  await removeImage(image.key);
  await deleteImage(id);

  return NextResponse.json({ ok: true });
}
