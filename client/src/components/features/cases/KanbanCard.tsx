import {useRef, useState} from "react";
import {useDraggable} from "@dnd-kit/core";
import {useNavigate} from "react-router-dom";
import {
  Clock,
  Briefcase,
  ExternalLink,
  MoreVertical,
  ArrowRight,
  Eye,
} from "lucide-react";
import {Badge, Button} from "@/components/ui";
import {useSidebar} from "@/contexts/SidebarContext";
import type {ICase, IClient, IUser} from "@/types";

interface Props {
  caseItem: ICase;
  onMoveStatus?: (caseItem: ICase) => void;
  disableDrag?: boolean;
}

export function KanbanCard({
  caseItem,
  onMoveStatus,
  disableDrag = false,
}: Props) {
  const {isMobile} = useSidebar();
  const navigate = useNavigate();
  const [showMenu, setShowMenu] = useState(false);
  const dragStartPos = useRef<{x: number; y: number} | null>(null);
  const {attributes, listeners, setNodeRef, transform, isDragging} =
    useDraggable({
      id: caseItem._id,
      disabled: disableDrag || isMobile,
    });

  const style = transform
    ? {
        transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
        zIndex: isDragging ? 50 : undefined,
      }
    : undefined;

  const clientName =
    typeof caseItem.client === "object"
      ? (caseItem.client as IClient).name
      : "Unknown Client";
  const assignee =
    Array.isArray(caseItem.assignedTeam) && caseItem.assignedTeam.length > 0
      ? (caseItem.assignedTeam[0] as IUser)
      : null;

  const isOverdue =
    caseItem.deadline && new Date(caseItem.deadline) < new Date();

  const getPriorityVariant = (priority: ICase["priority"]) => {
    const variants = {
      high: "destructive" as const,
      medium: "warning" as const,
      low: "secondary" as const,
    };
    return variants[priority];
  };

  // Track mouse position on pointer down to detect drag vs click
  const handlePointerDown = (e: React.PointerEvent) => {
    if (disableDrag || isMobile) return;
    dragStartPos.current = {x: e.clientX, y: e.clientY};
    // Call the original listener
    listeners?.onPointerDown?.(e as any);
  };

  const handleMenuToggle = (e: React.MouseEvent) => {
    e.stopPropagation();
    setShowMenu(!showMenu);
  };

  const handleMoveStatus = (e: React.MouseEvent) => {
    e.stopPropagation();
    setShowMenu(false);
    onMoveStatus?.(caseItem);
  };

  // Handle card click - navigate to case detail only if it was a click (not drag)
  const handleClick = (e: React.MouseEvent) => {
    // If we have a start position, check if mouse moved significantly (indicating drag)
    if (dragStartPos.current) {
      const dx = Math.abs(e.clientX - dragStartPos.current.x);
      const dy = Math.abs(e.clientY - dragStartPos.current.y);
      // If mouse moved more than 5px, it was a drag, not a click
      if (dx > 5 || dy > 5) {
        dragStartPos.current = null;
        return;
      }
    }
    dragStartPos.current = null;

    // Only navigate if not currently dragging
    if (!isDragging) {
      navigate(`/cases/${caseItem._id}`);
    }
  };

  // Modern card styles inspired by Linear/Notion/Vercel
  const cardBaseStyles = [
    // Base styles
    "relative",
    "bg-white dark:bg-slate-800/95",
    "p-4 rounded-xl",
    "border border-slate-200/80 dark:border-slate-700/80",
    "cursor-pointer",
    "group",
    // Smooth shadow transition (Linear-style)
    "shadow-[0_1px_3px_rgba(0,0,0,0.05),0_1px_2px_rgba(0,0,0,0.1)]",
    "dark:shadow-[0_1px_3px_rgba(0,0,0,0.2),0_1px_2px_rgba(0,0,0,0.15)]",
    // GPU-accelerated transforms for smooth animations
    "transform-gpu",
    // Transition with custom easing (ease-out for snappy feel)
    "transition-[transform,box-shadow,border-color] duration-200 ease-[cubic-bezier(0.25,0.1,0.25,1)]",
    // Hover states
    "hover:shadow-[0_4px_12px_rgba(0,0,0,0.08),0_2px_4px_rgba(0,0,0,0.06)]",
    "dark:hover:shadow-[0_4px_16px_rgba(0,0,0,0.35),0_2px_6px_rgba(0,0,0,0.25)]",
    "hover:border-slate-300 dark:hover:border-slate-600",
    "hover:-translate-y-0.5",
    // Focus visible for accessibility
    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2",
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
      onClick={handleClick}
      className={`${cardBaseStyles} ${cardDraggingStyles}`}>
      {/* Subtle gradient overlay on hover (Vercel-style) */}
      <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-blue-500/0 to-purple-500/0 group-hover:from-blue-500/[0.02] group-hover:to-purple-500/[0.02] dark:group-hover:from-blue-400/[0.03] dark:group-hover:to-purple-400/[0.03] transition-opacity duration-300 pointer-events-none" />

      {/* Card content */}
      <div className="relative">
        {/* Case Icon and Priority Row */}
        <div className="flex justify-between items-start mb-3">
          <div className="flex items-center gap-2">
            {/* Default Case Icon with hover glow */}
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center shadow-sm group-hover:shadow-[0_0_12px_rgba(59,130,246,0.35)] transition-shadow duration-300">
              <Briefcase className="w-4 h-4 text-white" />
            </div>
            <Badge
              variant={getPriorityVariant(caseItem.priority)}
              className="text-[10px]">
              {caseItem.priority}
            </Badge>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] text-slate-400 dark:text-slate-500 font-mono">
              {caseItem.caseNumber}
            </span>

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
                          navigate(`/cases/${caseItem._id}`);
                        }}
                        className="w-full flex items-center gap-2 px-3 py-2 text-sm text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700">
                        <Eye className="w-4 h-4" />
                        View Details
                      </button>
                    </div>
                  </>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Title with smooth color transition */}
        <h4 className="font-semibold text-slate-800 dark:text-slate-100 text-sm leading-tight mb-1 group-hover:text-slate-900 dark:group-hover:text-white transition-colors duration-200">
          {caseItem.title}
        </h4>
        <p className="text-xs text-slate-500 dark:text-slate-400 mb-3">
          {clientName}
        </p>

        {/* Footer */}
        <div className="flex justify-between items-center pt-2 border-t border-slate-100 dark:border-slate-700/70">
          <div className="flex items-center gap-1.5">
            {assignee ? (
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
            ) : (
              <div className="w-6 h-6 rounded-full bg-slate-100 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 flex items-center justify-center">
                <span className="text-[8px] text-slate-400">N/A</span>
              </div>
            )}
          </div>

          <div className="flex items-center gap-2">
            {caseItem.deadline && (
              <div
                className={`flex items-center gap-1 text-[10px] ${
                  isOverdue
                    ? "text-red-500"
                    : "text-slate-400 dark:text-slate-500"
                }`}>
                <Clock className="w-3 h-3" />
                {new Date(caseItem.deadline).toLocaleDateString()}
              </div>
            )}
            {/* View button with smooth reveal */}
            <Button
              variant="ghost"
              size="sm"
              className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-all duration-200 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-md"
              onClick={(e) => {
                e.stopPropagation();
                navigate(`/cases/${caseItem._id}`);
              }}
              onPointerDown={(e) => e.stopPropagation()}
              title="View case details">
              <ExternalLink className="w-3 h-3" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default KanbanCard;
