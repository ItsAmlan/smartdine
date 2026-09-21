import AnimatedBackground from "@/components/ui/AnimatedBackground";

export const metadata = { title: "SmartDine — Kitchen" };

export default function KitchenLayout({ children }) {
  return (
    <div className="min-h-screen relative">
      <AnimatedBackground color="amber" />
      {children}
    </div>
  );
}
