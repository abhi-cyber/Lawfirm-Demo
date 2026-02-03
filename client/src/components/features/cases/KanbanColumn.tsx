import {useDroppable} from "@dnd-kit/core";
import {KanbanCard} from "./KanbanCard";
import type {ICase} from "@/types";

interface Props {
  id: string;
  title: string;
  cases: ICase[];
  color: string;
}

export function KanbanColumn({id, title, cases, color}: Props) {
  const {setNodeRef, isOver} = useDroppable({id});

  return (
    <div
      ref={setNodeRef}
      className={`flex-1 min-w-[280px] bg-slate-100/50 dark:bg-slate-800/50 rounded-xl p-4 flex flex-col border transition-colors ${
        isOver
          ? "border-blue-400 dark:border-blue-500 bg-blue-50/50 dark:bg-blue-900/20"
          : "border-slate-200/60 dark:border-slate-700/60"
      }`}>
      <div className="flex justify-between items-center mb-4">
        <div className="flex items-center gap-2">
          <div className={`w-3 h-3 rounded-full ${color}`} />
          <h3 className="font-semibold text-slate-700 dark:text-slate-200">
            {title}
          </h3>
        </div>
        <span className="text-xs font-semibold bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300 px-2 py-1 rounded-full">
          {cases.length}
        </span>
      </div>

      <div className="flex-1 overflow-y-auto space-y-3 min-h-[200px] scrollbar-thin">
        {cases.map((c) => (
          <KanbanCard key={c._id} caseItem={c} />
        ))}
        {cases.length === 0 && (
          <div className="h-full min-h-[150px] flex items-center justify-center text-slate-400 dark:text-slate-500 text-sm border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-lg">
            Drop cases here
          </div>
        )}
      </div>
    </div>
  );
}

export default KanbanColumn;
