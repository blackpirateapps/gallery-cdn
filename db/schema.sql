CREATE TABLE IF NOT EXISTS images (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  key TEXT NOT NULL,
  url TEXT NOT NULL,
  title TEXT,
  description TEXT,
  tag TEXT,
  location TEXT,
  exif_json TEXT,
  created_at INTEGER NOT NULL
);
