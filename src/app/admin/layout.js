import AdminLayoutClient from "@/components/admin/AdminLayoutClient";
import AnimatedBackground from "@/components/ui/AnimatedBackground";

export const metadata = { title: "SmartDine — Admin" };

export default function AdminLayout({ children }) {
  return (
    <div className="min-h-screen relative">
      <AnimatedBackground color="green" />
      <AdminLayoutClient>{children}</AdminLayoutClient>
    </div>
  );
}
