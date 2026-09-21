import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { requireAuth } from "@/lib/auth";

// GET - Get restaurant settings
export async function GET() {
  try {
    const restaurant = await prisma.restaurant.findFirst();
    if (!restaurant) {
      return NextResponse.json({ error: "Restaurant not configured" }, { status: 404 });
    }
    return NextResponse.json({ restaurant });
  } catch (error) {
    console.error("Settings fetch error:", error.message);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// PUT - Update restaurant settings (admin only)
export async function PUT(request) {
  try {
    const auth = await requireAuth(["admin"]);
    if (auth.error) {
      return NextResponse.json({ error: auth.error }, { status: auth.status });
    }

    const { name, tagline, logo } = await request.json();

    const restaurant = await prisma.restaurant.findFirst();
    if (!restaurant) {
      return NextResponse.json({ error: "Restaurant not configured" }, { status: 404 });
    }

    const updateData = {};
    if (name !== undefined) updateData.name = name.trim();
    if (tagline !== undefined) updateData.tagline = tagline?.trim() || null;
    if (logo !== undefined) updateData.logo = logo;

    const updated = await prisma.restaurant.update({
      where: { id: restaurant.id },
      data: updateData,
    });

    return NextResponse.json({ restaurant: updated });
  } catch (error) {
    console.error("Settings update error:", error.message);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

