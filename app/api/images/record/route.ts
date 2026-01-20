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
  const exifMake = body?.exifMake;
  const exifModel = body?.exifModel;
  const exifLens = body?.exifLens;
  const exifFNumber = body?.exifFNumber;
  const exifExposure = body?.exifExposure;
  const exifIso = body?.exifIso;
  const exifFocal = body?.exifFocal;
  const exifTakenAt = body?.exifTakenAt;
  const exifLat = body?.exifLat;
  const exifLng = body?.exifLng;
  const thumbKey = body?.thumbKey;
  const thumbUrl = body?.thumbUrl;
  const visibility = body?.visibility;

  if (!key || !url) {
    return NextResponse.json({ error: 'Missing key or url' }, { status: 400 });
  }

  await insertImage({
    key: String(key),
    url: String(url),
    thumbKey: thumbKey ? String(thumbKey) : undefined,
    thumbUrl: thumbUrl ? String(thumbUrl) : undefined,
    title: title ? String(title) : undefined,
    description: description ? String(description) : undefined,
    tag: tag ? String(tag) : undefined,
    location: location ? String(location) : undefined,
    exifMake: exifMake ? String(exifMake) : undefined,
    exifModel: exifModel ? String(exifModel) : undefined,
    exifLens: exifLens ? String(exifLens) : undefined,
    exifFNumber: exifFNumber ? String(exifFNumber) : undefined,
    exifExposure: exifExposure ? String(exifExposure) : undefined,
    exifIso: exifIso ? String(exifIso) : undefined,
    exifFocal: exifFocal ? String(exifFocal) : undefined,
    exifTakenAt: exifTakenAt ? String(exifTakenAt) : undefined,
    exifLat: exifLat ? String(exifLat) : undefined,
    exifLng: exifLng ? String(exifLng) : undefined,
    visibility: visibility === 'private' || visibility === 'unlisted' ? visibility : 'public'
  });
  return NextResponse.json({ ok: true });
}
