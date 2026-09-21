import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { emitSSE } from "@/lib/sse";

// POST - Chef marks order as complete
export async function POST(request, { params }) {
  try {
    const { orderId } = await params;

    const order = await prisma.order.findUnique({
      where: { id: parseInt(orderId, 10) },
      include: { table: true, customer: true },
    });

    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    if (!["ACCEPTED", "PREPARING"].includes(order.status)) {
      return NextResponse.json(
        { error: `Cannot complete order with status: ${order.status}` },
        { status: 400 }
      );
    }

    const updated = await prisma.order.update({
      where: { id: parseInt(orderId, 10) },
      data: {
        status: "READY",
        completedAt: new Date(),
      },
      include: {
        items: { include: { dish: true } },
        customer: { select: { name: true } },
        table: { select: { tableNumber: true } },
      },
    });

    // Notify customer
    emitSSE(`customer-${order.id}`, {
      type: "ORDER_READY",
      order: updated,
    });

    // Notify steward
    emitSSE("steward", {
      type: "ORDER_READY",
      orderId: order.id,
      orderNumber: order.orderNumber,
      tableNumber: order.table.tableNumber,
      customerName: order.customer.name,
    });

    return NextResponse.json({ order: updated });
  } catch (error) {
    console.error("Order complete error:", error.message);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

