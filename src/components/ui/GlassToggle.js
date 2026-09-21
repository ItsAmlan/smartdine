"use client";

export default function GlassToggle({
  checked = false,
  onChange,
  color = "orange",
  label = "",
  disabled = false,
  size = "md",
}) {
  const trackColors = {
    orange: "bg-orange-500",
    green: "bg-green-500",
    amber: "bg-amber-500",
    red: "bg-red-500",
  };

  const focusColors = {
    orange: "focus-visible:ring-orange-300",
    green: "focus-visible:ring-green-300",
    amber: "focus-visible:ring-amber-300",
    red: "focus-visible:ring-red-300",
  };

  const sizes = {
    sm: { track: "w-9 h-5", thumb: "w-4 h-4", translate: "translate-x-4", offset: "translate-x-0.5" },
    md: { track: "w-11 h-6", thumb: "w-5 h-5", translate: "translate-x-5", offset: "translate-x-0.5" },
  };

  const s = sizes[size] || sizes.md;

  return (
    <label
      className={`inline-flex items-center gap-2.5 ${
        disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer"
      }`}
    >
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        disabled={disabled}
        onClick={onChange}
        className={`
          relative inline-flex items-center shrink-0
          ${s.track} rounded-full
          transition-colors duration-200 ease-in-out
          focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2
          ${focusColors[color] || focusColors.orange}
          ${checked ? trackColors[color] || trackColors.orange : "bg-gray-200"}
          ${disabled ? "cursor-not-allowed" : "cursor-pointer"}
        `}
      >
        <span
          aria-hidden="true"
          className={`
            inline-block ${s.thumb} rounded-full
            bg-white shadow-sm ring-1 ring-black/5
            transition-transform duration-200 ease-in-out
            ${checked ? s.translate : s.offset}
          `}
        />
      </button>
      {label && (
        <span className={`text-sm select-none ${checked ? "text-gray-700 font-medium" : "text-gray-500"}`}>
          {label}
        </span>
      )}
    </label>
  );
}

