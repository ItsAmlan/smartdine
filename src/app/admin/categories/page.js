"use client";

import { useState, useEffect } from "react";
import { Plus, Pencil, Trash2, GripVertical } from "lucide-react";
import GlassCard from "@/components/ui/GlassCard";
import GlassButton from "@/components/ui/GlassButton";
import GlassInput from "@/components/ui/GlassInput";
import GlassModal from "@/components/ui/GlassModal";
import GlassToggle from "@/components/ui/GlassToggle";

export default function CategoriesPage() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(null);
  const [form, setForm] = useState({ name: "", description: "", sortOrder: "0" });

  const fetchCategories = () => {
    fetch("/api/categories").then((r) => r.json()).then((d) => { setCategories(d.categories || []); setLoading(false); }).catch(() => setLoading(false));
  };
  useEffect(() => { fetchCategories(); }, []);

  const handleSave = async () => {
    try {
      if (modal.mode === "add") { await fetch("/api/categories", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(form) }); }
      else { await fetch("/api/categories", { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id: modal.data.id, ...form }) }); }
      fetchCategories(); setModal(null);
    } catch {}
  };

  const handleDelete = async (id) => {
    if (!confirm("Delete this category? All dishes in it will also be deleted.")) return;
    try { const res = await fetch(`/api/categories?id=${id}`, { method: "DELETE" }); if (res.ok) setCategories((prev) => prev.filter((c) => c.id !== id)); } catch {}
  };

  const toggleActive = async (cat) => {
    try {
      await fetch("/api/categories", { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id: cat.id, active: !cat.active }) });
      setCategories((prev) => prev.map((c) => c.id === cat.id ? { ...c, active: !cat.active } : c));
    } catch {}
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Categories</h1>
        <GlassButton color="green" onClick={() => { setForm({ name: "", description: "", sortOrder: "0" }); setModal({ mode: "add" }); }}>
          <Plus className="h-4 w-4" /> Add Category
        </GlassButton>
      </div>
      {loading ? (
        <div className="text-center py-12 text-gray-400">Loading...</div>
      ) : (
        <div className="space-y-3">
          {categories.map((cat) => (
            <GlassCard key={cat.id} color="green" padding="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <GripVertical className="h-4 w-4 text-gray-300" />
                  <div>
                    <p className="text-gray-900 font-medium">{cat.name}</p>
                    <p className="text-gray-400 text-xs">{cat._count?.dishes || 0} dishes • Order: {cat.sortOrder}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <GlassToggle
                    checked={cat.active}
                    onChange={() => toggleActive(cat)}
                    color="green"
                    label={cat.active ? "Active" : "Hidden"}
                    size="sm"
                  />
                  <button onClick={() => { setForm({ name: cat.name, description: cat.description || "", sortOrder: cat.sortOrder.toString() }); setModal({ mode: "edit", data: cat }); }} className="p-2 text-gray-400 hover:text-green-500"><Pencil className="h-4 w-4" /></button>
                  <button onClick={() => handleDelete(cat.id)} className="p-2 text-gray-400 hover:text-red-500"><Trash2 className="h-4 w-4" /></button>
                </div>
              </div>
            </GlassCard>
          ))}
        </div>
      )}
      <GlassModal isOpen={!!modal} onClose={() => setModal(null)} title={modal?.mode === "add" ? "Add Category" : "Edit Category"} color="green" size="sm">
        <div className="space-y-4">
          <GlassInput label="Name" name="name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required color="green" />
          <GlassInput label="Description" name="description" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} color="green" />
          <GlassInput label="Sort Order" name="sortOrder" type="number" value={form.sortOrder} onChange={(e) => setForm({ ...form, sortOrder: e.target.value })} color="green" />
          <div className="flex gap-3">
            <GlassButton variant="secondary" onClick={() => setModal(null)} className="flex-1">Cancel</GlassButton>
            <GlassButton color="green" onClick={handleSave} className="flex-1">Save</GlassButton>
          </div>
        </div>
      </GlassModal>
    </div>
  );
}
