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
    orange: "bg-orange-500 hover:bg-orange-600 focus:ring-orange-300 text-white shadow-orange-500/25",
    amber: "bg-amber-500 hover:bg-amber-600 focus:ring-amber-300 text-white shadow-amber-500/25",
    red: "bg-red-500 hover:bg-red-600 focus:ring-red-300 text-white shadow-red-500/25",
    green: "bg-green-500 hover:bg-green-600 focus:ring-green-300 text-white shadow-green-500/25",
    purple: "bg-purple-500 hover:bg-purple-600 focus:ring-purple-300 text-white shadow-purple-500/25",
  };

  const variants = {
    primary: `${primaryColors[color] || primaryColors.orange} shadow-lg`,
    secondary:
      "backdrop-blur-lg bg-white/70 border border-white/80 text-gray-700 hover:bg-white/90 shadow-sm ring-1 ring-white/50",
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
        rounded-xl px-6 py-3 font-semibold
        transition-all duration-200
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
