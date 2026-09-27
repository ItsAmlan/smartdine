"use client";

import { ArrowLeft } from "lucide-react";
import Image from "next/image";

export default function GlassNavbar({
  title,
  color = "orange",
  logo = null,
  children,
  showBack = false,
  onBack,
}) {
  const titleColors = {
    orange: "text-orange-600",
    amber: "text-amber-600",
    red: "text-red-600",
    green: "text-green-600",
    purple: "text-purple-600",
  };

  const borderColors = {
    orange: "border-orange-200/50",
    amber: "border-amber-200/50",
    red: "border-red-200/50",
    green: "border-green-200/50",
    purple: "border-purple-200/50",
  };

  return (
    <nav className={`sticky top-0 z-40 w-full bg-white/55 backdrop-blur-3xl backdrop-saturate-150 border-b ${borderColors[color] || borderColors.orange} shadow-[0_8px_30px_rgba(30,41,59,.05)]`}>
      <div className="px-5vw py-3.5 flex items-center justify-between">
        {/* Left side */}
        <div className="flex items-center gap-3">
          {showBack && (
            <button
              onClick={onBack}
              className="text-gray-400 hover:text-gray-600 p-1.5 rounded-lg hover:bg-white/60 transition-colors"
            >
              <ArrowLeft className="h-5 w-5" />
            </button>
          )}
          {logo && (
            <Image
              src={logo}
              alt="Restaurant Logo"
              width={32}
              height={32}
              className="rounded-lg object-cover"
            />
          )}
          <h1
            className={`text-lg font-extrabold tracking-[-0.035em] ${titleColors[color] || titleColors.orange}`}
          >
            {title}
          </h1>
        </div>

        {/* Right side */}
        <div className="flex items-center gap-2">{children}</div>
      </div>
    </nav>
  );
}
