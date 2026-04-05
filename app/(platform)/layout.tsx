import { UserProvider } from "@/components/providers/UserProvider";
import Sidebar from "@/components/platform/Sidebar";
import BottomNav from "@/components/platform/BottomNav";

export default function PlatformLayout({ children }: { children: React.ReactNode }) {
  return (
    <UserProvider>
      <div className="flex h-screen overflow-hidden bg-[#F8F7FF]">
        <div className="hidden md:block">
          <Sidebar />
        </div>
        <div className="flex-1 overflow-y-auto pb-16 md:pb-0">
          {children}
        </div>
        <BottomNav />
      </div>
    </UserProvider>
  );
}
