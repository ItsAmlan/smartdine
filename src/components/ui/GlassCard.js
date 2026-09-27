"use client";

export default function GlassCard({
  children,
  className = "",
  color = "orange",
  hover = false,
  padding = "p-6",
  blurClass = "backdrop-blur-2xl",
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
      className={`relative overflow-hidden ${blurClass} bg-gradient-to-br from-white/80 to-white/45 border border-white/90 shadow-[0_18px_48px_rgba(30,41,59,0.09)] ring-1 ring-white/60 rounded-[1.35rem] ${padding} ${hoverClasses} ${className}`}
    >
      {children}
    </div>
  );
}
