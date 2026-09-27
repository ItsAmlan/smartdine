import bcrypt from "bcryptjs";
import crypto from "crypto";
import { cookies } from "next/headers";
import prisma from "./prisma";

const SALT_ROUNDS = 12;
const SESSION_COOKIE =
  process.env.NODE_ENV === "production"
    ? "__Secure-smartdine-session"
    : "smartdine-session";
const SESSION_MAX_AGE = 8 * 60 * 60; // 8 hours in seconds

// Lazily resolved so a missing secret only breaks auth (at request time),
// never the build (module-level throws fail `next build` page-data collection).
function getSessionSecret() {
  const secret = process.env.SESSION_SECRET;
  if (secret) return secret;
  if (process.env.NODE_ENV === "production") {
    throw new Error("SESSION_SECRET must be set in production");
  }
  return "dev-only-insecure-session-secret";
}

function sign(payload) {
  return crypto.createHmac("sha256", getSessionSecret()).update(payload).digest("hex");
}

const MAX_FAILED_ATTEMPTS = 5;
const LOCKOUT_MS = 15 * 60 * 1000; // 15 minutes

// Brute-force guard for staff login. Kitchen/steward accounts in
// particular use short numeric PINs, which are otherwise trivially
// guessable without any throttling.
export async function checkLoginLockout(user) {
  if (user.lockedUntil && user.lockedUntil.getTime() > Date.now()) {
    const minutesLeft = Math.ceil((user.lockedUntil.getTime() - Date.now()) / 60000);
    return { locked: true, minutesLeft };
  }
  return { locked: false };
}

export async function recordFailedLogin(user) {
  const attempts = user.failedAttempts + 1;
  const data =
    attempts >= MAX_FAILED_ATTEMPTS
      ? { failedAttempts: 0, lockedUntil: new Date(Date.now() + LOCKOUT_MS) }
      : { failedAttempts: attempts };

  await prisma.staffUser.update({ where: { id: user.id }, data });
}

export async function recordSuccessfulLogin(userId) {
  await prisma.staffUser.update({
    where: { id: userId },
    data: { failedAttempts: 0, lockedUntil: null },
  });
}

export async function hashPassword(password) {
  return bcrypt.hash(password, SALT_ROUNDS);
}

export async function verifyPassword(password, hash) {
  return bcrypt.compare(password, hash);
}

export async function createSession(staffUserId) {
  const cookieStore = await cookies();
  const expiresAt = Date.now() + SESSION_MAX_AGE * 1000;
  const payload = `${staffUserId}.${expiresAt}`;
  const token = `${payload}.${sign(payload)}`;

  cookieStore.set(SESSION_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: SESSION_MAX_AGE,
    path: "/",
  });

  return token;
}

export async function getSession() {
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get(SESSION_COOKIE);

  if (!sessionCookie) return null;

  const parts = sessionCookie.value.split(".");
  if (parts.length !== 3) return null;
  const [staffUserId, expiresAt, signature] = parts;

  const expected = Buffer.from(sign(`${staffUserId}.${expiresAt}`), "hex");
  const actual = Buffer.from(signature, "hex");
  if (
    expected.length !== actual.length ||
    !crypto.timingSafeEqual(expected, actual)
  ) {
    return null;
  }

  if (!Number.isFinite(Number(expiresAt)) || Date.now() > Number(expiresAt)) {
    return null;
  }

  try {
    const user = await prisma.staffUser.findUnique({
      where: { id: parseInt(staffUserId, 10) },
      select: { id: true, name: true, role: true, active: true },
    });

    if (!user || !user.active) return null;
    return user;
  } catch {
    return null;
  }
}

export async function clearSession() {
  const cookieStore = await cookies();
  cookieStore.delete(SESSION_COOKIE);
}

export async function requireAuth(allowedRoles = []) {
  const user = await getSession();

  if (!user) {
    return { error: "Unauthorized", status: 401 };
  }

  if (allowedRoles.length > 0 && !allowedRoles.includes(user.role)) {
    return { error: "Forbidden", status: 403 };
  }

  return { user };
}

// Constant-time comparison for customer-held order access tokens, so a
// mismatched (or missing) token can't be distinguished by timing.
export function tokensMatch(a, b) {
  if (!a || !b) return false;
  const bufA = Buffer.from(a);
  const bufB = Buffer.from(b);
  if (bufA.length !== bufB.length) return false;
  return crypto.timingSafeEqual(bufA, bufB);
}

