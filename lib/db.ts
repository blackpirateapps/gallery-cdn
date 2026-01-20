import { createClient } from '@libsql/client';

let client: ReturnType<typeof createClient> | null = null;

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
  created_at: number;
};

export async function listImages() {
  const db = getDb();
  const result = await db.execute('SELECT id, key, url, created_at FROM images ORDER BY created_at DESC');
  return result.rows.map((row) => ({
    id: Number(row.id),
    key: String(row.key),
    url: String(row.url),
    created_at: Number(row.created_at)
  }));
}

export async function insertImage(key: string, url: string) {
  const db = getDb();
  const createdAt = Date.now();
  await db.execute({
    sql: 'INSERT INTO images (key, url, created_at) VALUES (?, ?, ?)',
    args: [key, url, createdAt]
  });
}

export async function deleteImage(id: number) {
  const db = getDb();
  await db.execute({
    sql: 'DELETE FROM images WHERE id = ?',
    args: [id]
  });
}

export async function getImageById(id: number) {
  const db = getDb();
  const result = await db.execute({
    sql: 'SELECT id, key, url, created_at FROM images WHERE id = ?',
    args: [id]
  });
  const row = result.rows[0];
  if (!row) return undefined;
  return {
    id: Number(row.id),
    key: String(row.key),
    url: String(row.url),
    created_at: Number(row.created_at)
  };
}
