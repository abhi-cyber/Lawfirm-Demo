import {useMemo} from "react";
import {useQuery} from "@tanstack/react-query";
import {
  Briefcase,
  Users,
  CheckSquare,
  AlertTriangle,
  TrendingUp,
  Clock,
} from "lucide-react";
import {getClients, getCases, getTasks} from "@/services/api";
import {PageHeader} from "@/components/ui";
import {
  StatsGrid,
  ActivityTimeline,
  MyWork,
  type StatItem,
  type Activity,
} from "@/components/features/dashboard";

const Dashboard = () => {
  const {data: clients} = useQuery({
    queryKey: ["clients"],
    queryFn: getClients,
  });
  const {data: cases} = useQuery({queryKey: ["cases"], queryFn: getCases});
  const {data: tasks} = useQuery({queryKey: ["tasks"], queryFn: getTasks});

  // Calculate metrics
  const metrics = useMemo(() => {
    const activeCases = cases?.filter((c) => c.status !== "closed").length || 0;
    const totalClients = clients?.length || 0;
    const pendingTasks =
      tasks?.filter((t) => t.status === "pending").length || 0;
    const inProgressTasks =
      tasks?.filter((t) => t.status === "in-progress").length || 0;

    // Overdue tasks
    const now = new Date();
    const overdueTasks =
      tasks?.filter(
        (t) => t.status !== "completed" && new Date(t.dueDate) < now,
      ).length || 0;

    // High priority cases
    const highPriorityCases =
      cases?.filter((c) => c.status !== "closed" && c.priority === "high")
        .length || 0;

    // Upcoming deadlines (next 7 days)
    const nextWeek = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
    const upcomingDeadlines =
      cases?.filter((c) => {
        if (!c.deadline || c.status === "closed") return false;
        const deadline = new Date(c.deadline);
        return deadline >= now && deadline <= nextWeek;
      }).length || 0;

    // Active clients (clients with active cases)
    const activeClients =
      clients?.filter((c) => c.status === "active").length || 0;

    return {
      activeCases,
      totalClients,
      pendingTasks,
      inProgressTasks,
      overdueTasks,
      highPriorityCases,
      upcomingDeadlines,
      activeClients,
    };
  }, [clients, cases, tasks]);

  // Build stats for the grid
  const stats: StatItem[] = [
    {
      label: "Active Cases",
      value: metrics.activeCases,
      icon: Briefcase,
      color: "text-blue-600",
      bgColor: "bg-blue-100 dark:bg-blue-900/30",
      subLabel: `${metrics.highPriorityCases} high priority`,
    },
    {
      label: "Total Clients",
      value: metrics.totalClients,
      icon: Users,
      color: "text-emerald-600",
      bgColor: "bg-emerald-100 dark:bg-emerald-900/30",
      subLabel: `${metrics.activeClients} active`,
    },
    {
      label: "Pending Tasks",
      value: metrics.pendingTasks + metrics.inProgressTasks,
      icon: CheckSquare,
      color: "text-amber-600",
      bgColor: "bg-amber-100 dark:bg-amber-900/30",
      subLabel: `${metrics.inProgressTasks} in progress`,
    },
    {
      label: "Overdue Tasks",
      value: metrics.overdueTasks,
      icon: AlertTriangle,
      color: metrics.overdueTasks > 0 ? "text-red-600" : "text-slate-400",
      bgColor:
        metrics.overdueTasks > 0
          ? "bg-red-100 dark:bg-red-900/30"
          : "bg-slate-100 dark:bg-slate-800",
      subLabel: metrics.overdueTasks > 0 ? "Needs attention" : "All on track",
    },
  ];

  // Generate mock activities based on real data
  const activities: Activity[] = useMemo(() => {
    const items: Activity[] = [];
    const now = new Date();

    // Add case activities
    cases?.slice(0, 3).forEach((c, i) => {
      items.push({
        id: `case-${c._id}`,
        type: "case_created",
        title: `Case: ${c.title}`,
        description: `Case #${c.caseNumber} - ${c.stage}`,
        timestamp: new Date(now.getTime() - (i + 1) * 3600000 * 2),
        user: "System",
      });
    });

    // Add task activities
    tasks
      ?.filter((t) => t.status === "completed")
      .slice(0, 2)
      .forEach((t, i) => {
        items.push({
          id: `task-${t._id}`,
          type: "task_completed",
          title: `Task completed: ${t.title}`,
          description: t.description,
          timestamp: new Date(now.getTime() - (i + 1) * 3600000 * 4),
          user: "You",
        });
      });

    // Add deadline warnings
    if (metrics.upcomingDeadlines > 0) {
      items.push({
        id: "deadline-warning",
        type: "deadline_warning",
        title: `${metrics.upcomingDeadlines} upcoming deadline${metrics.upcomingDeadlines > 1 ? "s" : ""}`,
        description: "Cases with deadlines in the next 7 days",
        timestamp: new Date(now.getTime() - 1800000),
      });
    }

    // Sort by timestamp
    return items.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
  }, [cases, tasks, metrics.upcomingDeadlines]);

  return (
    <div>
      <PageHeader
        title="Dashboard"
        description="Welcome back! Here's an overview of your practice."
      />

      {/* Stats Grid */}
      <div className="mb-8">
        <StatsGrid stats={stats} columns={4} />
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* My Work Section - Takes 2 columns */}
        <div className="lg:col-span-2">
          <MyWork tasks={tasks || []} cases={cases || []} />
        </div>

        {/* Activity Timeline - Takes 1 column */}
        <div className="lg:col-span-1">
          <ActivityTimeline activities={activities} maxItems={6} />
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
