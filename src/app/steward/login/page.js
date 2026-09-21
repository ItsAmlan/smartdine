"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Bell } from "lucide-react";
import GlassCard from "@/components/ui/GlassCard";
import GlassInput from "@/components/ui/GlassInput";
import GlassButton from "@/components/ui/GlassButton";

export default function StewardLoginPage() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!password) { setError("Please enter your PIN"); return; }

    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: "Steward", password, role: "steward" }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Invalid PIN");
      } else {
        router.push("/steward");
        router.refresh();
      }
    } catch {
      setError("Connection error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-5vw">
      <GlassCard color="red" className="w-full max-w-sm">
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-red-100 mb-4">
            <Bell className="h-8 w-8 text-red-600" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900">Steward Desk</h1>
          <p className="text-gray-500 text-sm">Enter your PIN to continue</p>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <GlassInput label="Steward PIN" name="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Enter PIN" error={error} color="red" required />
          <GlassButton type="submit" color="red" loading={loading} fullWidth>Enter Steward Desk</GlassButton>
        </form>
      </GlassCard>
    </div>
  );
}
