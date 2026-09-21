"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Plus, Pencil, Trash2 } from "lucide-react";
import GlassCard from "@/components/ui/GlassCard";
import GlassButton from "@/components/ui/GlassButton";
import GlassInput from "@/components/ui/GlassInput";
import GlassToggle from "@/components/ui/GlassToggle";

export default function DishesPage() {
  const [dishes, setDishes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    fetch("/api/dishes").then((r) => r.json()).then((data) => { setDishes(data.dishes || []); setLoading(false); }).catch(() => setLoading(false));
  }, []);

  const handleDelete = async (id) => {
    if (!confirm("Are you sure you want to delete this dish?")) return;
    try { const res = await fetch(`/api/dishes/${id}`, { method: "DELETE" }); if (res.ok) setDishes((prev) => prev.filter((d) => d.id !== id)); } catch {}
  };

  const toggleAvailability = async (id, available) => {
    try {
      await fetch(`/api/dishes/${id}/availability`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ available: !available }) });
      setDishes((prev) => prev.map((d) => d.id === id ? { ...d, available: !available } : d));
    } catch {}
  };

  const filtered = dishes.filter((d) => d.name.toLowerCase().includes(search.toLowerCase()) || d.category?.name.toLowerCase().includes(search.toLowerCase()));

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Dishes</h1>
        <Link href="/admin/dishes/new"><GlassButton color="green"><Plus className="h-4 w-4" /> Add Dish</GlassButton></Link>
      </div>
      <GlassInput name="search" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search dishes..." color="green" className="mb-4" />
      {loading ? (
        <div className="text-center py-12 text-gray-400">Loading...</div>
      ) : (
        <div className="space-y-3">
          {filtered.map((dish) => (
            <GlassCard key={dish.id} color="green" padding="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3 flex-1">
                  <span className={`w-3 h-3 rounded-full ${dish.isVeg ? "bg-green-500" : "bg-red-500"}`} />
                  <div>
                    <p className="text-gray-900 font-medium">{dish.name}</p>
                    <p className="text-gray-400 text-xs">{dish.category?.name} • ₹{parseFloat(dish.price).toFixed(0)}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <GlassToggle
                    checked={dish.available}
                    onChange={() => toggleAvailability(dish.id, dish.available)}
                    color="green"
                    size="sm"
                  />
                  <Link href={`/admin/dishes/${dish.id}/edit`}><button className="p-2 text-gray-400 hover:text-green-500 transition-colors"><Pencil className="h-4 w-4" /></button></Link>
                  <button onClick={() => handleDelete(dish.id)} className="p-2 text-gray-400 hover:text-red-500 transition-colors"><Trash2 className="h-4 w-4" /></button>
                </div>
              </div>
            </GlassCard>
          ))}
        </div>
      )}
    </div>
  );
}
