"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { use } from "react";
import GlassCard from "@/components/ui/GlassCard";
import GlassButton from "@/components/ui/GlassButton";
import GlassNavbar from "@/components/ui/GlassNavbar";
import GlassBadge from "@/components/ui/GlassBadge";
import OrderStatusTracker from "@/components/customer/OrderStatusTracker";
import CallStewardButton from "@/components/customer/CallStewardButton";
import useSSE from "@/hooks/useSSE";
import { Package, Receipt } from "lucide-react";

export default function OrderStatusPage({ params }) {
  const { orderId } = use(params);
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("t") || "";
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  const { data: sseData } = useSSE(`/api/events/customer/${orderId}?t=${encodeURIComponent(token)}`);

  useEffect(() => {
    fetch(`/api/orders/${orderId}?t=${encodeURIComponent(token)}`)
      .then((r) => r.json())
      .then((data) => { setOrder(data.order); setLoading(false); })
      .catch(() => setLoading(false));
  }, [orderId, token]);

  useEffect(() => {
    if (sseData && sseData.order) setOrder(sseData.order);
  }, [sseData]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-gray-400 flex items-center gap-3">
          <div className="h-6 w-6 border-2 border-orange-400 border-t-transparent rounded-full animate-spin" />
          Loading order...
        </div>
      </div>
    );
  }

  if (!order) {
    return (
      <>
        <GlassNavbar title="Order Not Found" color="orange" />
        <div className="px-5vw py-12 text-center"><p className="text-gray-500 mb-4">This order could not be found.</p></div>
      </>
    );
  }

  return (
    <>
      <GlassNavbar title="Order Status" color="orange" showBack onBack={() => router.push(`/table/${order.tableId}/menu`)} />

      <div className="px-5vw py-6 max-w-lg mx-auto">
        <GlassCard color="orange" className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-gray-900 font-bold text-lg">Order #{order.orderNumber}</h2>
              <p className="text-gray-500 text-sm">
                {order.table?.tableNumber} • {new Date(order.createdAt).toLocaleTimeString()}
              </p>
            </div>
            <GlassBadge
              variant={order.status === "DELIVERED" ? "success" : ["READY", "OUT_FOR_SERVICE"].includes(order.status) ? "info" : "warning"}
              size="md"
            >
              {order.status.replace(/_/g, " ")}
            </GlassBadge>
          </div>
          <OrderStatusTracker status={order.status} estimatedMinutes={order.estimatedMinutes} />
        </GlassCard>

        <GlassCard color="orange" className="mb-6">
          <h3 className="text-gray-900 font-semibold mb-3 flex items-center gap-2">
            <Receipt className="h-4 w-4 text-orange-500" /> Order Details
          </h3>
          <div className="space-y-3">
            {order.items?.map((item) => (
              <div key={item.id} className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2 flex-1">
                  <span className={`w-2.5 h-2.5 rounded-full ${item.dish?.isVeg ? "bg-green-500" : "bg-red-500"}`} />
                  <span className="text-gray-700">{item.dish?.name}</span>
                  <span className="text-gray-400">×{item.quantity}</span>
                  {item.forTakeaway && <Package className="h-3 w-3 text-orange-500" />}
                </div>
                <span className="text-gray-600">₹{parseFloat(item.subtotal).toFixed(0)}</span>
              </div>
            ))}
            <div className="border-t border-gray-100 pt-2 flex justify-between font-bold text-gray-900">
              <span>Total</span><span>₹{parseFloat(order.totalAmount).toFixed(0)}</span>
            </div>
          </div>
        </GlassCard>

        {order.status === "DELIVERED" && (
          <GlassButton onClick={() => router.push(`/table/${order.tableId}/menu`)} color="orange" fullWidth>
            Place Another Order
          </GlassButton>
        )}
      </div>

      <CallStewardButton tableId={order.tableId} />
    </>
  );
}
