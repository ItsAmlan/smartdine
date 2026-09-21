"use client";

import { useState, useEffect } from "react";
import { Upload, Save } from "lucide-react";
import Image from "next/image";
import GlassCard from "@/components/ui/GlassCard";
import GlassInput from "@/components/ui/GlassInput";
import GlassButton from "@/components/ui/GlassButton";

export default function SettingsPage() {
  const [form, setForm] = useState({ name: "", tagline: "" });
  const [logo, setLogo] = useState(null);
  const [currentLogo, setCurrentLogo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    fetch("/api/settings").then((r) => r.json()).then((data) => {
      if (data.restaurant) { setForm({ name: data.restaurant.name || "", tagline: data.restaurant.tagline || "" }); setCurrentLogo(data.restaurant.logo); }
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  const handleSave = async (e) => {
    e.preventDefault(); setSaving(true); setError(""); setSuccess("");
    try {
      let logoUrl = undefined;
      if (logo) {
        const fd = new FormData(); fd.append("file", logo);
        const upRes = await fetch("/api/upload", { method: "POST", body: fd });
        const upData = await upRes.json();
        if (upRes.ok) logoUrl = upData.url; else throw new Error(upData.error);
      }
      const body = { name: form.name, tagline: form.tagline };
      if (logoUrl !== undefined) body.logo = logoUrl;
      const res = await fetch("/api/settings", { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
      if (res.ok) {
        const data = await res.json(); setCurrentLogo(data.restaurant.logo); setLogo(null);
        setSuccess("Settings saved successfully!"); setTimeout(() => setSuccess(""), 3000);
      } else { const d = await res.json(); setError(d.error); }
    } catch (err) { setError(err.message || "Failed to save settings"); } finally { setSaving(false); }
  };

  if (loading) return <div className="text-center py-12 text-gray-400">Loading...</div>;

  return (
    <div className="max-w-lg">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Restaurant Settings</h1>
      <GlassCard color="green">
        <form onSubmit={handleSave} className="space-y-6">
          <div>
            <label className="text-sm font-medium text-gray-700 mb-3 block">Restaurant Logo</label>
            <div className="flex items-center gap-4">
              {(currentLogo || logo) && (
                <div className="w-20 h-20 rounded-xl overflow-hidden bg-white/40 backdrop-blur-sm flex-shrink-0">
                  <Image src={logo ? URL.createObjectURL(logo) : currentLogo} alt="Logo" width={80} height={80} className="w-full h-full object-cover" />
                </div>
              )}
              <div>
                <label className="cursor-pointer inline-flex items-center gap-2 bg-white/50 hover:bg-white/70 backdrop-blur-sm border border-white/80 rounded-xl px-4 py-2 text-gray-700 text-sm transition-colors">
                  <Upload className="h-4 w-4" /> {currentLogo ? "Change Logo" : "Upload Logo"}
                  <input type="file" accept="image/jpeg,image/png,image/webp" onChange={(e) => setLogo(e.target.files[0])} className="hidden" />
                </label>
                <p className="text-gray-400 text-xs mt-1">JPEG, PNG, or WebP. Max 5MB.</p>
              </div>
            </div>
          </div>
          <GlassInput label="Restaurant Name" name="name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required color="green" />
          <GlassInput label="Tagline" name="tagline" value={form.tagline} onChange={(e) => setForm({ ...form, tagline: e.target.value })} placeholder="Dine Smart, Dine Digital" color="green" />
          {error && <div className="bg-red-50/80 backdrop-blur-sm border border-red-200/80 rounded-xl px-4 py-2"><p className="text-red-600 text-sm">{error}</p></div>}
          {success && <div className="bg-green-50/80 backdrop-blur-sm border border-green-200/80 rounded-xl px-4 py-2"><p className="text-green-600 text-sm">{success}</p></div>}
          <GlassButton type="submit" color="green" loading={saving} fullWidth><Save className="h-4 w-4" /> Save Settings</GlassButton>
        </form>
      </GlassCard>
    </div>
  );
}
