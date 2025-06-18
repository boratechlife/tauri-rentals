import React, { useState, useMemo } from "react";
import {
  Search,
  DollarSign,
  Users,
  Home,
  Plus,
  Download,
  Eye,
  Edit,
  Trash2,
  BarChart3,
  Building2,
  Clock,
  Bell,
} from "lucide-react";

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
  const [searchText, setSearchText] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [dateRange, setDateRange] = useState("thisMonth");

  // Sample data
  const [payments] = useState<Payment[]>([
    {
      id: "1",
      tenant: "John Smith",
      unit: "A101",
      property: "Sunset Apartments",
      amount: 1500,
      date: "2025-06-15",
      dueDate: "2025-06-01",
      status: "Paid",
      method: "Bank Transfer",
      category: "Rent",
    },
    {
      id: "2",
      tenant: "Sarah Johnson",
      unit: "B205",
      property: "Oak Ridge Complex",
      amount: 1200,
      date: "2025-06-10",
      dueDate: "2025-06-01",
      status: "Paid",
      method: "Credit Card",
      category: "Rent",
    },
    {
      id: "3",
      tenant: "Mike Davis",
      unit: "C301",
      property: "Sunset Apartments",
      amount: 1800,
      date: "",
      dueDate: "2025-06-01",
      status: "Overdue",
      method: "",
      category: "Rent",
    },
    {
      id: "4",
      tenant: "Emily Wilson",
      unit: "A203",
      property: "Green Valley",
      amount: 150,
      date: "",
      dueDate: "2025-06-15",
      status: "Pending",
      method: "",
      category: "Utilities",
    },
    {
      id: "5",
      tenant: "David Brown",
      unit: "B102",
      property: "Oak Ridge Complex",
      amount: 1400,
      date: "2025-06-12",
      dueDate: "2025-06-01",
      status: "Paid",
      method: "Check",
      category: "Rent",
    },
  ]);

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
                        {payment.dueDate}
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
