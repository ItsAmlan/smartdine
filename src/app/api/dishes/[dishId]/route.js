import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { requireAuth } from "@/lib/auth";

// GET - Get single dish
export async function GET(request, { params }) {
  try {
    const { dishId } = await params;
    const dish = await prisma.dish.findUnique({
      where: { id: parseInt(dishId, 10) },
      include: { category: { select: { id: true, name: true } } },
    });
    if (!dish) {
      return NextResponse.json({ error: "Dish not found" }, { status: 404 });
    }
    return NextResponse.json({ dish });
  } catch (error) {
    console.error("Dish fetch error:", error.message);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// PUT - Update dish (admin only)
export async function PUT(request, { params }) {
  try {
    const auth = await requireAuth(["admin"]);
    if (auth.error) {
      return NextResponse.json({ error: auth.error }, { status: auth.status });
    }

    const { dishId } = await params;
    const data = await request.json();

    const updateData = {};
    if (data.name !== undefined) updateData.name = data.name.trim();
    if (data.description !== undefined) updateData.description = data.description?.trim() || null;
    if (data.price !== undefined) updateData.price = parseFloat(data.price);
    if (data.categoryId !== undefined) updateData.categoryId = parseInt(data.categoryId, 10);
    if (data.image !== undefined) updateData.image = data.image;
    if (data.isVeg !== undefined) updateData.isVeg = Boolean(data.isVeg);
    if (data.available !== undefined) updateData.available = Boolean(data.available);

    const dish = await prisma.dish.update({
      where: { id: parseInt(dishId, 10) },
      data: updateData,
      include: { category: { select: { id: true, name: true } } },
    });

    return NextResponse.json({ dish });
  } catch (error) {
    console.error("Dish update error:", error.message);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// DELETE - Delete dish (admin only)
export async function DELETE(request, { params }) {
  try {
    const auth = await requireAuth(["admin"]);
    if (auth.error) {
      return NextResponse.json({ error: auth.error }, { status: auth.status });
    }

    const { dishId } = await params;
    await prisma.dish.delete({
      where: { id: parseInt(dishId, 10) },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Dish delete error:", error.message);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

