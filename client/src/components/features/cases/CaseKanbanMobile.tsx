import {useState} from "react";
import {KanbanCard} from "./KanbanCard";
import {MoveCaseModal} from "./MoveCaseModal";
import type {ICase} from "@/types";

interface StatusTab {
  id: ICase["status"];
  title: string;
  color: string;
}

const STATUS_TABS: StatusTab[] = [
  {id: "intake", title: "Intake", color: "bg-blue-500"},
  {id: "discovery", title: "Discovery", color: "bg-purple-500"},
  {id: "trial", title: "Trial", color: "bg-amber-500"},
  {id: "closed", title: "Closed", color: "bg-emerald-500"},
];

interface CaseKanbanMobileProps {
  cases: ICase[];
  casesByStatus: Record<ICase["status"], ICase[]>;
}

export function CaseKanbanMobile({
  cases: _cases,
  casesByStatus,
}: CaseKanbanMobileProps) {
  const [activeTab, setActiveTab] = useState<ICase["status"]>("intake");
  const [moveModalOpen, setMoveModalOpen] = useState(false);
  const [selectedCase, setSelectedCase] = useState<ICase | null>(null);

  const handleMoveStatus = (caseItem: ICase) => {
    setSelectedCase(caseItem);
    setMoveModalOpen(true);
  };

  const handleCloseMoveModal = () => {
    setMoveModalOpen(false);
    setSelectedCase(null);
  };

  const activeCases = casesByStatus[activeTab] || [];

  return (
    <div className="flex flex-col h-full">
      {/* Sticky Status Tabs */}
      <div className="sticky top-0 z-20 bg-white dark:bg-slate-900 pb-4 -mx-4 px-4 pt-1 border-b border-slate-200 dark:border-slate-700">
        <div className="flex bg-slate-100 dark:bg-slate-800 rounded-lg p-1 gap-0.5">
          {STATUS_TABS.map((tab) => {
            const count = casesByStatus[tab.id]?.length || 0;
            const isActive = activeTab === tab.id;

            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex-1 flex flex-col items-center justify-center gap-0.5 py-2 px-1 rounded-md text-xs font-medium transition-all ${
                  isActive
                    ? "bg-white dark:bg-slate-700 shadow-sm text-slate-900 dark:text-slate-100"
                    : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200"
                }`}>
                <div className="flex items-center gap-1">
                  <div className={`w-2 h-2 rounded-full ${tab.color}`} />
                  <span className="truncate">{tab.title}</span>
                </div>
                <span
                  className={`min-w-[20px] h-4 flex items-center justify-center rounded-full text-[10px] ${
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

      {/* Case List */}
      <div className="flex-1 overflow-y-auto pt-4 space-y-3 -mx-4 px-4 pb-4 scrollbar-styled">
        {activeCases.length > 0 ? (
          activeCases.map((caseItem) => (
            <KanbanCard
              key={caseItem._id}
              caseItem={caseItem}
              onMoveStatus={handleMoveStatus}
              disableDrag
            />
          ))
        ) : (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <div className="w-16 h-16 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center mb-4">
              <span className="text-2xl">📁</span>
            </div>
            <p className="text-slate-500 dark:text-slate-400 text-sm">
              No{" "}
              {STATUS_TABS.find((t) => t.id === activeTab)?.title.toLowerCase()}{" "}
              cases
            </p>
          </div>
        )}
      </div>

      {/* Move Case Modal */}
      <MoveCaseModal
        isOpen={moveModalOpen}
        onClose={handleCloseMoveModal}
        caseItem={selectedCase}
      />
    </div>
  );
}

export default CaseKanbanMobile;
