import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { requireAuth } from "@/lib/auth";

// PATCH - Toggle dish availability (kitchen or admin)
export async function PATCH(request, { params }) {
  try {
    const auth = await requireAuth(["admin", "kitchen"]);
    if (auth.error) {
      return NextResponse.json({ error: auth.error }, { status: auth.status });
    }

    const { dishId } = await params;
    const { available } = await request.json();

    const dish = await prisma.dish.update({
      where: { id: parseInt(dishId, 10) },
      data: { available: Boolean(available) },
    });

    return NextResponse.json({ dish });
  } catch (error) {
    console.error("Dish availability error:", error.message);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

