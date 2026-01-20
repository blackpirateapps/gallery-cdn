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

## Current features
- Public gallery with masonry layout and lightbox (next/prev, details link, loading state).
- Image detail pages by random `public_id`, with private/unlisted visibility handling.
- Admin dashboard with modern upload panel, metadata editing, and share-link copy.
- Direct uploads to Cloudflare R2 using presigned URLs (full + thumbnail).
- Client-side EXIF parsing, stripping from uploads, and stored in dedicated DB columns.
- Auto DB initialization/migration on boot.
- WhatsApp “Hire me” CTA and photographer-themed UI.
