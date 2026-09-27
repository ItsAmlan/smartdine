"use client";

import { useState, useEffect } from "react";
import { Activity, ArrowUpRight, DollarSign, ShoppingBag, Users, TrendingUp, Star, ReceiptText } from "lucide-react";
import GlassCard from "@/components/ui/GlassCard";
import EmptyState from "@/components/ui/EmptyState";

const metricCards = [
  { key: "orderCount", label: "Today’s orders", detail: "Live order volume", icon: ShoppingBag, value: (data) => data.orderCount.toLocaleString(), iconClass: "bg-emerald-500 text-white shadow-emerald-500/25", bar: "bg-emerald-500" },
  { key: "totalRevenue", label: "Revenue captured", detail: "Gross sales today", icon: DollarSign, value: (data) => "₹" + data.totalRevenue.toLocaleString(), iconClass: "bg-teal-500 text-white shadow-teal-500/25", bar: "bg-teal-500" },
  { key: "avgOrderValue", label: "Average order", detail: "Value per ticket", icon: TrendingUp, value: (data) => "₹" + data.avgOrderValue.toFixed(0), iconClass: "bg-amber-500 text-white shadow-amber-500/25", bar: "bg-amber-500" },
  { key: "uniqueCustomers", label: "Unique customers", detail: "Guests served today", icon: Users, value: (data) => data.uniqueCustomers.toLocaleString(), iconClass: "bg-sky-500 text-white shadow-sky-500/25", bar: "bg-sky-500" },
];

function MetricCard({ card, analytics, index }) {
  const Icon = card.icon;
  return (
    <div className={"admin-metric-glass backdrop-blur-sm relative overflow-hidden rounded-[1.6rem] border border-white/90 p-5 shadow-[0_18px_42px_rgba(30,41,59,.09)] ring-1 ring-white/55"}>
      <div className="absolute right-5 top-5 text-[10px] font-bold tracking-[0.18em] text-slate-400/70">0{index + 1}</div>
      <div className="relative flex items-start justify-between gap-4">
        <div className={"flex h-11 w-11 items-center justify-center rounded-2xl shadow-lg " + card.iconClass}><Icon className="h-5 w-5" strokeWidth={2.2} /></div>
        <span className="inline-flex items-center gap-1 rounded-full border border-white/70 bg-white/55 px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.12em] text-slate-500"><Activity className="h-3 w-3" /> Live</span>
      </div>
      <div className="relative mt-7"><p className="text-[11px] font-bold uppercase tracking-[0.14em] text-slate-500">{card.label}</p><p className="mt-2 text-[2rem] font-extrabold leading-none tracking-[-0.06em] text-slate-900">{card.value(analytics)}</p><div className="mt-3 flex items-center justify-between gap-2"><p className="text-xs text-slate-500">{card.detail}</p><ArrowUpRight className="h-4 w-4 text-slate-400" /></div></div>
      <div className="relative mt-5 h-1 overflow-hidden rounded-full bg-slate-900/[0.06]"><div className={"h-full w-2/3 rounded-full " + card.bar + " opacity-75"} /></div>
    </div>
  );
}

