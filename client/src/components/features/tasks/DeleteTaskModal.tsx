import { useMutation, useQueryClient } from '@tanstack/react-query';
import { AlertTriangle } from 'lucide-react';
import { Modal, ModalFooter, Button } from '@/components/ui';
import { deleteTask } from '@/services/api';
import type { ITask } from '@/types';

interface DeleteTaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  taskData: ITask | null;
}

export function DeleteTaskModal({ isOpen, onClose, taskData }: DeleteTaskModalProps) {
  const queryClient = useQueryClient();

  const deleteMutation = useMutation({
    mutationFn: deleteTask,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      onClose();
    },
  });

  const handleDelete = () => {
    if (taskData) {
      deleteMutation.mutate(taskData._id);
    }
  };

  if (!taskData) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Delete Task">
      <div className="py-4">
        <div className="flex items-start gap-4">
          <div className="flex-shrink-0 w-12 h-12 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center">
            <AlertTriangle className="w-6 h-6 text-red-600 dark:text-red-400" />
          </div>
          <div>
            <p className="text-slate-700 dark:text-slate-200 mb-2">
              Are you sure you want to delete this task? This action cannot be undone.
            </p>
            <div className="bg-slate-50 dark:bg-slate-800 rounded-lg p-3 border border-slate-200 dark:border-slate-700">
              <p className="font-semibold text-slate-800 dark:text-slate-100">{taskData.title}</p>
              <p className="text-sm text-slate-500 dark:text-slate-400">
                Due: {new Date(taskData.dueDate).toLocaleDateString()}
              </p>
            </div>
          </div>
        </div>
      </div>
      <ModalFooter>
        <Button variant="outline" onClick={onClose} disabled={deleteMutation.isPending}>
          Cancel
        </Button>
        <Button
          variant="destructive"
          onClick={handleDelete}
          disabled={deleteMutation.isPending}
        >
          {deleteMutation.isPending ? 'Deleting...' : 'Delete Task'}
        </Button>
      </ModalFooter>
    </Modal>
  );
}

