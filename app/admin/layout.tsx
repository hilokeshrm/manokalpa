import { UserProvider } from "@/components/providers/UserProvider";
import AdminSidebar from "@/components/admin/AdminSidebar";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <UserProvider>
      <div className="flex h-screen overflow-hidden bg-slate-50">
        <AdminSidebar />
        <div className="flex-1 overflow-y-auto">{children}</div>
      </div>
    </UserProvider>
  );
}
