import React, { useState, useEffect } from 'react';
import { Block, Property } from './BlocksList';

interface BlockFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (
    blockData: Omit<Block, 'block_id' | 'property_name'> | Block
  ) => void;
  initialData: Block | null;
  properties: Property[];
}

const BlockFormModal: React.FC<BlockFormModalProps> = ({
  isOpen,
  onClose,
  onSave,
  initialData,
  properties,
}) => {
  const [formData, setFormData] = useState({
    block_name: '',
    property_id: 0,
    floor_count: '',
    notes: '',
  });

  useEffect(() => {
    if (initialData) {
      setFormData({
        block_name: initialData.block_name,
        property_id: initialData.property_id,
        floor_count: initialData.floor_count?.toString() || '',
        notes: initialData.notes || '',
      });
    } else {
      setFormData({
        block_name: '',
        property_id: 0,
        floor_count: '',
        notes: '',
      });
    }
  }, [initialData]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      block_name: formData.block_name,
      property_id: Number(formData.property_id),
      floor_count: formData.floor_count ? Number(formData.floor_count) : null,
      notes: formData.notes || null,
      ...(initialData ? { block_id: initialData.block_id } : {}),
    });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md">
        <h2 className="text-2xl font-bold mb-4">
          {initialData ? 'Edit Block' : 'Add Block'}
        </h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Block Name
            </label>
            <input
              type="text"
              value={formData.block_name}
              onChange={(e) =>
                setFormData({ ...formData, block_name: e.target.value })
              }
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-lg"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Property
            </label>
            <select
              value={formData.property_id}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  property_id: Number(e.target.value),
                })
              }
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-lg"
            >
              <option value={0} disabled>
                Select a property
              </option>
              {properties.map((property) => (
                <option key={property.property_id} value={property.property_id}>
                  {property.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Floor Count
            </label>
            <input
              type="number"
              value={formData.floor_count}
              onChange={(e) =>
                setFormData({ ...formData, floor_count: e.target.value })
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-lg"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Notes
            </label>
            <textarea
              value={formData.notes}
              onChange={(e) =>
                setFormData({ ...formData, notes: e.target.value })
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-lg"
            />
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

export default BlockFormModal;
