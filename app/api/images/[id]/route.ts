import { NextResponse } from 'next/server';
import { isAuthed } from '@/lib/auth';
import { deleteImage, getImageById, updateImageMeta } from '@/lib/db';
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
  if (image.thumb_key) {
    await removeImage(image.thumb_key);
  }
  await deleteImage(id);

  return NextResponse.json({ ok: true });
}

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

  await updateImageMeta(id, {
    title: body?.title ?? null,
    description: body?.description ?? null,
    tag: body?.tag ?? null,
    location: body?.location ?? null,
    exifMake: body?.exifMake ?? null,
    exifModel: body?.exifModel ?? null,
    exifLens: body?.exifLens ?? null,
    exifFNumber: body?.exifFNumber ?? null,
    exifExposure: body?.exifExposure ?? null,
    exifIso: body?.exifIso ?? null,
    exifFocal: body?.exifFocal ?? null,
    exifTakenAt: body?.exifTakenAt ?? null,
    exifLat: body?.exifLat ?? null,
    exifLng: body?.exifLng ?? null,
    featured: Boolean(body?.featured),
    visibility: allowedVisibility
  });

  return NextResponse.json({ ok: true });
}