export default function AdminDashboard() {
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    fetch("/api/analytics").then((r) => r.json()).then((data) => { setAnalytics(data && !data.error ? data : { orderCount: 0, totalRevenue: 0, avgOrderValue: 0, uniqueCustomers: 0, popularDishes: [], recentOrders: [] }); setLoading(false); }).catch(() => { setAnalytics({ orderCount: 0, totalRevenue: 0, avgOrderValue: 0, uniqueCustomers: 0, popularDishes: [], recentOrders: [] }); setLoading(false); });
  }, []);
  if (loading) return <div className="flex min-h-72 items-center justify-center text-sm text-slate-400">Loading analytics...</div>;
  if (!analytics) return <div className="flex min-h-72 items-center justify-center text-sm text-slate-400">Failed to load analytics</div>;

  return (
    <div className="mx-auto max-w-[1400px]">
      <div className="mb-8 flex flex-col justify-between gap-4 sm:flex-row sm:items-end"><div><p className="mb-2 text-[11px] font-bold uppercase tracking-[0.2em] text-emerald-600">Operations overview</p><h1 className="text-3xl font-extrabold tracking-[-0.055em] text-slate-900">Good morning, Admin.</h1><p className="mt-2 text-sm text-slate-500">Here’s the pulse of your restaurant today.</p></div><div className="inline-flex w-fit items-center gap-2 rounded-full border border-white/80 bg-white/60 px-3 py-2 text-xs font-semibold text-slate-500 shadow-sm backdrop-blur-xl"><span className="h-2 w-2 rounded-full bg-emerald-500 shadow-[0_0_0_4px_rgba(16,185,129,.14)]" />System operating normally</div></div>
      <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">{metricCards.map((card, index) => <MetricCard key={card.key} card={card} analytics={analytics} index={index} />)}</div>
      <div className="grid grid-cols-1 gap-5 xl:grid-cols-2">
        <GlassCard color="green" padding="p-0" blurClass="backdrop-blur-sm" className="overflow-hidden"><div className="flex items-center justify-between border-b border-white/60 px-6 py-5"><div><p className="text-[10px] font-bold uppercase tracking-[0.16em] text-emerald-600">Menu intelligence</p><h3 className="mt-1 flex items-center gap-2 text-lg font-bold tracking-[-0.03em] text-slate-900"><Star className="h-4 w-4 fill-emerald-500 text-emerald-500" />Most popular dishes</h3></div><span className="rounded-full bg-emerald-50 px-2.5 py-1 text-[10px] font-bold text-emerald-700">TOP PERFORMERS</span></div><div className="p-6">{analytics.popularDishes.length === 0 ? <EmptyState icon={Star} title="No order data yet" description="Popular dishes will appear as orders come in." color="green" compact /> : <div className="space-y-4">{analytics.popularDishes.map((dish, i) => <div key={dish.name} className="flex items-center gap-3"><span className="flex h-8 w-8 items-center justify-center rounded-xl bg-emerald-500/[0.1] text-xs font-extrabold text-emerald-600">{String(i + 1).padStart(2, "0")}</span><div className="min-w-0 flex-1"><div className="mb-1.5 flex items-center justify-between gap-3"><span className="truncate text-sm font-semibold text-slate-700">{dish.name}</span><span className="shrink-0 text-xs font-medium text-slate-400">{dish.count} orders</span></div><div className="h-1.5 overflow-hidden rounded-full bg-slate-900/[0.06]"><div className="h-full rounded-full bg-gradient-to-r from-emerald-400 to-teal-500" style={{ width: Math.max(18, 100 - i * 18) + "%" }} /></div></div><span className="text-xs font-bold text-emerald-600">₹{dish.revenue.toFixed(0)}</span></div>)}</div>}</div></GlassCard>
        <GlassCard color="green" padding="p-0" blurClass="backdrop-blur-sm" className="overflow-hidden"><div className="flex items-center justify-between border-b border-white/60 px-6 py-5"><div><p className="text-[10px] font-bold uppercase tracking-[0.16em] text-emerald-600">Live activity</p><h3 className="mt-1 flex items-center gap-2 text-lg font-bold tracking-[-0.03em] text-slate-900"><ReceiptText className="h-4 w-4 text-emerald-500" />Recent orders</h3></div><span className="rounded-full bg-slate-900/[0.05] px-2.5 py-1 text-[10px] font-bold text-slate-500">TODAY</span></div><div className="max-h-80 space-y-2 overflow-y-auto p-4">{analytics.recentOrders.length === 0 ? <EmptyState icon={ReceiptText} title="No orders today" description="New orders will appear here in real time." color="green" compact /> : analytics.recentOrders.slice(0, 10).map((order) => <div key={order.id} className="flex items-center justify-between rounded-2xl border border-white/65 bg-white/35 px-4 py-3"><div className="flex min-w-0 items-center gap-3"><span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-slate-900/[0.06] text-[10px] font-bold text-slate-500">#{order.orderNumber}</span><div className="min-w-0"><p className="truncate text-sm font-semibold text-slate-700">{order.customer?.name || "Guest"}</p><p className="text-[11px] text-slate-400">{order.status}</p></div></div><span className="ml-3 shrink-0 text-sm font-bold text-emerald-600">₹{parseFloat(order.totalAmount).toFixed(0)}</span></div>)}</div></GlassCard>
      </div>
    </div>
  );
}
