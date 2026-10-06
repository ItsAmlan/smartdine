"use client";

import { useState } from "react";
import { Minus, Plus } from "lucide-react";
import GlassModal from "@/components/ui/GlassModal";
import GlassButton from "@/components/ui/GlassButton";

// The parent remounts this component (via a changing `key`) every time it
// opens for a dish, so plain useState initializers are enough to start
// each customization fresh - no reset-on-open effect needed.
export default function CustomizeModal({ dish, isOpen, onClose, onConfirm }) {
  const [selectedAddonIds, setSelectedAddonIds] = useState([]);
  const [notes, setNotes] = useState("");
  const [quantity, setQuantity] = useState(1);

  if (!dish) return null;

  const addons = dish.addons || [];

  const toggleAddon = (addonId) => {
    setSelectedAddonIds((prev) =>
      prev.includes(addonId) ? prev.filter((id) => id !== addonId) : [...prev, addonId]
    );
  };

  const selectedAddons = addons.filter((a) => selectedAddonIds.includes(a.id));
  const unitTotal = parseFloat(dish.price) + selectedAddons.reduce((sum, a) => sum + parseFloat(a.price), 0);
  const lineTotal = unitTotal * quantity;

  const handleConfirm = () => {
    onConfirm(dish, quantity, selectedAddons, notes);
    onClose();
  };

  return (
    <GlassModal isOpen={isOpen} onClose={onClose} title={dish.name} color="orange" size="sm">
      <div className="space-y-5">
        {addons.length > 0 && (
          <div>
            <p className="text-xs font-bold uppercase tracking-wide text-gray-400 mb-2">Customize</p>
            <div className="space-y-2">
              {addons.map((addon) => (
                <label
                  key={addon.id}
                  className="flex items-center justify-between gap-3 bg-white/50 border border-gray-200 rounded-xl px-3 py-2.5 cursor-pointer"
                >
                  <span className="flex items-center gap-2 text-sm text-gray-700">
                    <input
                      type="checkbox"
                      checked={selectedAddonIds.includes(addon.id)}
                      onChange={() => toggleAddon(addon.id)}
                      className="rounded border-gray-300 text-orange-500 focus:ring-orange-300"
                    />
                    {addon.name}
                  </span>
                  <span className="text-xs font-medium text-gray-500">
                    {parseFloat(addon.price) > 0 ? `+₹${parseFloat(addon.price).toFixed(0)}` : "Free"}
                  </span>
                </label>
              ))}
            </div>
          </div>
        )}

        <div>
          <p className="text-xs font-bold uppercase tracking-wide text-gray-400 mb-2">Special instructions</p>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            maxLength={300}
            rows={2}
            placeholder="e.g. no onions, less spicy"
            className="w-full rounded-xl border border-gray-200 bg-white/50 px-3 py-2 text-sm text-gray-700 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-300"
          />
        </div>

        <div className="flex items-center justify-between">
          <p className="text-xs font-bold uppercase tracking-wide text-gray-400">Quantity</p>
          <div className="flex items-center gap-3 bg-orange-50 border border-orange-200 rounded-xl px-3 py-1.5">
            <button onClick={() => setQuantity((q) => Math.max(1, q - 1))} className="text-orange-600 hover:text-orange-700">
              <Minus className="h-4 w-4" />
            </button>
            <span className="text-gray-900 font-semibold text-sm min-w-[20px] text-center">{quantity}</span>
            <button onClick={() => setQuantity((q) => q + 1)} className="text-orange-600 hover:text-orange-700">
              <Plus className="h-4 w-4" />
            </button>
          </div>
        </div>

        <GlassButton onClick={handleConfirm} color="orange" fullWidth>
          Add to Cart — ₹{lineTotal.toFixed(0)}
        </GlassButton>
      </div>
    </GlassModal>
  );
}
