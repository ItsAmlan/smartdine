"use client";

import { createContext, useContext, useState, useCallback } from "react";

const CartContext = createContext(null);

export function CartProvider({ children }) {
  const [items, setItems] = useState([]);
  const [tableId, setTableId] = useState(null);
  const [customer, setCustomer] = useState(null);

  const addItem = useCallback((dish, quantity = 1, forTakeaway = false) => {
    setItems((prev) => {
      const existing = prev.find(
        (item) => item.dish.id === dish.id && item.forTakeaway === forTakeaway
      );
      if (existing) {
        return prev.map((item) =>
          item.dish.id === dish.id && item.forTakeaway === forTakeaway
            ? { ...item, quantity: item.quantity + quantity }
            : item
        );
      }
      return [...prev, { dish, quantity, forTakeaway }];
    });
  }, []);

  const updateQuantity = useCallback((dishId, quantity, forTakeaway) => {
    if (quantity <= 0) {
      setItems((prev) =>
        prev.filter(
          (item) =>
            !(item.dish.id === dishId && item.forTakeaway === forTakeaway)
        )
      );
    } else {
      setItems((prev) =>
        prev.map((item) =>
          item.dish.id === dishId && item.forTakeaway === forTakeaway
            ? { ...item, quantity }
            : item
        )
      );
    }
  }, []);

  const toggleTakeaway = useCallback((dishId, currentTakeaway) => {
    setItems((prev) =>
      prev.map((item) =>
        item.dish.id === dishId && item.forTakeaway === currentTakeaway
          ? { ...item, forTakeaway: !currentTakeaway }
          : item
      )
    );
  }, []);

  const removeItem = useCallback((dishId, forTakeaway) => {
    setItems((prev) =>
      prev.filter(
        (item) =>
          !(item.dish.id === dishId && item.forTakeaway === forTakeaway)
      )
    );
  }, []);

  const clearCart = useCallback(() => {
    setItems([]);
  }, []);

  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);
  const totalAmount = items.reduce(
    (sum, item) => sum + item.quantity * parseFloat(item.dish.price),
    0
  );

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

