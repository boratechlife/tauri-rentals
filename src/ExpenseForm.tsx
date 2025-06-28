import { useState, useEffect } from 'react';
import { NewExpense, Expense } from './Expense';

interface ExpenseFormProps {
  initialData?: NewExpense | Expense;
  onClose: () => void;
  onSubmit: (expense: NewExpense | Expense) => void;
  categories: string[];
  units: { unit_id: number; unit_number: string; block_id: number }[];
  blocks: { block_id: number; block_name: string }[];
  properties: { property_id: number; name: string }[];
}

export const ExpenseForm: React.FC<ExpenseFormProps> = ({
  initialData,
  onClose,
  onSubmit,
  categories: propCategories,
  units,
  blocks,
  properties,
}) => {
  const [formData, setFormData] = useState<NewExpense | Expense>(
    initialData || {
      amount: '',
      category: '',
      description: '',
      expense_date: new Date('2025-06-28T22:02:00+03:00')
        .toISOString()
        .split('T')[0], // Today's date: 10:02 PM EAT, June 28, 2025
      unit_id: '',
      block_id: '',
      property_id: '',
      payment_method: '',
      vendor: '',
      invoice_number: undefined,
      paid_by: undefined,
    }
  );

  // Hardcoded categories as a fallback if propCategories is empty or invalid
  const hardcodedCategories = [
    'Maintenance',
    'Utilities',
    'Security',
    'Cleaning',
    'Renovation',
    'Insurance',
    'Legal',
  ];
  const effectiveCategories =
    propCategories.length > 1 ? propCategories : hardcodedCategories;

  useEffect(() => {
    if (initialData) {
      setFormData(initialData);
    }
  }, [initialData]);

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]:
        name === 'amount' ||
        name === 'unit_id' ||
        name === 'block_id' ||
        name === 'property_id'
          ? value === ''
            ? ''
            : parseInt(value)
          : value,
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Basic validation
    if (
      !formData.amount ||
      !formData.category ||
      !formData.expense_date ||
      !formData.payment_method
    ) {
      alert('Please fill in all required fields.');
      return;
    }
    onSubmit(formData);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl p-6 w-full max-w-2xl mx-4 h-[90vh] overflow-y-auto shadow-lg">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          {initialData ? 'Edit Expense' : 'Add New Expense'}
        </h3>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label
              htmlFor="description"
              className="block text-sm font-medium text-gray-700"
            >
              Description *
            </label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
              rows={3}
              required
            />
          </div>
          <div>
            <label
              htmlFor="amount"
              className="block text-sm font-medium text-gray-700"
            >
              Amount ($)*
            </label>
            <input
              type="number"
              id="amount"
              name="amount"
              value={formData.amount}
              onChange={handleChange}
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
              step="0.01"
              min="0"
              required
            />
          </div>
          <div>
            <label
              htmlFor="category"
              className="block text-sm font-medium text-gray-700"
            >
              Category *
            </label>
            <select
              id="category"
              name="category"
              value={formData.category}
              onChange={handleChange}
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
              required
            >
              <option value="">Select a category</option>
              {effectiveCategories
                .filter((c) => c !== 'All')
                .map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
            </select>
          </div>
          <div>
            <label
              htmlFor="expense_date"
              className="block text-sm font-medium text-gray-700"
            >
              Date *
            </label>
            <input
              type="date"
              id="expense_date"
              name="expense_date"
              value={formData.expense_date}
              onChange={handleChange}
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
              max={new Date().toISOString().split('T')[0]} // Restrict to current date
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
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
            >
              <option value="">Select a unit</option>
              {units.length > 0 ? (
                units.map((unit) => (
                  <option key={unit.unit_id} value={unit.unit_id}>
                    {unit.unit_number}
                  </option>
                ))
              ) : (
                <option value="" disabled>
                  No units available
                </option>
              )}
            </select>
          </div>
          <div>
            <label
              htmlFor="block_id"
              className="block text-sm font-medium text-gray-700"
            >
              Block
            </label>
            <select
              id="block_id"
              name="block_id"
              value={formData.block_id || ''}
              onChange={handleChange}
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
            >
              <option value="">Select a block</option>
              {blocks.length > 0 ? (
                blocks.map((block) => (
                  <option key={block.block_id} value={block.block_id}>
                    {block.block_name}
                  </option>
                ))
              ) : (
                <option value="" disabled>
                  No blocks available
                </option>
              )}
            </select>
          </div>
          <div>
            <label
              htmlFor="property_id"
              className="block text-sm font-medium text-gray-700"
            >
              Property
            </label>
            <select
              id="property_id"
              name="property_id"
              value={formData.property_id || ''}
              onChange={handleChange}
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
            >
              <option value="">Select a property</option>
              {properties.length > 0 ? (
                properties.map((property) => (
                  <option
                    key={property.property_id}
                    value={property.property_id}
                  >
                    {property.name}
                  </option>
                ))
              ) : (
                <option value="" disabled>
                  No properties available
                </option>
              )}
            </select>
          </div>
          <div>
            <label
              htmlFor="payment_method"
              className="block text-sm font-medium text-gray-700"
            >
              Payment Method *
            </label>
            <select
              id="payment_method"
              name="payment_method"
              value={formData.payment_method}
              onChange={handleChange}
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
              required
            >
              <option value="">Select a method</option>
              <option value="Cash">Cash</option>
              <option value="Bank Transfer">Bank Transfer</option>
              <option value="Credit Card">Credit Card</option>
              <option value="Mobile Money">Mobile Money</option>
              <option value="Check">Check</option>
              <option value="Other">Other</option>
            </select>
          </div>
          <div>
            <label
              htmlFor="vendor"
              className="block text-sm font-medium text-gray-700"
            >
              Vendor (Optional)
            </label>
            <input
              type="text"
              id="vendor"
              name="vendor"
              value={formData.vendor}
              onChange={handleChange}
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
            />
          </div>
          <div>
            <label
              htmlFor="invoice_number"
              className="block text-sm font-medium text-gray-700"
            >
              Invoice Number (Optional)
            </label>
            <input
              type="text"
              id="invoice_number"
              name="invoice_number"
              value={formData.invoice_number || ''}
              onChange={handleChange}
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
            />
          </div>
          <div>
            <label
              htmlFor="paid_by"
              className="block text-sm font-medium text-gray-700"
            >
              Paid By (Optional)
            </label>
            <input
              type="text"
              id="paid_by"
              name="paid_by"
              value={formData.paid_by || ''}
              onChange={handleChange}
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
            />
          </div>
          <div className="col-span-2 flex justify-end gap-3 mt-6">
            <button
              type="button"
              onClick={onClose}
              className="bg-gray-200 hover:bg-gray-300 text-gray-800 px-4 py-2 rounded-lg"
            >
              Cancel
            </button>
            <button
              type="submit"
              onClick={handleSubmit}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg"
            >
              {initialData ? 'Save Changes' : 'Add Expense'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
