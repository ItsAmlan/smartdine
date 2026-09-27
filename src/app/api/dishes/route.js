import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { requireAuth } from "@/lib/auth";

// GET - List all dishes (admin or kitchen)
export async function GET() {
  try {
    const auth = await requireAuth(["admin", "kitchen"]);
    if (auth.error) {
      return NextResponse.json({ error: auth.error }, { status: auth.status });
    }

    const dishes = await prisma.dish.findMany({
      include: { category: { select: { id: true, name: true } } },
      orderBy: [{ category: { sortOrder: "asc" } }, { name: "asc" }],
    });
    return NextResponse.json({ dishes });
  } catch (error) {
    console.error("Dishes fetch error:", error.message);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// POST - Create a new dish (admin only)
export async function POST(request) {
  try {
    const auth = await requireAuth(["admin"]);
    if (auth.error) {
      return NextResponse.json({ error: auth.error }, { status: auth.status });
    }

    const { name, description, price, categoryId, image, isVeg } =
      await request.json();

    if (!name || !price || !categoryId) {
      return NextResponse.json(
        { error: "Name, price, and categoryId are required" },
        { status: 400 }
      );
    }

    if (parseFloat(price) <= 0) {
      return NextResponse.json(
        { error: "Price must be greater than 0" },
        { status: 400 }
      );
    }

    const dish = await prisma.dish.create({
      data: {
        name: name.trim(),
        description: description?.trim() || null,
        price: parseFloat(price),
        categoryId: parseInt(categoryId, 10),
        image: image || null,
        isVeg: isVeg !== false,
      },
      include: { category: { select: { id: true, name: true } } },
    });

    return NextResponse.json({ dish }, { status: 201 });
  } catch (error) {
    console.error("Dish creation error:", error.message);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

