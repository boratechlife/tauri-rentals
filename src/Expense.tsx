import React, { useState, useMemo } from "react";
import {
  DollarSign,
  TrendingUp,
  TrendingDown,
  Plus,
  Search,
  Filter,
  Calendar,
  Building,
  Home,
  Wrench,
  Zap,
  Droplets,
  Car,
  Shield,
  Users,
  MoreHorizontal,
  Edit,
  Trash2,
} from "lucide-react";

interface Expense {
  id: string;
  amount: number;
  category: string;
  description: string;
  date: string;
  unitId: string;
  unitName: string;
  blockName: string;
  paymentMethod: string;
  vendor?: string;
  receipt?: string;
}

const ExpensePage: React.FC = () => {
  const [expenses, setExpenses] = useState<Expense[]>([
    {
      id: "1",
      amount: 450.0,
      category: "Maintenance",
      description: "Plumbing repair - Kitchen sink",
      date: "2024-06-15",
      unitId: "A101",
      unitName: "Unit A101",
      blockName: "Block A",
      paymentMethod: "Bank Transfer",
      vendor: "ProFix Plumbing",
    },
    {
      id: "2",
      amount: 1200.0,
      category: "Utilities",
      description: "Electricity bill - Common areas",
      date: "2024-06-14",
      unitId: "COMMON",
      unitName: "Common Areas",
      blockName: "Block A",
      paymentMethod: "Direct Debit",
      vendor: "PowerCorp",
    },
    {
      id: "3",
      amount: 850.0,
      category: "Security",
      description: "Security system maintenance",
      date: "2024-06-12",
      unitId: "COMMON",
      unitName: "Common Areas",
      blockName: "Block B",
      paymentMethod: "Credit Card",
      vendor: "SecureGuard Inc",
    },
    {
      id: "4",
      amount: 320.0,
      category: "Cleaning",
      description: "Deep cleaning after tenant move-out",
      date: "2024-06-10",
      unitId: "B205",
      unitName: "Unit B205",
      blockName: "Block B",
      paymentMethod: "Cash",
      vendor: "CleanPro Services",
    },
    {
      id: "5",
      amount: 2500.0,
      category: "Renovation",
      description: "Bathroom renovation",
      date: "2024-06-08",
      unitId: "A103",
      unitName: "Unit A103",
      blockName: "Block A",
      paymentMethod: "Bank Transfer",
      vendor: "RenovateRight Co",
    },
  ]);

  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [selectedBlock, setSelectedBlock] = useState("All");
  const [dateRange, setDateRange] = useState("This Month");
  const [showAddExpense, setShowAddExpense] = useState(false);

  const categories = [
    "All",
    "Maintenance",
    "Utilities",
    "Security",
    "Cleaning",
    "Renovation",
    "Insurance",
    "Legal",
  ];
  const blocks = ["All", "Block A", "Block B", "Block C"];

  const categoryIcons = {
    Maintenance: Wrench,
    Utilities: Zap,
    Security: Shield,
    Cleaning: Users,
    Renovation: Home,
    Insurance: Shield,
    Legal: Users,
  };

  // Filter expenses based on search and filters
  const filteredExpenses = useMemo(() => {
    return expenses.filter((expense) => {
      const matchesSearch =
        expense.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        expense.vendor?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        expense.unitName.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory =
        selectedCategory === "All" || expense.category === selectedCategory;
      const matchesBlock =
        selectedBlock === "All" || expense.blockName === selectedBlock;
      return matchesSearch && matchesCategory && matchesBlock;
    });
  }, [expenses, searchTerm, selectedCategory, selectedBlock]);

  // Calculate summary statistics
  const summaryStats = useMemo(() => {
    const totalExpenses = filteredExpenses.reduce(
      (sum, expense) => sum + expense.amount,
      0
    );
    const thisMonthExpenses = filteredExpenses.filter((expense) => {
      const expenseDate = new Date(expense.date);
      const now = new Date();
      return (
        expenseDate.getMonth() === now.getMonth() &&
        expenseDate.getFullYear() === now.getFullYear()
      );
    });
    const thisMonthTotal = thisMonthExpenses.reduce(
      (sum, expense) => sum + expense.amount,
      0
    );

    // Mock last month data for comparison
    const lastMonthTotal = 4200.0;
    const percentageChange =
      ((thisMonthTotal - lastMonthTotal) / lastMonthTotal) * 100;

    const categoryBreakdown = filteredExpenses.reduce((acc, expense) => {
      acc[expense.category] = (acc[expense.category] || 0) + expense.amount;
      return acc;
    }, {} as Record<string, number>);

    return {
      totalExpenses,
      thisMonthTotal,
      percentageChange,
      totalTransactions: filteredExpenses.length,
      categoryBreakdown,
    };
  }, [filteredExpenses]);

  const handleAddExpense = () => {
    setShowAddExpense(true);
  };

  const handleDeleteExpense = (id: string) => {
    setExpenses(expenses.filter((expense) => expense.id !== id));
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Expenses</h1>
            <p className="text-gray-600 mt-1">
              Track and manage property expenses
            </p>
          </div>
          <button
            onClick={handleAddExpense}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
          >
            <Plus className="w-4 h-4" />
            Add Expense
          </button>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">
                  Total Expenses
                </p>
                <p className="text-2xl font-bold text-gray-900">
                  ${summaryStats.totalExpenses.toLocaleString()}
                </p>
              </div>
              <div className="bg-blue-100 p-3 rounded-lg">
                <DollarSign className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">This Month</p>
                <p className="text-2xl font-bold text-gray-900">
                  ${summaryStats.thisMonthTotal.toLocaleString()}
                </p>
                <div className="flex items-center mt-2">
                  {summaryStats.percentageChange >= 0 ? (
                    <TrendingUp className="w-4 h-4 text-green-500 mr-1" />
                  ) : (
                    <TrendingDown className="w-4 h-4 text-red-500 mr-1" />
                  )}
                  <span
                    className={`text-sm font-medium ${
                      summaryStats.percentageChange >= 0
                        ? "text-green-600"
                        : "text-red-600"
                    }`}
                  >
                    {Math.abs(summaryStats.percentageChange).toFixed(1)}%
                  </span>
                </div>
              </div>
              <div className="bg-green-100 p-3 rounded-lg">
                <Calendar className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">
                  Transactions
                </p>
                <p className="text-2xl font-bold text-gray-900">
                  {summaryStats.totalTransactions}
                </p>
              </div>
              <div className="bg-purple-100 p-3 rounded-lg">
                <Building className="w-6 h-6 text-purple-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">
                  Avg per Unit
                </p>
                <p className="text-2xl font-bold text-gray-900">
                  ${(summaryStats.totalExpenses / 10).toLocaleString()}
                </p>
              </div>
              <div className="bg-orange-100 p-3 rounded-lg">
                <Home className="w-6 h-6 text-orange-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Category Breakdown */}
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Expenses by Category
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {Object.entries(summaryStats.categoryBreakdown).map(
              ([category, amount]) => {
                const Icon =
                  categoryIcons[category as keyof typeof categoryIcons] ||
                  DollarSign;
                return (
                  <div key={category} className="text-center">
                    <div className="bg-gray-50 p-3 rounded-lg mb-2 flex justify-center">
                      <Icon className="w-6 h-6 text-gray-600" />
                    </div>
                    <p className="text-sm font-medium text-gray-900">
                      {category}
                    </p>
                    <p className="text-lg font-bold text-blue-600">
                      ${amount.toLocaleString()}
                    </p>
                  </div>
                );
              }
            )}
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search expenses..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              {categories.map((category) => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </select>

            <select
              value={selectedBlock}
              onChange={(e) => setSelectedBlock(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              {blocks.map((block) => (
                <option key={block} value={block}>
                  {block}
                </option>
              ))}
            </select>

            <select
              value={dateRange}
              onChange={(e) => setDateRange(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="This Month">This Month</option>
              <option value="Last Month">Last Month</option>
              <option value="Last 3 Months">Last 3 Months</option>
              <option value="This Year">This Year</option>
            </select>
          </div>
        </div>

        {/* Expenses Table */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">
              Recent Expenses
            </h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date & Description
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Category
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Unit/Block
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Amount
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Payment Method
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredExpenses.map((expense) => {
                  const Icon =
                    categoryIcons[
                      expense.category as keyof typeof categoryIcons
                    ] || DollarSign;
                  return (
                    <tr key={expense.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="bg-gray-100 p-2 rounded-lg mr-3">
                            <Icon className="w-4 h-4 text-gray-600" />
                          </div>
                          <div>
                            <div className="text-sm font-medium text-gray-900">
                              {expense.description}
                            </div>
                            <div className="text-sm text-gray-500">
                              {new Date(expense.date).toLocaleDateString()}
                            </div>
                            {expense.vendor && (
                              <div className="text-xs text-gray-400">
                                {expense.vendor}
                              </div>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                          {expense.category}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        <div>{expense.unitName}</div>
                        <div className="text-xs text-gray-500">
                          {expense.blockName}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        ${expense.amount.toLocaleString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {expense.paymentMethod}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex items-center justify-end gap-2">
                          <button className="text-blue-600 hover:text-blue-900 p-1">
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteExpense(expense.id)}
                            className="text-red-600 hover:text-red-900 p-1"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Add Expense Modal would go here */}
        {showAddExpense && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-xl p-6 w-full max-w-md mx-4">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Add New Expense
              </h3>
              <p className="text-gray-600 mb-4">
                This would contain the add expense form.
              </p>
              <button
                onClick={() => setShowAddExpense(false)}
                className="bg-gray-200 hover:bg-gray-300 text-gray-800 px-4 py-2 rounded-lg"
              >
                Close
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ExpensePage;
