import {useState, useMemo, useEffect} from "react";
import {useSearchParams} from "react-router-dom";
import {useQuery, useMutation, useQueryClient} from "@tanstack/react-query";
import {
  DndContext,
  DragOverlay,
  closestCenter,
  type DragEndEvent,
  type DragStartEvent,
} from "@dnd-kit/core";
import {Plus, Search, ChevronDown} from "lucide-react";
import {getTasks, getUsers, updateTaskStatus} from "@/services/api";
import {PageHeader, Button, Skeleton} from "@/components/ui";
import {
  TaskFormModal,
  DeleteTaskModal,
  TaskKanbanColumn,
  TaskKanbanCard,
  TaskKanbanMobile,
} from "@/components/features/tasks";
import {useSidebar} from "@/contexts/SidebarContext";
import type {ITask, IUser} from "@/types";

const STATUS_COLUMNS: {id: ITask["status"]; title: string; color: string}[] = [
  {id: "pending", title: "Pending", color: "bg-slate-500"},
  {id: "in-progress", title: "In Progress", color: "bg-amber-500"},
  {id: "completed", title: "Completed", color: "bg-emerald-500"},
];

const priorityOptions = [
  {value: "all", label: "All Priorities"},
  {value: "high", label: "High"},
  {value: "medium", label: "Medium"},
  {value: "low", label: "Low"},
];

