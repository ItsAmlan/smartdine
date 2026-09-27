"use client";

import { Loader2 } from "lucide-react";

export default function GlassButton({
  children,
  onClick,
  className = "",
  variant = "primary",
  color = "orange",
  loading = false,
  disabled = false,
  type = "button",
  fullWidth = false,
}) {
  const primaryColors = {
    orange: "bg-gradient-to-br from-orange-400 to-orange-600 hover:from-orange-500 hover:to-orange-700 focus:ring-orange-300 text-white shadow-orange-500/30",
    amber: "bg-gradient-to-br from-amber-400 to-amber-600 hover:from-amber-500 hover:to-amber-700 focus:ring-amber-300 text-white shadow-amber-500/30",
    red: "bg-gradient-to-br from-rose-400 to-red-600 hover:from-rose-500 hover:to-red-700 focus:ring-red-300 text-white shadow-red-500/30",
    green: "bg-gradient-to-br from-emerald-400 to-emerald-600 hover:from-emerald-500 hover:to-emerald-700 focus:ring-emerald-300 text-white shadow-emerald-500/30",
    purple: "bg-purple-500 hover:bg-purple-600 focus:ring-purple-300 text-white shadow-purple-500/25",
  };

  const variants = {
    primary: `${primaryColors[color] || primaryColors.orange} shadow-lg`,
    secondary:
      "backdrop-blur-xl bg-white/65 border border-white/90 text-gray-700 hover:bg-white/90 shadow-[0_8px_20px_rgba(30,41,59,.07)] ring-1 ring-white/60",
    ghost: "text-gray-600 hover:bg-white/50",
    danger: "bg-red-500 hover:bg-red-600 text-white shadow-lg shadow-red-500/25 focus:ring-red-300",
  };

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled || loading}
      className={`
        inline-flex items-center justify-center gap-2
        rounded-xl px-6 py-3 font-semibold tracking-[-0.01em]
        transition-all duration-200 hover:-translate-y-0.5 active:translate-y-0
        focus:outline-none focus:ring-2
        disabled:opacity-50 disabled:cursor-not-allowed
        ${variants[variant] || variants.primary}
        ${fullWidth ? "w-full" : ""}
        ${className}
      `}
    >
      {loading && <Loader2 className="h-5 w-5 animate-spin" />}
      {children}
    </button>
  );
}
