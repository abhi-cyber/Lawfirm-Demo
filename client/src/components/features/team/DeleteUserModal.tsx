import { useMutation, useQueryClient } from '@tanstack/react-query';
import { AlertTriangle } from 'lucide-react';
import { Modal, ModalFooter, Button } from '@/components/ui';
import { deleteUser } from '@/services/api';
import type { IUser } from '@/types';

interface DeleteUserModalProps {
  isOpen: boolean;
  onClose: () => void;
  userData: IUser | null;
}

export function DeleteUserModal({ isOpen, onClose, userData }: DeleteUserModalProps) {
  const queryClient = useQueryClient();

  const deleteMutation = useMutation({
    mutationFn: deleteUser,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      onClose();
    },
  });

  const handleDelete = () => {
    if (userData) {
      deleteMutation.mutate(userData._id);
    }
  };

  if (!userData) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Remove Team Member">
      <div className="py-4">
        <div className="flex items-start gap-4">
          <div className="flex-shrink-0 w-12 h-12 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center">
            <AlertTriangle className="w-6 h-6 text-red-600 dark:text-red-400" />
          </div>
          <div>
            <p className="text-slate-700 dark:text-slate-200 mb-2">
              Are you sure you want to remove this team member? This action cannot be undone.
            </p>
            <div className="bg-slate-50 dark:bg-slate-800 rounded-lg p-3 border border-slate-200 dark:border-slate-700">
              <div className="flex items-center gap-3">
                {userData.avatarUrl ? (
                  <img src={userData.avatarUrl} alt={userData.name} className="w-10 h-10 rounded-full object-cover" />
                ) : (
                  <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                    <span className="text-blue-700 dark:text-blue-300 font-semibold">
                      {userData.name.split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase()}
                    </span>
                  </div>
                )}
                <div>
                  <p className="font-semibold text-slate-800 dark:text-slate-100">{userData.name}</p>
                  <p className="text-sm text-slate-500 dark:text-slate-400 capitalize">{userData.role} • {userData.email}</p>
                </div>
              </div>
            </div>
            <p className="text-sm text-amber-600 dark:text-amber-400 mt-3">
              Note: This may affect tasks and cases assigned to this team member.
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
          {deleteMutation.isPending ? 'Removing...' : 'Remove Member'}
        </Button>
      </ModalFooter>
    </Modal>
  );
}

