import crypto from 'crypto';
import { createClient } from '@libsql/client';

let client: ReturnType<typeof createClient> | null = null;
let schemaReady = false;

async function ensureSchema() {
  if (schemaReady) return;
  const db = getDb();
  await db.execute(`CREATE TABLE IF NOT EXISTS images (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    key TEXT NOT NULL,
    url TEXT NOT NULL,
    public_id TEXT,
    thumb_key TEXT,
    thumb_url TEXT,
    title TEXT,
    description TEXT,
    tag TEXT,
    location TEXT,
    exif_make TEXT,
    exif_model TEXT,
    exif_lens TEXT,
    exif_fnumber TEXT,
    exif_exposure TEXT,
    exif_iso TEXT,
    exif_focal TEXT,
    exif_taken_at TEXT,
    exif_lat TEXT,
    exif_lng TEXT,
    featured INTEGER,
    visibility TEXT,
    created_at INTEGER NOT NULL
  )`);

  await db.execute(`CREATE TABLE IF NOT EXISTS albums (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    public_id TEXT,
    title TEXT NOT NULL,
    description TEXT,
    tag TEXT,
    visibility TEXT,
    created_at INTEGER NOT NULL
  )`);

  await db.execute(`CREATE TABLE IF NOT EXISTS album_images (
    album_id INTEGER NOT NULL,
    image_id INTEGER NOT NULL,
    created_at INTEGER NOT NULL,
    PRIMARY KEY (album_id, image_id)
  )`);
  await db.execute('CREATE UNIQUE INDEX IF NOT EXISTS albums_public_id_unique ON albums(public_id)');

  const result = await db.execute('PRAGMA table_info(images)');
  const existing = new Set(result.rows.map((row) => String(row.name)));
  const columns = [
    'public_id',
    'thumb_key',
    'thumb_url',
    'title',
    'description',
    'tag',
    'location',
    'exif_make',
    'exif_model',
    'exif_lens',
    'exif_fnumber',
    'exif_exposure',
    'exif_iso',
    'exif_focal',
    'exif_taken_at',
    'exif_lat',
    'exif_lng',
    'featured',
    'visibility'
  ];
  for (const column of columns) {
    if (!existing.has(column)) {
      await db.execute(`ALTER TABLE images ADD COLUMN ${column} TEXT`);
    }
  }
  if (!existing.has('created_at')) {
    await db.execute('ALTER TABLE images ADD COLUMN created_at INTEGER');
  }

  const missingPublicIds = await db.execute(
    "SELECT id FROM images WHERE public_id IS NULL OR public_id = ''"
  );
  for (const row of missingPublicIds.rows) {
    await db.execute({
      sql: 'UPDATE images SET public_id = ? WHERE id = ?',
      args: [crypto.randomUUID(), row.id]
    });
  }

  const missingVisibility = await db.execute(
    "SELECT id FROM images WHERE visibility IS NULL OR visibility = ''"
  );
  for (const row of missingVisibility.rows) {
    await db.execute({
      sql: 'UPDATE images SET visibility = ? WHERE id = ?',
      args: ['public', row.id]
    });
  }

  const albumResult = await db.execute('PRAGMA table_info(albums)');
  const albumExisting = new Set(albumResult.rows.map((row) => String(row.name)));
  const albumColumns = ['public_id', 'description', 'tag', 'visibility'];
  for (const column of albumColumns) {
    if (!albumExisting.has(column)) {
      await db.execute(`ALTER TABLE albums ADD COLUMN ${column} TEXT`);
    }
  }
  if (!albumExisting.has('created_at')) {
    await db.execute('ALTER TABLE albums ADD COLUMN created_at INTEGER');
  }

  const missingAlbumPublicIds = await db.execute(
    "SELECT id FROM albums WHERE public_id IS NULL OR public_id = ''"
  );
  for (const row of missingAlbumPublicIds.rows) {
    await db.execute({
      sql: 'UPDATE albums SET public_id = ? WHERE id = ?',
      args: [crypto.randomUUID(), row.id]
    });
  }

  const missingAlbumVisibility = await db.execute(
    "SELECT id FROM albums WHERE visibility IS NULL OR visibility = ''"
  );
  for (const row of missingAlbumVisibility.rows) {
    await db.execute({
      sql: 'UPDATE albums SET visibility = ? WHERE id = ?',
      args: ['public', row.id]
    });
  }

  const missingFeatured = await db.execute(
    "SELECT id FROM images WHERE featured IS NULL"
  );
  for (const row of missingFeatured.rows) {
    await db.execute({
      sql: 'UPDATE images SET featured = ? WHERE id = ?',
      args: [0, row.id]
    });
  }

  schemaReady = true;
}

