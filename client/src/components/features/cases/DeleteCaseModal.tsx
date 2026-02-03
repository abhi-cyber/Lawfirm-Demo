import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { AlertTriangle } from 'lucide-react';
import { Modal, ModalFooter, Button } from '@/components/ui';
import { deleteCase } from '@/services/api';
import type { ICase } from '@/types';

interface DeleteCaseModalProps {
  isOpen: boolean;
  onClose: () => void;
  caseData: ICase | null;
  redirectOnDelete?: boolean;
}

export function DeleteCaseModal({ isOpen, onClose, caseData, redirectOnDelete = false }: DeleteCaseModalProps) {
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  const deleteMutation = useMutation({
    mutationFn: deleteCase,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cases'] });
      onClose();
      if (redirectOnDelete) {
        navigate('/cases');
      }
    },
  });

  const handleDelete = () => {
    if (caseData) {
      deleteMutation.mutate(caseData._id);
    }
  };

  if (!caseData) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Delete Case">
      <div className="py-4">
        <div className="flex items-start gap-4">
          <div className="flex-shrink-0 w-12 h-12 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center">
            <AlertTriangle className="w-6 h-6 text-red-600 dark:text-red-400" />
          </div>
          <div>
            <p className="text-slate-700 dark:text-slate-200 mb-2">
              Are you sure you want to delete this case? This action cannot be undone.
            </p>
            <div className="bg-slate-50 dark:bg-slate-800 rounded-lg p-3 border border-slate-200 dark:border-slate-700">
              <p className="font-semibold text-slate-800 dark:text-slate-100">{caseData.title}</p>
              <p className="text-sm text-slate-500 dark:text-slate-400 font-mono">{caseData.caseNumber}</p>
            </div>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-3">
              All associated data including tasks and documents will be permanently removed.
            </p>
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
          {deleteMutation.isPending ? 'Deleting...' : 'Delete Case'}
        </Button>
      </ModalFooter>
    </Modal>
  );
}

