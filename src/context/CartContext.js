"use client";

import { createContext, useContext, useState, useCallback } from "react";

const CartContext = createContext(null);

// Two cart lines are the "same" line (and so merge quantity) only if the
// dish, takeaway flag, chosen addons and note all match - a plain
// "Paneer Tikka" and a "Paneer Tikka, extra cheese, no onions" are kept
// as separate lines even though they're the same dish.
function buildLineKey(dishId, forTakeaway, addonIds = [], notes = "") {
  const sortedAddons = [...addonIds].sort((a, b) => a - b).join(",");
  return `${dishId}|${forTakeaway}|${sortedAddons}|${(notes || "").trim()}`;
}

export function CartProvider({ children }) {
  const [items, setItems] = useState([]);
  const [tableId, setTableId] = useState(null);
  const [customer, setCustomer] = useState(null);

  const addItem = useCallback((dish, quantity = 1, forTakeaway = false, addons = [], notes = "") => {
    const lineKey = buildLineKey(dish.id, forTakeaway, addons.map((a) => a.id), notes);
    setItems((prev) => {
      const existing = prev.find((item) => item.lineKey === lineKey);
      if (existing) {
        return prev.map((item) =>
          item.lineKey === lineKey ? { ...item, quantity: item.quantity + quantity } : item
        );
      }
      return [...prev, { lineKey, dish, quantity, forTakeaway, addons, notes: notes?.trim() || "" }];
    });
  }, []);

  const updateQuantity = useCallback((lineKey, quantity) => {
    if (quantity <= 0) {
      setItems((prev) => prev.filter((item) => item.lineKey !== lineKey));
    } else {
      setItems((prev) => prev.map((item) => (item.lineKey === lineKey ? { ...item, quantity } : item)));
    }
  }, []);

  const toggleTakeaway = useCallback((lineKey) => {
    setItems((prev) =>
      prev.map((item) => {
        if (item.lineKey !== lineKey) return item;
        const forTakeaway = !item.forTakeaway;
        return { ...item, forTakeaway, lineKey: buildLineKey(item.dish.id, forTakeaway, item.addons.map((a) => a.id), item.notes) };
      })
    );
  }, []);

  const removeItem = useCallback((lineKey) => {
    setItems((prev) => prev.filter((item) => item.lineKey !== lineKey));
  }, []);

  const clearCart = useCallback(() => {
    setItems([]);
  }, []);

  const lineTotal = (item) => {
    const addonsTotal = item.addons.reduce((sum, a) => sum + parseFloat(a.price), 0);
    return (parseFloat(item.dish.price) + addonsTotal) * item.quantity;
  };

  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);
  const totalAmount = items.reduce((sum, item) => sum + lineTotal(item), 0);

  return (
    <CartContext.Provider
      value={{
        items,
        tableId,
        setTableId,
        customer,
        setCustomer,
        addItem,
        updateQuantity,
        toggleTakeaway,
        removeItem,
        clearCart,
        lineTotal,
        totalItems,
        totalAmount,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
}
