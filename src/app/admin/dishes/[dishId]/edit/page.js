"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { use } from "react";
import GlassCard from "@/components/ui/GlassCard";
import GlassInput from "@/components/ui/GlassInput";
import GlassButton from "@/components/ui/GlassButton";
import GlassSelect from "@/components/ui/GlassSelect";

export default function EditDishPage({ params }) {
  const { dishId } = use(params);
  const router = useRouter();
  const [form, setForm] = useState({ name: "", description: "", price: "", categoryId: "", isVeg: true, available: true });
  const [categories, setCategories] = useState([]);
  const [image, setImage] = useState(null);
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    Promise.all([fetch(`/api/dishes/${dishId}`).then((r) => r.json()), fetch("/api/categories").then((r) => r.json())])
      .then(([dishData, catData]) => {
        const d = dishData.dish;
        setForm({ name: d.name, description: d.description || "", price: parseFloat(d.price).toString(), categoryId: d.categoryId.toString(), isVeg: d.isVeg, available: d.available });
        setCategories(catData.categories || []); setFetching(false);
      }).catch(() => setFetching(false));
  }, [dishId]);

  const handleSubmit = async (e) => {
    e.preventDefault(); setLoading(true); setError("");
    try {
      let imageUrl = undefined;
      if (image) {
        const fd = new FormData(); fd.append("file", image);
        const upRes = await fetch("/api/upload", { method: "POST", body: fd });
        const upData = await upRes.json();
        if (upRes.ok) imageUrl = upData.url; else throw new Error(upData.error);
      }
      const body = { ...form, price: parseFloat(form.price), categoryId: parseInt(form.categoryId, 10) };
      if (imageUrl !== undefined) body.image = imageUrl;
      const res = await fetch(`/api/dishes/${dishId}`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
      if (res.ok) router.push("/admin/dishes"); else { const d = await res.json(); setError(d.error); }
    } catch (err) { setError(err.message || "Failed to update dish"); } finally { setLoading(false); }
  };

  if (fetching) return <div className="text-center py-12 text-gray-400">Loading...</div>;

  return (
    <div className="max-w-lg">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Edit Dish</h1>
      <GlassCard color="green">
        <form onSubmit={handleSubmit} className="space-y-4">
          <GlassInput label="Dish Name" name="name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required color="green" />
          <GlassInput label="Description" name="description" type="textarea" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} color="green" />
          <GlassInput label="Price (₹)" name="price" type="number" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} required min="1" color="green" />
          <GlassSelect label="Category" name="categoryId" value={form.categoryId} onChange={(e) => setForm({ ...form, categoryId: e.target.value })} options={categories.map((c) => ({ value: c.id.toString(), label: c.name }))} required color="green" />
          <div>
            <label className="text-sm font-medium text-gray-700 mb-1.5 block">Update Image</label>
            <input type="file" accept="image/jpeg,image/png,image/webp" onChange={(e) => setImage(e.target.files[0])} className="text-gray-600 text-sm" />
          </div>
          <label className="flex items-center gap-2 text-gray-700 text-sm cursor-pointer">
            <input type="checkbox" checked={form.isVeg} onChange={(e) => setForm({ ...form, isVeg: e.target.checked })} className="rounded border-gray-300 text-green-500" /> Vegetarian
          </label>
          <label className="flex items-center gap-2 text-gray-700 text-sm cursor-pointer">
            <input type="checkbox" checked={form.available} onChange={(e) => setForm({ ...form, available: e.target.checked })} className="rounded border-gray-300 text-green-500" /> Available
          </label>
          {error && <p className="text-red-500 text-sm">{error}</p>}
          <div className="flex gap-3">
            <GlassButton type="button" variant="secondary" onClick={() => router.back()} className="flex-1">Cancel</GlassButton>
            <GlassButton type="submit" color="green" loading={loading} className="flex-1">Update Dish</GlassButton>
          </div>
        </form>
      </GlassCard>
    </div>
  );
}
