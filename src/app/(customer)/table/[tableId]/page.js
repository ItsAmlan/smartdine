"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { use } from "react";
import GlassCard from "@/components/ui/GlassCard";
import GlassInput from "@/components/ui/GlassInput";
import GlassButton from "@/components/ui/GlassButton";
import GlassNavbar from "@/components/ui/GlassNavbar";
import CallStewardButton from "@/components/customer/CallStewardButton";
import OrderStatusTracker from "@/components/customer/OrderStatusTracker";
import { useCart } from "@/context/CartContext";
import { UtensilsCrossed } from "lucide-react";

export default function TablePage({ params }) {
  const { tableId } = use(params);
  const router = useRouter();
  const { setTableId, setCustomer } = useCart();

  const [form, setForm] = useState({ name: "", email: "", phone: "" });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [activeOrder, setActiveOrder] = useState(null);
  const [restaurant, setRestaurant] = useState(null);
  const [checkingOrder, setCheckingOrder] = useState(true);

  useEffect(() => {
    fetch("/api/settings")
      .then((r) => r.json())
      .then((data) => setRestaurant(data.restaurant))
      .catch(() => {});

    const savedEmail = typeof window !== "undefined" ? localStorage.getItem(`smartdine-email-${tableId}`) : null;
    if (savedEmail) {
      fetch("/api/customer/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: "check", email: savedEmail, phone: "0000000000",
          tableId: parseInt(tableId, 10),
        }),
      })
        .then((r) => r.json())
        .then((data) => {
          if (data.activeOrder) setActiveOrder(data.activeOrder);
          setCheckingOrder(false);
        })
        .catch(() => setCheckingOrder(false));
    } else {
      setCheckingOrder(false);
    }
  }, [tableId]);

  const validate = () => {
    const errs = {};
    if (!form.name.trim()) errs.name = "Name is required";
    if (!form.email.trim()) errs.email = "Email is required";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) errs.email = "Invalid email format";
    if (!form.phone.trim()) errs.phone = "Phone number is required";
    else if (form.phone.replace(/\D/g, "").length < 10) errs.phone = "Enter a valid 10-digit phone number";
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);
    try {
      const res = await fetch("/api/customer/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, tableId: parseInt(tableId, 10) }),
      });
      const data = await res.json();
      if (!res.ok) { setErrors({ submit: data.error }); return; }
      localStorage.setItem(`smartdine-email-${tableId}`, form.email);
      localStorage.setItem(`smartdine-customer-id`, data.customer.id);
      setTableId(parseInt(tableId, 10));
      setCustomer(data.customer);
      if (data.activeOrder) router.push(`/order/${data.activeOrder.id}`);
      else router.push(`/table/${tableId}/menu`);
    } catch {
      setErrors({ submit: "Something went wrong. Please try again." });
    } finally {
      setLoading(false);
    }
  };

  const handleNewOrder = () => {
    setTableId(parseInt(tableId, 10));
    router.push(`/table/${tableId}/menu`);
  };

  if (checkingOrder) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-gray-400 flex items-center gap-3">
          <div className="h-6 w-6 border-2 border-orange-400 border-t-transparent rounded-full animate-spin" />
          Loading...
        </div>
      </div>
    );
  }

  return (
    <>
      <GlassNavbar title={restaurant?.name || "SmartDine"} color="orange" logo={restaurant?.logo} />

      <div className="px-5vw py-8 max-w-lg mx-auto">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-orange-100 mb-4">
            <UtensilsCrossed className="h-8 w-8 text-orange-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Welcome to {restaurant?.name || "SmartDine"}
          </h2>
          {restaurant?.tagline && <p className="text-gray-500">{restaurant.tagline}</p>}
        </div>

        {activeOrder && (
          <GlassCard color="orange" className="mb-6">
            <h3 className="text-orange-600 font-semibold mb-3">You have an active order</h3>
            <div className="mb-4">
              <p className="text-gray-600 text-sm mb-1">Order #{activeOrder.orderNumber}</p>
              <OrderStatusTracker status={activeOrder.status} estimatedMinutes={activeOrder.estimatedMinutes} />
            </div>
            <div className="flex gap-3">
              <GlassButton onClick={() => router.push(`/order/${activeOrder.id}`)} color="orange" className="flex-1">View Order</GlassButton>
              <GlassButton onClick={handleNewOrder} variant="secondary" className="flex-1">New Order</GlassButton>
            </div>
          </GlassCard>
        )}

        {!activeOrder && (
          <GlassCard color="orange">
            <h3 className="text-lg font-semibold text-gray-900 mb-1">Get Started</h3>
            <p className="text-gray-500 text-sm mb-6">Enter your details to browse the menu and place an order.</p>

            <form onSubmit={handleSubmit} className="space-y-4">
              <GlassInput label="Full Name" name="name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Enter your name" error={errors.name} required color="orange" />
              <GlassInput label="Email Address" name="email" type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="your@email.com" error={errors.email} required color="orange" />
              <GlassInput label="Mobile Number" name="phone" type="tel" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} placeholder="10-digit mobile number" error={errors.phone} required color="orange" />
              {errors.submit && <p className="text-red-500 text-sm">{errors.submit}</p>}
              <GlassButton type="submit" color="orange" loading={loading} fullWidth>Proceed to Menu</GlassButton>
            </form>
          </GlassCard>
        )}
      </div>

      <CallStewardButton tableId={parseInt(tableId, 10)} />
    </>
  );
}
