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

export async function hashPassword(password) {
  return bcrypt.hash(password, SALT_ROUNDS);
}

export async function verifyPassword(password, hash) {
  return bcrypt.compare(password, hash);
}

export function generateSessionToken() {
  return crypto.randomBytes(32).toString("hex");
}

export async function createSession(staffUserId) {
  const token = generateSessionToken();
  const cookieStore = await cookies();

  cookieStore.set(SESSION_COOKIE, `${staffUserId}:${token}`, {
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

  const [staffUserId] = sessionCookie.value.split(":");
  if (!staffUserId) return null;

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