const Tasks = () => {
  const {isMobile} = useSidebar();
  const [searchParams] = useSearchParams();
  const queryClient = useQueryClient();
  const [searchQuery, setSearchQuery] = useState("");
  const [priorityFilter, setPriorityFilter] = useState("all");
  const [assigneeFilter, setAssigneeFilter] = useState("all");
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState<ITask | null>(null);
  const [activeTask, setActiveTask] = useState<ITask | null>(null);

  // Read filters from URL query params on mount
  useEffect(() => {
    const priorityParam = searchParams.get("priority");
    if (priorityParam && ["high", "medium", "low"].includes(priorityParam)) {
      setPriorityFilter(priorityParam);
    }
  }, [searchParams]);

  const {data: tasks, isLoading} = useQuery({
    queryKey: ["tasks"],
    queryFn: getTasks,
  });
  const {data: users} = useQuery({queryKey: ["users"], queryFn: getUsers});

  const updateStatusMutation = useMutation({
    mutationFn: ({id, status}: {id: string; status: ITask["status"]}) =>
      updateTaskStatus(id, status),
    onMutate: async ({id, status}) => {
      await queryClient.cancelQueries({queryKey: ["tasks"]});
      const previousTasks = queryClient.getQueryData<ITask[]>(["tasks"]);
      queryClient.setQueryData<ITask[]>(["tasks"], (old) =>
        old?.map((t) => (t._id === id ? {...t, status} : t)),
      );
      return {previousTasks};
    },
    onError: (err, variables, context) => {
      if (context?.previousTasks) {
        queryClient.setQueryData(["tasks"], context.previousTasks);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({queryKey: ["tasks"]});
    },
  });

  const assigneeOptions = [
    {value: "all", label: "All Assignees"},
    ...(users?.map((u) => ({value: u._id, label: u.name})) || []),
  ];

  const filteredTasks = useMemo(() => {
    if (!tasks) return [];
    return tasks.filter((task) => {
      if (priorityFilter !== "all" && task.priority !== priorityFilter)
        return false;
      if (assigneeFilter !== "all") {
        const assigneeId =
          typeof task.assignedTo === "string"
            ? task.assignedTo
            : task.assignedTo?._id;
        if (assigneeId !== assigneeFilter) return false;
      }
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        return (
          task.title.toLowerCase().includes(query) ||
          task.description.toLowerCase().includes(query)
        );
      }
      return true;
    });
  }, [tasks, searchQuery, priorityFilter, assigneeFilter]);

  const tasksByStatus = useMemo(() => {
    const grouped: Record<ITask["status"], ITask[]> = {
      pending: [],
      "in-progress": [],
      completed: [],
    };
    filteredTasks.forEach((t) => {
      if (grouped[t.status]) {
        grouped[t.status].push(t);
      }
    });
    return grouped;
  }, [filteredTasks]);

  const handleDragStart = (event: DragStartEvent) => {
    const draggedTask = tasks?.find((t) => t._id === event.active.id);
    setActiveTask(draggedTask || null);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const {active, over} = event;
    setActiveTask(null);
    if (!over) return;
    const taskId = active.id as string;
    const newStatus = over.id as ITask["status"];
    const currentTask = tasks?.find((t) => t._id === taskId);
    if (currentTask && currentTask.status !== newStatus) {
      updateStatusMutation.mutate({id: taskId, status: newStatus});
    }
  };

  const handleEdit = (task: ITask) => {
    setSelectedTask(task);
    setIsFormModalOpen(true);
  };

  const handleDelete = (task: ITask) => {
    setSelectedTask(task);
    setIsDeleteModalOpen(true);
  };

  const handleCloseFormModal = () => {
    setIsFormModalOpen(false);
    setSelectedTask(null);
  };

  const handleCloseDeleteModal = () => {
    setIsDeleteModalOpen(false);
    setSelectedTask(null);
  };

  if (isLoading) {
    return (
      <div>
        <PageHeader
          title="Tasks"
          description="Manage and track all your tasks."
        />
        <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide">
          {[1, 2, 3].map((i) => (
            <div key={i} className="flex-1 min-w-[300px] max-w-[380px]">
              <Skeleton className="h-10 w-full mb-4" />
              <div className="space-y-3">
                <Skeleton className="h-32 w-full" />
                <Skeleton className="h-32 w-full" />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div>
      <PageHeader
        title="Tasks"
        description="Manage and track all your tasks."
        actions={
          <Button onClick={() => setIsFormModalOpen(true)}>
            <Plus className="w-4 h-4 mr-2" />
            Create Task
          </Button>
        }
      />

      {/* Filters */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4 mb-6">
        {/* Search Input */}
        <div className="relative w-full sm:flex-1 sm:max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 dark:text-slate-500 pointer-events-none z-10" />
          <input
            type="text"
            placeholder="Search tasks..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="flex h-10 w-full rounded-lg border border-slate-200 bg-white pl-10 pr-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-900 focus:ring-offset-1 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100 dark:placeholder:text-slate-500 dark:focus:ring-amber-500"
          />
        </div>

        {/* Priority Filter */}
        <div className="relative w-full sm:w-40">
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

        {/* Assignee Filter */}
        <div className="relative w-full sm:w-48">
          <select
            value={assigneeFilter}
            onChange={(e) => setAssigneeFilter(e.target.value)}
            className="flex h-10 w-full appearance-none rounded-lg border border-slate-200 bg-white px-3 py-2 pr-10 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900 focus:ring-offset-1 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100 dark:focus:ring-amber-500">
            {assigneeOptions.map((option) => (
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
        <TaskKanbanMobile
          tasks={filteredTasks}
          tasksByStatus={tasksByStatus}
          onEdit={handleEdit}
          onDelete={handleDelete}
        />
      ) : (
        <DndContext
          collisionDetection={closestCenter}
          onDragStart={handleDragStart}
          onDragEnd={handleDragEnd}>
          <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide">
            {STATUS_COLUMNS.map((column) => (
              <TaskKanbanColumn
                key={column.id}
                id={column.id}
                title={column.title}
                color={column.color}
                tasks={tasksByStatus[column.id]}
                onEdit={handleEdit}
                onDelete={handleDelete}
              />
            ))}
          </div>
          <DragOverlay>
            {activeTask ? (
              <TaskKanbanCard
                task={activeTask}
                onEdit={handleEdit}
                onDelete={handleDelete}
              />
            ) : null}
          </DragOverlay>
        </DndContext>
      )}

      <TaskFormModal
        isOpen={isFormModalOpen}
        onClose={handleCloseFormModal}
        taskData={selectedTask}
      />
      <DeleteTaskModal
        isOpen={isDeleteModalOpen}
        onClose={handleCloseDeleteModal}
        taskData={selectedTask}
      />
    </div>
  );
};

export default Tasks;
