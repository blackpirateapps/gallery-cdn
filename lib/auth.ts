import crypto from 'crypto';
import { cookies } from 'next/headers';

const COOKIE_NAME = 'admin_token';
const SESSION_TTL_MS = 1000 * 60 * 60 * 24 * 7;

function getSecret() {
  const secret = process.env.APP_SECRET;
  if (!secret) {
    throw new Error('APP_SECRET is not set');
  }
  return secret;
}

export function createSessionToken() {
  const timestamp = Date.now().toString();
  const secret = getSecret();
  const hmac = crypto.createHmac('sha256', secret).update(timestamp).digest('hex');
  return `${timestamp}.${hmac}`;
}

export function verifySessionToken(token: string | undefined) {
  if (!token) return false;
  const [timestamp, signature] = token.split('.');
  if (!timestamp || !signature) return false;
  const secret = getSecret();
  const expected = crypto.createHmac('sha256', secret).update(timestamp).digest('hex');
  const signatureBuffer = Buffer.from(signature);
  const expectedBuffer = Buffer.from(expected);
  if (signatureBuffer.length !== expectedBuffer.length) return false;
  if (!crypto.timingSafeEqual(signatureBuffer, expectedBuffer)) return false;
  const age = Date.now() - Number(timestamp);
  return age >= 0 && age <= SESSION_TTL_MS;
}

export function setSessionCookie(token: string) {
  cookies().set({
    name: COOKIE_NAME,
    value: token,
    httpOnly: true,
    sameSite: 'lax',
    path: '/',
    maxAge: SESSION_TTL_MS / 1000
  });
}

export function clearSessionCookie() {
  cookies().set({
    name: COOKIE_NAME,
    value: '',
    httpOnly: true,
    sameSite: 'lax',
    path: '/',
    maxAge: 0
  });
}

export function isAuthed() {
  const token = cookies().get(COOKIE_NAME)?.value;
  return verifySessionToken(token);
}
