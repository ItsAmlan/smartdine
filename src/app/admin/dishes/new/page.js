"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import GlassCard from "@/components/ui/GlassCard";
import GlassInput from "@/components/ui/GlassInput";
import GlassButton from "@/components/ui/GlassButton";
import GlassSelect from "@/components/ui/GlassSelect";

export default function NewDishPage() {
  const router = useRouter();
  const [form, setForm] = useState({ name: "", description: "", price: "", categoryId: "", isVeg: true });
  const [categories, setCategories] = useState([]);
  const [image, setImage] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => { fetch("/api/categories").then((r) => r.json()).then((d) => setCategories(d.categories || [])).catch(() => {}); }, []);

  const handleImageUpload = async (file) => {
    const formData = new FormData(); formData.append("file", file);
    const res = await fetch("/api/upload", { method: "POST", body: formData });
    const data = await res.json();
    if (res.ok) return data.url; throw new Error(data.error);
  };

  const handleSubmit = async (e) => {
    e.preventDefault(); setLoading(true); setError("");
    try {
      let imageUrl = null;
      if (image) imageUrl = await handleImageUpload(image);
      const res = await fetch("/api/dishes", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ ...form, price: parseFloat(form.price), categoryId: parseInt(form.categoryId, 10), image: imageUrl }) });
      if (res.ok) router.push("/admin/dishes"); else { const d = await res.json(); setError(d.error); }
    } catch (err) { setError(err.message || "Failed to create dish"); } finally { setLoading(false); }
  };

  return (
    <div className="max-w-lg">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Add New Dish</h1>
      <GlassCard color="green">
        <form onSubmit={handleSubmit} className="space-y-4">
          <GlassInput label="Dish Name" name="name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required color="green" />
          <GlassInput label="Description" name="description" type="textarea" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} color="green" />
          <GlassInput label="Price (₹)" name="price" type="number" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} required min="1" color="green" />
          <GlassSelect label="Category" name="categoryId" value={form.categoryId} onChange={(e) => setForm({ ...form, categoryId: e.target.value })} options={categories.map((c) => ({ value: c.id.toString(), label: c.name }))} required color="green" />
          <div>
            <label className="text-sm font-medium text-gray-700 mb-1.5 block">Dish Image</label>
            <input type="file" accept="image/jpeg,image/png,image/webp" onChange={(e) => setImage(e.target.files[0])} className="text-gray-600 text-sm" />
          </div>
          <label className="flex items-center gap-2 text-gray-700 text-sm cursor-pointer">
            <input type="checkbox" checked={form.isVeg} onChange={(e) => setForm({ ...form, isVeg: e.target.checked })} className="rounded border-gray-300 text-green-500" /> Vegetarian
          </label>
          {error && <p className="text-red-500 text-sm">{error}</p>}
          <div className="flex gap-3">
            <GlassButton type="button" variant="secondary" onClick={() => router.back()} className="flex-1">Cancel</GlassButton>
            <GlassButton type="submit" color="green" loading={loading} className="flex-1">Create Dish</GlassButton>
          </div>
        </form>
      </GlassCard>
    </div>
  );
}
