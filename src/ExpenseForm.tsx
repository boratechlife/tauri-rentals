import { useState } from 'react';
import { NewExpense, Expense } from './Expense';

// Add this component outside the ExpensePage component, or in a separate file
interface ExpenseFormProps {
  initialData?: NewExpense | Expense;
  onClose: () => void;
  onSubmit: (expense: NewExpense | Expense) => void;
  categories: string[];
  units: { id: string; unit_number: string }[]; // Assuming you'll fetch units
  blocks: string[]; // Assuming you'll fetch blocks if needed for unit selection
}

export const ExpenseForm: React.FC<ExpenseFormProps> = ({
  initialData,
  onClose,
  onSubmit,
  categories,
  units, // Pass units to the form
}) => {
  const [formData, setFormData] = useState<NewExpense | Expense>(
    initialData || {
      amount: '',
      category: '',
      description: '',
      date: new Date().toISOString().split('T')[0],
      unitId: '',
      paymentMethod: '',
      vendor: '',
    }
  );

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex  items-center justify-center z-50">
      <div className="bg-white rounded-xl p-6 w-full max-w-md mx-4">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          {initialData ? 'Edit Expense' : 'Add New Expense'}
        </h3>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label
              htmlFor="description"
              className="block text-sm font-medium text-gray-700"
            >
              Description
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
              Amount
            </label>
            <input
              type="number"
              id="amount"
              name="amount"
              value={formData.amount}
              onChange={handleChange}
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
              step="0.01"
              required
            />
          </div>
          <div>
            <label
              htmlFor="category"
              className="block text-sm font-medium text-gray-700"
            >
              Category
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
              {categories
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
              htmlFor="date"
              className="block text-sm font-medium text-gray-700"
            >
              Date
            </label>
            <input
              type="date"
              id="date"
              name="date"
              value={formData.date}
              onChange={handleChange}
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
              required
            />
          </div>
          <div>
            <label
              htmlFor="unitId"
              className="block text-sm font-medium text-gray-700"
            >
              Unit
            </label>
            <select
              id="unitId"
              name="unitId"
              value={formData.unitId}
              onChange={handleChange}
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
              required
            >
              <option value="">Select a unit</option>
              {units.map((unit) => (
                <option key={unit.id} value={unit.id}>
                  {unit.unit_number}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label
              htmlFor="paymentMethod"
              className="block text-sm font-medium text-gray-700"
            >
              Payment Method
            </label>
            <input
              type="text"
              id="paymentMethod"
              name="paymentMethod"
              value={formData.paymentMethod}
              onChange={handleChange}
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
              required
            />
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
          <div className="flex justify-end gap-3 mt-6">
            <button
              type="button"
              onClick={onClose}
              className="bg-gray-200 hover:bg-gray-300 text-gray-800 px-4 py-2 rounded-lg"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg"
            >
              {initialData ? 'Save Changes' : 'Add Expense'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
