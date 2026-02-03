import {useState, useRef, useEffect, useMemo, useCallback} from "react";
import {useNavigate} from "react-router-dom";
import {useQuery} from "@tanstack/react-query";
import {
  Search,
  Plus,
  Bell,
  ChevronDown,
  User,
  LogOut,
  FileText,
  Users,
  Briefcase,
  X,
  CheckSquare,
  Menu,
} from "lucide-react";
import {cn} from "@/lib/utils";
import {Button, Avatar} from "@/components/ui";
import {getClients, getCases, getTasks, getUsers} from "@/services/api";
import {ClientFormModal} from "@/components/features/clients";
import {CaseFormModal} from "@/components/features/cases";
import {TaskFormModal} from "@/components/features/tasks";
import {useSidebar} from "@/contexts/SidebarContext";

interface TopBarProps {
  className?: string;
}

interface SearchResult {
  id: string;
  title: string;
  subtitle: string;
  type: "client" | "case" | "task" | "team";
  url: string;
}

export function TopBar({className}: TopBarProps) {
  const navigate = useNavigate();
  const {isMobile, openMobileSidebar} = useSidebar();
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const [showSearchResults, setShowSearchResults] = useState(false);
  const [showQuickActions, setShowQuickActions] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [isClientModalOpen, setIsClientModalOpen] = useState(false);
  const [isCaseModalOpen, setIsCaseModalOpen] = useState(false);
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const quickActionsRef = useRef<HTMLDivElement>(null);
  const profileMenuRef = useRef<HTMLDivElement>(null);

  // Fetch all data for search
  const {data: clients} = useQuery({
    queryKey: ["clients"],
    queryFn: getClients,
  });
  const {data: cases} = useQuery({
    queryKey: ["cases"],
    queryFn: getCases,
  });
  const {data: tasks} = useQuery({
    queryKey: ["tasks"],
    queryFn: getTasks,
  });
  const {data: users} = useQuery({
    queryKey: ["users"],
    queryFn: getUsers,
  });

  // Debounce search query
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(searchQuery);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Show results when there's a debounced query
  useEffect(() => {
    if (debouncedQuery.trim()) {
      setShowSearchResults(true);
    } else {
      setShowSearchResults(false);
    }
  }, [debouncedQuery]);

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setShowSearchResults(false);
      }
      if (
        quickActionsRef.current &&
        !quickActionsRef.current.contains(e.target as Node)
      ) {
        setShowQuickActions(false);
      }
      if (
        profileMenuRef.current &&
        !profileMenuRef.current.contains(e.target as Node)
      ) {
        setShowProfileMenu(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Handle keyboard events
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setShowSearchResults(false);
        searchInputRef.current?.blur();
      }
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, []);

  // Filter and group search results
  const searchResults = useMemo(() => {
    if (!debouncedQuery.trim())
      return {clients: [], cases: [], tasks: [], team: []};

    const query = debouncedQuery.toLowerCase();
    const results: {
      clients: SearchResult[];
      cases: SearchResult[];
      tasks: SearchResult[];
      team: SearchResult[];
    } = {clients: [], cases: [], tasks: [], team: []};

    // Search clients
    if (clients) {
      const matchedClients = clients
        .filter(
          (client) =>
            client.name.toLowerCase().includes(query) ||
            client.email.toLowerCase().includes(query) ||
            (client.companyName?.toLowerCase().includes(query) ?? false),
        )
        .slice(0, 4)
        .map((client) => ({
          id: client._id,
          title: client.name,
          subtitle: client.companyName || client.email,
          type: "client" as const,
          url: `/clients/${client._id}`,
        }));
      results.clients = matchedClients;
    }

    // Search cases
    if (cases) {
      const matchedCases = cases
        .filter(
          (c) =>
            c.title.toLowerCase().includes(query) ||
            c.caseNumber.toLowerCase().includes(query),
        )
        .slice(0, 4)
        .map((c) => ({
          id: c._id,
          title: c.title,
          subtitle: `${c.caseNumber} • ${c.status}`,
          type: "case" as const,
          url: `/cases/${c._id}`,
        }));
      results.cases = matchedCases;
    }

    // Search tasks
    if (tasks) {
      const matchedTasks = tasks
        .filter(
          (task) =>
            task.title.toLowerCase().includes(query) ||
            task.description.toLowerCase().includes(query),
        )
        .slice(0, 4)
        .map((task) => ({
          id: task._id,
          title: task.title,
          subtitle: `${task.status} • ${task.priority} priority`,
          type: "task" as const,
          url: `/tasks`,
        }));
      results.tasks = matchedTasks;
    }

    // Search team members
    if (users) {
      const matchedUsers = users
        .filter(
          (user) =>
            user.name.toLowerCase().includes(query) ||
            user.email.toLowerCase().includes(query) ||
            user.specialties?.some((s) => s.toLowerCase().includes(query)),
        )
        .slice(0, 4)
        .map((user) => ({
          id: user._id,
          title: user.name,
          subtitle: `${user.role} • ${user.email}`,
          type: "team" as const,
          url: `/team`,
        }));
      results.team = matchedUsers;
    }

    return results;
  }, [debouncedQuery, clients, cases, tasks, users]);

  const totalResults =
    searchResults.clients.length +
    searchResults.cases.length +
    searchResults.tasks.length +
    searchResults.team.length;

  const handleResultClick = useCallback(
    (url: string) => {
      navigate(url);
      setShowSearchResults(false);
      setSearchQuery("");
    },
    [navigate],
  );

  const clearSearch = useCallback(() => {
    setSearchQuery("");
    setDebouncedQuery("");
    setShowSearchResults(false);
    searchInputRef.current?.focus();
  }, []);

  const getTypeIcon = (type: SearchResult["type"]) => {
    switch (type) {
      case "client":
        return <Users className="h-4 w-4" />;
      case "case":
        return <Briefcase className="h-4 w-4" />;
      case "task":
        return <CheckSquare className="h-4 w-4" />;
      case "team":
        return <User className="h-4 w-4" />;
    }
  };

  const quickActions = [
    {
      icon: Users,
      label: "New Client",
      action: () => {
        setShowQuickActions(false);
        setIsClientModalOpen(true);
      },
    },
    {
      icon: Briefcase,
      label: "New Case",
      action: () => {
        setShowQuickActions(false);
        setIsCaseModalOpen(true);
      },
    },
    {
      icon: FileText,
      label: "New Task",
      action: () => {
        setShowQuickActions(false);
        setIsTaskModalOpen(true);
      },
    },
  ];

  return (
    <header
      className={cn(
        "h-16 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800",
        "flex items-center justify-between px-3 md:px-6 sticky top-0 z-40 gap-2 md:gap-4",
        className,
      )}>
      {/* Hamburger Menu - Mobile Only */}
      {isMobile && (
        <button
          onClick={openMobileSidebar}
          className="p-2 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg flex-shrink-0"
          aria-label="Open menu">
          <Menu className="h-5 w-5" />
        </button>
      )}

      {/* Search */}
      <div ref={searchRef} className="flex-1 max-w-md relative min-w-0">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none z-10" />
          <input
            ref={searchInputRef}
            type="text"
            placeholder={
              isMobile ? "Search..." : "Search clients, cases, tasks..."
            }
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onFocus={() => debouncedQuery.trim() && setShowSearchResults(true)}
            className={cn(
              "w-full h-10 pl-10 rounded-lg border border-slate-200 bg-slate-50",
              "text-sm placeholder:text-slate-400",
              "focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent",
              "dark:bg-slate-800 dark:border-slate-700 dark:text-slate-100 dark:focus:ring-amber-500",
              searchQuery ? "pr-10" : "pr-4",
            )}
          />
          {searchQuery && (
            <button
              onClick={clearSearch}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300">
              <X className="h-4 w-4" />
            </button>
          )}
        </div>

        {/* Search Results Dropdown */}
        {showSearchResults && (
          <div className="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-slate-800 rounded-lg shadow-lg border border-slate-200 dark:border-slate-700 z-50 max-h-[400px] overflow-y-auto">
            {totalResults === 0 ? (
              <div className="px-4 py-8 text-center text-slate-500 dark:text-slate-400">
                <Search className="h-8 w-8 mx-auto mb-2 opacity-50" />
                <p className="text-sm">
                  No results found for "{debouncedQuery}"
                </p>
                <p className="text-xs mt-1">
                  Try searching for clients, cases, tasks, or team members
                </p>
              </div>
            ) : (
              <div className="py-2">
                {/* Clients Section */}
                {searchResults.clients.length > 0 && (
                  <div>
                    <div className="px-3 py-1.5 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider bg-slate-50 dark:bg-slate-900/50">
                      Clients ({searchResults.clients.length})
                    </div>
                    {searchResults.clients.map((result) => (
                      <button
                        key={result.id}
                        onClick={() => handleResultClick(result.url)}
                        className="flex items-center gap-3 w-full px-4 py-2.5 text-left hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors">
                        <div className="flex-shrink-0 w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-blue-600 dark:text-blue-400">
                          {getTypeIcon(result.type)}
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-medium text-slate-900 dark:text-slate-100 truncate">
                            {result.title}
                          </p>
                          <p className="text-xs text-slate-500 dark:text-slate-400 truncate">
                            {result.subtitle}
                          </p>
                        </div>
                      </button>
                    ))}
                  </div>
                )}

                {/* Cases Section */}
                {searchResults.cases.length > 0 && (
                  <div>
                    <div className="px-3 py-1.5 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider bg-slate-50 dark:bg-slate-900/50">
                      Cases ({searchResults.cases.length})
                    </div>
                    {searchResults.cases.map((result) => (
                      <button
                        key={result.id}
                        onClick={() => handleResultClick(result.url)}
                        className="flex items-center gap-3 w-full px-4 py-2.5 text-left hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors">
                        <div className="flex-shrink-0 w-8 h-8 rounded-full bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center text-purple-600 dark:text-purple-400">
                          {getTypeIcon(result.type)}
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-medium text-slate-900 dark:text-slate-100 truncate">
                            {result.title}
                          </p>
                          <p className="text-xs text-slate-500 dark:text-slate-400 truncate">
                            {result.subtitle}
                          </p>
                        </div>
                      </button>
                    ))}
                  </div>
                )}

                {/* Tasks Section */}
                {searchResults.tasks.length > 0 && (
                  <div>
                    <div className="px-3 py-1.5 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider bg-slate-50 dark:bg-slate-900/50">
                      Tasks ({searchResults.tasks.length})
                    </div>
                    {searchResults.tasks.map((result) => (
                      <button
                        key={result.id}
                        onClick={() => handleResultClick(result.url)}
                        className="flex items-center gap-3 w-full px-4 py-2.5 text-left hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors">
                        <div className="flex-shrink-0 w-8 h-8 rounded-full bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center text-amber-600 dark:text-amber-400">
                          {getTypeIcon(result.type)}
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-medium text-slate-900 dark:text-slate-100 truncate">
                            {result.title}
                          </p>
                          <p className="text-xs text-slate-500 dark:text-slate-400 truncate">
                            {result.subtitle}
                          </p>
                        </div>
                      </button>
                    ))}
                  </div>
                )}

                {/* Team Section */}
                {searchResults.team.length > 0 && (
                  <div>
                    <div className="px-3 py-1.5 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider bg-slate-50 dark:bg-slate-900/50">
                      Team ({searchResults.team.length})
                    </div>
                    {searchResults.team.map((result) => (
                      <button
                        key={result.id}
                        onClick={() => handleResultClick(result.url)}
                        className="flex items-center gap-3 w-full px-4 py-2.5 text-left hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors">
                        <div className="flex-shrink-0 w-8 h-8 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
                          {getTypeIcon(result.type)}
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-medium text-slate-900 dark:text-slate-100 truncate">
                            {result.title}
                          </p>
                          <p className="text-xs text-slate-500 dark:text-slate-400 truncate">
                            {result.subtitle}
                          </p>
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Right section */}
      <div className="flex items-center gap-1 md:gap-3 flex-shrink-0">
        {/* Quick Actions */}
        <div ref={quickActionsRef} className="relative">
          <Button
            variant="default"
            size="sm"
            onClick={() => setShowQuickActions(!showQuickActions)}
            className="gap-1 px-2 md:px-3">
            <Plus className="h-4 w-4" />
            <span className="hidden md:inline">Quick Add</span>
            <ChevronDown className="h-3 w-3 hidden sm:block" />
          </Button>

          {showQuickActions && (
            <div className="absolute right-0 mt-2 w-48 py-2 bg-white dark:bg-slate-800 rounded-lg shadow-lg border border-slate-200 dark:border-slate-700 z-50">
              {quickActions.map((action) => (
                <button
                  key={action.label}
                  onClick={() => {
                    action.action();
                    setShowQuickActions(false);
                  }}
                  className="flex items-center gap-3 w-full px-4 py-2 text-sm text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700">
                  <action.icon className="h-4 w-4 text-slate-400" />
                  {action.label}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Notifications - Hidden on very small screens */}
        <button className="relative p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg hidden sm:block">
          <Bell className="h-5 w-5" />
          <span className="absolute top-1 right-1 h-2 w-2 bg-amber-500 rounded-full" />
        </button>

        {/* Profile Menu */}
        <div ref={profileMenuRef} className="relative">
          <button
            onClick={() => setShowProfileMenu(!showProfileMenu)}
            className="flex items-center gap-1 md:gap-2 p-1 md:pr-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800">
            <Avatar fallback="JD" size="sm" />
            <ChevronDown className="h-3 w-3 text-slate-400 hidden md:block" />
          </button>

          {showProfileMenu && (
            <div className="absolute right-0 mt-2 w-56 py-2 bg-white dark:bg-slate-800 rounded-lg shadow-lg border border-slate-200 dark:border-slate-700 z-50">
              <div className="px-4 py-2 border-b border-slate-100 dark:border-slate-700">
                <p className="font-medium text-slate-900 dark:text-slate-100">
                  John Doe
                </p>
                <p className="text-sm text-slate-500">
                  john.doe@abclawfirm.com
                </p>
              </div>
              {/* Notifications link in profile menu on mobile */}
              <button className="flex items-center gap-3 w-full px-4 py-2 text-sm text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 sm:hidden">
                <Bell className="h-4 w-4 text-slate-400" />
                Notifications
                <span className="ml-auto h-2 w-2 bg-amber-500 rounded-full" />
              </button>
              <button className="flex items-center gap-3 w-full px-4 py-2 text-sm text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700">
                <User className="h-4 w-4 text-slate-400" />
                Profile
              </button>
              <button className="flex items-center gap-3 w-full px-4 py-2 text-sm text-red-600 hover:bg-slate-100 dark:hover:bg-slate-700">
                <LogOut className="h-4 w-4" />
                Sign out
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Quick Action Modals */}
      <ClientFormModal
        isOpen={isClientModalOpen}
        onClose={() => setIsClientModalOpen(false)}
        client={null}
      />
      <CaseFormModal
        isOpen={isCaseModalOpen}
        onClose={() => setIsCaseModalOpen(false)}
      />
      <TaskFormModal
        isOpen={isTaskModalOpen}
        onClose={() => setIsTaskModalOpen(false)}
        taskData={null}
      />
    </header>
  );
}
