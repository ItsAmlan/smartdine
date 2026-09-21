import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function POST(request) {
  try {
    const { name, email, phone, tableId } = await request.json();

    if (!name || !email || !phone || !tableId) {
      return NextResponse.json(
        { error: "Name, email, phone, and tableId are required" },
        { status: 400 }
      );
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: "Invalid email format" },
        { status: 400 }
      );
    }

    // Validate phone format (10 digits)
    const phoneClean = phone.replace(/\D/g, "");
    if (phoneClean.length < 10 || phoneClean.length > 15) {
      return NextResponse.json(
        { error: "Invalid phone number" },
        { status: 400 }
      );
    }

    // Validate table exists
    const table = await prisma.table.findUnique({
      where: { id: parseInt(tableId, 10) },
    });

    if (!table || !table.active) {
      return NextResponse.json(
        { error: "Invalid or inactive table" },
        { status: 400 }
      );
    }

    // Upsert customer (find by email or create new)
    const customer = await prisma.customer.upsert({
      where: { email },
      update: { name, phone: phoneClean },
      create: { name, email, phone: phoneClean },
    });

    // Check for active orders on this table for this customer
    const activeOrder = await prisma.order.findFirst({
      where: {
        customerId: customer.id,
        tableId: table.id,
        status: {
          notIn: ["DELIVERED", "PAYMENT_FAILED"],
        },
      },
      include: {
        items: { include: { dish: true } },
        payment: true,
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({
      customer: {
        id: customer.id,
        name: customer.name,
        email: customer.email,
      },
      activeOrder: activeOrder || null,
      tableId: table.id,
      tableNumber: table.tableNumber,
    });
  } catch (error) {
    console.error("Customer registration error:", error.message);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

