import {useMutation, useQueryClient} from "@tanstack/react-query";
import {FileText, Search, Scale, CheckCircle, Loader2, AlertCircle} from "lucide-react";
import {Modal, ModalFooter, Button} from "@/components/ui";
import {updateCaseStatus} from "@/services/api";
import type {ICase} from "@/types";

interface MoveCaseModalProps {
  isOpen: boolean;
  onClose: () => void;
  caseItem: ICase | null;
}

const STATUS_OPTIONS: {id: ICase["status"]; title: string; color: string; icon: typeof FileText}[] = [
  {id: "intake", title: "Intake", color: "bg-blue-500", icon: FileText},
  {id: "discovery", title: "Discovery", color: "bg-purple-500", icon: Search},
  {id: "trial", title: "Trial", color: "bg-amber-500", icon: Scale},
  {id: "closed", title: "Closed", color: "bg-emerald-500", icon: CheckCircle},
];

export function MoveCaseModal({isOpen, onClose, caseItem}: MoveCaseModalProps) {
  const queryClient = useQueryClient();

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
    onError: (_err, _variables, context) => {
      if (context?.previousCases) {
        queryClient.setQueryData(["cases"], context.previousCases);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({queryKey: ["cases"]});
    },
    onSuccess: () => {
      onClose();
    },
  });

  const handleStatusSelect = (status: ICase["status"]) => {
    if (caseItem && caseItem.status !== status) {
      updateStatusMutation.mutate({id: caseItem._id, status});
    } else {
      onClose();
    }
  };

  if (!caseItem) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Move Case" size="sm">
      <div className="space-y-2">
        <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">
          Select a new status for "{caseItem.title}"
        </p>
        {STATUS_OPTIONS.map((option) => {
          const Icon = option.icon;
          const isCurrentStatus = caseItem.status === option.id;
          const isLoading = updateStatusMutation.isPending && 
            updateStatusMutation.variables?.status === option.id;
          
          return (
            <button
              key={option.id}
              onClick={() => handleStatusSelect(option.id)}
              disabled={updateStatusMutation.isPending}
              className={`w-full flex items-center gap-3 p-3 rounded-lg border transition-all ${
                isCurrentStatus
                  ? "border-slate-300 dark:border-slate-600 bg-slate-100 dark:bg-slate-800"
                  : "border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-800/50"
              } ${updateStatusMutation.isPending ? "opacity-50 cursor-not-allowed" : ""}`}
            >
              <div className={`w-8 h-8 rounded-lg ${option.color} flex items-center justify-center`}>
                {isLoading ? (
                  <Loader2 className="w-4 h-4 text-white animate-spin" />
                ) : (
                  <Icon className="w-4 h-4 text-white" />
                )}
              </div>
              <span className="font-medium text-slate-700 dark:text-slate-200">
                {option.title}
              </span>
              {isCurrentStatus && (
                <span className="ml-auto text-xs text-slate-400 dark:text-slate-500">
                  Current
                </span>
              )}
            </button>
          );
        })}
        
        {updateStatusMutation.isError && (
          <div className="flex items-center gap-2 p-3 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800">
            <AlertCircle className="w-4 h-4 text-red-500" />
            <span className="text-sm text-red-600 dark:text-red-400">
              Failed to update status. Please try again.
            </span>
          </div>
        )}
      </div>

      <ModalFooter>
        <Button variant="outline" onClick={onClose} disabled={updateStatusMutation.isPending}>
          Cancel
        </Button>
      </ModalFooter>
    </Modal>
  );
}

export default MoveCaseModal;

