"use client";

export default function GlassBadge({
  children,
  variant = "default",
  className = "",
  size = "sm",
}) {
  const variants = {
    default: "bg-gray-100/80 text-gray-700 border-gray-200/80",
    success: "bg-green-50/80 text-green-700 border-green-200/80",
    warning: "bg-amber-50/80 text-amber-700 border-amber-200/80",
    danger: "bg-red-50/80 text-red-700 border-red-200/80",
    info: "bg-blue-50/80 text-blue-700 border-blue-200/80",
    orange: "bg-orange-50/80 text-orange-700 border-orange-200/80",
    purple: "bg-purple-50/80 text-purple-700 border-purple-200/80",
    amber: "bg-amber-50/80 text-amber-700 border-amber-200/80",
    green: "bg-green-50/80 text-green-700 border-green-200/80",
  };

  const sizes = {
    sm: "px-2 py-0.5 text-xs",
    md: "px-3 py-1 text-sm",
  };

  return (
    <span
      className={`
        inline-flex items-center rounded-full border font-medium backdrop-blur-sm
        ${variants[variant] || variants.default}
        ${sizes[size] || sizes.sm}
        ${className}
      `}
    >
      {children}
    </span>
  );
}
