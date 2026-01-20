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
);

CREATE TABLE IF NOT EXISTS albums (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  public_id TEXT,
  title TEXT NOT NULL,
  description TEXT,
  tag TEXT,
  visibility TEXT,
  created_at INTEGER NOT NULL
);

CREATE TABLE IF NOT EXISTS album_images (
  album_id INTEGER NOT NULL,
  image_id INTEGER NOT NULL,
  created_at INTEGER NOT NULL,
  PRIMARY KEY (album_id, image_id)
);
