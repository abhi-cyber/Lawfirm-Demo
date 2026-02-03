import { useState, useEffect } from 'react';
import { useMutation, useQueryClient, useQuery } from '@tanstack/react-query';
import { Modal, ModalFooter, Input, Select, Textarea, Button } from '@/components/ui';
import { createTask, updateTask, getUsers, getCases, type CreateTaskInput } from '@/services/api';
import type { ITask, ICase } from '@/types';

interface TaskFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  taskData?: ITask | null;
  prefilledCaseId?: string;
}

type FormErrors = Partial<Record<keyof CreateTaskInput, string>>;

const statusOptions = [
  { value: 'pending', label: 'Pending' },
  { value: 'in-progress', label: 'In Progress' },
  { value: 'completed', label: 'Completed' },
];

const priorityOptions = [
  { value: 'high', label: 'High' },
  { value: 'medium', label: 'Medium' },
  { value: 'low', label: 'Low' },
];

export function TaskFormModal({ isOpen, onClose, taskData, prefilledCaseId }: TaskFormModalProps) {
  const queryClient = useQueryClient();
  const isEditing = !!taskData;

  const { data: users } = useQuery({ queryKey: ['users'], queryFn: getUsers });
  const { data: cases } = useQuery({ queryKey: ['cases'], queryFn: getCases });

  const userOptions = [
    { value: '', label: 'Select assignee...' },
    ...(users?.map((u) => ({ value: u._id, label: u.name })) || []),
  ];

  const caseOptions = [
    { value: '', label: 'No related case' },
    ...(cases?.map((c) => ({ value: c._id, label: `${c.caseNumber} - ${c.title}` })) || []),
  ];

  const [formData, setFormData] = useState<CreateTaskInput>({
    title: '',
    description: '',
    status: 'pending',
    priority: 'medium',
    dueDate: '',
    assignedTo: '',
    relatedCase: prefilledCaseId || '',
  });
  const [errors, setErrors] = useState<FormErrors>({});

  useEffect(() => {
    if (isOpen) {
      if (taskData) {
        const assignedToId = typeof taskData.assignedTo === 'string' ? taskData.assignedTo : taskData.assignedTo?._id || '';
        const relatedCaseId = typeof taskData.relatedCase === 'string' ? taskData.relatedCase : (taskData.relatedCase as ICase)?._id || '';
        setFormData({
          title: taskData.title,
          description: taskData.description,
          status: taskData.status,
          priority: taskData.priority,
          dueDate: taskData.dueDate ? taskData.dueDate.split('T')[0] : '',
          assignedTo: assignedToId,
          relatedCase: relatedCaseId,
        });
      } else {
        setFormData({
          title: '',
          description: '',
          status: 'pending',
          priority: 'medium',
          dueDate: '',
          assignedTo: '',
          relatedCase: prefilledCaseId || '',
        });
      }
      setErrors({});
    }
  }, [isOpen, taskData, prefilledCaseId]);

  const createMutation = useMutation({
    mutationFn: createTask,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      onClose();
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<CreateTaskInput> }) => updateTask(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      queryClient.invalidateQueries({ queryKey: ['task', taskData?._id] });
      onClose();
    },
  });

  const isLoading = createMutation.isPending || updateMutation.isPending;

  const validate = (): boolean => {
    const newErrors: FormErrors = {};
    if (!formData.title.trim()) newErrors.title = 'Title is required';
    if (!formData.assignedTo) newErrors.assignedTo = 'Assignee is required';
    if (!formData.dueDate) newErrors.dueDate = 'Due date is required';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    const submitData = { ...formData };
    if (!submitData.relatedCase) delete submitData.relatedCase;

    if (isEditing && taskData) {
      updateMutation.mutate({ id: taskData._id, data: submitData });
    } else {
      createMutation.mutate(submitData);
    }
  };

  const handleChange = (field: keyof CreateTaskInput, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: undefined }));
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={isEditing ? 'Edit Task' : 'New Task'} size="lg">
      <form onSubmit={handleSubmit}>
        <div className="space-y-4 py-4">
          <Input label="Title" value={formData.title} onChange={(e) => handleChange('title', e.target.value)} error={errors.title} required />
          <Textarea label="Description" value={formData.description} onChange={(e) => handleChange('description', e.target.value)} rows={3} />
          <div className="grid grid-cols-2 gap-4">
            <Select label="Assignee" value={formData.assignedTo} onChange={(e) => handleChange('assignedTo', e.target.value)} options={userOptions} error={errors.assignedTo} />
            <Input label="Due Date" type="date" value={formData.dueDate} onChange={(e) => handleChange('dueDate', e.target.value)} error={errors.dueDate} required />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Select label="Status" value={formData.status} onChange={(e) => handleChange('status', e.target.value)} options={statusOptions} />
            <Select label="Priority" value={formData.priority} onChange={(e) => handleChange('priority', e.target.value)} options={priorityOptions} />
          </div>
          <Select label="Related Case (Optional)" value={formData.relatedCase || ''} onChange={(e) => handleChange('relatedCase', e.target.value)} options={caseOptions} />
        </div>
        <ModalFooter>
          <Button type="button" variant="outline" onClick={onClose} disabled={isLoading}>Cancel</Button>
          <Button type="submit" disabled={isLoading}>{isLoading ? 'Saving...' : isEditing ? 'Save Changes' : 'Create Task'}</Button>
        </ModalFooter>
      </form>
    </Modal>
  );
}

