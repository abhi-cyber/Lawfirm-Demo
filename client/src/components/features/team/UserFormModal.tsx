import { useState, useEffect } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { X } from 'lucide-react';
import { Modal, ModalFooter, Input, Select, Button } from '@/components/ui';
import { createUser, updateUser, type CreateUserInput } from '@/services/api';
import type { IUser } from '@/types';

interface UserFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  userData?: IUser | null;
}

type FormErrors = Partial<Record<keyof CreateUserInput, string>>;

const roleOptions = [
  { value: 'partner', label: 'Partner' },
  { value: 'associate', label: 'Associate' },
  { value: 'paralegal', label: 'Paralegal' },
  { value: 'staff', label: 'Staff' },
];

const commonSpecialties = [
  'Corporate Law', 'Real Estate', 'Intellectual Property', 'Employment Law',
  'Litigation', 'Tax Law', 'Family Law', 'Criminal Defense', 'Estate Planning',
  'Immigration', 'Environmental Law', 'Healthcare Law', 'Bankruptcy',
];

export function UserFormModal({ isOpen, onClose, userData }: UserFormModalProps) {
  const queryClient = useQueryClient();
  const isEditing = !!userData;

  const [formData, setFormData] = useState<CreateUserInput>({
    name: '',
    email: '',
    role: 'associate',
    specialties: [],
    avatarUrl: '',
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [specialtyInput, setSpecialtyInput] = useState('');

  useEffect(() => {
    if (isOpen) {
      if (userData) {
        setFormData({
          name: userData.name,
          email: userData.email,
          role: userData.role,
          specialties: userData.specialties || [],
          avatarUrl: userData.avatarUrl || '',
        });
      } else {
        setFormData({ name: '', email: '', role: 'associate', specialties: [], avatarUrl: '' });
      }
      setErrors({});
      setSpecialtyInput('');
    }
  }, [isOpen, userData]);

  const createMutation = useMutation({
    mutationFn: createUser,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      onClose();
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<CreateUserInput> }) => updateUser(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      queryClient.invalidateQueries({ queryKey: ['user', userData?._id] });
      onClose();
    },
  });

  const isLoading = createMutation.isPending || updateMutation.isPending;

  const validate = (): boolean => {
    const newErrors: FormErrors = {};
    if (!formData.name.trim()) newErrors.name = 'Name is required';
    if (!formData.email.trim()) newErrors.email = 'Email is required';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) newErrors.email = 'Invalid email format';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    if (isEditing && userData) {
      updateMutation.mutate({ id: userData._id, data: formData });
    } else {
      createMutation.mutate(formData);
    }
  };

  const handleChange = (field: keyof CreateUserInput, value: string | string[]) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field as keyof FormErrors]) setErrors((prev) => ({ ...prev, [field]: undefined }));
  };

  const addSpecialty = (specialty: string) => {
    const trimmed = specialty.trim();
    if (trimmed && !formData.specialties.includes(trimmed)) {
      handleChange('specialties', [...formData.specialties, trimmed]);
    }
    setSpecialtyInput('');
  };

  const removeSpecialty = (specialty: string) => {
    handleChange('specialties', formData.specialties.filter((s) => s !== specialty));
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={isEditing ? 'Edit Team Member' : 'Add Team Member'} size="lg">
      <form onSubmit={handleSubmit}>
        <div className="space-y-4 py-4">
          <Input label="Full Name" value={formData.name} onChange={(e) => handleChange('name', e.target.value)} error={errors.name} required />
          <Input label="Email" type="email" value={formData.email} onChange={(e) => handleChange('email', e.target.value)} error={errors.email} required />
          <Select label="Role" value={formData.role} onChange={(e) => handleChange('role', e.target.value)} options={roleOptions} />
          <Input label="Avatar URL (Optional)" value={formData.avatarUrl || ''} onChange={(e) => handleChange('avatarUrl', e.target.value)} placeholder="https://..." />
          
          {/* Specialties */}
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Specialties</label>
            <div className="flex flex-wrap gap-2 mb-2">
              {formData.specialties.map((s) => (
                <span key={s} className="inline-flex items-center gap-1 px-2 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 text-sm rounded-full">
                  {s}
                  <button type="button" onClick={() => removeSpecialty(s)} className="hover:text-blue-900 dark:hover:text-blue-100">
                    <X className="w-3 h-3" />
                  </button>
                </span>
              ))}
            </div>
            <div className="flex gap-2">
              <Input value={specialtyInput} onChange={(e) => setSpecialtyInput(e.target.value)} placeholder="Add specialty..." onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addSpecialty(specialtyInput); } }} className="flex-1" />
              <Button type="button" variant="outline" onClick={() => addSpecialty(specialtyInput)}>Add</Button>
            </div>
            <div className="flex flex-wrap gap-1 mt-2">
              {commonSpecialties.filter((s) => !formData.specialties.includes(s)).slice(0, 6).map((s) => (
                <button key={s} type="button" onClick={() => addSpecialty(s)} className="px-2 py-0.5 text-xs bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 rounded hover:bg-slate-200 dark:hover:bg-slate-600">
                  + {s}
                </button>
              ))}
            </div>
          </div>
        </div>
        <ModalFooter>
          <Button type="button" variant="outline" onClick={onClose} disabled={isLoading}>Cancel</Button>
          <Button type="submit" disabled={isLoading}>{isLoading ? 'Saving...' : isEditing ? 'Save Changes' : 'Add Member'}</Button>
        </ModalFooter>
      </form>
    </Modal>
  );
}

