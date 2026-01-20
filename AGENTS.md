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
