import { useState, useEffect } from 'react';

// Assuming these interfaces are defined in a file like './Expense'
interface NewExpense {
  amount: number | string;
  category: string;
  description: string;
  expense_date: string;
  unit_id?: number | string;
  block_id?: number | string;
  property_id?: number | string;
  payment_method: string;
  vendor?: string;
  invoice_number?: string;
  paid_by?: string;
}

interface Expense extends NewExpense {
  expense_id: number; // Assuming an ID for existing expenses
}

interface ExpenseFormProps {
  initialData?: any;
  onClose: () => void;
  onSubmit: (data: any) => void;
  categories: string[];
  units: {
    unit_id: number;
    unit_number: string;
    block_id: number;
    property_id: number;
  }[];
  blocks: { block_id: number; block_name: string; property_id: number }[];
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
  // State to manage form data
  const [formData, setFormData] = useState<NewExpense | Expense>(
    initialData || {
      amount: '',
      category: '',
      description: '',
      expense_date: new Date().toISOString().split('T')[0], // Today's date
      unit_id: '',
      block_id: '',
      property_id: '',
      payment_method: '',
      vendor: '',
      invoice_number: undefined,
      paid_by: undefined,
    }
  );

  // State for validation message
  const [showValidationMessage, setShowValidationMessage] = useState(false);
  const [validationMessage, setValidationMessage] = useState('');

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
    propCategories && propCategories.length > 0
      ? propCategories
      : hardcodedCategories;

  // Effect to update form data when initialData changes (e.g., for editing)
  useEffect(() => {
    if (initialData) {
      setFormData(initialData);
    }
  }, [initialData]);

  // Filtered blocks based on selected property
  const filteredBlocks =
    properties.length > 0 && formData.property_id
      ? blocks.filter((block) => block.property_id === formData.property_id)
      : blocks; // If no property selected, show all blocks or if properties are not available

  // Filtered units based on selected property and block
  const filteredUnits =
    properties.length > 0 && formData.property_id
      ? units.filter((unit) => unit.property_id == formData.property_id)
      : units; // If no property selected, show all units or if properties are not available

