import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { requireAuth } from "@/lib/auth";

// GET - List categories
export async function GET() {
  try {
    const categories = await prisma.category.findMany({
      orderBy: { sortOrder: "asc" },
      include: { _count: { select: { dishes: true } } },
    });
    return NextResponse.json({ categories });
  } catch (error) {
    console.error("Categories fetch error:", error.message);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// POST - Create category (admin only)
export async function POST(request) {
  try {
    const auth = await requireAuth(["admin"]);
    if (auth.error) {
      return NextResponse.json({ error: auth.error }, { status: auth.status });
    }

    const { name, description, sortOrder } = await request.json();

    if (!name) {
      return NextResponse.json({ error: "Name is required" }, { status: 400 });
    }

    const category = await prisma.category.create({
      data: {
        name: name.trim(),
        description: description?.trim() || null,
        sortOrder: parseInt(sortOrder || "0", 10),
      },
    });

    return NextResponse.json({ category }, { status: 201 });
  } catch (error) {
    console.error("Category creation error:", error.message);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// PUT - Update category (admin only)
export async function PUT(request) {
  try {
    const auth = await requireAuth(["admin"]);
    if (auth.error) {
      return NextResponse.json({ error: auth.error }, { status: auth.status });
    }

    const { id, name, description, sortOrder, active } = await request.json();

    if (!id) {
      return NextResponse.json({ error: "Category ID is required" }, { status: 400 });
    }

    const updateData = {};
    if (name !== undefined) updateData.name = name.trim();
    if (description !== undefined) updateData.description = description?.trim() || null;
    if (sortOrder !== undefined) updateData.sortOrder = parseInt(sortOrder, 10);
    if (active !== undefined) updateData.active = Boolean(active);

    const category = await prisma.category.update({
      where: { id: parseInt(id, 10) },
      data: updateData,
    });

    return NextResponse.json({ category });
  } catch (error) {
    console.error("Category update error:", error.message);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// DELETE - Delete category (admin only)
export async function DELETE(request) {
  try {
    const auth = await requireAuth(["admin"]);
    if (auth.error) {
      return NextResponse.json({ error: auth.error }, { status: auth.status });
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "Category ID is required" }, { status: 400 });
    }

    await prisma.category.delete({
      where: { id: parseInt(id, 10) },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Category delete error:", error.message);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

