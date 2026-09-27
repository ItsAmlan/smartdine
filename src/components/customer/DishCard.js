"use client";

import Image from "next/image";
import { Plus, Minus, Package } from "lucide-react";
import { useState } from "react";
import GlassBadge from "@/components/ui/GlassBadge";

export default function DishCard({ dish, cartItem, onAdd, onUpdateQuantity, onToggleTakeaway }) {
  const [imageError, setImageError] = useState(false);
  const quantity = cartItem?.quantity || 0;
  const forTakeaway = cartItem?.forTakeaway || false;

  return (
    <div
      className={`group relative bg-white/68 backdrop-blur-2xl border border-white/90 shadow-[0_14px_34px_rgba(30,41,59,.08)] rounded-[1.35rem] overflow-hidden transition-all duration-300 ${
        !dish.available ? "opacity-50" : "hover:-translate-y-1 hover:shadow-[0_22px_42px_rgba(30,41,59,.15)]"
      }`}
    >
      <div className="relative h-40 bg-gradient-to-br from-orange-50 to-amber-100 overflow-hidden">
        {dish.image && !imageError ? (
          <Image
            src={dish.image}
            alt={dish.name}
            fill
            className="object-cover transition-transform duration-500 group-hover:scale-105"
            onError={() => setImageError(true)}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-300">
            <span className="text-4xl">🍽️</span>
          </div>
        )}
        {!dish.available && (
          <div className="absolute inset-0 bg-white/60 flex items-center justify-center">
            <GlassBadge variant="danger" size="md">Unavailable</GlassBadge>
          </div>
        )}
        <div className="absolute top-2 left-2">
          <span
            className={`inline-block w-4 h-4 rounded-full border-2 ${
              dish.isVeg ? "border-green-500 bg-green-100" : "border-red-500 bg-red-100"
            }`}
          />
        </div>
      </div>

      <div className="p-4">
        <div className="flex items-start justify-between mb-1">
          <h3 className="text-gray-900 font-semibold text-sm leading-tight">{dish.name}</h3>
          <span className="text-orange-600 font-bold text-sm whitespace-nowrap ml-2">
            ₹{parseFloat(dish.price).toFixed(0)}
          </span>
        </div>

        {dish.description && (
          <p className="text-gray-400 text-xs leading-relaxed mb-3 line-clamp-2">{dish.description}</p>
        )}

        {dish.available && (
          <div className="space-y-2">
            {quantity === 0 ? (
              <button
                onClick={() => onAdd(dish)}
                className="w-full bg-gradient-to-br from-orange-400 to-orange-600 hover:from-orange-500 hover:to-orange-700 text-white rounded-xl py-2.5 text-sm font-bold shadow-lg shadow-orange-500/20 transition-all hover:shadow-orange-500/30"
              >
                ADD
              </button>
            ) : (
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3 bg-orange-50 border border-orange-200 rounded-xl px-3 py-1">
                  <button onClick={() => onUpdateQuantity(dish.id, quantity - 1, forTakeaway)} className="text-orange-600 hover:text-orange-700">
                    <Minus className="h-4 w-4" />
                  </button>
                  <span className="text-gray-900 font-semibold text-sm min-w-[20px] text-center">{quantity}</span>
                  <button onClick={() => onUpdateQuantity(dish.id, quantity + 1, forTakeaway)} className="text-orange-600 hover:text-orange-700">
                    <Plus className="h-4 w-4" />
                  </button>
                </div>
                <span className="text-orange-600 font-semibold text-sm">
                  ₹{(parseFloat(dish.price) * quantity).toFixed(0)}
                </span>
              </div>
            )}

            {quantity > 0 && (
              <label className="flex items-center gap-2 cursor-pointer text-xs text-gray-500">
                <input type="checkbox" checked={forTakeaway} onChange={() => onToggleTakeaway(dish.id, forTakeaway)}
                  className="rounded border-gray-300 text-orange-500 focus:ring-orange-300" />
                <Package className="h-3 w-3" /> Pack for takeaway
              </label>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