  // Handle input changes
  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >
  ) => {
    const { name, value } = e.target;

    setFormData((prev) => {
      let updatedFormData = { ...prev };

      // Type conversion for numeric fields
      if (['amount', 'unit_id', 'block_id', 'property_id'].includes(name)) {
        updatedFormData = {
          ...updatedFormData,
          [name]: value === '' ? '' : parseFloat(value), // Use parseFloat for amount, parseInt for IDs
        };
      } else {
        updatedFormData = {
          ...updatedFormData,
          [name]: value,
        };
      }

      // Reset dependent fields when property or block changes
      if (name === 'property_id') {
        updatedFormData.block_id = ''; // Reset block when property changes
        updatedFormData.unit_id = ''; // Reset unit when property changes
      } else if (name === 'block_id') {
        updatedFormData.unit_id = ''; // Reset unit when block changes
      }

      return updatedFormData;
    });
  };

  // Handle form submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Basic validation
    if (
      !formData.amount ||
      !formData.category ||
      !formData.expense_date ||
      !formData.payment_method ||
      !formData.description
    ) {
      setValidationMessage(
        'Please fill in all required fields (marked with *).'
      );
      setShowValidationMessage(true);
      return;
    }
    onSubmit(formData);
    onClose(); // Close the form after successful submission
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl p-6 w-full max-w-2xl mx-auto h-[90vh] overflow-y-auto shadow-lg">
        <h3 className="text-2xl font-bold text-gray-900 mb-6 text-center">
          {initialData ? 'Edit Expense' : 'Add New Expense'}
        </h3>

        {/* Validation Message Box */}
        {showValidationMessage && (
          <div
            className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4"
            role="alert"
          >
            <strong className="font-bold">Error!</strong>
            <span className="block sm:inline ml-2">{validationMessage}</span>
            <span
              className="absolute top-0 bottom-0 right-0 px-4 py-3"
              onClick={() => setShowValidationMessage(false)}
            >
              <svg
                className="fill-current h-6 w-6 text-red-500"
                role="button"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 20 20"
              >
                <title>Close</title>
                <path d="M14.348 14.849a1.2 1.2 0 0 1-1.697 0L10 11.819l-2.651 3.029a1.2 1.2 0 1 1-1.697-1.697l2.758-3.15-2.759-3.15a1.2 1.2 0 1 1 1.697-1.697L10 8.183l2.651-3.029a1.2 1.2 0 1 1 1.697 1.697L11.819 10l3.029 2.651a1.2 1.2 0 0 1 0 1.698z" />
              </svg>
            </span>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Description */}
            <div>
              <label
                htmlFor="description"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Description <span className="text-red-500">*</span>
              </label>
              <textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleChange}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-3 focus:ring-blue-500 focus:border-blue-500 transition duration-150 ease-in-out"
                rows={3}
                required
              />
            </div>

            {/* Amount */}
            <div>
              <label
                htmlFor="amount"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Amount (KES.)<span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                id="amount"
                name="amount"
                value={formData.amount}
                onChange={handleChange}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-3 focus:ring-blue-500 focus:border-blue-500 transition duration-150 ease-in-out"
                step="0.01"
                min="0"
                required
              />
            </div>

            {/* Category */}
            <div>
              <label
                htmlFor="category"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Category <span className="text-red-500">*</span>
              </label>
              <select
                id="category"
                name="category"
                value={formData.category}
                onChange={handleChange}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-3 focus:ring-blue-500 focus:border-blue-500 transition duration-150 ease-in-out"
                required
              >
                <option value="">Select a category</option>
                {effectiveCategories
                  .filter((c) => c !== 'All') // Exclude 'All' if it's in the categories list
                  .map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
              </select>
            </div>

            {/* Expense Date */}
            <div>
              <label
                htmlFor="expense_date"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Date <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                id="expense_date"
                name="expense_date"
                value={formData.expense_date}
                onChange={handleChange}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-3 focus:ring-blue-500 focus:border-blue-500 transition duration-150 ease-in-out"
                max={new Date().toISOString().split('T')[0]} // Restrict to current date
                required
              />
            </div>

            {/* Property */}
            <div>
              <label
                htmlFor="property_id"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Property
              </label>
              <select
                id="property_id"
                name="property_id"
                value={formData.property_id || ''}
                onChange={handleChange}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-3 focus:ring-blue-500 focus:border-blue-500 transition duration-150 ease-in-out"
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

            {/* Block (filtered by property) */}
            <div>
              <label
                htmlFor="block_id"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Block
              </label>
              <select
                id="block_id"
                name="block_id"
                value={formData.block_id || ''}
                onChange={handleChange}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-3 focus:ring-blue-500 focus:border-blue-500 transition duration-150 ease-in-out"
                disabled={!formData.property_id} // Disable if no property is selected
              >
                <option value="">Select a block</option>
                {filteredBlocks.length > 0 ? (
                  filteredBlocks.map((block) => (
                    <option key={block.block_id} value={block.block_id}>
                      {block.block_name}
                    </option>
                  ))
                ) : (
                  <option value="" disabled>
                    No blocks available for this property
                  </option>
                )}
              </select>
            </div>

            {/* Unit (filtered by property and block) */}
            <div>
              <label
                htmlFor="unit_id"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Unit
              </label>
              <select
                id="unit_id"
                name="unit_id"
                value={formData.unit_id || ''}
                onChange={handleChange}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-3 focus:ring-blue-500 focus:border-blue-500 transition duration-150 ease-in-out"
                disabled={!formData.property_id} // Disable if no property is selected
              >
                <option value="">Select a unit</option>
                {filteredUnits.length > 0 ? (
                  filteredUnits.map((unit) => (
                    <option key={unit.unit_id} value={unit.unit_id}>
                      {unit.unit_number}
                    </option>
                  ))
                ) : (
                  <option value="" disabled>
                    No units available for this property/block
                  </option>
                )}
              </select>
            </div>

            {/* Payment Method */}
            <div>
              <label
                htmlFor="payment_method"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Payment Method <span className="text-red-500">*</span>
              </label>
              <select
                id="payment_method"
                name="payment_method"
                value={formData.payment_method}
                onChange={handleChange}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-3 focus:ring-blue-500 focus:border-blue-500 transition duration-150 ease-in-out"
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

            {/* Vendor */}
            <div>
              <label
                htmlFor="vendor"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Vendor (Optional)
              </label>
              <input
                type="text"
                id="vendor"
                name="vendor"
                value={formData.vendor || ''}
                onChange={handleChange}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-3 focus:ring-blue-500 focus:border-blue-500 transition duration-150 ease-in-out"
              />
            </div>

            {/* Invoice Number */}
            <div>
              <label
                htmlFor="invoice_number"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Invoice Number (Optional)
              </label>
              <input
                type="text"
                id="invoice_number"
                name="invoice_number"
                value={formData.invoice_number || ''}
                onChange={handleChange}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-3 focus:ring-blue-500 focus:border-blue-500 transition duration-150 ease-in-out"
              />
            </div>

            {/* Paid By */}
            <div>
              <label
                htmlFor="paid_by"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Paid By (Optional)
              </label>
              <input
                type="text"
                id="paid_by"
                name="paid_by"
                value={formData.paid_by || ''}
                onChange={handleChange}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-3 focus:ring-blue-500 focus:border-blue-500 transition duration-150 ease-in-out"
              />
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end gap-3 mt-8">
            <button
              type="button"
              onClick={onClose}
              className="bg-gray-200 hover:bg-gray-300 text-gray-800 px-6 py-3 rounded-lg font-medium transition duration-200 ease-in-out shadow-sm"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition duration-200 ease-in-out shadow-md"
            >
              {initialData ? 'Save Changes' : 'Add Expense'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
