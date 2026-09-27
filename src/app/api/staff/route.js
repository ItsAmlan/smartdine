import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { requireAuth } from "@/lib/auth";

// GET - List staff accounts (admin only). Never returns passwordHash.
export async function GET() {
  try {
    const auth = await requireAuth(["admin"]);
    if (auth.error) {
      return NextResponse.json({ error: auth.error }, { status: auth.status });
    }

    const staff = await prisma.staffUser.findMany({
      select: {
        id: true,
        name: true,
        role: true,
        active: true,
        lockedUntil: true,
        createdAt: true,
      },
      orderBy: [{ role: "asc" }, { name: "asc" }],
    });

    return NextResponse.json({ staff });
  } catch (error) {
    console.error("Staff list error:", error.message);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
