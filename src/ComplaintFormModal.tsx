import React, { useEffect, useState } from 'react';
import { Complaint } from './ComplaintsPage';

interface ComplaintFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (
    data: Omit<Complaint, 'complaint_id' | 'created_at' | 'updated_at'>
  ) => void;
  initialData: Complaint | null;
  units: { unit_id: number; unit_number: string; property_id: number }[];
  tenants: { tenant_id: number; full_name: string }[];
  properties: { property_id: number; name: string }[];
}

const ComplaintFormModal: React.FC<ComplaintFormModalProps> = ({
  isOpen,
  onClose,
  onSave,
  initialData,
  units,
  tenants,
  properties,
}) => {
  const [formData, setFormData] = useState({
    property_id: initialData?.unit_id
      ? units.find((u) => u.unit_id === initialData.unit_id)?.property_id || 0
      : 0,
    unit_id: initialData?.unit_id || 0,
    tenant_id: initialData?.tenant_id || null,
    description: initialData?.description || '',
    status: initialData?.status || 'Open',
  });

  const [filteredUnits, setFilteredUnits] = useState<
    { unit_id: number; unit_number: string; property_id: number }[]
  >([]);

  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (formData.property_id) {
      setFilteredUnits(
        units.filter((unit) => unit.property_id === formData.property_id)
      );
    } else {
      setFilteredUnits([]);
    }
  }, [formData.property_id, units, properties]);

  // Sync formData with initialData when initialData or isOpen changes
  useEffect(() => {
    if (isOpen && initialData) {
      setFormData({
        property_id: initialData.unit_id
          ? units.find((u) => u.unit_id === initialData.unit_id)?.property_id ||
            0
          : 0,
        unit_id: initialData.unit_id || 0,
        tenant_id: initialData.tenant_id || null,
        description: initialData.description || '',
        status: initialData.status || 'Open',
      });
    }
  }, [initialData, isOpen, units]);
  const handleSubmit = () => {
    if (!formData.property_id) {
      setError('Please select a property.');
      return;
    }

    onSave(formData);
    setFormData({
      property_id: 0,
      unit_id: 0,
      tenant_id: null,
      description: '',
      status: 'Open',
    });
    setError(null);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-md w-full">
        <h2 className="text-xl font-semibold mb-4">
          {initialData ? 'Edit Complaint' : 'Add Complaint'}
        </h2>

        {error && <div className="text-red-600 text-sm mt-4">{error}</div>}
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Property
          </label>
          <select
            className="mt-1 block w-full border border-gray-300 rounded-lg p-2"
            value={formData.property_id}
            onChange={(e) =>
              setFormData({
                ...formData,
                property_id: Number(e.target.value),
                unit_id: 0,
              })
            }
          >
            <option value={0}>Select Property</option>
            {properties.map((property) => (
              <option key={property.property_id} value={property.property_id}>
                {property.name}
              </option>
            ))}
          </select>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Unit
            </label>
            <select
              className="mt-1 block w-full border border-gray-300 rounded-lg p-2"
              value={formData.unit_id}
              onChange={(e) =>
                setFormData({ ...formData, unit_id: Number(e.target.value) })
              }
              disabled={!formData.property_id}
            >
              <option value={0}>Select Unit</option>
              {filteredUnits.map((unit) => (
                <option key={unit.unit_id} value={unit.unit_id}>
                  {unit.unit_number}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Tenant (Optional)
            </label>
            <select
              className="mt-1 block w-full border border-gray-300 rounded-lg p-2"
              value={formData.tenant_id || ''}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  tenant_id: e.target.value ? Number(e.target.value) : null,
                })
              }
            >
              <option value="">None</option>
              {tenants.map((tenant) => (
                <option key={tenant.tenant_id} value={tenant.tenant_id}>
                  {tenant.full_name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Description
            </label>
            <textarea
              className="mt-1 block w-full border border-gray-300 rounded-lg p-2"
              value={formData.description}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
              rows={4}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Status
            </label>
            <select
              className="mt-1 block w-full border border-gray-300 rounded-lg p-2"
              value={formData.status}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  status: e.target.value as 'Open' | 'In Progress' | 'Resolved',
                })
              }
            >
              <option value="Open">Open</option>
              <option value="In Progress">In Progress</option>
              <option value="Resolved">Resolved</option>
            </select>
          </div>
        </div>
        <div className="mt-6 flex justify-end gap-2">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-300 rounded-lg"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg"
            disabled={!formData.unit_id || !formData.description}
          >
            Save
          </button>
        </div>
      </div>
    </div>
  );
};

export default ComplaintFormModal;