export function getDb() {
  if (!client) {
    const url = process.env.TURSO_DB_URL;
    const authToken = process.env.TURSO_DB_AUTH_TOKEN;
    if (!url || !authToken) {
      throw new Error('TURSO_DB_URL or TURSO_DB_AUTH_TOKEN is not set');
    }
    client = createClient({ url, authToken });
  }
  return client;
}

export type ImageRecord = {
  id: number;
  key: string;
  url: string;
  public_id: string;
  thumb_key: string | null;
  thumb_url: string | null;
  title: string | null;
  description: string | null;
  tag: string | null;
  location: string | null;
  exif_make: string | null;
  exif_model: string | null;
  exif_lens: string | null;
  exif_fnumber: string | null;
  exif_exposure: string | null;
  exif_iso: string | null;
  exif_focal: string | null;
  exif_taken_at: string | null;
  exif_lat: string | null;
  exif_lng: string | null;
  featured: number | null;
  visibility: string | null;
  created_at: number;
};

export async function listImagesAll() {
  const db = getDb();
  await ensureSchema();
  const result = await db.execute(
    'SELECT id, key, url, public_id, thumb_key, thumb_url, title, description, tag, location, exif_make, exif_model, exif_lens, exif_fnumber, exif_exposure, exif_iso, exif_focal, exif_taken_at, exif_lat, exif_lng, featured, visibility, created_at FROM images ORDER BY created_at DESC'
  );
  return result.rows.map((row) => ({
    id: Number(row.id),
    key: String(row.key),
    url: String(row.url),
    public_id: String(row.public_id),
    thumb_key: row.thumb_key ? String(row.thumb_key) : null,
    thumb_url: row.thumb_url ? String(row.thumb_url) : null,
    title: row.title ? String(row.title) : null,
    description: row.description ? String(row.description) : null,
    tag: row.tag ? String(row.tag) : null,
    location: row.location ? String(row.location) : null,
    exif_make: row.exif_make ? String(row.exif_make) : null,
    exif_model: row.exif_model ? String(row.exif_model) : null,
    exif_lens: row.exif_lens ? String(row.exif_lens) : null,
    exif_fnumber: row.exif_fnumber ? String(row.exif_fnumber) : null,
    exif_exposure: row.exif_exposure ? String(row.exif_exposure) : null,
    exif_iso: row.exif_iso ? String(row.exif_iso) : null,
    exif_focal: row.exif_focal ? String(row.exif_focal) : null,
    exif_taken_at: row.exif_taken_at ? String(row.exif_taken_at) : null,
    exif_lat: row.exif_lat ? String(row.exif_lat) : null,
    exif_lng: row.exif_lng ? String(row.exif_lng) : null,
    featured: row.featured !== null && row.featured !== undefined ? Number(row.featured) : null,
    visibility: row.visibility ? String(row.visibility) : null,
    created_at: Number(row.created_at)
  }));
}

export async function listImagesPublic() {
  const db = getDb();
  await ensureSchema();
  const result = await db.execute(
    "SELECT id, key, url, public_id, thumb_key, thumb_url, title, description, tag, location, exif_make, exif_model, exif_lens, exif_fnumber, exif_exposure, exif_iso, exif_focal, exif_taken_at, exif_lat, exif_lng, featured, visibility, created_at FROM images WHERE visibility = 'public' ORDER BY created_at DESC"
  );
  return result.rows.map((row) => ({
    id: Number(row.id),
    key: String(row.key),
    url: String(row.url),
    public_id: String(row.public_id),
    thumb_key: row.thumb_key ? String(row.thumb_key) : null,
    thumb_url: row.thumb_url ? String(row.thumb_url) : null,
    title: row.title ? String(row.title) : null,
    description: row.description ? String(row.description) : null,
    tag: row.tag ? String(row.tag) : null,
    location: row.location ? String(row.location) : null,
    exif_make: row.exif_make ? String(row.exif_make) : null,
    exif_model: row.exif_model ? String(row.exif_model) : null,
    exif_lens: row.exif_lens ? String(row.exif_lens) : null,
    exif_fnumber: row.exif_fnumber ? String(row.exif_fnumber) : null,
    exif_exposure: row.exif_exposure ? String(row.exif_exposure) : null,
    exif_iso: row.exif_iso ? String(row.exif_iso) : null,
    exif_focal: row.exif_focal ? String(row.exif_focal) : null,
    exif_taken_at: row.exif_taken_at ? String(row.exif_taken_at) : null,
    exif_lat: row.exif_lat ? String(row.exif_lat) : null,
    exif_lng: row.exif_lng ? String(row.exif_lng) : null,
    featured: row.featured !== null && row.featured !== undefined ? Number(row.featured) : null,
    visibility: row.visibility ? String(row.visibility) : null,
    created_at: Number(row.created_at)
  }));
}

