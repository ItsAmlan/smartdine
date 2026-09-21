import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { emitSSE } from "@/lib/sse";

// POST - Chef accepts an order with estimated time
export async function POST(request, { params }) {
  try {
    const { orderId } = await params;
    const { estimatedMinutes } = await request.json();

    if (!estimatedMinutes || estimatedMinutes < 1) {
      return NextResponse.json(
        { error: "Estimated preparation time is required (in minutes)" },
        { status: 400 }
      );
    }

    const order = await prisma.order.findUnique({
      where: { id: parseInt(orderId, 10) },
      include: { table: true, customer: true },
    });

    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    if (!["PAID", "PAUSED"].includes(order.status)) {
      return NextResponse.json(
        { error: `Cannot accept order with status: ${order.status}` },
        { status: 400 }
      );
    }

    const updated = await prisma.order.update({
      where: { id: parseInt(orderId, 10) },
      data: {
        status: "ACCEPTED",
        estimatedMinutes: parseInt(estimatedMinutes, 10),
        acceptedAt: new Date(),
      },
      include: {
        items: { include: { dish: true } },
        customer: { select: { name: true } },
        table: { select: { tableNumber: true } },
      },
    });

    // Notify customer about acceptance
    emitSSE(`customer-${order.id}`, {
      type: "ORDER_ACCEPTED",
      order: updated,
    });

    return NextResponse.json({ order: updated });
  } catch (error) {
    console.error("Order accept error:", error.message);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

