import { UserProvider } from "@/components/providers/UserProvider";
import CounsellorSidebar from "@/components/counsellor/CounsellorSidebar";

export default function CounsellorLayout({ children }: { children: React.ReactNode }) {
  return (
    <UserProvider>
      <div className="flex h-screen overflow-hidden bg-[#F8F7FF]">
        <CounsellorSidebar />
        <div className="flex-1 overflow-y-auto">{children}</div>
      </div>
    </UserProvider>
  );
}
