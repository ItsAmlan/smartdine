const tones = {
  orange: {
    halo: "bg-orange-400/25",
    tile: "bg-gradient-to-br from-orange-500 to-amber-500 text-white shadow-orange-500/30",
    eyebrow: "text-orange-700",
  },
  amber: {
    halo: "bg-amber-400/25",
    tile: "bg-gradient-to-br from-amber-500 to-orange-500 text-white shadow-amber-500/30",
    eyebrow: "text-amber-800",
  },
  red: {
    halo: "bg-rose-400/25",
    tile: "bg-gradient-to-br from-rose-500 to-red-500 text-white shadow-rose-500/30",
    eyebrow: "text-rose-700",
  },
  green: {
    halo: "bg-emerald-400/25",
    tile: "bg-gradient-to-br from-emerald-500 to-teal-500 text-white shadow-emerald-500/30",
    eyebrow: "text-emerald-700",
  },
};

export default function EmptyState({
  icon: Icon,
  title,
  description,
  eyebrow,
  action,
  color = "orange",
  compact = false,
  className = "",
}) {
  const tone = tones[color] || tones.orange;

  return (
    <section
      aria-live="polite"
      className={`relative isolate overflow-hidden rounded-[1.6rem] border border-white/95 bg-white/65 text-center shadow-[0_18px_48px_rgba(30,41,59,0.14)] ring-1 ring-slate-900/[0.03] backdrop-blur-3xl ${compact ? "px-4 py-5" : "px-6 py-10 sm:px-10 sm:py-12"} ${className}`}
    >
      <div className={`absolute -right-12 -top-16 h-40 w-40 rounded-full blur-3xl ${tone.halo}`} aria-hidden="true" />
      <div className={`absolute -bottom-20 -left-10 h-32 w-32 rounded-full blur-3xl ${tone.halo}`} aria-hidden="true" />

      <div className={`relative mx-auto flex ${compact ? "max-w-sm flex-row items-center gap-4 text-left" : "max-w-md flex-col items-center"}`}>
        {Icon && (
          <div className={`flex shrink-0 items-center justify-center rounded-2xl shadow-lg ring-4 ring-white/75 ${tone.tile} ${compact ? "h-11 w-11" : "mb-5 h-16 w-16"}`}>
            <Icon className={compact ? "h-5 w-5" : "h-7 w-7"} strokeWidth={2.2} aria-hidden="true" />
          </div>
        )}
        <div className={compact ? "min-w-0" : ""}>
          {eyebrow && <p className={`mb-1 text-[10px] font-extrabold uppercase tracking-[0.16em] ${tone.eyebrow}`}>{eyebrow}</p>}
          <h2 className={`${compact ? "text-sm" : "text-lg"} font-extrabold tracking-[-0.025em] text-slate-950`}>{title}</h2>
          {description && <p className={`${compact ? "mt-1 text-xs" : "mt-2 text-sm"} leading-relaxed text-slate-600`}>{description}</p>}
          {action && <div className={compact ? "mt-3" : "mt-5"}>{action}</div>}
        </div>
      </div>
    </section>
  );
}
