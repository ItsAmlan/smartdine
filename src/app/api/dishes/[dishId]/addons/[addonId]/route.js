import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { requireAuth } from "@/lib/auth";

// PUT - Update a customization option: rename, reprice, or toggle active
// (hides it from the customer menu without deleting past orders' record
// of it, since OrderItemAddon keeps its own name/price snapshot either
// way). Admin only.
export async function PUT(request, { params }) {
  try {
    const auth = await requireAuth(["admin"]);
    if (auth.error) {
      return NextResponse.json({ error: auth.error }, { status: auth.status });
    }

    const { dishId, addonId } = await params;
    const existing = await prisma.dishAddon.findUnique({ where: { id: parseInt(addonId, 10) } });
    if (!existing || existing.dishId !== parseInt(dishId, 10)) {
      return NextResponse.json({ error: "Addon not found" }, { status: 404 });
    }

    const data = await request.json();
    const updateData = {};
    if (data.name !== undefined) {
      if (!data.name.trim()) {
        return NextResponse.json({ error: "Name cannot be empty" }, { status: 400 });
      }
      updateData.name = data.name.trim();
    }
    if (data.price !== undefined) {
      const parsedPrice = parseFloat(data.price);
      if (Number.isNaN(parsedPrice) || parsedPrice < 0) {
        return NextResponse.json({ error: "Price must be 0 or a positive number" }, { status: 400 });
      }
      updateData.price = parsedPrice;
    }
    if (data.active !== undefined) updateData.active = Boolean(data.active);

    const addon = await prisma.dishAddon.update({
      where: { id: existing.id },
      data: updateData,
    });

    return NextResponse.json({ addon });
  } catch (error) {
    console.error("Addon update error:", error.message);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// DELETE - Remove a customization option (admin only). Past orders keep
// their OrderItemAddon name/price snapshot regardless.
export async function DELETE(request, { params }) {
  try {
    const auth = await requireAuth(["admin"]);
    if (auth.error) {
      return NextResponse.json({ error: auth.error }, { status: auth.status });
    }

    const { dishId, addonId } = await params;
    const existing = await prisma.dishAddon.findUnique({ where: { id: parseInt(addonId, 10) } });
    if (!existing || existing.dishId !== parseInt(dishId, 10)) {
      return NextResponse.json({ error: "Addon not found" }, { status: 404 });
    }

    await prisma.dishAddon.delete({ where: { id: existing.id } });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Addon delete error:", error.message);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
