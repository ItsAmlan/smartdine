import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { emitSSE } from "@/lib/sse";
import { requireAuth } from "@/lib/auth";

// POST - Steward picks up a ready order and heads to the table
// (steward or admin only). Splits what used to be a single "Deliver"
// action into two, so the desk can tell "sitting at the pass" apart
// from "already on its way".
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

    if (order.status !== "READY") {
      return NextResponse.json(
        { error: `Cannot mark order out for serving with status: ${order.status}` },
        { status: 400 }
      );
    }

    const updated = await prisma.order.update({
      where: { id: parseInt(orderId, 10) },
      data: {
        status: "OUT_FOR_SERVICE",
        outForServiceAt: new Date(),
      },
      include: {
        items: { include: { dish: true, addons: true } },
        customer: { select: { name: true } },
        table: { select: { tableNumber: true } },
      },
    });

    // Notify customer
    emitSSE(`customer-${order.id}`, {
      type: "ORDER_OUT_FOR_SERVICE",
      order: updated,
    });

    return NextResponse.json({ order: updated });
  } catch (error) {
    console.error("Order serve error:", error.message);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