export async function listFeaturedPublic() {
  const db = getDb();
  await ensureSchema();
  const result = await db.execute(
    "SELECT id, key, url, public_id, thumb_key, thumb_url, title, description, tag, location, exif_make, exif_model, exif_lens, exif_fnumber, exif_exposure, exif_iso, exif_focal, exif_taken_at, exif_lat, exif_lng, featured, visibility, created_at FROM images WHERE LOWER(COALESCE(visibility, '')) = 'public' AND (CAST(featured AS REAL) >= 1 OR LOWER(featured) = 'true') ORDER BY created_at DESC"
  );
  return result.rows.map((row) => ({
    id: Number(row.id),
    key: String(row.key),
    url: String(row.url),
    public_id: String(row.public_id),
    thumb_key: row.thumb_key ? String(row.thumb_key) : null,
    thumb_url: row.thumb_url ? String(row.thumb_url) : null,
    title: row.title ? String(row.title) : null,
    description: row.description ? String(row.description) : null,
    tag: row.tag ? String(row.tag) : null,
    location: row.location ? String(row.location) : null,
    exif_make: row.exif_make ? String(row.exif_make) : null,
    exif_model: row.exif_model ? String(row.exif_model) : null,
    exif_lens: row.exif_lens ? String(row.exif_lens) : null,
    exif_fnumber: row.exif_fnumber ? String(row.exif_fnumber) : null,
    exif_exposure: row.exif_exposure ? String(row.exif_exposure) : null,
    exif_iso: row.exif_iso ? String(row.exif_iso) : null,
    exif_focal: row.exif_focal ? String(row.exif_focal) : null,
    exif_taken_at: row.exif_taken_at ? String(row.exif_taken_at) : null,
    exif_lat: row.exif_lat ? String(row.exif_lat) : null,
    exif_lng: row.exif_lng ? String(row.exif_lng) : null,
    featured: row.featured !== null && row.featured !== undefined ? Number(row.featured) : null,
    visibility: row.visibility ? String(row.visibility) : null,
    created_at: Number(row.created_at)
  }));
}

export async function insertImage(options: {
  key: string;
  url: string;
  thumbKey?: string;
  thumbUrl?: string;
  publicId?: string;
  title?: string;
  description?: string;
  tag?: string;
  location?: string;
  exifMake?: string;
  exifModel?: string;
  exifLens?: string;
  exifFNumber?: string;
  exifExposure?: string;
  exifIso?: string;
  exifFocal?: string;
  exifTakenAt?: string;
  exifLat?: string;
  exifLng?: string;
  featured?: boolean;
  visibility?: 'public' | 'unlisted' | 'private';
}) {
  const db = getDb();
  await ensureSchema();
  const createdAt = Date.now();
  const publicId = options.publicId ?? crypto.randomUUID();
  const visibility = options.visibility ?? 'public';
  const result = await db.execute({
    sql:
      'INSERT INTO images (key, url, public_id, thumb_key, thumb_url, title, description, tag, location, exif_make, exif_model, exif_lens, exif_fnumber, exif_exposure, exif_iso, exif_focal, exif_taken_at, exif_lat, exif_lng, featured, visibility, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
    args: [
      options.key,
      options.url,
      publicId,
      options.thumbKey ?? null,
      options.thumbUrl ?? null,
      options.title ?? null,
      options.description ?? null,
      options.tag ?? null,
      options.location ?? null,
      options.exifMake ?? null,
      options.exifModel ?? null,
      options.exifLens ?? null,
      options.exifFNumber ?? null,
      options.exifExposure ?? null,
      options.exifIso ?? null,
      options.exifFocal ?? null,
      options.exifTakenAt ?? null,
      options.exifLat ?? null,
      options.exifLng ?? null,
      options.featured ? 1 : 0,
      visibility,
      createdAt
    ]
  });
  const id = Number(result.lastInsertRowid ?? 0);
  return id;
}

