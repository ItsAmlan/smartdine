"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Clock, Check, ChefHat, Pause, Play, Package } from "lucide-react";
import GlassCard from "@/components/ui/GlassCard";
import GlassButton from "@/components/ui/GlassButton";
import GlassBadge from "@/components/ui/GlassBadge";
import GlassNavbar from "@/components/ui/GlassNavbar";
import GlassModal from "@/components/ui/GlassModal";
import GlassInput from "@/components/ui/GlassInput";
import GlassToggle from "@/components/ui/GlassToggle";
import EmptyState from "@/components/ui/EmptyState";
import useSSE from "@/hooks/useSSE";
import useWakeLock from "@/hooks/useWakeLock";
import { playNotificationChime } from "@/lib/notificationSound";

export default function KitchenDashboard() {
  const router = useRouter();
  const [authed, setAuthed] = useState(false);
  const [orders, setOrders] = useState([]);
  const [filter, setFilter] = useState("active");
  const [acceptingOrders, setAcceptingOrders] = useState(true);
  const [pauseUpdating, setPauseUpdating] = useState(false);
  const [loading, setLoading] = useState(true);
  const [acceptModal, setAcceptModal] = useState(null);
  const [estTime, setEstTime] = useState("20");
  const [dishes, setDishes] = useState([]);
  const [showDishes, setShowDishes] = useState(false);

  const { data: sseData } = useSSE("/api/events/kitchen");
  useWakeLock(authed);

  const fetchOrders = useCallback(async () => {
    try {
      const res = await fetch("/api/orders?status=PAID,ACCEPTED,READY,PAUSED");
      const data = await res.json();
      setOrders(data.orders || []);
    } catch { /* Handle silently */ }
    finally { setLoading(false); }
  }, []);

  const fetchDishes = useCallback(async () => {
    try {
      const res = await fetch("/api/dishes");
      const data = await res.json();
      setDishes(data.dishes || []);
    } catch { /* Handle silently */ }
  }, []);

  const fetchKitchenStatus = useCallback(async () => {
    try {
      const res = await fetch("/api/kitchen/status");
      const data = await res.json();
      if (typeof data.acceptingOrders === "boolean") setAcceptingOrders(data.acceptingOrders);
    } catch { /* Handle silently */ }
  }, []);

  // Auth check
  useEffect(() => {
    fetch("/api/auth/me")
      .then((r) => {
        if (!r.ok) { router.replace("/kitchen/login"); return; }
        return r.json();
      })
      .then((data) => {
        if (data?.user?.role === "admin" || data?.user?.role === "kitchen") setAuthed(true);
        else router.replace("/kitchen/login");
      })
      .catch(() => router.replace("/kitchen/login"));
  }, [router]);

  useEffect(() => {
    if (!authed) return;
    fetchOrders();
    fetchDishes();
    fetchKitchenStatus();
  }, [authed, fetchOrders, fetchDishes, fetchKitchenStatus]);

  useEffect(() => {
    if (sseData?.type === "NEW_ORDER") {
      setOrders((prev) => {
        const exists = prev.find((o) => o.id === sseData.order.id);
        if (exists) return prev;
        return [sseData.order, ...prev];
      });
      playNotificationChime();
    }
    if (sseData?.type === "KITCHEN_STATUS") {
      setAcceptingOrders(sseData.acceptingOrders);
      if (sseData.resumedOrders?.length) {
        setOrders((prev) => {
          const byId = new Map(prev.map((o) => [o.id, o]));
          sseData.resumedOrders.forEach((o) => byId.set(o.id, o));
          return Array.from(byId.values());
        });
      }
    }
  }, [sseData]);

  const handleTogglePause = async () => {
    setPauseUpdating(true);
    try {
      const res = await fetch("/api/kitchen/status", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ acceptingOrders: !acceptingOrders }),
      });
      if (res.ok) {
        const data = await res.json();
        setAcceptingOrders(data.acceptingOrders);
        if (data.resumedOrders?.length) {
          setOrders((prev) => {
            const byId = new Map(prev.map((o) => [o.id, o]));
            data.resumedOrders.forEach((o) => byId.set(o.id, o));
            return Array.from(byId.values());
          });
        }
      }
    } catch { /* Handle silently */ }
    finally { setPauseUpdating(false); }
  };

  const handleAccept = async () => {
    if (!acceptModal || !estTime) return;
    try {
      const res = await fetch(`/api/orders/${acceptModal.id}/accept`, {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ estimatedMinutes: parseInt(estTime, 10) }),
      });
      if (res.ok) {
        const data = await res.json();
        setOrders((prev) => prev.map((o) => (o.id === data.order.id ? data.order : o)));
        setAcceptModal(null);
      }
    } catch {}
  };

  const handleComplete = async (orderId) => {
    try {
      const res = await fetch(`/api/orders/${orderId}/complete`, { method: "POST" });
      if (res.ok) {
        const data = await res.json();
        setOrders((prev) => prev.map((o) => (o.id === data.order.id ? data.order : o)));
      }
    } catch {}
  };

  const toggleDishAvailability = async (dishId, available) => {
    try {
      await fetch(`/api/dishes/${dishId}/availability`, {
        method: "PATCH", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ available: !available }),
      });
      setDishes((prev) => prev.map((d) => d.id === dishId ? { ...d, available: !available } : d));
    } catch {}
  };

  const filteredOrders = orders.filter((o) => {
    if (filter === "active") return ["PAID", "ACCEPTED", "PAUSED"].includes(o.status);
    if (filter === "pending") return o.status === "PAID" || o.status === "PAUSED";
    if (filter === "accepted") return o.status === "ACCEPTED";
    if (filter === "ready") return o.status === "READY";
    return true;
  });

  const statusBadge = (status) => {
    const map = {
      PAID: { variant: "warning", label: "New" },
      PAUSED: { variant: "danger", label: "Paused" },
      ACCEPTED: { variant: "info", label: "Accepted" },
      READY: { variant: "success", label: "Ready" },
    };
    const s = map[status] || { variant: "default", label: status };
    return <GlassBadge variant={s.variant}>{s.label}</GlassBadge>;
  };

  return (
    <>
      <GlassNavbar title="Kitchen Dashboard" color="amber">
        <GlassButton onClick={() => setShowDishes(!showDishes)} variant="secondary" className="text-xs px-3 py-2">
          {showDishes ? "Orders" : "Dish Menu"}
        </GlassButton>
        <button
          onClick={handleTogglePause}
          disabled={pauseUpdating}
          className={`p-2 rounded-xl transition-colors disabled:opacity-50 ${!acceptingOrders ? "bg-red-500 text-white" : "bg-white/50 backdrop-blur-sm text-gray-600 hover:bg-white/70"}`}
          title={acceptingOrders ? "Pause new orders" : "Resume accepting orders"}
        >
          {!acceptingOrders ? <Play className="h-5 w-5" /> : <Pause className="h-5 w-5" />}
        </button>
      </GlassNavbar>

      {!acceptingOrders && (
        <div className="bg-red-50/80 backdrop-blur-sm border-b border-red-200/60 px-5vw py-2 text-center">
          <p className="text-red-600 text-sm font-medium">⏸ Kitchen is paused — new orders will be held until you resume</p>
        </div>
      )}

      <div className="px-5vw py-4">
        {showDishes ? (
          <div>
            <h2 className="text-gray-900 font-bold text-lg mb-4">Dish Availability</h2>
            {dishes.length === 0 ? (
              <EmptyState
                icon={ChefHat}
                eyebrow="Dish availability"
                title="No dishes to manage"
                description="Add dishes in the admin menu and they will appear here for the kitchen."
                color="amber"
              />
            ) : (
              <div className="space-y-2">
              {dishes.map((dish) => (
                <div key={dish.id} className="flex items-center justify-between backdrop-blur-xl bg-white/60 border border-white/80 rounded-xl px-4 py-3 shadow-sm">
                  <div className="flex items-center gap-3">
                    <span className={`w-3 h-3 rounded-full ${dish.isVeg ? "bg-green-500" : "bg-red-500"}`} />
                    <div>
                      <p className="text-gray-900 text-sm font-medium">{dish.name}</p>
                      <p className="text-gray-400 text-xs">{dish.category?.name}</p>
                    </div>
                  </div>
                  <GlassToggle
                    checked={dish.available}
                    onChange={() => toggleDishAvailability(dish.id, dish.available)}
                    color="amber"
                    label={dish.available ? "Available" : "Unavailable"}
                  />
                </div>
              ))}
              </div>
            )}
          </div>
        ) : (
          <>
            <div className="flex gap-2 mb-4 overflow-x-auto">
              {[
                { key: "active", label: "Active" }, { key: "pending", label: "Pending" },
                { key: "accepted", label: "In Progress" }, { key: "ready", label: "Ready" },
              ].map((tab) => (
                <button key={tab.key} onClick={() => setFilter(tab.key)}
                  className={`whitespace-nowrap px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                    filter === tab.key ? "bg-amber-500 text-white shadow-lg shadow-amber-500/25" : "bg-white/60 backdrop-blur-sm text-gray-600 border border-white/80 hover:bg-white/80"
                  }`}>
                  {tab.label}
                </button>
              ))}
            </div>

            {loading ? (
              <div className="text-center py-12 text-gray-400">Loading orders...</div>
            ) : filteredOrders.length === 0 ? (
              <EmptyState
                icon={ChefHat}
                eyebrow="Kitchen queue"
                title="This station is clear"
                description="No orders match the selected queue right now. New tickets will appear here automatically."
                color="amber"
              />
            ) : (
              <div className="space-y-4">
                {filteredOrders.map((order) => (
                  <GlassCard key={order.id} color="amber" padding="p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h3 className="text-gray-900 font-bold">#{order.orderNumber}</h3>
                        <p className="text-gray-500 text-sm">{order.table?.tableNumber} • {order.customer?.name}</p>
                        <p className="text-gray-400 text-xs">{new Date(order.createdAt).toLocaleTimeString()}</p>
                      </div>
                      {statusBadge(order.status)}
                    </div>

                    <div className="space-y-2 mb-4">
                      {order.items?.map((item) => (
                        <div key={item.id} className="text-sm">
                          <div className="flex items-center gap-2">
                            <span className="text-amber-600 font-mono">{item.quantity}×</span>
                            <span className="text-gray-700">{item.dish?.name}</span>
                            {item.forTakeaway && <Package className="h-3 w-3 text-amber-500" />}
                          </div>
                          {item.addons?.length > 0 && (
                            <p className="text-amber-700 text-xs ml-6 font-medium">{item.addons.map((a) => a.name).join(", ")}</p>
                          )}
                          {item.notes && (
                            <p className="text-gray-500 text-xs ml-6 italic">Note: {item.notes}</p>
                          )}
                        </div>
                      ))}
                    </div>

                    <div className="flex gap-2 items-center">
                      {(order.status === "PAID" || order.status === "PAUSED") && (
                        <GlassButton onClick={() => { setAcceptModal(order); setEstTime("20"); }} color="amber" className="text-sm px-4 py-2 flex-1">
                          <Check className="h-4 w-4" /> Accept
                        </GlassButton>
                      )}
                      {order.status === "ACCEPTED" && (
                        <GlassButton onClick={() => handleComplete(order.id)} color="amber" className="text-sm px-4 py-2 flex-1">
                          <ChefHat className="h-4 w-4" /> Mark Complete
                        </GlassButton>
                      )}
                      {order.estimatedMinutes && (
                        <div className="flex items-center gap-1 text-amber-600 text-xs">
                          <Clock className="h-3 w-3" /> {order.estimatedMinutes}m
                        </div>
                      )}
                    </div>
                  </GlassCard>
                ))}
              </div>
            )}
          </>
        )}
      </div>

      <GlassModal isOpen={!!acceptModal} onClose={() => setAcceptModal(null)} title="Accept Order" color="amber" size="sm">
        <p className="text-gray-600 text-sm mb-4">Set estimated preparation time for order #{acceptModal?.orderNumber}</p>
        <GlassInput label="Estimated Time (minutes)" name="estTime" type="number" value={estTime} onChange={(e) => setEstTime(e.target.value)} min="1" max="120" color="amber" />
        <div className="flex gap-2 mt-4">
          <GlassButton onClick={() => setAcceptModal(null)} variant="secondary" className="flex-1">Cancel</GlassButton>
          <GlassButton onClick={handleAccept} color="amber" className="flex-1">Accept Order</GlassButton>
        </div>
      </GlassModal>
    </>
  );
}
