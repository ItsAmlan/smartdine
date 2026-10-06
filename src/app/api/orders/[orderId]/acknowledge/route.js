import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { emitSSE } from "@/lib/sse";
import { requireAuth } from "@/lib/auth";

// POST - Steward marks an out-for-service order as delivered to the
// table (steward or admin only)
export async function POST(request, { params }) {
  try {
    const auth = await requireAuth(["admin", "steward"]);
    if (auth.error) {
      return NextResponse.json({ error: auth.error }, { status: auth.status });
    }

    const { orderId } = await params;

    const order = await prisma.order.findUnique({
      where: { id: parseInt(orderId, 10) },
      include: { table: true },
    });

    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    if (order.status !== "OUT_FOR_SERVICE") {
      return NextResponse.json(
        { error: `Cannot deliver order with status: ${order.status}` },
        { status: 400 }
      );
    }

    const updated = await prisma.order.update({
      where: { id: parseInt(orderId, 10) },
      data: {
        status: "DELIVERED",
        deliveredAt: new Date(),
      },
      include: {
        items: { include: { dish: true, addons: true } },
        customer: { select: { name: true } },
        table: { select: { tableNumber: true } },
      },
    });

    // Notify customer
    emitSSE(`customer-${order.id}`, {
      type: "ORDER_DELIVERED",
      order: updated,
    });

    return NextResponse.json({ order: updated });
  } catch (error) {
    console.error("Order acknowledge error:", error.message);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

