"use client";

import { useEffect, useCallback, useState, useRef } from "react";
import { X } from "lucide-react";

export default function GlassModal({
  isOpen,
  onClose,
  title,
  children,
  color = "orange",
  size = "md",
}) {
  const sizeClasses = {
    sm: "max-w-sm",
    md: "max-w-md",
    lg: "max-w-lg",
    xl: "max-w-xl",
  };

  const titleColors = {
    orange: "text-orange-600",
    amber: "text-amber-600",
    red: "text-red-600",
    green: "text-green-600",
    purple: "text-purple-600",
  };

  // Animation state: 'closed' | 'entering' | 'open' | 'leaving'
  const [phase, setPhase] = useState("closed");
  const timeoutRef = useRef(null);

  useEffect(() => {
    if (isOpen) {
      // Mount immediately, then trigger enter animation on next frame
      setPhase("entering");
      timeoutRef.current = requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          setPhase("open");
        });
      });
    } else if (phase === "open" || phase === "entering") {
      // Start exit animation, then unmount after transition
      setPhase("leaving");
      timeoutRef.current = setTimeout(() => {
        setPhase("closed");
      }, 200); // match transition duration
    }
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
        cancelAnimationFrame(timeoutRef.current);
      }
    };
  }, [isOpen]);

  const handleEscape = useCallback(
    (e) => {
      if (e.key === "Escape") onClose();
    },
    [onClose]
  );

  useEffect(() => {
    if (phase !== "closed") {
      document.addEventListener("keydown", handleEscape);
      document.body.style.overflow = "hidden";
    }
    return () => {
      document.removeEventListener("keydown", handleEscape);
      if (phase === "closed") {
        document.body.style.overflow = "";
      }
    };
  }, [phase, handleEscape]);

  // Don't render anything when fully closed
  if (phase === "closed") return null;

  const isVisible = phase === "open";

  return (
    <div
      className={`
        fixed inset-0 z-50 flex items-center justify-center p-4
        transition-all duration-200 ease-out
        ${isVisible ? "bg-black/25 backdrop-blur-sm" : "bg-black/0 backdrop-blur-0"}
      `}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        className={`
          backdrop-blur-2xl bg-white/80 border border-white/60
          rounded-2xl shadow-2xl shadow-black/[0.08] ring-1 ring-white/50
          w-full ${sizeClasses[size] || sizeClasses.md}
          overflow-hidden
          transition-all duration-200 ease-out
          ${isVisible
            ? "opacity-100 scale-100 translate-y-0"
            : "opacity-0 scale-95 translate-y-2"
          }
        `}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/40">
          <h3
            className={`text-lg font-semibold ${titleColors[color] || titleColors.orange}`}
          >
            {title}
          </h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors p-1 rounded-lg hover:bg-white/60"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Body */}
        <div className="px-6 py-4">{children}</div>
      </div>
    </div>
  );
}