export async function deleteImage(id: number) {
  const db = getDb();
  await ensureSchema();
  await db.execute({
    sql: 'DELETE FROM album_images WHERE image_id = ?',
    args: [id]
  });
  await db.execute({
    sql: 'DELETE FROM images WHERE id = ?',
    args: [id]
  });
}

export async function updateImageMeta(
  id: number,
  fields: {
    title?: string | null;
    description?: string | null;
    tag?: string | null;
    location?: string | null;
    exifMake?: string | null;
    exifModel?: string | null;
    exifLens?: string | null;
    exifFNumber?: string | null;
    exifExposure?: string | null;
    exifIso?: string | null;
    exifFocal?: string | null;
    exifTakenAt?: string | null;
    exifLat?: string | null;
    exifLng?: string | null;
    featured?: boolean;
    visibility?: 'public' | 'unlisted' | 'private';
  }
) {
  const db = getDb();
  await ensureSchema();
  await db.execute({
    sql:
      'UPDATE images SET title = ?, description = ?, tag = ?, location = ?, exif_make = ?, exif_model = ?, exif_lens = ?, exif_fnumber = ?, exif_exposure = ?, exif_iso = ?, exif_focal = ?, exif_taken_at = ?, exif_lat = ?, exif_lng = ?, featured = ?, visibility = ? WHERE id = ?',
    args: [
      fields.title ?? null,
      fields.description ?? null,
      fields.tag ?? null,
      fields.location ?? null,
      fields.exifMake ?? null,
      fields.exifModel ?? null,
      fields.exifLens ?? null,
      fields.exifFNumber ?? null,
      fields.exifExposure ?? null,
      fields.exifIso ?? null,
      fields.exifFocal ?? null,
      fields.exifTakenAt ?? null,
      fields.exifLat ?? null,
      fields.exifLng ?? null,
      fields.featured ? 1 : 0,
      fields.visibility ?? 'public',
      id
    ]
  });
}

export async function getImageById(id: number) {
  const db = getDb();
  await ensureSchema();
  const result = await db.execute({
    sql:
      'SELECT id, key, url, public_id, thumb_key, thumb_url, title, description, tag, location, exif_make, exif_model, exif_lens, exif_fnumber, exif_exposure, exif_iso, exif_focal, exif_taken_at, exif_lat, exif_lng, featured, visibility, created_at FROM images WHERE id = ?',
    args: [id]
  });
  const row = result.rows[0];
  if (!row) return undefined;
  return {
    id: Number(row.id),
    key: String(row.key),
    url: String(row.url),
    public_id: String(row.public_id),
    thumb_key: row.thumb_key ? String(row.thumb_key) : null,
    thumb_url: row.thumb_url ? String(row.thumb_url) : null,
    title: row.title ? String(row.title) : null,
    description: row.description ? String(row.description) : null,
    tag: row.tag ? String(row.tag) : null,
    location: row.location ? String(row.location) : null,
    exif_make: row.exif_make ? String(row.exif_make) : null,
    exif_model: row.exif_model ? String(row.exif_model) : null,
    exif_lens: row.exif_lens ? String(row.exif_lens) : null,
    exif_fnumber: row.exif_fnumber ? String(row.exif_fnumber) : null,
    exif_exposure: row.exif_exposure ? String(row.exif_exposure) : null,
    exif_iso: row.exif_iso ? String(row.exif_iso) : null,
    exif_focal: row.exif_focal ? String(row.exif_focal) : null,
    exif_taken_at: row.exif_taken_at ? String(row.exif_taken_at) : null,
    exif_lat: row.exif_lat ? String(row.exif_lat) : null,
    exif_lng: row.exif_lng ? String(row.exif_lng) : null,
    featured: row.featured !== null && row.featured !== undefined ? Number(row.featured) : null,
    visibility: row.visibility ? String(row.visibility) : null,
    created_at: Number(row.created_at)
  };
}

