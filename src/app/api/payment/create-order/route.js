import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getRazorpay } from "@/lib/razorpay";

// POST - Create Razorpay order
export async function POST(request) {
  try {
    const razorpay = getRazorpay();
    if (!razorpay) {
      return NextResponse.json(
        { error: "Payment gateway not configured" },
        { status: 503 }
      );
    }

    const { orderId } = await request.json();

    if (!orderId) {
      return NextResponse.json(
        { error: "orderId is required" },
        { status: 400 }
      );
    }

    const order = await prisma.order.findUnique({
      where: { id: parseInt(orderId, 10) },
      include: { customer: true },
    });

    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    if (order.status !== "PENDING") {
      return NextResponse.json(
        { error: "Order is not in a payable state" },
        { status: 400 }
      );
    }

    // Amount in paise (INR smallest unit)
    const amountInPaise = Math.round(parseFloat(order.totalAmount) * 100);

    const razorpayOrder = await razorpay.orders.create({
      amount: amountInPaise,
      currency: "INR",
      receipt: order.orderNumber,
      notes: {
        orderId: order.id.toString(),
        customerName: order.customer.name,
        customerEmail: order.customer.email,
      },
    });

    // Create payment record
    await prisma.payment.create({
      data: {
        orderId: order.id,
        razorpayOrderId: razorpayOrder.id,
        amount: order.totalAmount,
        status: "PENDING",
      },
    });

    // Update order status
    await prisma.order.update({
      where: { id: order.id },
      data: { status: "PAYMENT_PENDING" },
    });

    return NextResponse.json({
      razorpayOrderId: razorpayOrder.id,
      amount: amountInPaise,
      currency: "INR",
      orderId: order.id,
      orderNumber: order.orderNumber,
      customerName: order.customer.name,
      customerEmail: order.customer.email,
      customerPhone: order.customer.phone,
    });
  } catch (error) {
    console.error("Payment order creation error:", error.message);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

