import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getSession, tokensMatch } from "@/lib/auth";

// GET - Get order details. Customers have no login, so this order was
// created without one; access is gated by the unguessable accessToken
// handed back at creation time instead (?t=), unless the caller is
// logged-in staff. Without this, a bare numeric order id would let anyone
// enumerate other diners' orders (items, totals, names) just by guessing.
export async function GET(request, { params }) {
  try {
    const { orderId } = await params;
    const { searchParams } = new URL(request.url);
    const token = searchParams.get("t");

    const order = await prisma.order.findUnique({
      where: { id: parseInt(orderId, 10) },
      include: {
        items: { include: { dish: true, addons: true } },
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

    const staffUser = await getSession();
    if (!staffUser && !tokensMatch(token, order.accessToken)) {
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
