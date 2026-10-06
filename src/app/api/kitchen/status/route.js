import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { requireAuth } from "@/lib/auth";
import { emitSSE } from "@/lib/sse";

// GET - Whether the kitchen is currently accepting new orders
export async function GET() {
  try {
    const auth = await requireAuth(["admin", "kitchen"]);
    if (auth.error) {
      return NextResponse.json({ error: auth.error }, { status: auth.status });
    }

    const restaurant = await prisma.restaurant.findFirst();
    if (!restaurant) {
      return NextResponse.json({ error: "Restaurant not configured" }, { status: 404 });
    }

    return NextResponse.json({ acceptingOrders: restaurant.acceptingOrders });
  } catch (error) {
    console.error("Kitchen status fetch error:", error.message);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// PATCH - Pause/resume the kitchen. Pausing holds newly-paid orders as
// PAUSED instead of PAID (see payment/verify); resuming releases any held
// orders back to PAID so they immediately show as a normal new order.
export async function PATCH(request) {
  try {
    const auth = await requireAuth(["admin", "kitchen"]);
    if (auth.error) {
      return NextResponse.json({ error: auth.error }, { status: auth.status });
    }

    const { acceptingOrders } = await request.json();
    if (typeof acceptingOrders !== "boolean") {
      return NextResponse.json(
        { error: "acceptingOrders (boolean) is required" },
        { status: 400 }
      );
    }

    const restaurant = await prisma.restaurant.findFirst();
    if (!restaurant) {
      return NextResponse.json({ error: "Restaurant not configured" }, { status: 404 });
    }

    const updated = await prisma.restaurant.update({
      where: { id: restaurant.id },
      data: { acceptingOrders },
    });

    let resumedOrders = [];
    if (acceptingOrders) {
      const held = await prisma.order.findMany({ where: { status: "PAUSED" } });
      if (held.length > 0) {
        await prisma.order.updateMany({
          where: { status: "PAUSED" },
          data: { status: "PAID" },
        });
        resumedOrders = await prisma.order.findMany({
          where: { id: { in: held.map((o) => o.id) } },
          include: {
            items: { include: { dish: true, addons: true } },
            customer: { select: { id: true, name: true } },
            table: { select: { id: true, tableNumber: true } },
          },
        });
      }
    }

    emitSSE("kitchen", {
      type: "KITCHEN_STATUS",
      acceptingOrders: updated.acceptingOrders,
      resumedOrders,
    });

    return NextResponse.json({
      acceptingOrders: updated.acceptingOrders,
      resumedOrders,
    });
  } catch (error) {
    console.error("Kitchen status update error:", error.message);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
