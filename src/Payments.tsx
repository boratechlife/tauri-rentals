import React, { useState, useMemo, useEffect } from "react";
import { Search, Plus, Eye, Edit, Trash2 } from "lucide-react";
import { invoke } from "@tauri-apps/api/core";

import Database from "@tauri-apps/plugin-sql";

interface Payment {
  id: string;
  tenant: string;
  unit: string;
  property: string;
  amount: number;
  date: string;
  dueDate: string;
  status: "Paid" | "Pending" | "Late" | "Overdue";
  method: "Bank Transfer" | "Credit Card" | "Check" | "Cash";
  category: "Rent" | "Utilities" | "Maintenance" | "Deposit";
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
  status: "Active" | "Moving Out" | "Overdue";
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
  const [activeTab, setActiveTab] = useState("dashboard");
  const [payments, setPayments] = useState([]);
  const [searchText, setSearchText] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [dateRange, setDateRange] = useState("thisMonth");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchPayments() {
      try {
        setLoading(true);
        const db = await Database.load("sqlite:test.db");
        // Assuming your payments table has these columns
        const dbPayments = await db.select(
          `SELECT id, tenant, unit, property, amount, date, due_date, status, method, category FROM payments`
        );
        setError("");
        setPayments(dbPayments);
        console.log("Payments fetched successfully:", dbPayments);
      } catch (err) {
        console.error("Error fetching payments:", err);
        setError("Failed to get payments - check console");
      } finally {
        setLoading(false);
      }
    }
    fetchPayments();
  }, []);

  const filteredPayments = useMemo(() => {
    return payments.filter((payment) => {
      const matchesSearch =
        payment.tenant.toLowerCase().includes(searchText.toLowerCase()) ||
        payment.unit.toLowerCase().includes(searchText.toLowerCase()) ||
        payment.property.toLowerCase().includes(searchText.toLowerCase());
      const matchesFilter =
        filterStatus === "all" ||
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

              <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
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
                            payment.status === "Paid"
                              ? "bg-green-100 text-green-800"
                              : payment.status === "Pending"
                              ? "bg-yellow-100 text-yellow-800"
                              : payment.status === "Late"
                              ? "bg-orange-100 text-orange-800"
                              : "bg-red-100 text-red-800"
                          }`}
                        >
                          {payment.status}
                        </span>
                      </td>
                      <td className="py-4 px-6 text-gray-900">
                        {payment.method || "-"}
                      </td>
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-2">
                          <button className="p-1 text-blue-600 hover:text-blue-800 transition-colors">
                            <Eye className="w-4 h-4" />
                          </button>
                          <button className="p-1 text-green-600 hover:text-green-800 transition-colors">
                            <Edit className="w-4 h-4" />
                          </button>
                          <button className="p-1 text-red-600 hover:text-red-800 transition-colors">
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
    </div>
  );
};

export default PropertyManagementDashboard;
