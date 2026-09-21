"use client";

export default function AnimatedBackground({ color = "orange" }) {
  const palettes = {
    orange: {
      base: "from-orange-50/80 via-white/60 to-amber-50/70",
      orbs: [
        { bg: "bg-orange-300/40", size: "w-72 h-72", pos: "top-[-5%] left-[-8%]", anim: "float-1", dur: "25s" },
        { bg: "bg-amber-200/35", size: "w-96 h-96", pos: "top-[30%] right-[-12%]", anim: "float-2", dur: "30s" },
        { bg: "bg-orange-200/30", size: "w-80 h-80", pos: "bottom-[-10%] left-[20%]", anim: "float-3", dur: "22s" },
        { bg: "bg-amber-300/25", size: "w-64 h-64", pos: "top-[60%] left-[50%]", anim: "float-4", dur: "28s" },
      ],
    },
    green: {
      base: "from-green-50/80 via-white/60 to-emerald-50/70",
      orbs: [
        { bg: "bg-green-300/40", size: "w-72 h-72", pos: "top-[-5%] right-[-8%]", anim: "float-1", dur: "26s" },
        { bg: "bg-emerald-200/35", size: "w-96 h-96", pos: "top-[40%] left-[-12%]", anim: "float-2", dur: "32s" },
        { bg: "bg-teal-200/30", size: "w-80 h-80", pos: "bottom-[-8%] right-[15%]", anim: "float-3", dur: "24s" },
        { bg: "bg-green-200/25", size: "w-64 h-64", pos: "top-[20%] left-[40%]", anim: "float-4", dur: "29s" },
      ],
    },
    amber: {
      base: "from-amber-50/80 via-white/60 to-yellow-50/70",
      orbs: [
        { bg: "bg-amber-300/40", size: "w-72 h-72", pos: "top-[-6%] left-[10%]", anim: "float-1", dur: "24s" },
        { bg: "bg-yellow-200/35", size: "w-96 h-96", pos: "top-[35%] right-[-10%]", anim: "float-2", dur: "28s" },
        { bg: "bg-amber-200/30", size: "w-80 h-80", pos: "bottom-[-12%] left-[-5%]", anim: "float-3", dur: "20s" },
        { bg: "bg-yellow-300/25", size: "w-64 h-64", pos: "top-[55%] left-[45%]", anim: "float-4", dur: "26s" },
      ],
    },
    red: {
      base: "from-red-50/80 via-white/60 to-rose-50/70",
      orbs: [
        { bg: "bg-red-300/40", size: "w-72 h-72", pos: "top-[-4%] right-[5%]", anim: "float-1", dur: "27s" },
        { bg: "bg-rose-200/35", size: "w-96 h-96", pos: "top-[45%] left-[-10%]", anim: "float-2", dur: "31s" },
        { bg: "bg-red-200/30", size: "w-80 h-80", pos: "bottom-[-10%] right-[20%]", anim: "float-3", dur: "23s" },
        { bg: "bg-rose-300/25", size: "w-64 h-64", pos: "top-[15%] left-[35%]", anim: "float-4", dur: "33s" },
      ],
    },
  };

  const palette = palettes[color] || palettes.orange;

  return (
    <div
      className={`fixed inset-0 -z-10 overflow-hidden bg-gradient-to-br ${palette.base}`}
      aria-hidden="true"
    >
      {palette.orbs.map((orb, i) => (
        <div
          key={i}
          className={`absolute ${orb.size} ${orb.pos} ${orb.bg} rounded-full blur-3xl`}
          style={{
            animation: `${orb.anim} ${orb.dur} ease-in-out infinite`,
            willChange: "transform",
          }}
        />
      ))}
    </div>
  );
}

