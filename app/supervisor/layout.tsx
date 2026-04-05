import { UserProvider } from "@/components/providers/UserProvider";
import SupervisorSidebar from "@/components/supervisor/SupervisorSidebar";

export default function SupervisorLayout({ children }: { children: React.ReactNode }) {
  return (
    <UserProvider>
      <div className="flex h-screen overflow-hidden bg-slate-50">
        <SupervisorSidebar />
        <div className="flex-1 overflow-y-auto">{children}</div>
      </div>
    </UserProvider>
  );
}
