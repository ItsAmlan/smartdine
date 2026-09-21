import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

// PATCH - Toggle dish availability (kitchen or admin)
export async function PATCH(request, { params }) {
  try {
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

