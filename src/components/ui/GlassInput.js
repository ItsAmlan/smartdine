"use client";

export default function GlassInput({
  label,
  name,
  type = "text",
  value,
  onChange,
  placeholder = "",
  error = "",
  required = false,
  color = "orange",
  disabled = false,
  className = "",
  min,
  max,
  rows = 4,
}) {
  const focusColors = {
    orange: "focus:border-orange-400 focus:ring-orange-200/60",
    amber: "focus:border-amber-400 focus:ring-amber-200/60",
    red: "focus:border-red-400 focus:ring-red-200/60",
    green: "focus:border-green-400 focus:ring-green-200/60",
    purple: "focus:border-purple-400 focus:ring-purple-200/60",
  };

  const inputClasses = `
    w-full bg-white/70 backdrop-blur-sm border border-white/80
    rounded-xl px-4 py-3 text-gray-900 placeholder-gray-400
    outline-none transition-all duration-200
    focus:ring-2 ${focusColors[color] || focusColors.orange}
    disabled:opacity-50 disabled:cursor-not-allowed disabled:bg-gray-50/50
    ${error ? "border-red-400" : ""}
  `;

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
      {type === "textarea" ? (
        <textarea
          id={name}
          name={name}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          required={required}
          disabled={disabled}
          rows={rows}
          className={`${inputClasses} resize-none`}
        />
      ) : (
        <input
          id={name}
          name={name}
          type={type}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          required={required}
          disabled={disabled}
          min={min}
          max={max}
          className={inputClasses}
        />
      )}
      {error && <p className="text-red-500 text-sm mt-1">{error}</p>}
    </div>
  );
}
