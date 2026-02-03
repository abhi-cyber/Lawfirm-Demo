import {useState} from "react";
import {TaskKanbanCard} from "./TaskKanbanCard";
import {MoveTaskModal} from "./MoveTaskModal";
import type {ITask} from "@/types";

interface StatusTab {
  id: ITask["status"];
  title: string;
  color: string;
}

const STATUS_TABS: StatusTab[] = [
  {id: "pending", title: "Pending", color: "bg-slate-500"},
  {id: "in-progress", title: "In Progress", color: "bg-amber-500"},
  {id: "completed", title: "Completed", color: "bg-emerald-500"},
];

interface TaskKanbanMobileProps {
  tasks: ITask[];
  tasksByStatus: Record<ITask["status"], ITask[]>;
  onEdit: (task: ITask) => void;
  onDelete: (task: ITask) => void;
}

export function TaskKanbanMobile({
  tasks: _tasks,
  tasksByStatus,
  onEdit,
  onDelete,
}: TaskKanbanMobileProps) {
  const [activeTab, setActiveTab] = useState<ITask["status"]>("pending");
  const [moveModalOpen, setMoveModalOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState<ITask | null>(null);

  const handleMoveStatus = (task: ITask) => {
    setSelectedTask(task);
    setMoveModalOpen(true);
  };

  const handleCloseMoveModal = () => {
    setMoveModalOpen(false);
    setSelectedTask(null);
  };

  const activeTasks = tasksByStatus[activeTab] || [];

  return (
    <div className="flex flex-col h-full">
      {/* Sticky Status Tabs */}
      <div className="sticky top-0 z-20 bg-white dark:bg-slate-900 pb-4 -mx-4 px-4 pt-1 border-b border-slate-200 dark:border-slate-700">
        <div className="flex bg-slate-100 dark:bg-slate-800 rounded-lg p-1 gap-1">
          {STATUS_TABS.map((tab) => {
            const count = tasksByStatus[tab.id]?.length || 0;
            const isActive = activeTab === tab.id;

            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 px-2 rounded-md text-sm font-medium transition-all ${
                  isActive
                    ? "bg-white dark:bg-slate-700 shadow-sm text-slate-900 dark:text-slate-100"
                    : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200"
                }`}>
                <div className={`w-2 h-2 rounded-full ${tab.color}`} />
                <span className="truncate">{tab.title}</span>
                <span
                  className={`min-w-[20px] h-5 flex items-center justify-center rounded-full text-xs ${
                    isActive
                      ? "bg-slate-200 dark:bg-slate-600 text-slate-700 dark:text-slate-200"
                      : "bg-slate-200/50 dark:bg-slate-700/50 text-slate-500 dark:text-slate-400"
                  }`}>
                  {count}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Task List */}
      <div className="flex-1 overflow-y-auto pt-4 space-y-3 -mx-4 px-4 pb-4 scrollbar-styled">
        {activeTasks.length > 0 ? (
          activeTasks.map((task) => (
            <TaskKanbanCard
              key={task._id}
              task={task}
              onEdit={onEdit}
              onDelete={onDelete}
              onMoveStatus={handleMoveStatus}
              disableDrag
            />
          ))
        ) : (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <div className="w-16 h-16 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center mb-4">
              <span className="text-2xl">📋</span>
            </div>
            <p className="text-slate-500 dark:text-slate-400 text-sm">
              No{" "}
              {STATUS_TABS.find((t) => t.id === activeTab)?.title.toLowerCase()}{" "}
              tasks
            </p>
          </div>
        )}
      </div>

      {/* Move Task Modal */}
      <MoveTaskModal
        isOpen={moveModalOpen}
        onClose={handleCloseMoveModal}
        task={selectedTask}
      />
    </div>
  );
}

export default TaskKanbanMobile;
