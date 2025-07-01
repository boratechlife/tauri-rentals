import React, { useState, useMemo, useEffect } from 'react';
import { Search, Plus, Eye, Edit, Trash2 } from 'lucide-react';
import Database from '@tauri-apps/plugin-sql';
import { PaymentFormModal } from './PaymentFormModal';
import { DeleteConfirmationModal } from './DeleteConfirmationModal';

export interface Payment {
  payment_id: string;
  tenant_id: number; // Updated to INTEGER from TEXT
  unit_id: number; // Updated to INTEGER from TEXT
  property_id: number; // Updated to INTEGER from TEXT
  amount_paid: number;
  payment_date: string;
  due_date: string;
  payment_status: 'Paid' | 'Pending' | 'Overdue';
  payment_method:
    | 'Cash'
    | 'Bank Transfer'
    | 'Credit Card'
    | 'Mobile Money'
    | 'Check'
    | 'Other';
  payment_category: 'Rent' | 'Utilities' | 'Deposit' | 'Other';
  receipt_number?: string;
  transaction_reference?: string;
  remarks?: string;
  created_at?: string;
  updated_at?: string;
  tenant_name?: string; // Derived from tenants table
  unit_number?: string; // Derived from units table
  property_name?: string; // Derived from properties table
}

interface Tenant {
  tenant_id: number;
  full_name: string;
  phone_number: string;
  email: string;
  id_number: string;
  lease_start_date: string;
  lease_end_date: string;
  rent_amount: number;
  deposit_amount: number;
  unit_id: number | null; // Nullable foreign key to units
  status: 'active' | 'Moving Out' | 'Inactive';
  created_at?: string;
  updated_at?: string;
}

interface Property {
  property_id: number;
  name: string;
  address: string;
  total_units: number;
  property_type: string;
  status: string;
  last_inspection?: string;
  manager_id: number;
  created_at?: string;
  updated_at?: string;
}

const PropertyManagementDashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [payments, setPayments] = useState<Payment[]>([]);
  const [searchText, setSearchText] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [dateRange, setDateRange] = useState('thisMonth');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [showAddEditModal, setShowAddEditModal] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [selectedPayment, setSelectedPayment] = useState<Payment | null>(null);

  async function fetchPayments() {
    try {
      setLoading(true);
      const db = await Database.load('sqlite:test4.db');
      const dbPayments = await db.select(`
        SELECT 
          p.payment_id, p.tenant_id, p.unit_id, p.property_id, p.amount_paid,
          p.payment_date, p.due_date, p.payment_status, p.payment_method, p.payment_category,
          p.receipt_number, p.transaction_reference, p.remarks, p.created_at, p.updated_at,
          t.full_name AS tenant_name, u.unit_number, pr.name AS property_name
        FROM payments p
        LEFT JOIN tenants t ON p.tenant_id = t.tenant_id
        LEFT JOIN units u ON p.unit_id = u.unit_id
        LEFT JOIN properties pr ON p.property_id = pr.property_id
      `);
      setError('');
      setPayments(dbPayments as Payment[]);
    } catch (err) {
      console.error('Error fetching payments:', err);
      setError('Failed to get payments - check console');
    } finally {
      setLoading(false);
    }
  }

  const handleDeletePayment = async () => {
    if (!selectedPayment) {
      setError('No payment selected for deletion.');
      return;
    }
    setLoading(true);
    const db = await Database.load('sqlite:test4.db');
    try {
      await db.execute(`DELETE FROM payments WHERE payment_id = $1`, [
        selectedPayment.payment_id,
      ]);
      console.log('Payment deleted successfully:', selectedPayment.payment_id);
      fetchPayments();
      setShowDeleteConfirm(false);
      setSelectedPayment(null);
    } catch (err) {
      console.error('Error deleting payment:', err);
      setError('Failed to delete payment.');
    } finally {
      setLoading(false);
    }
  };

  const handleSavePayment = async (
    paymentData: Omit<Payment, 'payment_id'> | Payment
  ) => {
    const db = await Database.load('sqlite:test4.db');
    setLoading(true);
    try {
      if ('payment_id' in paymentData && paymentData.payment_id !== null) {
        await db.execute(
          `UPDATE payments SET tenant_id = $1, unit_id = $2, property_id = $3, amount_paid = $4,
           payment_date = $5, due_date = $6, payment_status = $7, payment_method = $8,
           payment_category = $9, receipt_number = $10, transaction_reference = $11, remarks = $12,
           updated_at = CURRENT_TIMESTAMP WHERE payment_id = $13`,
          [
            paymentData.tenant_id,
            paymentData.unit_id,
            paymentData.property_id,
            paymentData.amount_paid,
            paymentData.payment_date,
            paymentData.due_date,
            paymentData.payment_status,
            paymentData.payment_method,
            paymentData.payment_category,
            paymentData.receipt_number || null,
            paymentData.transaction_reference || null,
            paymentData.remarks || null,
            paymentData.payment_id,
          ]
        );
        console.log('Payment updated successfully:', paymentData.payment_id);
      } else {
        await db.execute(
          `INSERT INTO payments (payment_id, tenant_id, unit_id, property_id, amount_paid,
           payment_date, due_date, payment_status, payment_method, payment_category,
           receipt_number, transaction_reference, remarks, created_at, updated_at)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)`,
          [
            `PAY${Date.now()}-${Math.floor(Math.random() * 1000)}`,
            paymentData.tenant_id,
            paymentData.unit_id,
            paymentData.property_id,
            paymentData.amount_paid,
            paymentData.payment_date,
            paymentData.due_date,
            paymentData.payment_status,
            paymentData.payment_method,
            paymentData.payment_category,
            paymentData.receipt_number || null,
            paymentData.transaction_reference || null,
            paymentData.remarks || null,
          ]
        );
        console.log('New payment added successfully.');
      }
      fetchPayments();
      setShowAddEditModal(false);
      setSelectedPayment(null);
    } catch (err) {
      console.error('Error saving payment:', err);
      setError('Failed to save payment.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPayments();
  }, []);

  const filteredPayments = useMemo(() => {
    return payments.filter((payment) => {
      const matchesSearch =
        (payment.tenant_name || '')
          .toLowerCase()
          .includes(searchText.toLowerCase()) ||
        (payment.unit_number || '')
          .toLowerCase()
          .includes(searchText.toLowerCase()) ||
        (payment.property_name || '')
          .toLowerCase()
          .includes(searchText.toLowerCase());
      const matchesFilter =
        filterStatus === 'all' ||
        payment.payment_status.toLowerCase() === filterStatus.toLowerCase();
      return matchesSearch && matchesFilter;
    });
  }, [payments, searchText, filterStatus]);

  if (loading) {
    return (
      <div className="p-6 text-center text-gray-600">Loading payments...</div>
    );
  }

  if (error) {
    return (
      <div className="p-6 text-center text-red-600">
        <p>{error}</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-6">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex flex-wrap gap-4 items-center">
              <div className="relative flex-1 min-w-64">
                <input
                  type="text"
                  placeholder="Search tenant, unit, or property..."
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  value={searchText}
                  onChange={(e) => setSearchText(e.target.value)}
                />
                <Search
                  className="absolute left-3 top-2.5 text-gray-400"
                  size={18}
                />
              </div>

              <select
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
              >
                <option value="all">All Status</option>
                <option value="paid">Paid</option>
                <option value="pending">Pending</option>
                <option value="overdue">Overdue</option>
              </select>

              <select
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                value={dateRange}
                onChange={(e) => setDateRange(e.target.value)}
              >
                <option value="thisMonth">This Month</option>
                <option value="lastMonth">Last Month</option>
                <option value="thisYear">This Year</option>
                <option value="custom">Custom Range</option>
              </select>

              <button
                onClick={() => {
                  setSelectedPayment(null);
                  setShowAddEditModal(true);
                }}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <Plus className="w-4 h-4" />
                Add Payment
              </button>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="text-left py-3 px-6 font-semibold text-gray-900">
                      Tenant
                    </th>
                    <th className="text-left py-3 px-6 font-semibold text-gray-900">
                      Property
                    </th>
                    <th className="text-left py-3 px-6 font-semibold text-gray-900">
                      Amount
                    </th>
                    <th className="text-left py-3 px-6 font-semibold text-gray-900">
                      Due Date
                    </th>
                    <th className="text-left py-3 px-6 font-semibold text-gray-900">
                      Status
                    </th>
                    <th className="text-left py-3 px-6 font-semibold text-gray-900">
                      Method
                    </th>
                    <th className="text-left py-3 px-6 font-semibold text-gray-900">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {filteredPayments.map((payment) => (
                    <tr
                      key={payment.payment_id}
                      className="hover:bg-gray-50 transition-colors"
                    >
                      <td className="py-4 px-6">
                        <div>
                          <p className="font-medium text-gray-900">
                            {payment.tenant_name || 'N/A'}
                          </p>
                          <p className="text-sm text-gray-600">
                            {payment.unit_number || 'N/A'}
                          </p>
                        </div>
                      </td>
                      <td className="py-4 px-6 text-gray-900">
                        {payment.property_name || 'N/A'}
                      </td>
                      <td className="py-4 px-6">
                        <div>
                          <p className="font-semibold text-gray-900">
                            ${payment.amount_paid.toLocaleString()}
                          </p>
                          <p className="text-xs text-gray-500">
                            {payment.payment_category}
                          </p>
                        </div>
                      </td>
                      <td className="py-4 px-6 text-gray-900">
                        {payment.due_date}
                      </td>
                      <td className="py-4 px-6">
                        <span
                          className={`inline-flex px-3 py-1 rounded-full text-sm font-medium ${
                            payment.payment_status === 'Paid'
                              ? 'bg-green-100 text-green-800'
                              : payment.payment_status === 'Pending'
                              ? 'bg-yellow-100 text-yellow-800'
                              : 'bg-red-100 text-red-800'
                          }`}
                        >
                          {payment.payment_status}
                        </span>
                      </td>
                      <td className="py-4 px-6 text-gray-900">
                        {payment.payment_method || '-'}
                      </td>
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-2">
                          <button className="p-1 text-blue-600 hover:text-blue-800 transition-colors">
                            <Eye className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => {
                              setSelectedPayment(payment);
                              setShowAddEditModal(true);
                            }}
                            className="p-1 text-green-600 hover:text-green-800 transition-colors"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => {
                              setSelectedPayment(payment);
                              setShowDeleteConfirm(true);
                            }}
                            className="p-1 text-red-600 hover:text-red-800 transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </main>

      <PaymentFormModal
        isOpen={showAddEditModal}
        onClose={() => setShowAddEditModal(false)}
        onSave={handleSavePayment}
        initialData={selectedPayment}
      />

      <DeleteConfirmationModal
        isOpen={showDeleteConfirm}
        onClose={() => setShowDeleteConfirm(false)}
        onConfirm={handleDeletePayment}
        itemName={selectedPayment?.tenant_name || 'this payment'}
      />
    </div>
  );
};

export default PropertyManagementDashboard;
