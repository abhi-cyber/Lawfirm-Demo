import { useMutation, useQueryClient } from '@tanstack/react-query';
import { AlertTriangle } from 'lucide-react';
import { Modal, ModalFooter, Button } from '@/components/ui';
import { deleteClient } from '@/services/api';

interface DeleteConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  clientId: string;
  clientName: string;
  onDeleted?: () => void;
}

export function DeleteConfirmModal({
  isOpen,
  onClose,
  clientId,
  clientName,
  onDeleted,
}: DeleteConfirmModalProps) {
  const queryClient = useQueryClient();

  const deleteMutation = useMutation({
    mutationFn: () => deleteClient(clientId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['clients'] });
      onClose();
      onDeleted?.();
    },
  });

  const handleDelete = () => {
    deleteMutation.mutate();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Delete Client" size="sm">
      <div className="py-4">
        <div className="flex items-center gap-3 p-4 bg-red-50 dark:bg-red-900/20 rounded-lg mb-4">
          <AlertTriangle className="w-6 h-6 text-red-600 flex-shrink-0" />
          <p className="text-sm text-red-800 dark:text-red-200">
            This action cannot be undone. All associated data will be permanently deleted.
          </p>
        </div>
        <p className="text-slate-600 dark:text-slate-400">
          Are you sure you want to delete{' '}
          <span className="font-semibold text-slate-900 dark:text-slate-100">
            {clientName}
          </span>
          ?
        </p>
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
          {deleteMutation.isPending ? 'Deleting...' : 'Delete Client'}
        </Button>
      </ModalFooter>
    </Modal>
  );
}

