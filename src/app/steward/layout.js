import AnimatedBackground from "@/components/ui/AnimatedBackground";

export const metadata = { title: "SmartDine — Steward Desk" };

export default function StewardLayout({ children }) {
  return (
    <div className="min-h-screen relative">
      <AnimatedBackground color="red" />
      {children}
    </div>
  );
}
