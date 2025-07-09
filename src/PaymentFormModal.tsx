import { X } from 'lucide-react';
import { useState, useEffect } from 'react';
import { Payment } from './Payments'; // Assuming Payment interface is defined here
import Database from '@tauri-apps/plugin-sql';

// Define Tenant, Unit, and Property interfaces for clarity and type safety
interface Tenant {
  tenant_id: number;
  full_name: string;
  unit_id?: number; // Optional, as a tenant might not always be linked to a unit via lease in this direct query
  property_id?: number; // Optional, same reason
  property_name?: string; // Added for display in dropdown
  unit_number?: string; // Added for display in dropdown
}

interface Unit {
  unit_id: number;
  unit_number: string;
  property_id: number;
}

interface Property {
  property_id: number;
  name: string;
}

// Initial form state for adding/editing payments
export const initialPaymentFormState: Omit<Payment, 'payment_id'> = {
  tenant_id: 0,
  unit_id: 0,
  property_id: 0,
  amount_paid: 0,
  payment_date: new Date().toISOString().split('T')[0], // Default to today
  due_date: '',
  payment_status: 'Pending',
  payment_method: 'Bank Transfer',
  payment_category: 'Rent',
  payment_month: '',
  receipt_number: undefined,
  transaction_reference: undefined,
  remarks: undefined,
  created_at: undefined,
  updated_at: undefined,
  tenant_name: undefined, // These are for display, not directly stored in DB for Payments
  unit_number: undefined,
  property_name: undefined,
};

// Component for adding/editing payments
export interface PaymentFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (payment: Omit<Payment, 'payment_id'> | Payment) => void;
  initialData?: Payment | null;
}

