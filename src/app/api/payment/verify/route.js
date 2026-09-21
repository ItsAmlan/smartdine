import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { verifyPaymentSignature } from "@/lib/razorpay";
import { emitSSE } from "@/lib/sse";

// POST - Verify Razorpay payment
export async function POST(request) {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } =
      await request.json();

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return NextResponse.json(
        { error: "Payment verification data is incomplete" },
        { status: 400 }
      );
    }

    // Verify signature
    const isValid = verifyPaymentSignature({
      razorpayOrderId: razorpay_order_id,
      razorpayPaymentId: razorpay_payment_id,
      razorpaySignature: razorpay_signature,
    });

    if (!isValid) {
      return NextResponse.json(
        { error: "Payment verification failed - signature mismatch" },
        { status: 400 }
      );
    }

    // Update payment and order in transaction
    const result = await prisma.$transaction(async (tx) => {
      const payment = await tx.payment.update({
        where: { razorpayOrderId: razorpay_order_id },
        data: {
          razorpayPaymentId: razorpay_payment_id,
          razorpaySignature: razorpay_signature,
          status: "PAID",
        },
      });

      const order = await tx.order.update({
        where: { id: payment.orderId },
        data: { status: "PAID" },
        include: {
          items: { include: { dish: true } },
          customer: { select: { id: true, name: true, email: true } },
          table: { select: { id: true, tableNumber: true } },
          payment: true,
        },
      });

      return order;
    });

    // Notify kitchen about new paid order
    emitSSE("kitchen", {
      type: "NEW_ORDER",
      order: result,
    });

    return NextResponse.json({
      success: true,
      order: result,
    });
  } catch (error) {
    console.error("Payment verification error:", error.message);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

