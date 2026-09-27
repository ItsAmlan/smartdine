import AdminLayoutClient from "@/components/admin/AdminLayoutClient";

export const metadata = { title: "SmartDine — Admin" };

export default function AdminLayout({ children }) {
  return <AdminLayoutClient>{children}</AdminLayoutClient>;
}
