import {useState, useMemo, useEffect} from "react";
import {useSearchParams} from "react-router-dom";
import {
  DndContext,
  DragOverlay,
  closestCenter,
  type DragEndEvent,
  type DragStartEvent,
} from "@dnd-kit/core";
import {useQuery, useMutation, useQueryClient} from "@tanstack/react-query";
import {Search, ChevronDown} from "lucide-react";
import {getCases, updateCaseStatus} from "@/services/api";
import {Skeleton} from "@/components/ui";
import {KanbanColumn} from "./KanbanColumn";
import {KanbanCard} from "./KanbanCard";
import {CaseKanbanMobile} from "./CaseKanbanMobile";
import {useSidebar} from "@/contexts/SidebarContext";
import type {ICase, IUser} from "@/types";

const STATUS_COLUMNS: {id: ICase["status"]; title: string; color: string}[] = [
  {id: "intake", title: "Intake", color: "bg-blue-500"},
  {id: "discovery", title: "Discovery", color: "bg-purple-500"},
  {id: "trial", title: "Trial", color: "bg-amber-500"},
  {id: "closed", title: "Closed", color: "bg-emerald-500"},
];

const priorityOptions = [
  {value: "all", label: "All Priorities"},
  {value: "high", label: "High"},
  {value: "medium", label: "Medium"},
  {value: "low", label: "Low"},
];

export function CaseKanban() {
  const {isMobile} = useSidebar();
  const [searchParams] = useSearchParams();
  const queryClient = useQueryClient();
  const [searchQuery, setSearchQuery] = useState("");
  const [priorityFilter, setPriorityFilter] = useState("all");
  const [activeCase, setActiveCase] = useState<ICase | null>(null);

  // Read filter from URL query params on mount
  useEffect(() => {
    const priorityParam = searchParams.get("priority");
    if (priorityParam && ["high", "medium", "low"].includes(priorityParam)) {
      setPriorityFilter(priorityParam);
    }
  }, [searchParams]);

  const {data: cases, isLoading} = useQuery({
    queryKey: ["cases"],
    queryFn: getCases,
  });

  const updateStatusMutation = useMutation({
    mutationFn: ({id, status}: {id: string; status: ICase["status"]}) =>
      updateCaseStatus(id, status),
    onMutate: async ({id, status}) => {
      await queryClient.cancelQueries({queryKey: ["cases"]});
      const previousCases = queryClient.getQueryData<ICase[]>(["cases"]);
      queryClient.setQueryData<ICase[]>(["cases"], (old) =>
        old?.map((c) => (c._id === id ? {...c, status} : c)),
      );
      return {previousCases};
    },
    onError: (err, variables, context) => {
      if (context?.previousCases) {
        queryClient.setQueryData(["cases"], context.previousCases);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({queryKey: ["cases"]});
    },
  });

  const filteredCases = useMemo(() => {
    if (!cases) return [];

    return cases.filter((c) => {
      if (priorityFilter !== "all" && c.priority !== priorityFilter) {
        return false;
      }
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        return (
          c.title.toLowerCase().includes(query) ||
          c.caseNumber.toLowerCase().includes(query)
        );
      }
      return true;
    });
  }, [cases, searchQuery, priorityFilter]);

  const casesByStatus = useMemo(() => {
    const grouped: Record<ICase["status"], ICase[]> = {
      intake: [],
      discovery: [],
      trial: [],
      closed: [],
    };
    filteredCases.forEach((c) => {
      if (grouped[c.status]) {
        grouped[c.status].push(c);
      }
    });
    return grouped;
  }, [filteredCases]);

  const handleDragStart = (event: DragStartEvent) => {
    const draggedCase = cases?.find((c) => c._id === event.active.id);
    setActiveCase(draggedCase || null);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const {active, over} = event;
    setActiveCase(null);

    if (!over) return;

    const caseId = active.id as string;
    const newStatus = over.id as ICase["status"];
    const currentCase = cases?.find((c) => c._id === caseId);

    if (currentCase && currentCase.status !== newStatus) {
      updateStatusMutation.mutate({id: caseId, status: newStatus});
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="flex gap-4 mb-6">
          <Skeleton className="h-10 flex-1 max-w-md" />
          <Skeleton className="h-10 w-40" />
        </div>
        <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="min-w-[280px] h-[400px]" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div>
      {/* Filters */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4 mb-6">
        {/* Search Input */}
        <div className="relative w-full sm:flex-1 sm:max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 dark:text-slate-500 pointer-events-none z-10" />
          <input
            type="text"
            placeholder="Search by title or case number..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="flex h-10 w-full rounded-lg border border-slate-200 bg-white pl-10 pr-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-900 focus:ring-offset-1 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100 dark:placeholder:text-slate-500 dark:focus:ring-amber-500"
          />
        </div>

        {/* Priority Filter */}
        <div className="relative w-full sm:w-48">
          <select
            value={priorityFilter}
            onChange={(e) => setPriorityFilter(e.target.value)}
            className="flex h-10 w-full appearance-none rounded-lg border border-slate-200 bg-white px-3 py-2 pr-10 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900 focus:ring-offset-1 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100 dark:focus:ring-amber-500">
            {priorityOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
          <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none" />
        </div>
      </div>

      {/* Kanban Board - Conditional rendering for mobile/desktop */}
      {isMobile ? (
        <CaseKanbanMobile cases={filteredCases} casesByStatus={casesByStatus} />
      ) : (
        <DndContext
          collisionDetection={closestCenter}
          onDragStart={handleDragStart}
          onDragEnd={handleDragEnd}>
          <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide">
            {STATUS_COLUMNS.map((column) => (
              <KanbanColumn
                key={column.id}
                id={column.id}
                title={column.title}
                color={column.color}
                cases={casesByStatus[column.id]}
              />
            ))}
          </div>

          <DragOverlay>
            {activeCase ? <KanbanCard caseItem={activeCase} /> : null}
          </DragOverlay>
        </DndContext>
      )}
    </div>
  );
}

export default CaseKanban;
