import { CartProvider } from "@/context/CartContext";
import AnimatedBackground from "@/components/ui/AnimatedBackground";

export const metadata = {
  title: "SmartDine — Digital Menu & Ordering",
};

export default function CustomerLayout({ children }) {
  return (
    <CartProvider>
      <div className="min-h-screen relative">
        <AnimatedBackground color="orange" />
        <main className="flex-1 relative">{children}</main>
      </div>
    </CartProvider>
  );
}
