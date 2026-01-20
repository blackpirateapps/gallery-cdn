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
    thumb_key TEXT,
    thumb_url TEXT,
    title TEXT,
    description TEXT,
    tag TEXT,
    location TEXT,
    exif_json TEXT,
    created_at INTEGER NOT NULL
  )`);

  const result = await db.execute('PRAGMA table_info(images)');
  const existing = new Set(result.rows.map((row) => String(row.name)));
  const columns = ['thumb_key', 'thumb_url', 'title', 'description', 'tag', 'location', 'exif_json'];
  for (const column of columns) {
    if (!existing.has(column)) {
      await db.execute(`ALTER TABLE images ADD COLUMN ${column} TEXT`);
    }
  }
  if (!existing.has('created_at')) {
    await db.execute('ALTER TABLE images ADD COLUMN created_at INTEGER');
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
  thumb_key: string | null;
  thumb_url: string | null;
  title: string | null;
  description: string | null;
  tag: string | null;
  location: string | null;
  exif_json: string | null;
  created_at: number;
};

export async function listImages() {
  const db = getDb();
  await ensureSchema();
  const result = await db.execute(
    'SELECT id, key, url, thumb_key, thumb_url, title, description, tag, location, exif_json, created_at FROM images ORDER BY created_at DESC'
  );
  return result.rows.map((row) => ({
    id: Number(row.id),
    key: String(row.key),
    url: String(row.url),
    thumb_key: row.thumb_key ? String(row.thumb_key) : null,
    thumb_url: row.thumb_url ? String(row.thumb_url) : null,
    title: row.title ? String(row.title) : null,
    description: row.description ? String(row.description) : null,
    tag: row.tag ? String(row.tag) : null,
    location: row.location ? String(row.location) : null,
    exif_json: row.exif_json ? String(row.exif_json) : null,
    created_at: Number(row.created_at)
  }));
}

export async function insertImage(options: {
  key: string;
  url: string;
  thumbKey?: string;
  thumbUrl?: string;
  title?: string;
  description?: string;
  tag?: string;
  location?: string;
  exifJson?: string;
}) {
  const db = getDb();
  await ensureSchema();
  const createdAt = Date.now();
  await db.execute({
    sql:
      'INSERT INTO images (key, url, thumb_key, thumb_url, title, description, tag, location, exif_json, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
    args: [
      options.key,
      options.url,
      options.thumbKey ?? null,
      options.thumbUrl ?? null,
      options.title ?? null,
      options.description ?? null,
      options.tag ?? null,
      options.location ?? null,
      options.exifJson ?? null,
      createdAt
    ]
  });
}

export async function deleteImage(id: number) {
  const db = getDb();
  await ensureSchema();
  await db.execute({
    sql: 'DELETE FROM images WHERE id = ?',
    args: [id]
  });
}

export async function getImageById(id: number) {
  const db = getDb();
  await ensureSchema();
  const result = await db.execute({
    sql:
      'SELECT id, key, url, thumb_key, thumb_url, title, description, tag, location, exif_json, created_at FROM images WHERE id = ?',
    args: [id]
  });
  const row = result.rows[0];
  if (!row) return undefined;
  return {
    id: Number(row.id),
    key: String(row.key),
    url: String(row.url),
    thumb_key: row.thumb_key ? String(row.thumb_key) : null,
    thumb_url: row.thumb_url ? String(row.thumb_url) : null,
    title: row.title ? String(row.title) : null,
    description: row.description ? String(row.description) : null,
    tag: row.tag ? String(row.tag) : null,
    location: row.location ? String(row.location) : null,
    exif_json: row.exif_json ? String(row.exif_json) : null,
    created_at: Number(row.created_at)
  };
}
