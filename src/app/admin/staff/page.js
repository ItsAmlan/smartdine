"use client";

import { useState, useEffect } from "react";
import { KeyRound, ShieldCheck, ChefHat, ConciergeBell, Lock } from "lucide-react";
import GlassCard from "@/components/ui/GlassCard";
import GlassButton from "@/components/ui/GlassButton";
import GlassInput from "@/components/ui/GlassInput";
import GlassModal from "@/components/ui/GlassModal";
import GlassBadge from "@/components/ui/GlassBadge";
import EmptyState from "@/components/ui/EmptyState";

const roleMeta = {
  admin: { label: "Admin", icon: ShieldCheck },
  kitchen: { label: "Kitchen", icon: ChefHat },
  steward: { label: "Steward", icon: ConciergeBell },
};

export default function StaffPage() {
  const [staff, setStaff] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(null);
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState("");

  const fetchStaff = () => {
    fetch("/api/staff")
      .then((r) => r.json())
      .then((d) => { setStaff(d.staff || []); setLoading(false); })
      .catch(() => setLoading(false));
  };
  useEffect(() => { fetchStaff(); }, []);

  const openModal = (member) => {
    setModal(member);
    setPassword("");
    setConfirm("");
    setError("");
  };

  const handleSave = async () => {
    if (password.length < 4) { setError("Password must be at least 4 characters"); return; }
    if (password !== confirm) { setError("Passwords do not match"); return; }
    setSaving(true);
    setError("");
    try {
      const res = await fetch(`/api/staff/${modal.id}/password`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ newPassword: password }),
      });
      const data = await res.json();
      if (res.ok) {
        setModal(null);
        setSuccess(`Password updated for ${modal.name}`);
        setTimeout(() => setSuccess(""), 3000);
        fetchStaff();
      } else {
        setError(data.error || "Failed to update password");
      }
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-2 flex items-center gap-2">
        <KeyRound className="h-6 w-6 text-green-500" /> Staff Accounts
      </h1>
      <p className="text-gray-500 text-sm mb-6">
        Kitchen and steward staff have no way to change their own password — only an admin can reset one here.
      </p>

      {success && (
        <div className="bg-green-50/80 backdrop-blur-sm border border-green-200/80 rounded-xl px-4 py-2 mb-4">
          <p className="text-green-600 text-sm">{success}</p>
        </div>
      )}

      {loading ? (
        <div className="text-center py-12 text-gray-400">Loading...</div>
      ) : staff.length === 0 ? (
        <EmptyState
          icon={KeyRound}
          eyebrow="Staff accounts"
          title="No staff accounts yet"
          description="Staff accounts are created by seeding the database. See the README for details."
          color="green"
        />
      ) : (
        <div className="space-y-3">
          {staff.map((member) => {
            const meta = roleMeta[member.role] || { label: member.role, icon: KeyRound };
            const Icon = meta.icon;
            const locked = member.lockedUntil && new Date(member.lockedUntil) > new Date();
            return (
              <GlassCard key={member.id} color="green" padding="p-4">
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-green-500/10 text-green-600">
                      <Icon className="h-5 w-5" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-gray-900 font-medium truncate">{member.name}</p>
                      <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                        <GlassBadge variant="default" size="sm">{meta.label}</GlassBadge>
                        {!member.active && <GlassBadge variant="danger" size="sm">Inactive</GlassBadge>}
                        {locked && (
                          <GlassBadge variant="danger" size="sm">
                            <Lock className="h-3 w-3" /> Locked
                          </GlassBadge>
                        )}
                      </div>
                    </div>
                  </div>
                  <GlassButton onClick={() => openModal(member)} variant="secondary" className="text-sm px-4 py-2 shrink-0">
                    <KeyRound className="h-4 w-4" /> Change Password
                  </GlassButton>
                </div>
              </GlassCard>
            );
          })}
        </div>
      )}

      <GlassModal isOpen={!!modal} onClose={() => setModal(null)} title={`Change Password — ${modal?.name || ""}`} color="green" size="sm">
        <p className="text-gray-500 text-sm mb-4">
          Set a new password for {modal?.name}. They will need it the next time they sign in, and any existing lockout will be cleared.
        </p>
        <div className="space-y-4">
          <GlassInput label="New Password" name="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} color="green" required />
          <GlassInput label="Confirm Password" name="confirm" type="password" value={confirm} onChange={(e) => setConfirm(e.target.value)} color="green" required />
          {error && <p className="text-red-500 text-sm">{error}</p>}
          <div className="flex gap-3">
            <GlassButton variant="secondary" onClick={() => setModal(null)} className="flex-1">Cancel</GlassButton>
            <GlassButton color="green" onClick={handleSave} loading={saving} className="flex-1">Save</GlassButton>
          </div>
        </div>
      </GlassModal>
    </div>
  );
}
