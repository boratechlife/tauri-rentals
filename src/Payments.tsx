import React, { useState, useMemo, useEffect } from 'react';
import { Search, Plus, Eye, Edit, Trash2 } from 'lucide-react';
import { invoke } from '@tauri-apps/api/core';

import Database from '@tauri-apps/plugin-sql';
import { PaymentFormModal } from './PaymentFormModal';
import { DeleteConfirmationModal } from './DeleteConfirmationModal';

export interface Payment {
  id: string;
  tenant: string;
  unit: string;
  property: string;
  amount: number;
  date: string;
  dueDate: string;
  status: 'Paid' | 'Pending' | 'Late' | 'Overdue';
  method: 'Bank Transfer' | 'Credit Card' | 'Check' | 'Cash';
  category: 'Rent' | 'Utilities' | 'Maintenance' | 'Deposit';
}

interface Tenant {
  id: string;
  name: string;
  email: string;
  phone: string;
  unit: string;
  property: string;
  leaseStart: string;
  leaseEnd: string;
  rentAmount: number;
  status: 'Active' | 'Moving Out' | 'Overdue';
}

interface Property {
  id: string;
  name: string;
  address: string;
  units: number;
  occupiedUnits: number;
  monthlyRevenue: number;
  expenses: number;
}

const PropertyManagementDashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [payments, setPayments] = useState([]);
  const [searchText, setSearchText] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [dateRange, setDateRange] = useState('thisMonth');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // State for CRUD Modals - NEW
  const [showAddEditModal, setShowAddEditModal] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [selectedPayment, setSelectedPayment] = useState<Payment | null>(null); // For editing or deleting

  // Database instance, initialized once - NEW
  const [dbInstance, setDbInstance] = useState<Database | null>(null);

  async function fetchPayments() {
    try {
      setLoading(true);
      const db = await Database.load('sqlite:test.db');
      // Assuming your payments table has these columns
      const dbPayments = await db.select(
        `SELECT id, tenant, unit, property, amount, date, due_date, status, method, category FROM payments`
      );
      setError('');
      setPayments(dbPayments);
      console.log('Payments fetched successfully:', dbPayments);
    } catch (err) {
      console.error('Error fetching payments:', err);
      setError('Failed to get payments - check console');
    } finally {
      setLoading(false);
    }
  }

  // Function to handle payment deletion - NEW
  const handleDeletePayment = async () => {
    if (!selectedPayment) {
      setError('Database not initialized or no payment selected for deletion.');
      return;
    }
    setLoading(true);
    const db = await Database.load('sqlite:test.db');
    try {
      await db.execute(`DELETE FROM payments WHERE id = $1`, [
        selectedPayment.id,
      ]);
      console.log('Payment deleted successfully:', selectedPayment.id);
      fetchPayments(); // Refresh the list after deletion
      setShowDeleteConfirm(false); // Close the confirmation modal
      setSelectedPayment(null); // Clear selected payment
    } catch (err) {
      console.error('Error deleting payment:', err);
      setError('Failed to delete payment.');
    } finally {
      setLoading(false);
    }
  };

  // Function to handle adding or updating a payment - NEW/MODIFIED
  const handleSavePayment = async (
    paymentData: Omit<Payment, 'id'> | Payment
  ) => {
    const db = await Database.load('sqlite:test.db');
    setLoading(true);
    try {
      if ('id' in paymentData && paymentData.id !== null) {
        // Update existing payment - MODIFIED
        await db.execute(
          `UPDATE payments SET tenant = $1, unit = $2, property = $3, amount = $4, date = $5, due_date = $6, status = $7, method = $8, category = $9 WHERE id = $10`,
          [
            paymentData.tenant,
            paymentData.unit,
            paymentData.property,
            paymentData.amount,
            paymentData.date,
            paymentData.dueDate,
            paymentData.status,
            paymentData.method,
            paymentData.category,
            paymentData.id, // Use the ID for the WHERE clause
          ]
        );
        console.log('Payment updated successfully:', paymentData.id);
      } else {
        // Add new payment (from Step 3)
        await db.execute(
          `INSERT INTO payments (id,tenant, unit, property, amount, date, due_date, status, method, category) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9,$10)`,
          [
            // generate id by finding the max id and adding one
            (() => {
              // Find the max id in the current payments array (as number)
              const maxId = payments.reduce((max, p) => {
                const idNum = parseInt(p.id, 10);
                return !isNaN(idNum) && idNum > max ? idNum : max;
              }, 0);
              return String(maxId + 1);
            })(),
            paymentData.tenant,
            paymentData.unit,
            paymentData.property,
            paymentData.amount,
            paymentData.date,
            paymentData.dueDate,
            paymentData.status,
            paymentData.method,
            paymentData.category,
          ]
        );
        console.log('New payment added successfully.');
      }
      fetchPayments(); // Refresh the list after save
      setShowAddEditModal(false); // Close the modal
      setSelectedPayment(null); // Clear selected payment
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
        payment.tenant.toLowerCase().includes(searchText.toLowerCase()) ||
        payment.unit.toLowerCase().includes(searchText.toLowerCase()) ||
        payment.property.toLowerCase().includes(searchText.toLowerCase());
      const matchesFilter =
        filterStatus === 'all' ||
        payment.status.toLowerCase() === filterStatus.toLowerCase();
      return matchesSearch && matchesFilter;
    });
  }, [payments, searchText, filterStatus]);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-6">
          {/* Filters */}
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
                <option value="late">Late</option>
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
                  setSelectedPayment(null); // Ensure no old data for add mode - MODIFIED
                  setShowAddEditModal(true);
                }}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <Plus className="w-4 h-4" />
                Add Payment
              </button>
            </div>
          </div>

          {/* Payments Table */}
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
                      key={payment.id}
                      className="hover:bg-gray-50 transition-colors"
                    >
                      <td className="py-4 px-6">
                        <div>
                          <p className="font-medium text-gray-900">
                            {payment.tenant}
                          </p>
                          <p className="text-sm text-gray-600">
                            {payment.unit}
                          </p>
                        </div>
                      </td>
                      <td className="py-4 px-6 text-gray-900">
                        {payment.property}
                      </td>
                      <td className="py-4 px-6">
                        <div>
                          <p className="font-semibold text-gray-900">
                            ${payment.amount.toLocaleString()}
                          </p>
                          <p className="text-xs text-gray-500">
                            {payment.category}
                          </p>
                        </div>
                      </td>
                      <td className="py-4 px-6 text-gray-900">
                        {payment.due_date}
                      </td>
                      <td className="py-4 px-6">
                        <span
                          className={`inline-flex px-3 py-1 rounded-full text-sm font-medium ${
                            payment.status === 'Paid'
                              ? 'bg-green-100 text-green-800'
                              : payment.status === 'Pending'
                              ? 'bg-yellow-100 text-yellow-800'
                              : payment.status === 'Late'
                              ? 'bg-orange-100 text-orange-800'
                              : 'bg-red-100 text-red-800'
                          }`}
                        >
                          {payment.status}
                        </span>
                      </td>
                      <td className="py-4 px-6 text-gray-900">
                        {payment.method || '-'}
                      </td>
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-2">
                          <button className="p-1 text-blue-600 hover:text-blue-800 transition-colors">
                            <Eye className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => {
                              setSelectedPayment(payment); // Set the payment to be edited - MODIFIED
                              setShowAddEditModal(true);
                            }}
                            className="p-1 text-green-600 hover:text-green-800 transition-colors"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => {
                              setSelectedPayment(payment); // Set the payment to be deleted - MODIFIED
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

      {/* Payment Add/Edit Modal - NEW */}
      <PaymentFormModal
        isOpen={showAddEditModal}
        onClose={() => setShowAddEditModal(false)}
        onSave={handleSavePayment}
        initialData={selectedPayment}
      />

      {/* Delete Confirmation Modal - NEW */}
      <DeleteConfirmationModal
        isOpen={showDeleteConfirm}
        onClose={() => setShowDeleteConfirm(false)}
        onConfirm={handleDeletePayment}
        itemName={selectedPayment?.tenant || 'this payment'} // Show tenant name in confirmation
      />
    </div>
  );
};

export default PropertyManagementDashboard;
