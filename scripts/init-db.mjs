import { createClient } from '@libsql/client';

const url = process.env.TURSO_DB_URL;
const authToken = process.env.TURSO_DB_AUTH_TOKEN;

if (!url || !authToken) {
  console.error('Missing TURSO_DB_URL or TURSO_DB_AUTH_TOKEN. Skipping DB init.');
  process.exit(0);
}

const db = createClient({ url, authToken });

const ensureColumn = async (table, column, type) => {
  const result = await db.execute(`PRAGMA table_info(${table})`);
  const existing = new Set(result.rows.map((row) => String(row.name)));
  if (!existing.has(column)) {
    await db.execute(`ALTER TABLE ${table} ADD COLUMN ${column} ${type}`);
  }
};

const ensureColumns = async (table, columns) => {
  for (const [column, type] of columns) {
    await ensureColumn(table, column, type);
  }
};

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

await ensureColumns('images', [
  ['public_id', 'TEXT'],
  ['thumb_key', 'TEXT'],
  ['thumb_url', 'TEXT'],
  ['title', 'TEXT'],
  ['description', 'TEXT'],
  ['tag', 'TEXT'],
  ['location', 'TEXT'],
  ['exif_make', 'TEXT'],
  ['exif_model', 'TEXT'],
  ['exif_lens', 'TEXT'],
  ['exif_fnumber', 'TEXT'],
  ['exif_exposure', 'TEXT'],
  ['exif_iso', 'TEXT'],
  ['exif_focal', 'TEXT'],
  ['exif_taken_at', 'TEXT'],
  ['exif_lat', 'TEXT'],
  ['exif_lng', 'TEXT'],
  ['featured', 'INTEGER'],
  ['visibility', 'TEXT'],
  ['created_at', 'INTEGER']
]);

await db.execute(`CREATE TABLE IF NOT EXISTS albums (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  public_id TEXT,
  title TEXT NOT NULL,
  description TEXT,
  tag TEXT,
  visibility TEXT,
  created_at INTEGER NOT NULL
)`);

await ensureColumns('albums', [
  ['public_id', 'TEXT'],
  ['description', 'TEXT'],
  ['tag', 'TEXT'],
  ['visibility', 'TEXT'],
  ['created_at', 'INTEGER']
]);

await db.execute(`CREATE TABLE IF NOT EXISTS album_images (
  album_id INTEGER NOT NULL,
  image_id INTEGER NOT NULL,
  created_at INTEGER NOT NULL,
  PRIMARY KEY (album_id, image_id)
)`);

await db.execute('CREATE UNIQUE INDEX IF NOT EXISTS albums_public_id_unique ON albums(public_id)');

await db.execute(`CREATE TABLE IF NOT EXISTS site_settings (
  key TEXT PRIMARY KEY,
  value TEXT,
  updated_at INTEGER NOT NULL
)`);

console.log('DB init complete.');
