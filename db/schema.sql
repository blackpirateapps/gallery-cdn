CREATE TABLE IF NOT EXISTS images (
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
  exif_json TEXT,
  visibility TEXT,
  created_at INTEGER NOT NULL
);
