"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { use } from "react";
import { ShoppingCart, UtensilsCrossed } from "lucide-react";
import GlassNavbar from "@/components/ui/GlassNavbar";
import DishCard from "@/components/customer/DishCard";
import CategoryTabs from "@/components/customer/CategoryTabs";
import CallStewardButton from "@/components/customer/CallStewardButton";
import CustomizeModal from "@/components/customer/CustomizeModal";
import EmptyState from "@/components/ui/EmptyState";
import { useCart } from "@/context/CartContext";

export default function MenuPage({ params }) {
  const { tableId } = use(params);
  const router = useRouter();
  const { items, addItem, updateQuantity, toggleTakeaway, totalItems, totalAmount, setTableId } = useCart();

  const [categories, setCategories] = useState([]);
  const [activeCategory, setActiveCategory] = useState(null);
  const [loading, setLoading] = useState(true);
  const [restaurant, setRestaurant] = useState(null);
  const [customizeDish, setCustomizeDish] = useState(null);
  const [customizeNonce, setCustomizeNonce] = useState(0);

  useEffect(() => {
    setTableId(parseInt(tableId, 10));
    Promise.all([
      fetch("/api/menu").then((r) => r.json()),
      fetch("/api/settings").then((r) => r.json()),
    ])
      .then(([menuData, settingsData]) => {
        setCategories(menuData.categories || []);
        setRestaurant(settingsData.restaurant);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [tableId, setTableId]);

  const getCartItem = (dishId) => items.find((item) => item.dish.id === dishId && item.addons.length === 0 && !item.notes);

  const handleCustomizeConfirm = (dish, quantity, selectedAddons, notes) => {
    addItem(dish, quantity, false, selectedAddons, notes);
  };

  const filteredDishes = activeCategory
    ? categories.filter((c) => c.id === activeCategory).flatMap((c) => c.dishes)
    : categories.flatMap((c) => c.dishes);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-gray-400 flex items-center gap-3">
          <div className="h-6 w-6 border-2 border-orange-400 border-t-transparent rounded-full animate-spin" />
          Loading menu...
        </div>
      </div>
    );
  }

  return (
    <>
      <GlassNavbar title={restaurant?.name || "SmartDine"} color="orange" logo={restaurant?.logo} showBack onBack={() => router.push(`/table/${tableId}`)} />

      <div className="px-5vw py-6">
        <div className="mb-6 max-w-xl">
          <p className="text-orange-600/80 text-[11px] font-bold uppercase tracking-[0.18em] mb-1">Curated for your table</p>
          <h2 className="text-2xl font-extrabold tracking-[-0.04em] text-gray-900">Choose something memorable.</h2>
        </div>
        <div className="mb-6">
          <CategoryTabs categories={categories} activeCategory={activeCategory} onSelect={setActiveCategory} />
        </div>

        {activeCategory && (
          <h2 className="text-gray-900 font-bold text-lg mb-4">
            {categories.find((c) => c.id === activeCategory)?.name}
          </h2>
        )}

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 pb-24">
          {filteredDishes.map((dish) => (
            <DishCard
              key={dish.id}
              dish={dish}
              cartItem={getCartItem(dish.id)}
              onAdd={(d) => addItem(d, 1, false)}
              onUpdateQuantity={updateQuantity}
              onToggleTakeaway={toggleTakeaway}
              onCustomize={(d) => { setCustomizeDish(d); setCustomizeNonce((n) => n + 1); }}
            />
          ))}
        </div>

        {filteredDishes.length === 0 && (
          <EmptyState
            icon={UtensilsCrossed}
            eyebrow="Menu selection"
            title="Nothing to savour here yet"
            description="Try another category, or ask your server about today’s specials."
            color="orange"
          />
        )}
      </div>

      {totalItems > 0 && (
        <div className="fixed bottom-0 left-0 right-0 z-40 bg-white/65 backdrop-blur-3xl border-t border-white/90 shadow-[0_-12px_35px_rgba(30,41,59,.08)] px-5vw py-4">
          <button
            onClick={() => router.push("/checkout")}
            className="w-full bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white rounded-2xl py-3.5 shadow-xl shadow-orange-500/20 font-semibold transition-colors flex items-center justify-between px-6 shadow-lg"
          >
            <div className="flex items-center gap-2">
              <ShoppingCart className="h-5 w-5" />
              <span>{totalItems} {totalItems === 1 ? "item" : "items"}</span>
            </div>
            <span>₹{totalAmount.toFixed(0)} →</span>
          </button>
        </div>
      )}

      <CallStewardButton tableId={parseInt(tableId, 10)} />

      <CustomizeModal
        key={customizeNonce}
        dish={customizeDish}
        isOpen={!!customizeDish}
        onClose={() => setCustomizeDish(null)}
        onConfirm={handleCustomizeConfirm}
      />
    </>
  );
}