export async function getImageByPublicId(publicId: string) {
  const db = getDb();
  await ensureSchema();
  const result = await db.execute({
    sql:
      'SELECT id, key, url, public_id, thumb_key, thumb_url, title, description, tag, location, exif_make, exif_model, exif_lens, exif_fnumber, exif_exposure, exif_iso, exif_focal, exif_taken_at, exif_lat, exif_lng, featured, visibility, created_at FROM images WHERE public_id = ?',
    args: [publicId]
  });
  const row = result.rows[0];
  if (!row) return undefined;
  return {
    id: Number(row.id),
    key: String(row.key),
    url: String(row.url),
    public_id: String(row.public_id),
    thumb_key: row.thumb_key ? String(row.thumb_key) : null,
    thumb_url: row.thumb_url ? String(row.thumb_url) : null,
    title: row.title ? String(row.title) : null,
    description: row.description ? String(row.description) : null,
    tag: row.tag ? String(row.tag) : null,
    location: row.location ? String(row.location) : null,
    exif_make: row.exif_make ? String(row.exif_make) : null,
    exif_model: row.exif_model ? String(row.exif_model) : null,
    exif_lens: row.exif_lens ? String(row.exif_lens) : null,
    exif_fnumber: row.exif_fnumber ? String(row.exif_fnumber) : null,
    exif_exposure: row.exif_exposure ? String(row.exif_exposure) : null,
    exif_iso: row.exif_iso ? String(row.exif_iso) : null,
    exif_focal: row.exif_focal ? String(row.exif_focal) : null,
    exif_taken_at: row.exif_taken_at ? String(row.exif_taken_at) : null,
    exif_lat: row.exif_lat ? String(row.exif_lat) : null,
    exif_lng: row.exif_lng ? String(row.exif_lng) : null,
    featured: row.featured !== null && row.featured !== undefined ? Number(row.featured) : null,
    visibility: row.visibility ? String(row.visibility) : null,
    created_at: Number(row.created_at)
  };
}

export type AlbumRecord = {
  id: number;
  public_id: string;
  title: string;
  description: string | null;
  tag: string | null;
  visibility: string | null;
  created_at: number;
};

export async function listAlbumsAll() {
  const db = getDb();
  await ensureSchema();
  const result = await db.execute(
    'SELECT id, public_id, title, description, tag, visibility, created_at FROM albums ORDER BY created_at DESC'
  );
  return result.rows.map((row) => ({
    id: Number(row.id),
    public_id: String(row.public_id),
    title: String(row.title),
    description: row.description ? String(row.description) : null,
    tag: row.tag ? String(row.tag) : null,
    visibility: row.visibility ? String(row.visibility) : null,
    created_at: Number(row.created_at)
  }));
}

export async function listAlbumsPublic() {
  const db = getDb();
  await ensureSchema();
  const result = await db.execute(
    "SELECT id, public_id, title, description, tag, visibility, created_at FROM albums WHERE visibility = 'public' ORDER BY created_at DESC"
  );
  return result.rows.map((row) => ({
    id: Number(row.id),
    public_id: String(row.public_id),
    title: String(row.title),
    description: row.description ? String(row.description) : null,
    tag: row.tag ? String(row.tag) : null,
    visibility: row.visibility ? String(row.visibility) : null,
    created_at: Number(row.created_at)
  }));
}

export async function createAlbum(options: {
  title: string;
  description?: string;
  tag?: string;
  publicId?: string;
  visibility?: 'public' | 'unlisted' | 'private';
}) {
  const db = getDb();
  await ensureSchema();
  const createdAt = Date.now();
  const publicId = options.publicId ?? crypto.randomUUID();
  const taken = await db.execute({
    sql: 'SELECT id FROM albums WHERE public_id = ?',
    args: [publicId]
  });
  if (taken.rows.length) {
    throw new Error('Album public id already exists');
  }
  const visibility = options.visibility ?? 'public';
  const result = await db.execute({
    sql: 'INSERT INTO albums (public_id, title, description, tag, visibility, created_at) VALUES (?, ?, ?, ?, ?, ?)',
    args: [publicId, options.title, options.description ?? null, options.tag ?? null, visibility, createdAt]
  });
  const id = Number(result.lastInsertRowid ?? 0);
  return { id, publicId };
}

export async function updateAlbum(
  id: number,
  fields: {
    title?: string | null;
    description?: string | null;
    tag?: string | null;
    publicId?: string | null;
    visibility?: 'public' | 'unlisted' | 'private';
  }
) {
  const db = getDb();
  await ensureSchema();
  if (fields.publicId) {
    const taken = await db.execute({
      sql: 'SELECT id FROM albums WHERE public_id = ? AND id != ?',
      args: [fields.publicId, id]
    });
    if (taken.rows.length) {
      throw new Error('Album public id already exists');
    }
  }
  await db.execute({
    sql: 'UPDATE albums SET title = ?, description = ?, tag = ?, public_id = ?, visibility = ? WHERE id = ?',
    args: [
      fields.title ?? null,
      fields.description ?? null,
      fields.tag ?? null,
      fields.publicId ?? null,
      fields.visibility ?? 'public',
      id
    ]
  });
}

