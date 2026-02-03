import { useState, useEffect } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Modal, ModalFooter, Input, Select, Button } from '@/components/ui';
import { createClient, updateClient, type CreateClientInput } from '@/services/api';
import type { IClient } from '@/types';

interface ClientFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  client?: IClient | null;
}

type FormErrors = Partial<Record<keyof CreateClientInput, string>>;

const statusOptions = [
  { value: 'active', label: 'Active' },
  { value: 'inactive', label: 'Inactive' },
  { value: 'prospect', label: 'Prospect' },
];

export function ClientFormModal({ isOpen, onClose, client }: ClientFormModalProps) {
  const queryClient = useQueryClient();
  const isEditing = !!client;

  const [formData, setFormData] = useState<CreateClientInput>({
    name: '',
    companyName: '',
    email: '',
    phone: '',
    status: 'prospect',
  });
  const [errors, setErrors] = useState<FormErrors>({});

  // Reset form when modal opens/closes or client changes
  useEffect(() => {
    if (isOpen) {
      if (client) {
        setFormData({
          name: client.name,
          companyName: client.companyName || '',
          email: client.email,
          phone: client.phone,
          status: client.status,
        });
      } else {
        setFormData({
          name: '',
          companyName: '',
          email: '',
          phone: '',
          status: 'prospect',
        });
      }
      setErrors({});
    }
  }, [isOpen, client]);

  const createMutation = useMutation({
    mutationFn: createClient,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['clients'] });
      onClose();
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<CreateClientInput> }) =>
      updateClient(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['clients'] });
      queryClient.invalidateQueries({ queryKey: ['client', client?._id] });
      onClose();
    },
  });

  const isLoading = createMutation.isPending || updateMutation.isPending;

  const validate = (): boolean => {
    const newErrors: FormErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
    }
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Invalid email format';
    }
    if (!formData.phone.trim()) {
      newErrors.phone = 'Phone is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    if (isEditing && client) {
      updateMutation.mutate({ id: client._id, data: formData });
    } else {
      createMutation.mutate(formData);
    }
  };

  const handleChange = (field: keyof CreateClientInput, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isEditing ? 'Edit Client' : 'New Client'}
      size="md"
    >
      <form onSubmit={handleSubmit}>
        <div className="space-y-4 py-4">
          <Input
            label="Name"
            value={formData.name}
            onChange={(e) => handleChange('name', e.target.value)}
            error={errors.name}
            placeholder="Enter client name"
            required
          />
          <Input
            label="Company Name"
            value={formData.companyName}
            onChange={(e) => handleChange('companyName', e.target.value)}
            placeholder="Enter company name (optional)"
          />
          <Input
            label="Email"
            type="email"
            value={formData.email}
            onChange={(e) => handleChange('email', e.target.value)}
            error={errors.email}
            placeholder="Enter email address"
            required
          />
          <Input
            label="Phone"
            value={formData.phone}
            onChange={(e) => handleChange('phone', e.target.value)}
            error={errors.phone}
            placeholder="Enter phone number"
            required
          />
          <Select
            label="Status"
            value={formData.status}
            onChange={(e) => handleChange('status', e.target.value as IClient['status'])}
            options={statusOptions}
          />
        </div>
        <ModalFooter>
          <Button type="button" variant="outline" onClick={onClose} disabled={isLoading}>
            Cancel
          </Button>
          <Button type="submit" disabled={isLoading}>
            {isLoading ? 'Saving...' : isEditing ? 'Save Changes' : 'Create Client'}
          </Button>
        </ModalFooter>
      </form>
    </Modal>
  );
}

