"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Shield } from "lucide-react";
import GlassCard from "@/components/ui/GlassCard";
import GlassInput from "@/components/ui/GlassInput";
import GlassButton from "@/components/ui/GlassButton";
import AnimatedBackground from "@/components/ui/AnimatedBackground";

export default function AdminLoginPage() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!password) { setError("Password is required"); return; }
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: "Admin", password, role: "admin" }),
      });
      const data = await res.json();
      if (!res.ok) setError(data.error || "Invalid credentials");
      else { router.push("/admin"); router.refresh(); }
    } catch { setError("Connection error"); }
    finally { setLoading(false); }
  };

  return (
    <div className="min-h-screen relative flex items-center justify-center px-5vw">
      <AnimatedBackground color="green" />
      <GlassCard color="green" className="w-full max-w-sm">
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-green-100/80 mb-4">
            <Shield className="h-8 w-8 text-green-600" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900">Admin Panel</h1>
          <p className="text-gray-500 text-sm">Enter your password to continue</p>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <GlassInput label="Password" name="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Enter admin password" error={error} color="green" required />
          <GlassButton type="submit" color="green" loading={loading} fullWidth>Sign In</GlassButton>
        </form>
      </GlassCard>
    </div>
  );
}
