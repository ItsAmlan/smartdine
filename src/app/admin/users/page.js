"use client";

import { useState, useEffect } from "react";
import { UserRoundSearch, Users } from "lucide-react";
import GlassCard from "@/components/ui/GlassCard";
import GlassInput from "@/components/ui/GlassInput";
import EmptyState from "@/components/ui/EmptyState";

function maskEmail(email) {
  const [local, domain] = email.split("@");
  if (local.length <= 2) return `${local[0]}***@${domain}`;
  return `${local[0]}${"*".repeat(local.length - 2)}${local.slice(-1)}@${domain}`;
}

function maskPhone(phone) {
  if (phone.length <= 4) return "***" + phone;
  return `${"*".repeat(phone.length - 4)}${phone.slice(-4)}`;
}

export default function CustomersPage() {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    fetch("/api/orders?limit=200").then((r) => r.json()).then((data) => {
      const orders = data.orders || [];
      const customerMap = {};
      orders.forEach((order) => {
        const c = order.customer; if (!c) return;
        if (!customerMap[c.id]) customerMap[c.id] = { ...c, orderCount: 0, totalSpent: 0 };
        customerMap[c.id].orderCount++;
        customerMap[c.id].totalSpent += parseFloat(order.totalAmount);
      });
      setCustomers(Object.values(customerMap)); setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  const filtered = customers.filter((c) => c.name.toLowerCase().includes(search.toLowerCase()) || c.email.toLowerCase().includes(search.toLowerCase()));

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
        <Users className="h-6 w-6 text-green-500" /> Registered Customers
      </h1>
      <GlassInput name="search" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search customers..." color="green" className="mb-4" />
      {loading ? (
        <div className="text-center py-12 text-gray-400">Loading...</div>
      ) : filtered.length === 0 ? (
        <EmptyState
          icon={UserRoundSearch}
          eyebrow="Customer directory"
          title={search ? "No matching customers" : "No customers yet"}
          description={search ? "Try a different name or email address." : "Customer details will appear here after their first order."}
          color="green"
        />
      ) : (
        <div className="space-y-3">
          {filtered.map((customer) => (
            <GlassCard key={customer.id} color="green" padding="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-900 font-medium">{customer.name}</p>
                  <p className="text-gray-400 text-xs">{maskEmail(customer.email)} • {maskPhone(customer.phone)}</p>
                </div>
                <div className="text-right">
                  <p className="text-green-600 font-semibold">{customer.orderCount} orders</p>
                  <p className="text-gray-400 text-xs">₹{customer.totalSpent.toFixed(0)} spent</p>
                </div>
              </div>
            </GlassCard>
          ))}
        </div>
      )}
    </div>
  );
}
