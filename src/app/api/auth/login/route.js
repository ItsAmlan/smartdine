import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import {
  verifyPassword,
  createSession,
  checkLoginLockout,
  recordFailedLogin,
  recordSuccessfulLogin,
} from "@/lib/auth";

export async function POST(request) {
  try {
    const { name, password, role } = await request.json();

    if (!name || !password || !role) {
      return NextResponse.json(
        { error: "Name, password, and role are required" },
        { status: 400 }
      );
    }

    const allowedRoles = ["admin", "kitchen", "steward"];
    if (!allowedRoles.includes(role)) {
      return NextResponse.json({ error: "Invalid role" }, { status: 400 });
    }

    const user = await prisma.staffUser.findFirst({
      where: { name, role, active: true },
    });

    if (!user) {
      return NextResponse.json(
        { error: "Invalid credentials" },
        { status: 401 }
      );
    }

    const lockout = await checkLoginLockout(user);
    if (lockout.locked) {
      return NextResponse.json(
        {
          error: `Too many failed attempts. Try again in ${lockout.minutesLeft} minute${lockout.minutesLeft === 1 ? "" : "s"}.`,
        },
        { status: 429 }
      );
    }

    const valid = await verifyPassword(password, user.passwordHash);
    if (!valid) {
      await recordFailedLogin(user);
      return NextResponse.json(
        { error: "Invalid credentials" },
        { status: 401 }
      );
    }

    await recordSuccessfulLogin(user.id);
    await createSession(user.id);

    return NextResponse.json({
      user: { id: user.id, name: user.name, role: user.role },
    });
  } catch (error) {
    console.error("Login error:", error.message);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
