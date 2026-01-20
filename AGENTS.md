# Agents

This project is a Next.js gallery app with Turso + Cloudflare R2.

## Local conventions
- App router in `app/`
- Server utilities in `lib/`
- SQL schema in `db/schema.sql`
- Environment variables in `.env.local`

## Guardrails
- Keep auth checks in API routes and admin pages
- Use R2 for upload/delete only; public reads use stored URLs
- Avoid adding new dependencies without a clear need

## Quick checklist
- `npm install`
- Configure `.env.local`
- `npm run dev`

## Commit summary
- c549212 Add metadata fields, client EXIF parsing, EXIF stripping, upload preview, and auto DB init.
- d4f545f Return presign error details and force Node runtime.
- dce93af Add detailed upload debug logging in the admin UI.
- ba4b0e4 Upload directly to R2 with presigned URLs and save metadata separately.
- f4d99e7 Normalize Turso rows into `ImageRecord` objects.
- 79ef892 Track latest `@libsql/client`.
- 77111d6 Add TS path alias resolution for `@/*`.
- af7be76 Scaffold Next.js gallery with Turso + R2.
