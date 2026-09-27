import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { emitSSE } from "@/lib/sse";
import { requireAuth } from "@/lib/auth";
import crypto from "crypto";

// GET - List orders (for kitchen/steward/admin)
export async function GET(request) {
  try {
    const auth = await requireAuth(["admin", "kitchen", "steward"]);
    if (auth.error) {
      return NextResponse.json({ error: auth.error }, { status: auth.status });
    }

    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status");
    const tableId = searchParams.get("tableId");
    const date = searchParams.get("date");
    const limit = parseInt(searchParams.get("limit") || "50", 10);

    const where = {};

    if (status) {
      if (status.includes(",")) {
        where.status = { in: status.split(",") };
      } else {
        where.status = status;
      }
    }

    if (tableId) {
      where.tableId = parseInt(tableId, 10);
    }

    if (date) {
      const start = new Date(date);
      start.setHours(0, 0, 0, 0);
      const end = new Date(date);
      end.setHours(23, 59, 59, 999);
      where.createdAt = { gte: start, lte: end };
    }

    const orders = await prisma.order.findMany({
      where,
      include: {
        items: { include: { dish: true } },
        customer: {
          select: { id: true, name: true, email: true, phone: true },
        },
        table: { select: { id: true, tableNumber: true } },
        payment: true,
      },
      orderBy: { createdAt: "desc" },
      take: limit,
    });

    return NextResponse.json({ orders });
  } catch (error) {
    console.error("Order list error:", error.message);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// POST - Create a new order
export async function POST(request) {
  try {
    const { customerId, tableId, items } = await request.json();

    if (!customerId || !tableId || !items || items.length === 0) {
      return NextResponse.json(
        { error: "customerId, tableId, and items are required" },
        { status: 400 }
      );
    }

    // Validate all dishes exist and are available
    const dishIds = items.map((item) => item.dishId);
    const dishes = await prisma.dish.findMany({
      where: { id: { in: dishIds } },
    });

    if (dishes.length !== dishIds.length) {
      return NextResponse.json(
        { error: "One or more dishes not found" },
        { status: 400 }
      );
    }

    const unavailable = dishes.filter((d) => !d.available);
    if (unavailable.length > 0) {
      return NextResponse.json(
        {
          error: `Dishes currently unavailable: ${unavailable.map((d) => d.name).join(", ")}`,
        },
        { status: 400 }
      );
    }

    // Generate order number
    const orderNumber = `SD-${Date.now().toString(36).toUpperCase()}-${crypto.randomBytes(2).toString("hex").toUpperCase()}`;

    // Calculate totals
    const orderItems = items.map((item) => {
      const dish = dishes.find((d) => d.id === item.dishId);
      const unitPrice = parseFloat(dish.price);
      return {
        dishId: item.dishId,
        quantity: parseInt(item.quantity, 10),
        forTakeaway: Boolean(item.forTakeaway),
        unitPrice,
        subtotal: unitPrice * parseInt(item.quantity, 10),
      };
    });

    const totalAmount = orderItems.reduce((sum, item) => sum + item.subtotal, 0);

    // Create order with items in a transaction
    const order = await prisma.$transaction(async (tx) => {
      const newOrder = await tx.order.create({
        data: {
          orderNumber,
          customerId: parseInt(customerId, 10),
          tableId: parseInt(tableId, 10),
          status: "PENDING",
          totalAmount,
          items: {
            create: orderItems,
          },
        },
        include: {
          items: { include: { dish: true } },
          customer: { select: { id: true, name: true } },
          table: { select: { id: true, tableNumber: true } },
        },
      });

      return newOrder;
    });

    return NextResponse.json({ order }, { status: 201 });
  } catch (error) {
    console.error("Order creation error:", error.message);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

