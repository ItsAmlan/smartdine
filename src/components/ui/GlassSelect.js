"use client";

import { ChevronDown } from "lucide-react";

export default function GlassSelect({
  label,
  name,
  value,
  onChange,
  options = [],
  color = "orange",
  required = false,
  error = "",
  className = "",
  disabled = false,
  placeholder = "Select an option",
}) {
  const focusColors = {
    orange: "focus:border-orange-400 focus:ring-orange-200/60",
    amber: "focus:border-amber-400 focus:ring-amber-200/60",
    red: "focus:border-red-400 focus:ring-red-200/60",
    green: "focus:border-green-400 focus:ring-green-200/60",
    purple: "focus:border-purple-400 focus:ring-purple-200/60",
  };

  return (
    <div className={className}>
      {label && (
        <label
          htmlFor={name}
          className="text-sm font-medium text-gray-700 mb-1.5 block"
        >
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      <div className="relative">
        <select
          id={name}
          name={name}
          value={value}
          onChange={onChange}
          required={required}
          disabled={disabled}
          className={`
            w-full bg-white/70 backdrop-blur-sm border border-white/80
            rounded-xl px-4 py-3 text-gray-900
            outline-none appearance-none cursor-pointer
            transition-all duration-200
            focus:ring-2 ${focusColors[color] || focusColors.orange}
            disabled:opacity-50 disabled:cursor-not-allowed disabled:bg-gray-50/50
            ${error ? "border-red-400" : ""}
          `}
        >
          {placeholder && (
            <option value="" className="text-gray-400">
              {placeholder}
            </option>
          )}
          {options.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
        <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400 pointer-events-none" />
      </div>
      {error && <p className="text-red-500 text-sm mt-1">{error}</p>}
    </div>
  );
}
