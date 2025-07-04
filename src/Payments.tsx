import React, { useState, useMemo, useEffect } from 'react';
import { Search, Plus, Eye, Edit, Trash2, Download } from 'lucide-react';
import Database from '@tauri-apps/plugin-sql';
import { PaymentFormModal } from './PaymentFormModal';
import { DeleteConfirmationModal } from './DeleteConfirmationModal';

export interface Payment {
  payment_id: string;
  tenant_id: number; // Updated to INTEGER from TEXT
  unit_id: any; // Updated to INTEGER from TEXT
  property_id: number; // Updated to INTEGER from TEXT
  payment_month: string; // New field for payment month
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

export interface Tenant {
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

export interface Property {
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

interface ArrearsReport {
  tenant_id: number;
  tenant_name: string;
  unit_number: any;
  expected_amount: number;
  total_paid: number;
  balance: number;
  status: 'Arrears' | 'Overpaid' | 'Current';
}

const PropertyManagementDashboard: React.FC = () => {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [searchText, setSearchText] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [filterCategory, setFilterCategory] = useState('all');
  const [filterMonth, setFilterMonth] = useState('');
  const [activeTab, setActiveTab] = useState<'payments' | 'arrears'>(
    'payments'
  );

  const [showAddEditModal, setShowAddEditModal] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [selectedPayment, setSelectedPayment] = useState<Payment | null>(null);
  const [showReportModal, setShowReportModal] = useState(false);
  const [loadingReport, setLoadingReport] = useState(false);
  const [filterMethod, setFilterMethod] = useState('all');

  async function fetchPayments() {
    try {
      setLoading(true);
      const db = await Database.load('sqlite:test6.db');
      const dbPayments = await db.select(`
  SELECT 
    p.payment_id, p.tenant_id, p.unit_id, p.property_id, p.amount_paid,
    p.payment_date, p.due_date, p.payment_status, p.payment_method, p.payment_category,
    p.payment_month, p.receipt_number, p.transaction_reference, p.remarks, p.created_at, p.updated_at,
    t.full_name AS tenant_name, u.unit_number, pr.name AS property_name
  FROM payments p
  LEFT JOIN tenants t ON p.tenant_id = t.tenant_id
  LEFT JOIN units u ON p.unit_id = u.unit_id
  LEFT JOIN properties pr ON p.property_id = pr.property_id
`);
      setError('');
      setPayments(dbPayments as Payment[]);

      const dbTenants = await db.select('SELECT * FROM tenants');
      setTenants(dbTenants as Tenant[]);

      console.log('Tenants', tenants.length);
    } catch (err) {
      console.error('Error fetching payments:', err);
      setError('Failed to get payments - check console');
    } finally {
      setLoading(false);
    }
  }
  async function calculateArrearsReport(
    month: string
  ): Promise<ArrearsReport[]> {
    try {
      const db = await Database.load('sqlite:test6.db');
      const tenantsData = await db.select(`
      SELECT t.tenant_id, t.full_name, t.rent_amount, t.lease_start_date, t.lease_end_date, u.unit_number
      FROM tenants t
      LEFT JOIN units u ON t.unit_id = u.unit_id
      WHERE t.status = 'active'
    `);
      const arrearsReport: ArrearsReport[] = [];
      for (const tenant of tenantsData as Tenant[]) {
        const leaseStart = new Date(tenant.lease_start_date);
        const leaseEnd = new Date(tenant.lease_end_date);
        const selectedMonth = new Date(month + '-01');
        const isWithinLease =
          selectedMonth >= leaseStart && selectedMonth <= leaseEnd;
        if (!isWithinLease) continue;
        const paymentsForMonth: any = await db.select(
          `
  SELECT SUM(amount_paid) as total_paid
  FROM payments
  WHERE tenant_id = $1 AND payment_month = $2 AND payment_category = 'Rent'
`,
          [tenant.tenant_id, month]
        );
        const totalPaid = paymentsForMonth[0]?.total_paid || 0;
        const balance = tenant.rent_amount - totalPaid;

        let status: 'Arrears' | 'Overpaid' | 'Current';
        if (balance > 0) {
          status = 'Arrears';
        } else if (balance < 0) {
          status = 'Overpaid';
        } else {
          status = 'Current';
        }
        arrearsReport.push({
          tenant_id: tenant.tenant_id,
          tenant_name: tenant.full_name,
          unit_number: tenant.unit_id || 'N/A',
          expected_amount: tenant.rent_amount,
          total_paid: totalPaid,
          balance,
          status,
        });
      }
      return arrearsReport;
    } catch (err) {
      console.error('Error calculating arrears report:', err);
      setError('Failed to generate arrears report');
      return [];
    }
  }

  const ArrearsReportTab: React.FC<{ month: string }> = ({ month }) => {
    const [arrearsData, setArrearsData] = useState<ArrearsReport[]>([]);
    const [loadingArrears, setLoadingArrears] = useState(false);
    useEffect(() => {
      if (month) {
        setLoadingArrears(true);
        calculateArrearsReport(month).then((data) => {
          setArrearsData(data);
          setLoadingArrears(false);
        });
      }
    }, [month]);
    if (loadingArrears) {
      return (
        <div className="p-6 text-center text-gray-600">
          Loading arrears report...
        </div>
      );
    }
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h2 className="text-xl font-semibold mb-4">Arrears Report - {month}</h2>
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="text-left py-3 px-6 font-semibold text-gray-900">
                Tenant
              </th>
              <th className="text-left py-3 px-6 font-semibold text-gray-900">
                Unit
              </th>
              <th className="text-left py-3 px-6 font-semibold text-gray-900">
                Expected Amount
              </th>
              <th className="text-left py-3 px-6 font-semibold text-gray-900">
                Total Paid
              </th>
              <th className="text-left py-3 px-6 font-semibold text-gray-900">
                Balance
              </th>
              <th className="text-left py-3 px-6 font-semibold text-gray-900">
                Status
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {arrearsData.map((report) => (
              <tr
                key={report.tenant_id}
                className="hover:bg-gray-50 transition-colors"
              >
                <td className="py-4 px-6">{report.tenant_name}</td>
                <td className="py-4 px-6">{report.unit_number}</td>
                <td className="py-4 px-6">
                  ${report.expected_amount.toLocaleString()}
                </td>
                <td className="py-4 px-6">
                  ${report.total_paid.toLocaleString()}
                </td>
                <td className="py-4 px-6">
                  ${Math.abs(report.balance).toLocaleString()}
                </td>
                <td className="py-4 px-6">
                  <span
                    className={`px-2 py-1 rounded ${
                      report.status === 'Arrears'
                        ? 'bg-red-100 text-red-800'
                        : report.status === 'Overpaid'
                        ? 'bg-green-100 text-green-800'
                        : 'bg-blue-100 text-blue-800'
                    }`}
                  >
                    {report.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        <div className="mt-4 flex justify-end">
          <button
            onClick={() => {
              const csv = [
                'Tenant,Unit,Expected Amount,Total Paid,Balance,Status',
                ...arrearsData.map(
                  (r) =>
                    `${r.tenant_name},${r.unit_number},${r.expected_amount},${r.total_paid},${r.balance},${r.status}`
                ),
              ].join('\n');
              const blob = new Blob([csv], { type: 'text/csv' });
              const url = URL.createObjectURL(blob);
              const a = document.createElement('a');
              a.href = url;
              a.download = `arrears_report_${month}.csv`;
              a.click();
              URL.revokeObjectURL(url);
            }}
            className="px-4 py-2 bg-blue-600 text-white rounded flex items-center gap-2"
          >
            <Download size={16} /> Download CSV
          </button>
        </div>
      </div>
    );
  };
  async function generateMonthlyReport(month: string) {
    try {
      const db = await Database.load('sqlite:test6.db');
      const reportData = await db.select(
        `
      SELECT 
        p.payment_id, p.tenant_id, p.unit_id, p.amount_paid, p.payment_date,
        p.due_date, p.payment_status, p.payment_method, p.payment_category,
        p.payment_month, t.full_name AS tenant_name, u.unit_number
      FROM payments p
      LEFT JOIN tenants t ON p.tenant_id = t.tenant_id
      LEFT JOIN units u ON p.unit_id = u.unit_id
      WHERE p.payment_month = $1
    `,
        [month]
      );
      return reportData as Payment[];
    } catch (err) {
      console.error('Error generating report:', err);
      setError('Failed to generate report');
      return [];
    }
  }

  const handleDeletePayment = async () => {
    if (!selectedPayment) {
      setError('No payment selected for deletion.');
      return;
    }
    setLoading(true);
    const db = await Database.load('sqlite:test6.db');
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
    const db = await Database.load('sqlite:test6.db');
    setLoading(true);
    const paymentMonth = paymentData.due_date.slice(0, 7);
    const status =
      paymentData.payment_date > paymentData.due_date
        ? 'Overdue'
        : paymentData.payment_date < paymentData.due_date
        ? 'Paid'
        : 'Pending';

    try {
      if ('payment_id' in paymentData && paymentData.payment_id !== null) {
        await db.execute(
          `UPDATE payments SET tenant_id = $1, unit_id = $2, property_id = $3, amount_paid = $4,
         payment_date = $5, due_date = $6, payment_status = $7, payment_method = $8,
         payment_category = $9, receipt_number = $10, transaction_reference = $11, remarks = $12, payment_month = $13,
         updated_at = CURRENT_TIMESTAMP WHERE payment_id = $14`,
          [
            paymentData.tenant_id,
            paymentData.unit_id,
            paymentData.property_id,
            paymentData.amount_paid,
            paymentData.payment_date,
            paymentData.due_date,
            status,
            paymentData.payment_method,
            paymentData.payment_category,
            paymentData.receipt_number || null,
            paymentData.transaction_reference || null,
            paymentData.remarks || null,
            paymentMonth,
            paymentData.payment_id,
          ]
        );
        console.log('Payment updated successfully:', paymentData.payment_id);
      } else {
        await db.execute(
          `INSERT INTO payments (
          payment_id, tenant_id, unit_id, property_id, amount_paid,
          payment_date, due_date, payment_status, payment_method, payment_category,
          payment_month, receipt_number, transaction_reference, remarks, created_at, updated_at
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)`,
          [
            `PAY${Date.now()}-${Math.floor(Math.random() * 1000)}`,
            paymentData.tenant_id,
            paymentData.unit_id,
            paymentData.property_id,
            paymentData.amount_paid,
            paymentData.payment_date,
            paymentData.due_date,
            status,
            paymentData.payment_method,
            paymentData.payment_category,
            paymentMonth,
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

  const handleDownloadReport = async () => {
    const reportData = await generateMonthlyReport(
      filterMonth || new Date().toISOString().slice(0, 7)
    );
    const csvContent = [
      'Tenant,Unit,Amount,Payment Date,Due Date,Status,Method,Category',
      ...reportData.map(
        (p) =>
          `${p.tenant_name},${p.unit_number},${p.amount_paid},${p.payment_date},${p.due_date},${p.payment_status},${p.payment_method},${p.payment_category}`
      ),
    ].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `rent_report_${filterMonth || 'current'}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };
  useEffect(() => {
    fetchPayments();
    calculateArrearsReport('2025-07').then((data) =>
      console.log('Tenants:', data)
    );
  }, []);
  const filteredPayments = useMemo(() => {
    return payments
      .filter((payment) => {
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
        const matchesStatus =
          filterStatus === 'all' ||
          payment.payment_status.toLowerCase() === filterStatus.toLowerCase();
        const matchesMonth =
          !filterMonth || payment.payment_month === filterMonth;
        const matchesCategory =
          filterCategory === 'all' ||
          payment.payment_category.toLowerCase() ===
            filterCategory.toLowerCase();
        const matchesMethod =
          filterMethod === 'all' ||
          payment.payment_method.toLowerCase() === filterMethod.toLowerCase();
        return (
          matchesSearch &&
          matchesStatus &&
          matchesMonth &&
          matchesCategory &&
          matchesMethod
        );
      })
      .sort((a, b) => a.payment_month.localeCompare(b.payment_month));
  }, [
    payments,
    searchText,
    filterStatus,
    filterMonth,
    filterCategory,
    filterMethod,
  ]);

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

  const MonthlyReportModal: React.FC<{
    isOpen: boolean;
    onClose: () => void;
    month: string;
  }> = ({ isOpen, onClose, month }) => {
    const [reportData, setReportData] = useState<Payment[]>([]);
    useEffect(() => {
      setLoadingReport(true);
      if (isOpen && month) {
        generateMonthlyReport(month).then((data) => {
          setReportData(data);
          setLoadingReport(false);
        });
      }
    }, [isOpen, month]);
    if (!isOpen) return null;
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        {loadingReport ? (
          <div>Loading report...</div>
        ) : (
          <div className="bg-white rounded-lg p-6 max-w-4xl w-full max-h-[80vh] overflow-auto">
            <h2 className="text-xl font-semibold mb-4">
              Monthly Report - {month}
            </h2>
            <table className="w-full">
              <thead>
                <tr className="bg-gray-100">
                  <th className="py-2 px-4 text-left">Tenant</th>
                  <th className="py-2 px-4 text-left">Unit</th>
                  <th className="py-2 px-4 text-left">Amount</th>
                  <th className="py-2 px-4 text-left">Status</th>
                  <th className="py-2 px-4 text-left">Category</th>
                </tr>
              </thead>
              <tbody>
                {reportData.map((p) => (
                  <tr key={p.payment_id}>
                    <td className="py-2 px-4">{p.tenant_name}</td>
                    <td className="py-2 px-4">{p.unit_number}</td>
                    <td className="py-2 px-4">${p.amount_paid}</td>
                    <td className="py-2 px-4">{p.payment_status}</td>
                    <td className="py-2 px-4">{p.payment_category}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div className="mt-4 flex justify-end gap-2">
              <button
                onClick={onClose}
                className="px-4 py-2 bg-gray-300 rounded"
              >
                Close
              </button>

              <button
                onClick={handleDownloadReport}
                className="px-4 py-2 bg-blue-600 text-white rounded flex items-center gap-2"
              >
                <Download size={16} /> Download CSV
              </button>
            </div>
          </div>
        )}
      </div>
    );
  };

  const isUnitPaid = (unit_id: number, month: string) => {
    const unitPayments = payments.filter(
      (p) =>
        p.unit_id === unit_id &&
        p.payment_month === month &&
        p.payment_category === 'Rent' &&
        p.payment_status === 'Paid'
    );
    return unitPayments.length > 0 ? 'Paid' : 'Unpaid';
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <main className=" mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8">
              <button
                onClick={() => setActiveTab('payments')}
                className={`${
                  activeTab === 'payments'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
              >
                Payments
              </button>
              <button
                onClick={() => setActiveTab('arrears')}
                className={`${
                  activeTab === 'arrears'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
              >
                Arrears Report
              </button>
            </nav>
          </div>
        </div>
        <div className="space-y-6">
          <input
            type="month"
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            value={filterMonth}
            onChange={(e) => {
              if (/^\d{4}-\d{2}$/.test(e.target.value))
                setFilterMonth(e.target.value);
            }}
          />
          {activeTab === 'payments' && (
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
                  value={filterCategory}
                  onChange={(e) => setFilterCategory(e.target.value)}
                >
                  <option value="all">All Categories</option>
                  <option value="rent">Rent</option>
                  <option value="deposit">Deposit</option>
                  <option value="utilities">Utilities</option>
                  <option value="other">Other</option>
                </select>

                <button
                  onClick={() => {
                    const csv = [
                      'Tenant,Unit,Property,Amount,Month,Due Date,Status,Category,Method',
                      ...payments.map(
                        (p) =>
                          `${p.tenant_name},${p.unit_number},${p.property_name},${p.amount_paid},${p.payment_month},${p.due_date},${p.payment_status},${p.payment_category},${p.payment_method}`
                      ),
                    ].join('\n');
                    const blob = new Blob([csv], { type: 'text/csv' });
                    const url = URL.createObjectURL(blob);
                    const a = document.createElement('a');
                    a.href = url;
                    a.download = 'all_payments.csv';
                    a.click();
                  }}
                  className="px-4 py-2 bg-blue-600 text-white rounded"
                >
                  Export All
                </button>
                <button
                  onClick={() => setShowReportModal(true)}
                  className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                >
                  <Download className="w-4 h-4" /> Generate Report
                </button>
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
          )}

          {activeTab === 'payments' ? (
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
                        Month
                      </th>
                      <th className="text-left py-3 px-6 font-semibold text-gray-900">
                        Unit
                      </th>

                      <th className="text-left py-3 px-6 font-semibold text-gray-900">
                        Category
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
                          </div>
                        </td>
                        <td className="py-4 px-6 text-gray-900">
                          {payment.payment_month}
                        </td>
                        <td className="py-4 px-6 text-gray-900">
                          {payment.unit_number || 'N/A'}
                        </td>
                        <td className="py-4 px-6 text-gray-900">
                          {payment.payment_category}
                        </td>
                        <td className="py-4 px-6 text-gray-900">
                          {payment.due_date}
                        </td>
                        {isUnitPaid(payment.unit_id, payment.payment_month)
                          ? 'Paid'
                          : 'Unpaid'}
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
          ) : (
            <ArrearsReportTab
              month={filterMonth || new Date().toISOString().slice(0, 7)}
            />
          )}
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
      <MonthlyReportModal
        isOpen={showReportModal}
        onClose={() => setShowReportModal(false)}
        month={filterMonth || new Date().toISOString().slice(0, 7)}
      />
    </div>
  );
};

export default PropertyManagementDashboard;
