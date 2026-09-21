import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

// GET - Get order details
export async function GET(request, { params }) {
  try {
    const { orderId } = await params;

    const order = await prisma.order.findUnique({
      where: { id: parseInt(orderId, 10) },
      include: {
        items: { include: { dish: true } },
        customer: {
          select: { id: true, name: true, email: true },
        },
        table: { select: { id: true, tableNumber: true } },
        payment: true,
      },
    });

    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    return NextResponse.json({ order });
  } catch (error) {
    console.error("Order fetch error:", error.message);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

