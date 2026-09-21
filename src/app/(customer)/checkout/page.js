"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Script from "next/script";
import { Minus, Plus, Package, Trash2 } from "lucide-react";
import GlassCard from "@/components/ui/GlassCard";
import GlassButton from "@/components/ui/GlassButton";
import GlassNavbar from "@/components/ui/GlassNavbar";
import { useCart } from "@/context/CartContext";

export default function CheckoutPage() {
  const router = useRouter();
  const { items, tableId, customer, updateQuantity, toggleTakeaway, removeItem, totalAmount, clearCart } = useCart();

  const [paying, setPaying] = useState(false);
  const [error, setError] = useState("");

  const customerId = customer?.id || (typeof window !== "undefined" ? localStorage.getItem("smartdine-customer-id") : null);

  const handlePayment = async () => {
    if (!customerId || !tableId || items.length === 0) {
      setError("Missing order information. Please go back and try again.");
      return;
    }
    setPaying(true);
    setError("");
    try {
      const orderRes = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customerId: parseInt(customerId, 10), tableId,
          items: items.map((item) => ({ dishId: item.dish.id, quantity: item.quantity, forTakeaway: item.forTakeaway })),
        }),
      });
      const orderData = await orderRes.json();
      if (!orderRes.ok) { setError(orderData.error || "Failed to create order"); setPaying(false); return; }

      const paymentRes = await fetch("/api/payment/create-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderId: orderData.order.id }),
      });
      const paymentData = await paymentRes.json();
      if (!paymentRes.ok) { setError(paymentData.error || "Failed to initiate payment"); setPaying(false); return; }

      const options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
        amount: paymentData.amount, currency: paymentData.currency,
        name: "SmartDine", description: `Order #${paymentData.orderNumber}`,
        order_id: paymentData.razorpayOrderId,
        prefill: { name: paymentData.customerName, email: paymentData.customerEmail, contact: paymentData.customerPhone },
        theme: { color: "#f97316" },
        handler: async function (response) {
          try {
            const verifyRes = await fetch("/api/payment/verify", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ razorpay_order_id: response.razorpay_order_id, razorpay_payment_id: response.razorpay_payment_id, razorpay_signature: response.razorpay_signature }),
            });
            const verifyData = await verifyRes.json();
            if (verifyData.success) { clearCart(); router.push(`/order/${orderData.order.id}`); }
            else { setError("Payment verification failed. Please contact support."); }
          } catch { setError("Payment verification error. Please contact support."); }
          setPaying(false);
        },
        modal: { ondismiss: function () { setPaying(false); } },
      };

      if (typeof window !== "undefined" && window.Razorpay) {
        const rzp = new window.Razorpay(options);
        rzp.on("payment.failed", function () { setError("Payment failed. Please try again."); setPaying(false); });
        rzp.open();
      } else { setError("Payment gateway not loaded. Please refresh and try again."); setPaying(false); }
    } catch { setError("Something went wrong. Please try again."); setPaying(false); }
  };

  if (items.length === 0) {
    return (
      <>
        <GlassNavbar title="Checkout" color="orange" showBack onBack={() => router.back()} />
        <div className="px-5vw py-12 text-center">
          <p className="text-gray-500 mb-4">Your cart is empty</p>
          <GlassButton onClick={() => router.back()} color="orange">Browse Menu</GlassButton>
        </div>
      </>
    );
  }

  return (
    <>
      <Script src="https://checkout.razorpay.com/v1/checkout.js" strategy="lazyOnload" />
      <GlassNavbar title="Checkout" color="orange" showBack onBack={() => router.back()} />

      <div className="px-5vw py-6 max-w-lg mx-auto pb-32">
        <h2 className="text-xl font-bold text-gray-900 mb-4">Your Order</h2>

        <div className="space-y-3 mb-6">
          {items.map((item) => (
            <GlassCard key={`${item.dish.id}-${item.forTakeaway}`} color="orange" padding="p-4">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className={`w-3 h-3 rounded-full border-2 ${item.dish.isVeg ? "border-green-500 bg-green-100" : "border-red-500 bg-red-100"}`} />
                    <h4 className="text-gray-900 font-medium text-sm">{item.dish.name}</h4>
                  </div>
                  <p className="text-gray-400 text-xs mt-1">₹{parseFloat(item.dish.price).toFixed(0)} each</p>
                </div>
                <button onClick={() => removeItem(item.dish.id, item.forTakeaway)} className="text-gray-300 hover:text-red-500 transition-colors p-1"><Trash2 className="h-4 w-4" /></button>
              </div>

              <div className="flex items-center justify-between mt-3">
                <div className="flex items-center gap-3 bg-gray-50 border border-gray-200 rounded-xl px-3 py-1.5">
                  <button onClick={() => updateQuantity(item.dish.id, item.quantity - 1, item.forTakeaway)} className="text-gray-600 hover:text-orange-500"><Minus className="h-4 w-4" /></button>
                  <span className="text-gray-900 font-semibold text-sm min-w-[20px] text-center">{item.quantity}</span>
                  <button onClick={() => updateQuantity(item.dish.id, item.quantity + 1, item.forTakeaway)} className="text-gray-600 hover:text-orange-500"><Plus className="h-4 w-4" /></button>
                </div>
                <label className="flex items-center gap-1.5 text-xs text-gray-500 cursor-pointer">
                  <input type="checkbox" checked={item.forTakeaway} onChange={() => toggleTakeaway(item.dish.id, item.forTakeaway)} className="rounded border-gray-300 text-orange-500" />
                  <Package className="h-3 w-3" /> Takeaway
                </label>
                <span className="text-orange-600 font-semibold text-sm">₹{(parseFloat(item.dish.price) * item.quantity).toFixed(0)}</span>
              </div>
            </GlassCard>
          ))}
        </div>

        <GlassCard color="orange" className="mb-6">
          <h3 className="text-gray-900 font-semibold mb-3">Order Summary</h3>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between text-gray-500"><span>Subtotal</span><span>₹{totalAmount.toFixed(0)}</span></div>
            <div className="border-t border-gray-100 pt-2 flex justify-between text-gray-900 font-bold text-base"><span>Total</span><span>₹{totalAmount.toFixed(0)}</span></div>
          </div>
        </GlassCard>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3 mb-4">
            <p className="text-red-600 text-sm">{error}</p>
          </div>
        )}

        <GlassButton onClick={handlePayment} loading={paying} color="orange" fullWidth>
          Pay ₹{totalAmount.toFixed(0)} with Razorpay
        </GlassButton>
      </div>
    </>
  );
}
