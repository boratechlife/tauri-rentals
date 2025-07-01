import React, { useState, useEffect } from 'react';
import { Manager } from './ManagersList';

interface ManagerFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (managerData: Omit<Manager, 'manager_id'> | Manager) => void;
  initialData: Manager | null;
}

const ManagerFormModal: React.FC<ManagerFormModalProps> = ({
  isOpen,
  onClose,
  onSave,
  initialData,
}) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    hire_date: '',
  });
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  useEffect(() => {
    if (initialData) {
      setFormData({
        name: initialData.name,
        email: initialData.email || '',
        phone: initialData.phone,
        hire_date: initialData.hire_date,
      });
      setErrors({});
    } else {
      setFormData({ name: '', email: '', phone: '', hire_date: '' });
      setErrors({});
    }
  }, [initialData]);

  const validateForm = () => {
    const newErrors: { [key: string]: string } = {};
    if (!formData.name.trim()) newErrors.name = 'Name is required';
    if (!formData.phone.trim()) newErrors.phone = 'Phone is required';
    if (!formData.hire_date) newErrors.hire_date = 'Hire date is required';
    if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Invalid email format';
    }
    return newErrors;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const validationErrors = validateForm();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }
    onSave({
      ...formData,
      ...(initialData ? { manager_id: initialData.manager_id } : {}),
    });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md">
        <h2 className="text-2xl font-bold mb-4">
          {initialData ? 'Edit Manager' : 'Add Manager'}
        </h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Name
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
              className={`w-full px-3 py-2 border ${
                errors.name ? 'border-red-500' : 'border-gray-300'
              } rounded-lg`}
            />
            {errors.name && (
              <p className="text-red-500 text-sm">{errors.name}</p>
            )}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Email
            </label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) =>
                setFormData({ ...formData, email: e.target.value })
              }
              className={`w-full px-3 py-2 border ${
                errors.email ? 'border-red-500' : 'border-gray-300'
              } rounded-lg`}
            />
            {errors.email && (
              <p className="text-red-500 text-sm">{errors.email}</p>
            )}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Phone
            </label>
            <input
              type="text"
              value={formData.phone}
              onChange={(e) =>
                setFormData({ ...formData, phone: e.target.value })
              }
              className={`w-full px-3 py-2 border ${
                errors.phone ? 'border-red-500' : 'border-gray-300'
              } rounded-lg`}
            />
            {errors.phone && (
              <p className="text-red-500 text-sm">{errors.phone}</p>
            )}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Hire Date
            </label>
            <input
              type="date"
              value={formData.hire_date}
              onChange={(e) =>
                setFormData({ ...formData, hire_date: e.target.value })
              }
              className={`w-full px-3 py-2 border ${
                errors.hire_date ? 'border-red-500' : 'border-gray-300'
              } rounded-lg`}
            />
            {errors.hire_date && (
              <p className="text-red-500 text-sm">{errors.hire_date}</p>
            )}
          </div>
          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-gray-200 rounded-lg"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded-lg"
            >
              Save
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ManagerFormModal;
