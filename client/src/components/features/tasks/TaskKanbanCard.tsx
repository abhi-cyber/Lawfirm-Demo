import {useRef, useState} from "react";
import {useDraggable} from "@dnd-kit/core";
import {
  Clock,
  CheckSquare,
  Edit,
  Trash2,
  Briefcase,
  AlertCircle,
  MoreVertical,
  ArrowRight,
} from "lucide-react";
import {Badge, Button} from "@/components/ui";
import {useSidebar} from "@/contexts/SidebarContext";
import type {ITask, IUser, ICase} from "@/types";

interface Props {
  task: ITask;
  onEdit: (task: ITask) => void;
  onDelete: (task: ITask) => void;
  onMoveStatus?: (task: ITask) => void;
  disableDrag?: boolean;
}

export function TaskKanbanCard({
  task,
  onEdit,
  onDelete,
  onMoveStatus,
  disableDrag = false,
}: Props) {
  const {isMobile} = useSidebar();
  const [showMenu, setShowMenu] = useState(false);
  const dragStartPos = useRef<{x: number; y: number} | null>(null);
  const {attributes, listeners, setNodeRef, transform, isDragging} =
    useDraggable({
      id: task._id,
      disabled: disableDrag || isMobile,
    });

  const style = transform
    ? {
        transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
        zIndex: isDragging ? 50 : undefined,
      }
    : undefined;

  const assignee =
    typeof task.assignedTo === "object" ? (task.assignedTo as IUser) : null;
  const relatedCase =
    typeof task.relatedCase === "object" ? (task.relatedCase as ICase) : null;
  const isOverdue =
    task.status !== "completed" && new Date(task.dueDate) < new Date();

  const getPriorityVariant = (priority: ITask["priority"]) => {
    const variants = {
      high: "destructive" as const,
      medium: "warning" as const,
      low: "secondary" as const,
    };
    return variants[priority];
  };

  const handlePointerDown = (e: React.PointerEvent) => {
    if (disableDrag || isMobile) return;
    dragStartPos.current = {x: e.clientX, y: e.clientY};
    listeners?.onPointerDown?.(e as any);
  };

  const handleMenuToggle = (e: React.MouseEvent) => {
    e.stopPropagation();
    setShowMenu(!showMenu);
  };

  const handleMoveStatus = (e: React.MouseEvent) => {
    e.stopPropagation();
    setShowMenu(false);
    onMoveStatus?.(task);
  };

  const cardBaseStyles = [
    "relative",
    "bg-white dark:bg-slate-800/95",
    "p-4 rounded-xl",
    "border border-slate-200/80 dark:border-slate-700/80",
    disableDrag || isMobile ? "cursor-default" : "cursor-grab",
    "group",
    "shadow-[0_1px_3px_rgba(0,0,0,0.05),0_1px_2px_rgba(0,0,0,0.1)]",
    "dark:shadow-[0_1px_3px_rgba(0,0,0,0.2),0_1px_2px_rgba(0,0,0,0.15)]",
    "transform-gpu",
    "transition-[transform,box-shadow,border-color] duration-200 ease-[cubic-bezier(0.25,0.1,0.25,1)]",
    "hover:shadow-[0_4px_12px_rgba(0,0,0,0.08),0_2px_4px_rgba(0,0,0,0.06)]",
    "dark:hover:shadow-[0_4px_16px_rgba(0,0,0,0.35),0_2px_6px_rgba(0,0,0,0.25)]",
    "hover:border-slate-300 dark:hover:border-slate-600",
    "hover:-translate-y-0.5",
    isOverdue ? "border-red-300 dark:border-red-700" : "",
  ].join(" ");

  const cardDraggingStyles = isDragging
    ? "opacity-60 shadow-[0_20px_40px_rgba(0,0,0,0.15)] dark:shadow-[0_20px_40px_rgba(0,0,0,0.4)] scale-[1.02] rotate-[1deg] cursor-grabbing"
    : "";

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      onPointerDown={handlePointerDown}
      className={`${cardBaseStyles} ${cardDraggingStyles}`}>
      {/* Gradient overlay on hover */}
      <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-emerald-500/0 to-teal-500/0 group-hover:from-emerald-500/[0.02] group-hover:to-teal-500/[0.02] dark:group-hover:from-emerald-400/[0.03] dark:group-hover:to-teal-400/[0.03] transition-opacity duration-300 pointer-events-none" />

      <div className="relative">
        {/* Header: Icon + Priority */}
        <div className="flex justify-between items-start mb-3">
          <div className="flex items-center gap-2">
            <div
              className={`w-8 h-8 rounded-lg bg-gradient-to-br ${isOverdue ? "from-red-500 to-red-600" : "from-emerald-500 to-teal-600"} flex items-center justify-center shadow-sm group-hover:shadow-[0_0_12px_rgba(16,185,129,0.35)] transition-shadow duration-300`}>
              {isOverdue ? (
                <AlertCircle className="w-4 h-4 text-white" />
              ) : (
                <CheckSquare className="w-4 h-4 text-white" />
              )}
            </div>
            <Badge
              variant={getPriorityVariant(task.priority)}
              className="text-[10px]">
              {task.priority}
            </Badge>
          </div>
          {/* Action buttons - Desktop */}
          {!isMobile && (
            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
              <Button
                variant="ghost"
                size="sm"
                className="h-6 w-6 p-0 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-md"
                onClick={(e) => {
                  e.stopPropagation();
                  onEdit(task);
                }}
                onPointerDown={(e) => e.stopPropagation()}>
                <Edit className="w-3 h-3" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="h-6 w-6 p-0 hover:bg-red-100 dark:hover:bg-red-900/30 rounded-md"
                onClick={(e) => {
                  e.stopPropagation();
                  onDelete(task);
                }}
                onPointerDown={(e) => e.stopPropagation()}>
                <Trash2 className="w-3 h-3 text-red-500" />
              </Button>
            </div>
          )}

          {/* Kebab menu - Mobile */}
          {isMobile && (
            <div className="relative">
              <Button
                variant="ghost"
                size="sm"
                className="h-7 w-7 p-0 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-md"
                onClick={handleMenuToggle}
                onPointerDown={(e) => e.stopPropagation()}>
                <MoreVertical className="w-4 h-4" />
              </Button>

              {showMenu && (
                <>
                  {/* Backdrop to close menu */}
                  <div
                    className="fixed inset-0 z-40"
                    onClick={(e) => {
                      e.stopPropagation();
                      setShowMenu(false);
                    }}
                  />
                  {/* Dropdown menu */}
                  <div className="absolute right-0 top-8 z-50 w-40 bg-white dark:bg-slate-800 rounded-lg shadow-lg border border-slate-200 dark:border-slate-700 py-1">
                    {onMoveStatus && (
                      <button
                        onClick={handleMoveStatus}
                        className="w-full flex items-center gap-2 px-3 py-2 text-sm text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700">
                        <ArrowRight className="w-4 h-4" />
                        Move to...
                      </button>
                    )}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setShowMenu(false);
                        onEdit(task);
                      }}
                      className="w-full flex items-center gap-2 px-3 py-2 text-sm text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700">
                      <Edit className="w-4 h-4" />
                      Edit
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setShowMenu(false);
                        onDelete(task);
                      }}
                      className="w-full flex items-center gap-2 px-3 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20">
                      <Trash2 className="w-4 h-4" />
                      Delete
                    </button>
                  </div>
                </>
              )}
            </div>
          )}
        </div>

        {/* Title */}
        <h4 className="font-semibold text-slate-800 dark:text-slate-100 text-sm leading-tight mb-1 group-hover:text-slate-900 dark:group-hover:text-white transition-colors duration-200">
          {task.title}
        </h4>
        {task.description && (
          <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 mb-3">
            {task.description}
          </p>
        )}

        {/* Footer */}
        <div className="flex justify-between items-center pt-2 border-t border-slate-100 dark:border-slate-700/70">
          <div className="flex items-center gap-2">
            {assignee && (
              <div
                className="w-6 h-6 rounded-full bg-slate-200 dark:bg-slate-700 overflow-hidden ring-2 ring-transparent group-hover:ring-slate-300/50 dark:group-hover:ring-slate-600/50 transition-all duration-200"
                title={assignee.name}>
                {assignee.avatarUrl ? (
                  <img
                    src={assignee.avatarUrl}
                    alt={assignee.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-[10px] font-bold text-slate-500 dark:text-slate-400">
                    {assignee.name.charAt(0)}
                  </div>
                )}
              </div>
            )}
            {relatedCase && (
              <span className="text-[10px] text-slate-400 dark:text-slate-500 flex items-center gap-1">
                <Briefcase className="w-3 h-3" />
                {relatedCase.caseNumber}
              </span>
            )}
          </div>
          <div
            className={`flex items-center gap-1 text-[10px] ${isOverdue ? "text-red-500 font-medium" : "text-slate-400 dark:text-slate-500"}`}>
            <Clock className="w-3 h-3" />
            {new Date(task.dueDate).toLocaleDateString()}
          </div>
        </div>
      </div>
    </div>
  );
}

export default TaskKanbanCard;
