"use client";

import { useState, useEffect } from "react";
import { DollarSign, ShoppingBag, Users, TrendingUp, Star } from "lucide-react";
import GlassCard from "@/components/ui/GlassCard";

export default function AdminDashboard() {
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/analytics")
      .then((r) => r.json())
      .then((data) => {
        if (data && !data.error) {
          setAnalytics(data);
        } else {
          setAnalytics({
            orderCount: 0, totalRevenue: 0, avgOrderValue: 0,
            uniqueCustomers: 0, popularDishes: [], recentOrders: [],
          });
        }
        setLoading(false);
      })
      .catch(() => {
        setAnalytics({
          orderCount: 0, totalRevenue: 0, avgOrderValue: 0,
          uniqueCustomers: 0, popularDishes: [], recentOrders: [],
        });
        setLoading(false);
      });
  }, []);

  if (loading) {
    return <div className="text-center py-12 text-gray-400">Loading analytics...</div>;
  }

  if (!analytics) {
    return <div className="text-center py-12 text-gray-400">Failed to load analytics</div>;
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Dashboard</h1>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <GlassCard color="green" padding="p-5">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-green-100/80">
              <ShoppingBag className="h-5 w-5 text-green-600" />
            </div>
            <div>
              <p className="text-gray-500 text-xs">Today&apos;s Orders</p>
              <p className="text-gray-900 text-2xl font-bold">{analytics.orderCount}</p>
            </div>
          </div>
        </GlassCard>

        <GlassCard color="green" padding="p-5">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-emerald-100/80">
              <DollarSign className="h-5 w-5 text-emerald-600" />
            </div>
            <div>
              <p className="text-gray-500 text-xs">Revenue</p>
              <p className="text-gray-900 text-2xl font-bold">₹{analytics.totalRevenue.toLocaleString()}</p>
            </div>
          </div>
        </GlassCard>

        <GlassCard color="green" padding="p-5">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-amber-100/80">
              <TrendingUp className="h-5 w-5 text-amber-600" />
            </div>
            <div>
              <p className="text-gray-500 text-xs">Avg Order Value</p>
              <p className="text-gray-900 text-2xl font-bold">₹{analytics.avgOrderValue.toFixed(0)}</p>
            </div>
          </div>
        </GlassCard>

        <GlassCard color="green" padding="p-5">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-blue-100/80">
              <Users className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <p className="text-gray-500 text-xs">Unique Customers</p>
              <p className="text-gray-900 text-2xl font-bold">{analytics.uniqueCustomers}</p>
            </div>
          </div>
        </GlassCard>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <GlassCard color="green">
          <h3 className="text-gray-900 font-semibold mb-4 flex items-center gap-2">
            <Star className="h-4 w-4 text-green-500" />
            Most Popular Dishes
          </h3>
          {analytics.popularDishes.length === 0 ? (
            <p className="text-gray-400 text-sm">No order data yet</p>
          ) : (
            <div className="space-y-3">
              {analytics.popularDishes.map((dish, i) => (
                <div key={dish.name} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="text-green-500 font-bold text-sm w-6">#{i + 1}</span>
                    <span className="text-gray-700 text-sm">{dish.name}</span>
                  </div>
                  <div className="text-right">
                    <span className="text-gray-500 text-sm">{dish.count} orders</span>
                    <span className="text-green-600 text-xs ml-2">₹{dish.revenue.toFixed(0)}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </GlassCard>

        <GlassCard color="green">
          <h3 className="text-gray-900 font-semibold mb-4">Recent Orders</h3>
          {analytics.recentOrders.length === 0 ? (
            <p className="text-gray-400 text-sm">No orders today</p>
          ) : (
            <div className="space-y-2 max-h-80 overflow-y-auto">
              {analytics.recentOrders.slice(0, 10).map((order) => (
                <div
                  key={order.id}
                  className="flex items-center justify-between bg-white/40 backdrop-blur-sm rounded-xl px-3 py-2 text-sm"
                >
                  <div>
                    <span className="text-gray-900 font-medium">#{order.orderNumber}</span>
                    <span className="text-gray-400 ml-2">{order.customer?.name}</span>
                  </div>
                  <div className="text-right">
                    <span className="text-green-600 font-medium">₹{parseFloat(order.totalAmount).toFixed(0)}</span>
                    <span className="text-gray-400 text-xs ml-2">{order.status}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </GlassCard>
      </div>
    </div>
  );
}
