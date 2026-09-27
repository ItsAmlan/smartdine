import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { createSSEResponse } from "@/lib/sse";
import { getSession, tokensMatch } from "@/lib/auth";

export const dynamic = "force-dynamic";

// Same access rule as GET /api/orders/[orderId]: token or staff session,
// otherwise this live stream would let a stranger watch another diner's
// order (name, items, status) update in real time just by guessing the id.
export async function GET(request, { params }) {
  const { orderId } = await params;
  const { searchParams } = new URL(request.url);
  const token = searchParams.get("t");

  const order = await prisma.order.findUnique({
    where: { id: parseInt(orderId, 10) },
    select: { accessToken: true },
  });

  if (!order) {
    return NextResponse.json({ error: "Order not found" }, { status: 404 });
  }

  const staffUser = await getSession();
  if (!staffUser && !tokensMatch(token, order.accessToken)) {
    return NextResponse.json({ error: "Order not found" }, { status: 404 });
  }

  return createSSEResponse(`customer-${orderId}`);
}
