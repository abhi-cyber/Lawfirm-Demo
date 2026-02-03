import {Outlet} from "react-router-dom";
import {cn} from "@/lib/utils";
import Sidebar from "./Sidebar";
import {TopBar} from "./TopBar";
import {useSidebar} from "@/contexts/SidebarContext";
import AIChat from "@/components/features/ai/AIChat";

const AppLayout = () => {
  const {isCollapsed, isMobile} = useSidebar();

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex transition-colors">
      <Sidebar />
      <div
        className={cn(
          "flex-1 flex flex-col transition-all duration-300",
          // No margin on mobile (sidebar is overlay), margin on desktop
          !isMobile && (isCollapsed ? "ml-20" : "ml-64"),
        )}>
        <TopBar />
        <main className="flex-1 p-4 md:p-6 lg:p-8">
          <Outlet />
        </main>
      </div>
      <AIChat />
    </div>
  );
};

export default AppLayout;
