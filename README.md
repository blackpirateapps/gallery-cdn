# gallery-cdn

Minimal Next.js gallery app backed by Turso (libSQL) and Cloudflare R2.

## Setup

1) Install dependencies

```bash
npm install
```

2) Create the database table in Turso

```sql
-- db/schema.sql
CREATE TABLE IF NOT EXISTS images (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  key TEXT NOT NULL,
  url TEXT NOT NULL,
  created_at INTEGER NOT NULL
);
```

3) Configure environment variables

```bash
cp .env.example .env.local
```

4) Run the app

```bash
npm run dev
```

Visit `http://localhost:3000` for the public gallery. Go to `/login` for admin.
