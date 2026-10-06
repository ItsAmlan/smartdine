import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { requireAuth } from "@/lib/auth";

// GET - List a dish's customization options (admin only; the public menu
// gets active addons through /api/menu instead)
export async function GET(request, { params }) {
  try {
    const auth = await requireAuth(["admin"]);
    if (auth.error) {
      return NextResponse.json({ error: auth.error }, { status: auth.status });
    }

    const { dishId } = await params;
    const addons = await prisma.dishAddon.findMany({
      where: { dishId: parseInt(dishId, 10) },
      orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
    });
    return NextResponse.json({ addons });
  } catch (error) {
    console.error("Addon list error:", error.message);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// POST - Add a customization option to a dish (admin only). price = 0
// means a free customization (e.g. "No Onion"); any positive price makes
// it chargeable (e.g. "Extra Cheese +Rs 30").
export async function POST(request, { params }) {
  try {
    const auth = await requireAuth(["admin"]);
    if (auth.error) {
      return NextResponse.json({ error: auth.error }, { status: auth.status });
    }

    const { dishId } = await params;
    const { name, price } = await request.json();

    if (!name?.trim()) {
      return NextResponse.json({ error: "Name is required" }, { status: 400 });
    }
    const parsedPrice = price === undefined || price === "" ? 0 : parseFloat(price);
    if (Number.isNaN(parsedPrice) || parsedPrice < 0) {
      return NextResponse.json({ error: "Price must be 0 or a positive number" }, { status: 400 });
    }

    const dish = await prisma.dish.findUnique({ where: { id: parseInt(dishId, 10) } });
    if (!dish) {
      return NextResponse.json({ error: "Dish not found" }, { status: 404 });
    }

    const addon = await prisma.dishAddon.create({
      data: {
        dishId: dish.id,
        name: name.trim(),
        price: parsedPrice,
      },
    });

    return NextResponse.json({ addon }, { status: 201 });
  } catch (error) {
    console.error("Addon creation error:", error.message);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
