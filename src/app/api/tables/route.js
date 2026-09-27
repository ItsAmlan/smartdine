import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { requireAuth } from "@/lib/auth";

// GET - List tables (admin only)
export async function GET() {
  try {
    const auth = await requireAuth(["admin"]);
    if (auth.error) {
      return NextResponse.json({ error: auth.error }, { status: auth.status });
    }

    const tables = await prisma.table.findMany({
      orderBy: { tableNumber: "asc" },
      include: { _count: { select: { orders: true } } },
    });
    return NextResponse.json({ tables });
  } catch (error) {
    console.error("Tables fetch error:", error.message);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// POST - Create table (admin only)
export async function POST(request) {
  try {
    const auth = await requireAuth(["admin"]);
    if (auth.error) {
      return NextResponse.json({ error: auth.error }, { status: auth.status });
    }

    const { tableNumber } = await request.json();

    if (!tableNumber) {
      return NextResponse.json({ error: "Table number is required" }, { status: 400 });
    }

    const restaurant = await prisma.restaurant.findFirst();
    if (!restaurant) {
      return NextResponse.json({ error: "Restaurant not configured" }, { status: 500 });
    }

    const table = await prisma.table.create({
      data: {
        tableNumber: tableNumber.trim(),
        restaurantId: restaurant.id,
        active: true,
      },
    });

    return NextResponse.json({ table }, { status: 201 });
  } catch (error) {
    if (error.code === "P2002") {
      return NextResponse.json({ error: "Table number already exists" }, { status: 400 });
    }
    console.error("Table creation error:", error.message);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// DELETE - Delete table (admin only)
export async function DELETE(request) {
  try {
    const auth = await requireAuth(["admin"]);
    if (auth.error) {
      return NextResponse.json({ error: auth.error }, { status: auth.status });
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "Table ID is required" }, { status: 400 });
    }

    await prisma.table.delete({
      where: { id: parseInt(id, 10) },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Table delete error:", error.message);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

