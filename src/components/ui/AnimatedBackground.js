"use client";

const backgrounds = {
  orange: { avif: "/backgrounds/customer.avif", fallback: "/backgrounds/customer-atmosphere.svg" },
  amber: { avif: "/backgrounds/kitchen.avif", fallback: "/backgrounds/kitchen-atmosphere.svg" },
  red: { avif: "/backgrounds/steward.avif", fallback: "/backgrounds/steward-atmosphere.svg" },
};

export default function AnimatedBackground({ color = "orange", className = "-z-10" }) {
  const background = backgrounds[color] || backgrounds.orange;

  return (
    <div className={`pointer-events-none fixed inset-0 overflow-hidden bg-[#fbf8f5] ${className}`} aria-hidden="true">
      <picture>
        <source srcSet={background.avif} type="image/avif" />
        <img
          src={background.fallback}
          alt=""
          className="h-full w-full object-cover"
          decoding="async"
        />
      </picture>
    </div>
  );
}
