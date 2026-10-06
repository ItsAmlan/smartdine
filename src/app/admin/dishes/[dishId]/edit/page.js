"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { use } from "react";
import { Plus, Trash2 } from "lucide-react";
import GlassCard from "@/components/ui/GlassCard";
import GlassInput from "@/components/ui/GlassInput";
import GlassButton from "@/components/ui/GlassButton";
import GlassSelect from "@/components/ui/GlassSelect";
import GlassToggle from "@/components/ui/GlassToggle";

export default function EditDishPage({ params }) {
  const { dishId } = use(params);
  const router = useRouter();
  const [form, setForm] = useState({ name: "", description: "", price: "", categoryId: "", isVeg: true, available: true });
  const [categories, setCategories] = useState([]);
  const [image, setImage] = useState(null);
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [error, setError] = useState("");

  const [addons, setAddons] = useState([]);
  const [addonForm, setAddonForm] = useState({ name: "", price: "" });
  const [addonError, setAddonError] = useState("");
  const [addonSaving, setAddonSaving] = useState(false);

  useEffect(() => {
    Promise.all([
      fetch(`/api/dishes/${dishId}`).then((r) => r.json()),
      fetch("/api/categories").then((r) => r.json()),
      fetch(`/api/dishes/${dishId}/addons`).then((r) => r.json()),
    ])
      .then(([dishData, catData, addonData]) => {
        const d = dishData.dish;
        setForm({ name: d.name, description: d.description || "", price: parseFloat(d.price).toString(), categoryId: d.categoryId.toString(), isVeg: d.isVeg, available: d.available });
        setCategories(catData.categories || []);
        setAddons(addonData.addons || []);
        setFetching(false);
      }).catch(() => setFetching(false));
  }, [dishId]);

  const handleAddAddon = async (e) => {
    e.preventDefault();
    if (!addonForm.name.trim()) { setAddonError("Name is required"); return; }
    setAddonSaving(true); setAddonError("");
    try {
      const res = await fetch(`/api/dishes/${dishId}/addons`, {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: addonForm.name, price: addonForm.price || 0 }),
      });
      const data = await res.json();
      if (res.ok) { setAddons((prev) => [...prev, data.addon]); setAddonForm({ name: "", price: "" }); }
      else setAddonError(data.error || "Failed to add customization");
    } catch { setAddonError("Failed to add customization"); } finally { setAddonSaving(false); }
  };

  const toggleAddonActive = async (addon) => {
    try {
      const res = await fetch(`/api/dishes/${dishId}/addons/${addon.id}`, {
        method: "PUT", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ active: !addon.active }),
      });
      if (res.ok) setAddons((prev) => prev.map((a) => (a.id === addon.id ? { ...a, active: !addon.active } : a)));
    } catch {}
  };

  const handleDeleteAddon = async (addonId) => {
    if (!confirm("Remove this customization option?")) return;
    try {
      const res = await fetch(`/api/dishes/${dishId}/addons/${addonId}`, { method: "DELETE" });
      if (res.ok) setAddons((prev) => prev.filter((a) => a.id !== addonId));
    } catch {}
  };

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

      <GlassCard color="green" className="mt-6">
        <h2 className="text-lg font-bold text-gray-900 mb-1">Customization Options</h2>
        <p className="text-gray-500 text-sm mb-4">Let customers tick extras when ordering this dish — free (₹0) or chargeable.</p>

        {addons.length > 0 && (
          <div className="space-y-2 mb-4">
            {addons.map((addon) => (
              <div key={addon.id} className="flex items-center justify-between bg-white/50 border border-gray-200 rounded-xl px-3 py-2">
                <div>
                  <p className="text-gray-800 text-sm font-medium">{addon.name}</p>
                  <p className="text-gray-400 text-xs">{parseFloat(addon.price) > 0 ? `+₹${parseFloat(addon.price).toFixed(0)}` : "Free"}</p>
                </div>
                <div className="flex items-center gap-3">
                  <GlassToggle checked={addon.active} onChange={() => toggleAddonActive(addon)} color="green" size="sm" label={addon.active ? "Active" : "Hidden"} />
                  <button onClick={() => handleDeleteAddon(addon.id)} className="p-1.5 text-gray-400 hover:text-red-500"><Trash2 className="h-4 w-4" /></button>
                </div>
              </div>
            ))}
          </div>
        )}

        <form onSubmit={handleAddAddon} className="flex gap-2 items-end">
          <GlassInput label="Name" name="addonName" value={addonForm.name} onChange={(e) => setAddonForm({ ...addonForm, name: e.target.value })} placeholder="e.g. Extra Cheese" color="green" className="flex-1" />
          <GlassInput label="Price (₹, 0 = free)" name="addonPrice" type="number" min="0" value={addonForm.price} onChange={(e) => setAddonForm({ ...addonForm, price: e.target.value })} placeholder="0" color="green" />
          <GlassButton type="submit" color="green" loading={addonSaving}><Plus className="h-4 w-4" /> Add</GlassButton>
        </form>
        {addonError && <p className="text-red-500 text-sm mt-2">{addonError}</p>}
      </GlassCard>
    </div>
  );
}
