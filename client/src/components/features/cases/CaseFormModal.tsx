import { useState, useEffect } from 'react';
import { useMutation, useQueryClient, useQuery } from '@tanstack/react-query';
import { Modal, ModalFooter, Input, Select, Textarea, Button } from '@/components/ui';
import { createCase, updateCase, getClients, type CreateCaseInput } from '@/services/api';
import type { ICase } from '@/types';

interface CaseFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  caseData?: ICase | null;
}

type FormErrors = Partial<Record<keyof CreateCaseInput, string>>;

const statusOptions = [
  { value: 'intake', label: 'Intake' },
  { value: 'discovery', label: 'Discovery' },
  { value: 'trial', label: 'Trial' },
  { value: 'closed', label: 'Closed' },
];

const priorityOptions = [
  { value: 'high', label: 'High' },
  { value: 'medium', label: 'Medium' },
  { value: 'low', label: 'Low' },
];

function generateCaseNumber(): string {
  const year = new Date().getFullYear();
  const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
  return `CASE-${year}-${random}`;
}

export function CaseFormModal({ isOpen, onClose, caseData }: CaseFormModalProps) {
  const queryClient = useQueryClient();
  const isEditing = !!caseData;

  const { data: clients } = useQuery({
    queryKey: ['clients'],
    queryFn: getClients,
  });

  const clientOptions = [
    { value: '', label: 'Select a client...' },
    ...(clients?.map((c) => ({ value: c._id, label: c.name })) || []),
  ];

  const [formData, setFormData] = useState<CreateCaseInput>({
    title: '',
    caseNumber: generateCaseNumber(),
    client: '',
    assignedTeam: [],
    status: 'intake',
    priority: 'medium',
    stage: 'Initial Review',
    deadline: '',
    description: '',
  });
  const [errors, setErrors] = useState<FormErrors>({});

  useEffect(() => {
    if (isOpen) {
      if (caseData) {
        const clientId = typeof caseData.client === 'string' ? caseData.client : caseData.client?._id || '';
        setFormData({
          title: caseData.title,
          caseNumber: caseData.caseNumber,
          client: clientId,
          assignedTeam: caseData.assignedTeam.map((t) => (typeof t === 'string' ? t : t._id)),
          status: caseData.status,
          priority: caseData.priority,
          stage: caseData.stage,
          deadline: caseData.deadline || '',
          description: '',
        });
      } else {
        setFormData({
          title: '',
          caseNumber: generateCaseNumber(),
          client: '',
          assignedTeam: [],
          status: 'intake',
          priority: 'medium',
          stage: 'Initial Review',
          deadline: '',
          description: '',
        });
      }
      setErrors({});
    }
  }, [isOpen, caseData]);

  const createMutation = useMutation({
    mutationFn: createCase,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cases'] });
      onClose();
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<CreateCaseInput> }) =>
      updateCase(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cases'] });
      queryClient.invalidateQueries({ queryKey: ['case', caseData?._id] });
      onClose();
    },
  });

  const isLoading = createMutation.isPending || updateMutation.isPending;

  const validate = (): boolean => {
    const newErrors: FormErrors = {};
    if (!formData.title.trim()) newErrors.title = 'Title is required';
    if (!formData.client) newErrors.client = 'Client is required';
    if (!formData.caseNumber.trim()) newErrors.caseNumber = 'Case number is required';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    if (isEditing && caseData) {
      updateMutation.mutate({ id: caseData._id, data: formData });
    } else {
      createMutation.mutate(formData);
    }
  };

  const handleChange = (field: keyof CreateCaseInput, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: undefined }));
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={isEditing ? 'Edit Case' : 'New Case'} size="lg">
      <form onSubmit={handleSubmit}>
        <div className="space-y-4 py-4">
          <Input label="Title" value={formData.title} onChange={(e) => handleChange('title', e.target.value)} error={errors.title} required />
          <div className="grid grid-cols-2 gap-4">
            <Input label="Case Number" value={formData.caseNumber} onChange={(e) => handleChange('caseNumber', e.target.value)} error={errors.caseNumber} required />
            <Select label="Client" value={formData.client} onChange={(e) => handleChange('client', e.target.value)} options={clientOptions} error={errors.client} />
          </div>
          <div className="grid grid-cols-3 gap-4">
            <Select label="Status" value={formData.status} onChange={(e) => handleChange('status', e.target.value)} options={statusOptions} />
            <Select label="Priority" value={formData.priority} onChange={(e) => handleChange('priority', e.target.value)} options={priorityOptions} />
            <Input label="Deadline" type="date" value={formData.deadline} onChange={(e) => handleChange('deadline', e.target.value)} />
          </div>
          <Textarea label="Description" value={formData.description || ''} onChange={(e) => handleChange('description', e.target.value)} rows={3} />
        </div>
        <ModalFooter>
          <Button type="button" variant="outline" onClick={onClose} disabled={isLoading}>Cancel</Button>
          <Button type="submit" disabled={isLoading}>{isLoading ? 'Saving...' : isEditing ? 'Save Changes' : 'Create Case'}</Button>
        </ModalFooter>
      </form>
    </Modal>
  );
}

