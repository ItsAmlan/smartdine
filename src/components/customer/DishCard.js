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
      className={`bg-white border border-gray-200 shadow-sm rounded-2xl overflow-hidden transition-all duration-300 ${
        !dish.available ? "opacity-50" : "hover:shadow-md"
      }`}
    >
      <div className="relative h-40 bg-gray-50">
        {dish.image && !imageError ? (
          <Image
            src={dish.image}
            alt={dish.name}
            fill
            className="object-cover"
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
                className="w-full bg-orange-500 hover:bg-orange-600 text-white rounded-xl py-2 text-sm font-semibold transition-colors"
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
