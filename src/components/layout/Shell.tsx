import { ReactNode } from "react";
import { TopNav } from "./TopNav";
import { useLocation } from "react-router-dom";

export function AppShell({ children }: { children: ReactNode }) {
  const location = useLocation();
  const isLandingPage = location.pathname === "/";

  if (isLandingPage) {
    return <main className="w-full min-h-screen">{children}</main>;
  }

  return (
    <div className="flex h-screen w-full bg-[#E8EDF2] p-4 md:p-6 overflow-hidden font-sans">
      <div className="flex flex-col bg-[#F9FAFB] rounded-[32px] w-full h-full overflow-hidden shadow-sm border border-gray-200/50 relative">
        <TopNav />
        <div className="flex-1 overflow-auto">
          <main className="w-full max-w-[1400px] mx-auto p-4 md:p-8">
            {children}
          </main>
        </div>
      </div>
    </div>
  );
}
