import React, { useState, useMemo } from "react";
import {
  Search,
  Filter,
  DollarSign,
  TrendingUp,
  Users,
  Home,
  Calendar,
  AlertTriangle,
  Plus,
  Download,
  Eye,
  Edit,
  Trash2,
  BarChart3,
  PieChart,
  Building2,
  Clock,
  CheckCircle,
  XCircle,
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

  const [tenants] = useState<Tenant[]>([
    {
      id: "1",
      name: "John Smith",
      email: "john@email.com",
      phone: "(555) 123-4567",
      unit: "A101",
      property: "Sunset Apartments",
      leaseStart: "2024-01-01",
      leaseEnd: "2025-12-31",
      rentAmount: 1500,
      status: "Active",
    },
    {
      id: "2",
      name: "Sarah Johnson",
      email: "sarah@email.com",
      phone: "(555) 234-5678",
      unit: "B205",
      property: "Oak Ridge Complex",
      leaseStart: "2024-03-01",
      leaseEnd: "2025-02-28",
      rentAmount: 1200,
      status: "Active",
    },
    {
      id: "3",
      name: "Mike Davis",
      email: "mike@email.com",
      phone: "(555) 345-6789",
      unit: "C301",
      property: "Sunset Apartments",
      leaseStart: "2024-06-01",
      leaseEnd: "2025-05-31",
      rentAmount: 1800,
      status: "Overdue",
    },
    {
      id: "4",
      name: "Emily Wilson",
      email: "emily@email.com",
      phone: "(555) 456-7890",
      unit: "A203",
      property: "Green Valley",
      leaseStart: "2024-02-15",
      leaseEnd: "2025-02-14",
      rentAmount: 1350,
      status: "Active",
    },
    {
      id: "5",
      name: "David Brown",
      email: "david@email.com",
      phone: "(555) 567-8901",
      unit: "B102",
      property: "Oak Ridge Complex",
      leaseStart: "2024-04-01",
      leaseEnd: "2025-03-31",
      rentAmount: 1400,
      status: "Active",
    },
  ]);

  const [properties] = useState<Property[]>([
    {
      id: "1",
      name: "Sunset Apartments",
      address: "123 Sunset Blvd",
      units: 24,
      occupiedUnits: 22,
      monthlyRevenue: 33600,
      expenses: 8400,
    },
    {
      id: "2",
      name: "Oak Ridge Complex",
      address: "456 Oak Street",
      units: 18,
      occupiedUnits: 16,
      monthlyRevenue: 22400,
      expenses: 5600,
    },
    {
      id: "3",
      name: "Green Valley",
      address: "789 Valley Road",
      units: 12,
      occupiedUnits: 10,
      monthlyRevenue: 14850,
      expenses: 3960,
    },
  ]);

  // Analytics calculations
  const analytics = useMemo(() => {
    const totalRevenue = payments
      .filter((p) => p.status === "Paid")
      .reduce((sum, p) => sum + p.amount, 0);
    const pendingAmount = payments
      .filter(
        (p) =>
          p.status === "Pending" ||
          p.status === "Late" ||
          p.status === "Overdue"
      )
      .reduce((sum, p) => sum + p.amount, 0);
    const totalUnits = properties.reduce((sum, p) => sum + p.units, 0);
    const occupiedUnits = properties.reduce(
      (sum, p) => sum + p.occupiedUnits,
      0
    );
    const occupancyRate = (occupiedUnits / totalUnits) * 100;

    return {
      totalRevenue,
      pendingAmount,
      totalUnits,
      occupiedUnits,
      occupancyRate: occupancyRate.toFixed(1),
      totalTenants: tenants.length,
      overduePayments: payments.filter((p) => p.status === "Overdue").length,
    };
  }, [payments, properties, tenants]);

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

  const filteredTenants = useMemo(() => {
    return tenants.filter((tenant) => {
      const matchesSearch =
        tenant.name.toLowerCase().includes(searchText.toLowerCase()) ||
        tenant.unit.toLowerCase().includes(searchText.toLowerCase()) ||
        tenant.property.toLowerCase().includes(searchText.toLowerCase());
      return matchesSearch;
    });
  }, [tenants, searchText]);

  const StatCard = ({ title, value, icon: Icon, color, subtitle }: any) => (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className={`text-2xl font-bold ${color}`}>{value}</p>
          {subtitle && <p className="text-xs text-gray-500 mt-1">{subtitle}</p>}
        </div>
        <div
          className={`p-3 rounded-full ${color
            .replace("text-", "bg-")
            .replace("-600", "-100")}`}
        >
          <Icon className={`w-6 h-6 ${color}`} />
        </div>
      </div>
    </div>
  );

  const renderDashboard = () => (
    <div className="space-y-6">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total Revenue"
          value={`$${analytics.totalRevenue.toLocaleString()}`}
          icon={DollarSign}
          color="text-green-600"
          subtitle="This month"
        />
        <StatCard
          title="Pending Payments"
          value={`$${analytics.pendingAmount.toLocaleString()}`}
          icon={Clock}
          color="text-orange-600"
          subtitle={`${
            payments.filter((p) => p.status !== "Paid").length
          } payments`}
        />
        <StatCard
          title="Occupancy Rate"
          value={`${analytics.occupancyRate}%`}
          icon={Home}
          color="text-blue-600"
          subtitle={`${analytics.occupiedUnits}/${analytics.totalUnits} units`}
        />
        <StatCard
          title="Total Tenants"
          value={analytics.totalTenants}
          icon={Users}
          color="text-purple-600"
          subtitle={`${analytics.overduePayments} overdue`}
        />
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Quick Actions
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <button className="flex items-center justify-center gap-2 p-3 bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 transition-colors">
            <Plus className="w-4 h-4" />
            Add Payment
          </button>
          <button className="flex items-center justify-center gap-2 p-3 bg-green-50 text-green-700 rounded-lg hover:bg-green-100 transition-colors">
            <Users className="w-4 h-4" />
            Add Tenant
          </button>
          <button className="flex items-center justify-center gap-2 p-3 bg-purple-50 text-purple-700 rounded-lg hover:bg-purple-100 transition-colors">
            <Download className="w-4 h-4" />
            Export Data
          </button>
          <button className="flex items-center justify-center gap-2 p-3 bg-orange-50 text-orange-700 rounded-lg hover:bg-orange-100 transition-colors">
            <Bell className="w-4 h-4" />
            Send Reminders
          </button>
        </div>
      </div>

      {/* Recent Activity & Analytics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Recent Payments
          </h3>
          <div className="space-y-3">
            {payments.slice(0, 5).map((payment) => (
              <div
                key={payment.id}
                className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
              >
                <div>
                  <p className="font-medium text-gray-900">{payment.tenant}</p>
                  <p className="text-sm text-gray-600">
                    {payment.unit} • {payment.property}
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-gray-900">
                    ${payment.amount}
                  </p>
                  <span
                    className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${
                      payment.status === "Paid"
                        ? "bg-green-100 text-green-800"
                        : payment.status === "Pending"
                        ? "bg-yellow-100 text-yellow-800"
                        : "bg-red-100 text-red-800"
                    }`}
                  >
                    {payment.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Property Performance
          </h3>
          <div className="space-y-4">
            {properties.map((property) => (
              <div
                key={property.id}
                className="border-l-4 border-blue-500 pl-4"
              >
                <div className="flex justify-between items-start">
                  <div>
                    <h4 className="font-medium text-gray-900">
                      {property.name}
                    </h4>
                    <p className="text-sm text-gray-600">{property.address}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-green-600">
                      ${property.monthlyRevenue.toLocaleString()}
                    </p>
                    <p className="text-xs text-gray-500">Monthly Revenue</p>
                  </div>
                </div>
                <div className="mt-2 flex justify-between text-sm">
                  <span className="text-gray-600">
                    Occupancy: {property.occupiedUnits}/{property.units} (
                    {((property.occupiedUnits / property.units) * 100).toFixed(
                      0
                    )}
                    %)
                  </span>
                  <span className="text-red-600">
                    Expenses: ${property.expenses.toLocaleString()}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );

  const renderPayments = () => (
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
                      <p className="text-sm text-gray-600">{payment.unit}</p>
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
                  <td className="py-4 px-6 text-gray-900">{payment.dueDate}</td>
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
  );

  const renderTenants = () => (
    <div className="space-y-6">
      {/* Search and Add */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex flex-wrap gap-4 items-center justify-between">
          <div className="relative flex-1 min-w-64">
            <input
              type="text"
              placeholder="Search tenants..."
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
            />
            <Search
              className="absolute left-3 top-2.5 text-gray-400"
              size={18}
            />
          </div>
          <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
            <Plus className="w-4 h-4" />
            Add Tenant
          </button>
        </div>
      </div>

      {/* Tenants Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredTenants.map((tenant) => (
          <div
            key={tenant.id}
            className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow"
          >
            <div className="flex items-start justify-between mb-4">
              <div>
                <h3 className="font-semibold text-gray-900">{tenant.name}</h3>
                <p className="text-sm text-gray-600">
                  {tenant.unit} • {tenant.property}
                </p>
              </div>
              <span
                className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${
                  tenant.status === "Active"
                    ? "bg-green-100 text-green-800"
                    : tenant.status === "Moving Out"
                    ? "bg-yellow-100 text-yellow-800"
                    : "bg-red-100 text-red-800"
                }`}
              >
                {tenant.status}
              </span>
            </div>

            <div className="space-y-2 text-sm text-gray-600">
              <p>
                <span className="font-medium">Email:</span> {tenant.email}
              </p>
              <p>
                <span className="font-medium">Phone:</span> {tenant.phone}
              </p>
              <p>
                <span className="font-medium">Rent:</span> $
                {tenant.rentAmount.toLocaleString()}/month
              </p>
              <p>
                <span className="font-medium">Lease:</span> {tenant.leaseStart}{" "}
                to {tenant.leaseEnd}
              </p>
            </div>

            <div className="flex items-center gap-2 mt-4 pt-4 border-t border-gray-200">
              <button className="flex-1 px-3 py-2 text-sm bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 transition-colors">
                View Details
              </button>
              <button className="px-3 py-2 text-sm text-gray-600 hover:text-gray-800 transition-colors">
                <Edit className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const renderProperties = () => (
    <div className="space-y-6">
      {/* Properties Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {properties.map((property) => (
          <div
            key={property.id}
            className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow"
          >
            <div className="flex items-start justify-between mb-4">
              <div>
                <h3 className="font-semibold text-gray-900">{property.name}</h3>
                <p className="text-sm text-gray-600">{property.address}</p>
              </div>
              <Building2 className="w-8 h-8 text-blue-600" />
            </div>

            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-600">Units</span>
                <span className="font-medium">
                  {property.occupiedUnits}/{property.units}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Occupancy</span>
                <span className="font-medium">
                  {((property.occupiedUnits / property.units) * 100).toFixed(0)}
                  %
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Revenue</span>
                <span className="font-medium text-green-600">
                  ${property.monthlyRevenue.toLocaleString()}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Expenses</span>
                <span className="font-medium text-red-600">
                  ${property.expenses.toLocaleString()}
                </span>
              </div>
              <div className="flex justify-between font-semibold">
                <span className="text-gray-900">Net Income</span>
                <span className="text-green-600">
                  $
                  {(
                    property.monthlyRevenue - property.expenses
                  ).toLocaleString()}
                </span>
              </div>
            </div>

            <div className="mt-4 pt-4 border-t border-gray-200">
              <button className="w-full px-4 py-2 bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 transition-colors">
                View Details
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                Property Management
              </h1>
              <p className="text-sm text-gray-600">
                Manage your properties, tenants, and payments
              </p>
            </div>
            <div className="flex items-center gap-4">
              <button className="relative p-2 text-gray-600 hover:text-gray-900 transition-colors">
                <Bell className="w-5 h-5" />
                <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full"></span>
              </button>
              <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
                <span className="text-white font-medium text-sm">PM</span>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Navigation */}
      <nav className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex space-x-8">
            {[
              { id: "dashboard", label: "Dashboard", icon: BarChart3 },
              { id: "payments", label: "Payments", icon: DollarSign },
              { id: "tenants", label: "Tenants", icon: Users },
              { id: "properties", label: "Properties", icon: Building2 },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === tab.id
                    ? "border-blue-500 text-blue-600"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                }`}
              >
                <tab.icon className="w-4 h-4" />
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeTab === "dashboard" && renderDashboard()}
        {activeTab === "payments" && renderPayments()}
        {activeTab === "tenants" && renderTenants()}
        {activeTab === "properties" && renderProperties()}
      </main>
    </div>
  );
};

export default PropertyManagementDashboard;
