import {NavLink} from "react-router-dom";
import {
  LayoutDashboard,
  Users,
  Briefcase,
  CheckSquare,
  UserCircle,
  Settings,
  LogOut,
  ChevronLeft,
  ChevronRight,
  X,
} from "lucide-react";
import {cn} from "@/lib/utils";
import {ThemeToggleSimple} from "@/components/ui";
import {useSidebar} from "@/contexts/SidebarContext";

const Sidebar = () => {
  const {
    isCollapsed,
    isMobileOpen,
    isMobile,
    toggleSidebar,
    closeMobileSidebar,
  } = useSidebar();

  const navItems = [
    {name: "Dashboard", path: "/", icon: LayoutDashboard},
    {name: "Clients", path: "/clients", icon: Users},
    {name: "Cases", path: "/cases", icon: Briefcase},
    {name: "Tasks", path: "/tasks", icon: CheckSquare},
    {name: "Team", path: "/team", icon: UserCircle},
    {name: "Settings", path: "/settings", icon: Settings},
  ];

  // Determine if sidebar should be shown (always on desktop, only when open on mobile)
  const showSidebar = !isMobile || isMobileOpen;
  // On mobile, always show expanded sidebar
  const effectiveCollapsed = isMobile ? false : isCollapsed;

  return (
    <>
      {/* Mobile overlay backdrop */}
      {isMobile && isMobileOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 md:hidden"
          onClick={closeMobileSidebar}
          aria-hidden="true"
        />
      )}

      <aside
        className={cn(
          "bg-slate-900 text-white h-screen flex flex-col fixed left-0 top-0 border-r border-slate-800 transition-all duration-300 z-50",
          // Width based on collapsed state (desktop only)
          effectiveCollapsed ? "w-20" : "w-64",
          // Mobile: slide in/out from left
          isMobile && !isMobileOpen && "-translate-x-full",
          isMobile && isMobileOpen && "translate-x-0",
          // Hide on mobile when closed (for accessibility)
          !showSidebar && "invisible md:visible",
        )}>
        {/* Header */}
        <div
          className={cn(
            "p-4 border-b border-slate-800 flex items-center",
            effectiveCollapsed ? "justify-center" : "justify-between",
          )}>
          {!effectiveCollapsed && (
            <div>
              <h1 className="text-xl font-bold tracking-wider text-amber-500">
                ABC LAW FIRM
              </h1>
              <p className="text-xs text-slate-400 mt-0.5">Legal Management</p>
            </div>
          )}
          {effectiveCollapsed && (
            <span className="text-xl font-bold text-amber-500">LC</span>
          )}

          {/* Close button on mobile, collapse button on desktop */}
          {isMobile ? (
            <button
              onClick={closeMobileSidebar}
              className="p-1.5 rounded-lg text-slate-400 hover:bg-slate-800 hover:text-white transition-colors"
              aria-label="Close sidebar">
              <X className="w-5 h-5" />
            </button>
          ) : (
            <button
              onClick={toggleSidebar}
              className={cn(
                "p-1.5 rounded-lg text-slate-400 hover:bg-slate-800 hover:text-white transition-colors",
                effectiveCollapsed && "hidden",
              )}
              title="Collapse sidebar">
              <ChevronLeft className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Expand button when collapsed (desktop only) */}
        {effectiveCollapsed && !isMobile && (
          <button
            onClick={toggleSidebar}
            className="mx-auto mt-2 p-1.5 rounded-lg text-slate-400 hover:bg-slate-800 hover:text-white transition-colors">
            <ChevronRight className="w-4 h-4" />
          </button>
        )}

        {/* Navigation */}
        <nav
          className={cn("flex-1 p-3 space-y-1", effectiveCollapsed && "px-2")}>
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              onClick={() => isMobile && closeMobileSidebar()}
              title={effectiveCollapsed ? item.name : undefined}
              className={({isActive}) =>
                cn(
                  "flex items-center gap-3 rounded-lg transition-all duration-200",
                  effectiveCollapsed ? "justify-center p-3" : "px-4 py-3",
                  isActive
                    ? "bg-amber-600/10 text-amber-500 border border-amber-600/20"
                    : "text-slate-400 hover:bg-slate-800 hover:text-white",
                )
              }>
              <item.icon className="w-5 h-5 flex-shrink-0" />
              {!effectiveCollapsed && (
                <span className="font-medium">{item.name}</span>
              )}
            </NavLink>
          ))}
        </nav>

        {/* Footer */}
        <div
          className={cn(
            "p-3 border-t border-slate-800 space-y-2",
            effectiveCollapsed && "px-2",
          )}>
          {/* Theme Toggle */}
          <div
            className={cn(
              "flex",
              effectiveCollapsed ? "justify-center" : "px-1",
            )}>
            <ThemeToggleSimple />
          </div>

          <button
            className={cn(
              "flex items-center gap-3 w-full text-slate-400 hover:bg-slate-800 hover:text-white rounded-lg transition-colors",
              effectiveCollapsed ? "justify-center p-3" : "px-4 py-3",
            )}
            title={effectiveCollapsed ? "Logout" : undefined}>
            <LogOut className="w-5 h-5 flex-shrink-0" />
            {!effectiveCollapsed && <span className="font-medium">Logout</span>}
          </button>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
