"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Bell, ConciergeBell, ChefHat, Check, Truck, Clock } from "lucide-react";
import GlassCard from "@/components/ui/GlassCard";
import GlassButton from "@/components/ui/GlassButton";
import GlassBadge from "@/components/ui/GlassBadge";
import GlassNavbar from "@/components/ui/GlassNavbar";
import EmptyState from "@/components/ui/EmptyState";
import useSSE from "@/hooks/useSSE";

export default function StewardDashboard() {
  const router = useRouter();
  const [authed, setAuthed] = useState(false);
  const [readyOrders, setReadyOrders] = useState([]);
  const [stewardCalls, setStewardCalls] = useState([]);
  const [showHistory, setShowHistory] = useState(false);
  const [loading, setLoading] = useState(true);

  const { data: sseData } = useSSE("/api/events/steward");

  useEffect(() => {
    fetch("/api/auth/me")
      .then((r) => { if (!r.ok) { router.replace("/steward/login"); return; } return r.json(); })
      .then((data) => { if (data?.user) setAuthed(true); })
      .catch(() => router.replace("/steward/login"));
  }, [router]);

  const fetchData = useCallback(async () => {
    try {
      const [callsRes, ordersRes] = await Promise.all([
        fetch("/api/steward-call"), fetch("/api/orders?status=READY"),
      ]);
      const callsData = await callsRes.json();
      const ordersData = await ordersRes.json();
      setStewardCalls(callsData.calls || []);
      setReadyOrders(ordersData.orders || []);
    } catch {} finally { setLoading(false); }
  }, []);

  useEffect(() => { if (!authed) return; fetchData(); }, [authed, fetchData]);

  const playNotification = useCallback(() => {
    try { const audio = new Audio("/sounds/notification.mp3"); audio.play().catch(() => {}); } catch {}
  }, []);

  useEffect(() => {
    if (!sseData) return;
    if (sseData.type === "STEWARD_CALL") {
      setStewardCalls((prev) => {
        if (prev.find((c) => c.id === sseData.callId)) return prev;
        return [{ id: sseData.callId, tableId: sseData.tableId, table: { tableNumber: sseData.tableNumber }, message: sseData.message, status: "PENDING", createdAt: sseData.createdAt }, ...prev];
      });
      playNotification();
    }
    if (sseData.type === "ORDER_READY") {
      setReadyOrders((prev) => {
        if (prev.find((o) => o.id === sseData.orderId)) return prev;
        return [{ id: sseData.orderId, orderNumber: sseData.orderNumber, table: { tableNumber: sseData.tableNumber }, customer: { name: sseData.customerName }, status: "READY" }, ...prev];
      });
      playNotification();
    }
  }, [sseData, playNotification]);

  const acknowledgeCall = async (callId) => {
    try {
      const res = await fetch("/api/steward-call", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ callId }) });
      if (res.ok) setStewardCalls((prev) => prev.map((c) => c.id === callId ? { ...c, status: "ACKNOWLEDGED", acknowledgedAt: new Date() } : c));
    } catch {}
  };

  const deliverOrder = async (orderId) => {
    try {
      const res = await fetch(`/api/orders/${orderId}/acknowledge`, { method: "POST" });
      if (res.ok) setReadyOrders((prev) => prev.filter((o) => o.id !== orderId));
    } catch {}
  };

  const pendingCalls = stewardCalls.filter((c) => c.status === "PENDING");
  const acknowledgedCalls = stewardCalls.filter((c) => c.status === "ACKNOWLEDGED");
  const totalAlerts = pendingCalls.length + readyOrders.length;

  return (
    <>
      <GlassNavbar title="Steward Desk" color="red">
        {totalAlerts > 0 && (
          <div className="bg-red-500 text-white rounded-full w-7 h-7 flex items-center justify-center text-xs font-bold animate-pulse">{totalAlerts}</div>
        )}
        <GlassButton onClick={() => setShowHistory(!showHistory)} variant="secondary" className="text-xs px-3 py-2">
          {showHistory ? "Active" : "History"}
        </GlassButton>
      </GlassNavbar>

      <div className="px-5vw py-4">
        {loading ? (
          <div className="text-center py-12 text-gray-400">Loading...</div>
        ) : showHistory ? (
          <div>
            <h2 className="text-gray-900 font-bold text-lg mb-4">Acknowledged Alerts</h2>
            {acknowledgedCalls.length === 0 ? (
              <EmptyState
                icon={Check}
                eyebrow="Alert history"
                title="No acknowledgements yet"
                description="Resolved table calls will be collected here for quick review."
                color="red"
                compact
              />
            ) : (
              <div className="space-y-3">
                {acknowledgedCalls.map((call) => (
                  <div key={call.id} className="bg-white border border-gray-200 rounded-xl px-4 py-3 flex items-center justify-between">
                    <div>
                      <p className="text-gray-600 text-sm">{call.table?.tableNumber}</p>
                      <p className="text-gray-400 text-xs">{new Date(call.createdAt).toLocaleTimeString()}</p>
                    </div>
                    <GlassBadge variant="success" size="sm">Done</GlassBadge>
                  </div>
                ))}
              </div>
            )}
          </div>
        ) : (
          <>
            {totalAlerts === 0 && (
              <EmptyState
                icon={Bell}
                eyebrow="Steward desk"
                title="All clear"
                description="There are no table calls or ready orders waiting for you."
                color="red"
              />
            )}

            {pendingCalls.length > 0 && (
              <div className="mb-6">
                <h2 className="text-gray-900 font-bold text-lg mb-3 flex items-center gap-2">
                  <ConciergeBell className="h-5 w-5 text-red-500" /> Table Calls ({pendingCalls.length})
                </h2>
                <div className="space-y-3">
                  {pendingCalls.map((call) => (
                    <GlassCard key={call.id} color="red" padding="p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-gray-900 font-bold text-lg">{call.table?.tableNumber}</p>
                          <div className="flex items-center gap-2 text-gray-500 text-sm">
                            <Clock className="h-3 w-3" /> {new Date(call.createdAt).toLocaleTimeString()}
                          </div>
                          {call.message && <p className="text-gray-500 text-sm mt-1">{call.message}</p>}
                        </div>
                        <GlassButton onClick={() => acknowledgeCall(call.id)} color="red" className="text-sm px-4 py-2">
                          <Check className="h-4 w-4" /> Acknowledge
                        </GlassButton>
                      </div>
                    </GlassCard>
                  ))}
                </div>
              </div>
            )}

            {readyOrders.length > 0 && (
              <div>
                <h2 className="text-gray-900 font-bold text-lg mb-3 flex items-center gap-2">
                  <ChefHat className="h-5 w-5 text-red-500" /> Orders Ready ({readyOrders.length})
                </h2>
                <div className="space-y-3">
                  {readyOrders.map((order) => (
                    <GlassCard key={order.id} color="red" padding="p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-gray-900 font-bold">#{order.orderNumber}</p>
                          <p className="text-gray-500 text-sm">{order.table?.tableNumber} • {order.customer?.name}</p>
                        </div>
                        <GlassButton onClick={() => deliverOrder(order.id)} color="red" className="text-sm px-4 py-2">
                          <Truck className="h-4 w-4" /> Deliver
                        </GlassButton>
                      </div>
                    </GlassCard>
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </>
  );
}
