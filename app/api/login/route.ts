import { NextResponse } from 'next/server';
import { createSessionToken, setSessionCookie } from '@/lib/auth';

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const password = body?.password;
  const expected = process.env.ADMIN_PASSWORD;
  if (!expected) {
    return NextResponse.json({ error: 'ADMIN_PASSWORD is not set' }, { status: 500 });
  }
  if (!password || password !== expected) {
    return NextResponse.json({ error: 'Invalid password' }, { status: 401 });
  }
  const token = createSessionToken();
  setSessionCookie(token);
  return NextResponse.json({ ok: true });
}
