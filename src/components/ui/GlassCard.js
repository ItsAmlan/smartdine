"use client";

export default function GlassCard({
  children,
  className = "",
  color = "orange",
  hover = false,
  padding = "p-6",
}) {
  const hoverBorderColors = {
    orange: "hover:border-orange-300/80",
    amber: "hover:border-amber-300/80",
    red: "hover:border-red-300/80",
    green: "hover:border-green-300/80",
    purple: "hover:border-purple-300/80",
  };

  const hoverClasses = hover
    ? `hover:shadow-lg hover:shadow-black/[0.06] transition-all duration-300 cursor-pointer ${hoverBorderColors[color] || hoverBorderColors.orange}`
    : "";

  return (
    <div
      className={`backdrop-blur-xl bg-white/60 border border-white/80 shadow-lg shadow-black/[0.04] ring-1 ring-white/50 rounded-2xl ${padding} ${hoverClasses} ${className}`}
    >
      {children}
    </div>
  );
}
