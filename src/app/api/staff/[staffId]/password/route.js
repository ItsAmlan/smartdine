import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { requireAuth, hashPassword } from "@/lib/auth";

const MIN_PASSWORD_LENGTH = 4;

// PATCH - Set a staff member's password (admin only).
//
// There is no self-service "change my password" for kitchen/steward
// accounts anywhere in the app — this is the only way any staff
// password gets changed, and it requires an admin session regardless of
// whose account is being updated.
export async function PATCH(request, { params }) {
  try {
    const auth = await requireAuth(["admin"]);
    if (auth.error) {
      return NextResponse.json({ error: auth.error }, { status: auth.status });
    }

    const { staffId } = await params;
    const { newPassword } = await request.json();

    if (typeof newPassword !== "string" || newPassword.length < MIN_PASSWORD_LENGTH) {
      return NextResponse.json(
        { error: `Password must be at least ${MIN_PASSWORD_LENGTH} characters` },
        { status: 400 }
      );
    }

    const target = await prisma.staffUser.findUnique({ where: { id: parseInt(staffId, 10) } });
    if (!target) {
      return NextResponse.json({ error: "Staff account not found" }, { status: 404 });
    }

    await prisma.staffUser.update({
      where: { id: target.id },
      data: {
        passwordHash: await hashPassword(newPassword),
        failedAttempts: 0,
        lockedUntil: null,
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Staff password update error:", error.message);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
