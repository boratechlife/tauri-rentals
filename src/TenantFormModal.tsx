import { X } from 'lucide-react';
import { useState, useEffect } from 'react';
import { Tenant } from './Tenants';
import Database from '@tauri-apps/plugin-sql';

// Initial form state for adding/editing tenants
const initialTenantFormState: Omit<Tenant, 'tenant_id'> = {
  full_name: '',
  email: '',
  phone_number: '',
  status: 'active', // Updated to match schema default
  unit_id: null, // Nullable foreign key to units
  rent_amount: 0,
  lease_start_date: '',
  lease_end_date: '',
  unit_number: undefined, // Derived, not editable
  property_name: undefined, // Derived, not editable
};

// ---
// TenantFormModal Component (for Add/Edit)
// ---
interface TenantFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (tenant: Omit<Tenant, 'tenant_id'> | Tenant) => void;
  initialData?: Tenant | null;
}

export const TenantFormModal: React.FC<TenantFormModalProps> = ({
  isOpen,
  onClose,
  onSave,
  initialData,
}) => {
  const [formData, setFormData] = useState<Omit<Tenant, 'tenant_id'> | Tenant>(
    initialTenantFormState
  );
  const [units, setUnits] = useState<
    { unit_id: number; unit_number: string }[]
  >([]);

  useEffect(() => {
    setFormData(initialData || initialTenantFormState);
  }, [initialData]);

  // Fetch units for the dropdown
  useEffect(() => {
    async function fetchUnits() {
      try {
        const db = await Database.load('sqlite:test6.db');
        const dbUnits = await db.select(`
          SELECT unit_id, unit_number 
          FROM units
        `);
        setUnits(dbUnits as { unit_id: number; unit_number: string }[]);
      } catch (err) {
        console.error('Error fetching units:', err);
      }
    }
    if (isOpen) fetchUnits();
  }, [isOpen]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]:
        name === 'rent_amount'
          ? parseFloat(value) || 0
          : name === 'unit_id'
          ? parseInt(value) || null
          : value,
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center p-4 z-50 font-[Inter]">
      <div className="bg-white rounded-xl shadow-2xl p-8 w-full max-w-md max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-800">
            {initialData ? 'Edit Tenant' : 'Add New Tenant'}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 transition-colors"
          >
            <X size={24} />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label
              htmlFor="full_name"
              className="block text-sm font-medium text-gray-700"
            >
              Tenant Name
            </label>
            <input
              type="text"
              id="full_name"
              name="full_name"
              value={formData.full_name}
              onChange={handleChange}
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              required
            />
          </div>
          <div>
            <label
              htmlFor="email"
              className="block text-sm font-medium text-gray-700"
            >
              Email
            </label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email || ''}
              onChange={handleChange}
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          <div>
            <label
              htmlFor="phone_number"
              className="block text-sm font-medium text-gray-700"
            >
              Phone
            </label>
            <input
              type="tel"
              id="phone_number"
              name="phone_number"
              value={formData.phone_number || ''}
              onChange={handleChange}
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              required
            />
          </div>
          <div>
            <label
              htmlFor="unit_id"
              className="block text-sm font-medium text-gray-700"
            >
              Unit
            </label>
            <select
              id="unit_id"
              name="unit_id"
              value={formData.unit_id || ''}
              onChange={handleChange}
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              required
            >
              <option value="">Select Unit</option>
              {units.map((unit) => (
                <option key={unit.unit_id} value={unit.unit_id}>
                  {unit.unit_number}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label
              htmlFor="rent_amount"
              className="block text-sm font-medium text-gray-700"
            >
              Rent Amount ($)
            </label>
            <input
              type="number"
              id="rent_amount"
              name="rent_amount"
              value={formData.rent_amount || 0}
              onChange={handleChange}
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              required
              min="0"
            />
          </div>
          <div>
            <label
              htmlFor="lease_start_date"
              className="block text-sm font-medium text-gray-700"
            >
              Lease Start Date
            </label>
            <input
              type="date"
              id="lease_start_date"
              name="lease_start_date"
              value={formData.lease_start_date || ''}
              onChange={handleChange}
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              required
            />
          </div>
          <div>
            <label
              htmlFor="lease_end_date"
              className="block text-sm font-medium text-gray-700"
            >
              Lease End Date
            </label>
            <input
              type="date"
              id="lease_end_date"
              name="lease_end_date"
              value={formData.lease_end_date || ''}
              onChange={handleChange}
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              required
            />
          </div>
          <div>
            <label
              htmlFor="status"
              className="block text-sm font-medium text-gray-700"
            >
              Status
            </label>
            <select
              id="status"
              name="status"
              value={formData.status}
              onChange={handleChange}
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              required
            >
              <option value="active">Active</option>
              <option value="Moving Out">Moving Out</option>
              <option value="Inactive">Inactive</option>
            </select>
          </div>
          <div className="flex justify-end space-x-3 mt-6">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shadow-md"
            >
              {initialData ? 'Update Tenant' : 'Add Tenant'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
