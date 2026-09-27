import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { tokensMatch } from "@/lib/auth";

// GET - Look up a returning customer's active order for a table, without
// touching their stored profile (register/route.js upserts name+phone,
// which must never run with placeholder data).
//
// This is a silent, browser-initiated check with no user action, so unlike
// the main register endpoint it must not trust a bare email address: that
// would let anyone who merely knows (or guesses) a diner's email and table
// pull up their live order. It additionally requires the recognitionToken
// handed back at registration and kept in the browser's own localStorage.
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const email = searchParams.get("email");
    const tableId = searchParams.get("tableId");
    const token = searchParams.get("token");

    if (!email || !tableId) {
      return NextResponse.json(
        { error: "email and tableId are required" },
        { status: 400 }
      );
    }

    const customer = await prisma.customer.findUnique({ where: { email } });
    if (!customer || !tokensMatch(token, customer.recognitionToken)) {
      return NextResponse.json({ customer: null, activeOrder: null });
    }

    const activeOrder = await prisma.order.findFirst({
      where: {
        customerId: customer.id,
        tableId: parseInt(tableId, 10),
        status: { notIn: ["DELIVERED", "PAYMENT_FAILED"] },
      },
      include: {
        items: { include: { dish: true } },
        payment: true,
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({
      customer: { id: customer.id, name: customer.name, email: customer.email },
      activeOrder: activeOrder || null,
    });
  } catch (error) {
    console.error("Active order lookup error:", error.message);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
