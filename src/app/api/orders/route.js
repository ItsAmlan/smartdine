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
        items: { include: { dish: true, addons: true } },
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

    // Validate every chosen addon actually belongs to its dish and is
    // still active - never trust addon prices from the client.
    const allAddonIds = [...new Set(items.flatMap((item) => item.addonIds || []))];
    const addons = allAddonIds.length
      ? await prisma.dishAddon.findMany({ where: { id: { in: allAddonIds } } })
      : [];
    const addonById = new Map(addons.map((a) => [a.id, a]));

    for (const item of items) {
      for (const addonId of item.addonIds || []) {
        const addon = addonById.get(addonId);
        if (!addon || !addon.active || addon.dishId !== item.dishId) {
          return NextResponse.json(
            { error: "One or more selected customizations are no longer available" },
            { status: 400 }
          );
        }
      }
    }

    // Generate order number and an unguessable token customers use to view
    // this order without a login (see /api/orders/[orderId]).
    const orderNumber = `SD-${Date.now().toString(36).toUpperCase()}-${crypto.randomBytes(2).toString("hex").toUpperCase()}`;
    const accessToken = crypto.randomBytes(24).toString("hex");

    // Calculate totals - each addon's price applies per unit, same as the
    // dish price itself (order 2 with "extra cheese" -> charged twice).
    const orderItems = items.map((item) => {
      const dish = dishes.find((d) => d.id === item.dishId);
      const unitPrice = parseFloat(dish.price);
      const quantity = parseInt(item.quantity, 10);
      const chosenAddons = (item.addonIds || []).map((id) => addonById.get(id));
      const addonsUnitTotal = chosenAddons.reduce((sum, a) => sum + parseFloat(a.price), 0);
      return {
        dishId: item.dishId,
        quantity,
        forTakeaway: Boolean(item.forTakeaway),
        notes: item.notes?.trim() ? item.notes.trim().slice(0, 300) : null,
        unitPrice,
        subtotal: (unitPrice + addonsUnitTotal) * quantity,
        addons: {
          create: chosenAddons.map((a) => ({
            dishAddonId: a.id,
            name: a.name,
            price: a.price,
          })),
        },
      };
    });

    const totalAmount = orderItems.reduce((sum, item) => sum + item.subtotal, 0);

    // Create order with items in a transaction
    const order = await prisma.$transaction(async (tx) => {
      const newOrder = await tx.order.create({
        data: {
          orderNumber,
          accessToken,
          customerId: parseInt(customerId, 10),
          tableId: parseInt(tableId, 10),
          status: "PENDING",
          totalAmount,
          items: {
            create: orderItems,
          },
        },
        include: {
          items: { include: { dish: true, addons: true } },
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