export async function deleteAlbum(id: number) {
  const db = getDb();
  await ensureSchema();
  await db.execute({ sql: 'DELETE FROM album_images WHERE album_id = ?', args: [id] });
  await db.execute({ sql: 'DELETE FROM albums WHERE id = ?', args: [id] });
}

export async function addImagesToAlbum(albumId: number, imageIds: number[]) {
  const db = getDb();
  await ensureSchema();
  const createdAt = Date.now();
  for (const imageId of imageIds) {
    await db.execute({
      sql: 'INSERT OR IGNORE INTO album_images (album_id, image_id, created_at) VALUES (?, ?, ?)',
      args: [albumId, imageId, createdAt]
    });
  }
}

export async function removeImageFromAlbum(albumId: number, imageId: number) {
  const db = getDb();
  await ensureSchema();
  await db.execute({
    sql: 'DELETE FROM album_images WHERE album_id = ? AND image_id = ?',
    args: [albumId, imageId]
  });
}

export async function getAlbumByPublicId(publicId: string) {
  const db = getDb();
  await ensureSchema();
  const result = await db.execute({
    sql: 'SELECT id, public_id, title, description, tag, visibility, created_at FROM albums WHERE public_id = ?',
    args: [publicId]
  });
  const row = result.rows[0];
  if (!row) return undefined;
  return {
    id: Number(row.id),
    public_id: String(row.public_id),
    title: String(row.title),
    description: row.description ? String(row.description) : null,
    tag: row.tag ? String(row.tag) : null,
    visibility: row.visibility ? String(row.visibility) : null,
    created_at: Number(row.created_at)
  };
}

export async function listImagesForAlbum(albumId: number) {
  const db = getDb();
  await ensureSchema();
  const result = await db.execute({
    sql:
      'SELECT images.id, images.key, images.url, images.public_id, images.thumb_key, images.thumb_url, images.title, images.description, images.tag, images.location, images.exif_make, images.exif_model, images.exif_lens, images.exif_fnumber, images.exif_exposure, images.exif_iso, images.exif_focal, images.exif_taken_at, images.exif_lat, images.exif_lng, images.visibility, images.created_at FROM images INNER JOIN album_images ON album_images.image_id = images.id WHERE album_images.album_id = ? ORDER BY images.created_at DESC',
    args: [albumId]
  });
  return result.rows.map((row) => ({
    id: Number(row.id),
    key: String(row.key),
    url: String(row.url),
    public_id: String(row.public_id),
    thumb_key: row.thumb_key ? String(row.thumb_key) : null,
    thumb_url: row.thumb_url ? String(row.thumb_url) : null,
    title: row.title ? String(row.title) : null,
    description: row.description ? String(row.description) : null,
    tag: row.tag ? String(row.tag) : null,
    location: row.location ? String(row.location) : null,
    exif_make: row.exif_make ? String(row.exif_make) : null,
    exif_model: row.exif_model ? String(row.exif_model) : null,
    exif_lens: row.exif_lens ? String(row.exif_lens) : null,
    exif_fnumber: row.exif_fnumber ? String(row.exif_fnumber) : null,
    exif_exposure: row.exif_exposure ? String(row.exif_exposure) : null,
    exif_iso: row.exif_iso ? String(row.exif_iso) : null,
    exif_focal: row.exif_focal ? String(row.exif_focal) : null,
    exif_taken_at: row.exif_taken_at ? String(row.exif_taken_at) : null,
    exif_lat: row.exif_lat ? String(row.exif_lat) : null,
    exif_lng: row.exif_lng ? String(row.exif_lng) : null,
    visibility: row.visibility ? String(row.visibility) : null,
    created_at: Number(row.created_at)
  }));
}

export async function listAlbumPreviewImages(albumId: number, limit: number) {
  const db = getDb();
  await ensureSchema();
  const result = await db.execute({
    sql:
      'SELECT images.id, images.url, images.public_id, images.thumb_url, images.title, images.description FROM images INNER JOIN album_images ON album_images.image_id = images.id WHERE album_images.album_id = ? ORDER BY images.created_at DESC LIMIT ?',
    args: [albumId, limit]
  });
  return result.rows.map((row) => ({
    id: Number(row.id),
    url: String(row.url),
    public_id: String(row.public_id),
    thumb_url: row.thumb_url ? String(row.thumb_url) : null,
    title: row.title ? String(row.title) : null,
    description: row.description ? String(row.description) : null
  }));
}