export const PaymentFormModal: React.FC<PaymentFormModalProps> = ({
  isOpen,
  onClose,
  onSave,
  initialData,
}) => {
  const [formData, setFormData] = useState<
    Omit<Payment, 'payment_id'> | Payment
  >(initialData || initialPaymentFormState);
  // Updated type for tenants state to include property and unit info
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [allUnits, setAllUnits] = useState<Unit[]>([]); // All units, regardless of property
  const [units, setUnits] = useState<Unit[]>([]); // Units filtered by selected property
  const [properties, setProperties] = useState<Property[]>([]);

  // Effect to populate form when initialData changes (for editing mode)
  useEffect(() => {
    if (initialData) {
      setFormData({
        ...initialData,
        payment_month: initialData.due_date
          ? initialData.due_date.slice(0, 7)
          : '',
      });
    } else {
      setFormData(initialPaymentFormState);
    }
  }, [initialData]);

  // Fetch tenants, all units, and properties for dropdowns
  useEffect(() => {
    async function fetchData() {
      try {
        const db = await Database.load('sqlite:productionv7.db');

        // Fetch tenants along with their active unit and property from the 'leases' table
        // This query is now updated to fetch property_name and unit_number for display
        const dbTenants = await db.select(`
          SELECT
              t.tenant_id,
              t.full_name,
              t.unit_id,
              u.property_id,
              u.unit_number,  -- Select unit_number
              p.name AS property_name -- Select property name and alias it
          FROM tenants t
          LEFT JOIN units u ON t.unit_id = u.unit_id
          LEFT JOIN properties p ON u.property_id = p.property_id
        `);

        // Fetch all units
        const dbUnits = await db.select(`
          SELECT unit_id, unit_number, property_id FROM units
        `);

        // Fetch all properties
        const dbProperties = await db.select(`
          SELECT property_id, name FROM properties
        `);

        setTenants(dbTenants as Tenant[]); // Use the updated Tenant type
        setAllUnits(dbUnits as Unit[]);
        setProperties(dbProperties as Property[]);
      } catch (err) {
        console.error('Error fetching data:', err);
      }
    }
    if (isOpen) fetchData();
  }, [isOpen]);

  // Filter units whenever the selected property changes
  // This useEffect will react to changes in formData.property_id,
  // which will be updated either manually or by selecting a tenant.
  useEffect(() => {
    if (formData.property_id) {
      const filtered = allUnits.filter(
        (unit) => unit.property_id === formData.property_id
      );
      setUnits(filtered);
    } else {
      setUnits([]); // Clear units if no property is selected or property is reset
    }
  }, [formData.property_id, allUnits]);

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >
  ) => {
    const { name, value } = e.target;
    setFormData((prevData) => {
      let newData = { ...prevData };

      if (name === 'tenant_id') {
        const selectedTenantId = parseInt(value);
        // Find the selected tenant from our fetched list
        const selectedTenant = tenants.find(
          (t) => t.tenant_id === selectedTenantId
        );

        if (selectedTenant) {
          // Automatically set property_id and unit_id based on the selected tenant's associated data
          newData = {
            ...newData,
            tenant_id: selectedTenantId,
            property_id: selectedTenant.property_id || 0, // Use 0 if not found/null
            unit_id: selectedTenant.unit_id || 0, // Use 0 if not found/null
          };
        } else {
          // If no tenant selected or no associated data, reset
          newData = {
            ...newData,
            tenant_id: selectedTenantId,
            property_id: 0,
            unit_id: 0,
          };
        }
      } else if (name === 'property_id') {
        // If property is changed manually, reset the unit_id
        newData = {
          ...newData,
          property_id: parseInt(value) || 0,
          unit_id: 0, // Reset unit_id when property changes manually
        };
      } else {
        // Handle other form fields
        newData = {
          ...newData,
          [name]:
            name === 'amount_paid' ||
            name === 'tenant_id' ||
            name === 'unit_id' ||
            name === 'property_id'
              ? parseInt(value) || 0 // Parse IDs and amount as integers
              : value,
        };
      }

      // Handle payment_month update based on due_date (if it's changed)
      if (name === 'due_date' && value) {
        newData = { ...newData, payment_month: value.slice(0, 7) };
      }

      return newData;
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Ensure payment_month is set even if due_date hasn't changed manually
    const finalFormData = {
      ...formData,
      payment_month: formData.due_date ? formData.due_date.slice(0, 7) : '',
    };
    onSave(finalFormData);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl shadow-2xl p-8 w-full max-w-md max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-800">
            {initialData ? 'Edit Payment' : 'Add New Payment'}
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
              htmlFor="tenant_id"
              className="block text-sm font-medium text-gray-700"
            >
              Tenant
            </label>
            <select
              id="tenant_id"
              name="tenant_id"
              value={formData.tenant_id || ''}
              onChange={handleChange}
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              required
            >
              <option value="">Select Tenant </option>
              {tenants.map((tenant) => (
                <option key={tenant.tenant_id} value={tenant.tenant_id}>
                  {/* Display tenant name with property and unit in a bracket */}
                  {tenant.full_name}
                  {tenant.property_name &&
                    tenant.unit_number &&
                    ` (${tenant.property_name} - Unit ${tenant.unit_number})`}
                  {/* Fallback for cases where property_name/unit_number might be missing, but IDs are present */}
                  {!tenant.property_name &&
                    !tenant.unit_number &&
                    tenant.unit_id &&
                    ` (Unit ID: ${tenant.unit_id})`}
                  {!tenant.property_name &&
                    tenant.property_id &&
                    !tenant.unit_id &&
                    ` (Property ID: ${tenant.property_id})`}
                </option>
              ))}
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
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              required
              disabled
            >
              <option value="">Select Property</option>
              {properties.map((property) => (
                <option key={property.property_id} value={property.property_id}>
                  {property.name}
                </option>
              ))}
            </select>
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
              // Disable if no property is selected or no units are available for the selected property
              disabled
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
              htmlFor="amount_paid"
              className="block text-sm font-medium text-gray-700"
            >
              Amount
            </label>
            <input
              type="number"
              id="amount_paid"
              name="amount_paid"
              value={formData.amount_paid || 0}
              onChange={handleChange}
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              required
              min="0"
              step="0.01"
            />
          </div>
          <div>
            <label
              htmlFor="payment_date"
              className="block text-sm font-medium text-gray-700"
            >
              Payment Date
            </label>
            <input
              type="date"
              id="payment_date"
              name="payment_date"
              value={formData.payment_date || ''}
              onChange={handleChange}
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              required
            />
          </div>
          <div>
            <label
              htmlFor="due_date"
              className="block text-sm font-medium text-gray-700"
            >
              Due Date
            </label>
            <input
              type="date"
              id="due_date"
              name="due_date"
              value={formData.due_date || ''}
              onChange={handleChange}
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              required
            />
          </div>
          <div>
            <label
              htmlFor="payment_status"
              className="block text-sm font-medium text-gray-700"
            >
              Status
            </label>
            <select
              id="payment_status"
              name="payment_status"
              value={formData.payment_status}
              onChange={handleChange}
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              required
            >
              <option value="Paid">Paid</option>
              <option value="Pending">Pending</option>
              <option value="Overdue">Overdue</option>
            </select>
          </div>
          <div>
            <label
              htmlFor="payment_method"
              className="block text-sm font-medium text-gray-700"
            >
              Payment Method
            </label>
            <select
              id="payment_method"
              name="payment_method"
              value={formData.payment_method}
              onChange={handleChange}
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              required
            >
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
              htmlFor="payment_category"
              className="block text-sm font-medium text-gray-700"
            >
              Category
            </label>
            <select
              id="payment_category"
              name="payment_category"
              value={formData.payment_category}
              onChange={handleChange}
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              required
            >
              <option value="Rent">Rent</option>
              <option value="Utilities">Utilities</option>
              <option value="Deposit">Deposit</option>
              <option value="Other">Other</option>
            </select>
          </div>
          <div>
            <label
              htmlFor="receipt_number"
              className="block text-sm font-medium text-gray-700"
            >
              Receipt Number (Optional)
            </label>
            <input
              type="text"
              id="receipt_number"
              name="receipt_number"
              value={formData.receipt_number || ''}
              onChange={handleChange}
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          <div>
            <label
              htmlFor="transaction_reference"
              className="block text-sm font-medium text-gray-700"
            >
              Transaction Reference (Optional)
            </label>
            <input
              type="text"
              id="transaction_reference"
              name="transaction_reference"
              value={formData.transaction_reference || ''}
              onChange={handleChange}
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          <div>
            <label
              htmlFor="remarks"
              className="block text-sm font-medium text-gray-700"
            >
              Remarks (Optional)
            </label>
            <textarea
              id="remarks"
              name="remarks"
              value={formData.remarks || ''}
              onChange={handleChange}
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            />
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
              {initialData ? 'Update Payment' : 'Add Payment'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
