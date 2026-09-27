import Razorpay from "razorpay";
import crypto from "crypto";

// Resolved lazily (not at module load) so a missing key only breaks the
// payment routes at request time, never `next build`'s page-data collection.
let razorpayInstance;

export function getRazorpay() {
  if (razorpayInstance !== undefined) return razorpayInstance;

  const keyId = process.env.RAZORPAY_KEY_ID;
  const keySecret = process.env.RAZORPAY_KEY_SECRET;

  if (!keyId || !keySecret) {
    console.warn(
      "⚠️ Razorpay credentials not set. Payment features will not work."
    );
    razorpayInstance = null;
    return razorpayInstance;
  }

  razorpayInstance = new Razorpay({
    key_id: keyId,
    key_secret: keySecret,
  });
  return razorpayInstance;
}

export function verifyPaymentSignature({
  razorpayOrderId,
  razorpayPaymentId,
  razorpaySignature,
}) {
  const keySecret = process.env.RAZORPAY_KEY_SECRET;
  if (!keySecret) {
    throw new Error("RAZORPAY_KEY_SECRET is not configured");
  }

  const body = `${razorpayOrderId}|${razorpayPaymentId}`;
  const expectedSignature = crypto
    .createHmac("sha256", keySecret)
    .update(body)
    .digest("hex");

  return expectedSignature === razorpaySignature;
}

