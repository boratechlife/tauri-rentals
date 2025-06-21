import React, { useState, useMemo, useEffect } from 'react';
import Database from '@tauri-apps/plugin-sql';
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
} from 'lucide-react';
import { invoke } from '@tauri-apps/api/core';
import { ExpenseForm } from './ExpenseForm';

export interface Expense {
  id: string;
  amount: number;
  category: string;
  description: string;
  date: string;
  unitId: string; // Note: camelCase here to match original JS data
  unitName: string;
  blockName: string;
  paymentMethod: string;
  vendor: string;
}

// Define the structure for a new expense form
export interface NewExpense {
  amount: number | '';
  category: string;
  description: string;
  date: string;
  unitId: string;
  paymentMethod: string;
  vendor: string;
}

const ExpensePage: React.FC = () => {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [categories, setCategories] = useState([]);
  const [blocks, setBlocks] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedBlock, setSelectedBlock] = useState('All');
  const [dateRange, setDateRange] = useState('This Month');
  const [showAddExpense, setShowAddExpense] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [units, setUnits] = useState<
    { id: string; unit_number: string; block: string }[]
  >([]);
  // New state for handling the form data for adding/editing
  const [currentExpense, setCurrentExpense] = useState<NewExpense | Expense>({
    amount: '',
    category: '',
    description: '',
    date: new Date().toISOString().split('T')[0], // Default to today's date
    unitId: '',
    paymentMethod: '',
    vendor: '',
  });

  const [isEditing, setIsEditing] = useState(false); // New state to determine if we are editing or adding

  // Combine data fetching into a single function for easier re-use
  const fetchData = async () => {
    try {
      setLoading(true);
      const db = await Database.load('sqlite:test.db');

      const dbExpenses = await db.select(
        `SELECT
            e.id, e.amount, e.category, e.description, e.date,
            u.id as unitId, u.unit_number as unitName,
            p.block as blockName,
            e.payment_method as paymentMethod, e.vendor
          FROM expenses e
          LEFT JOIN units u ON e.unit_id = u.id
          LEFT JOIN properties p ON u.property = p.id;`
      );
      setExpenses(dbExpenses);

      const dbUnits = await db.select(
        `SELECT id, unit_number,block FROM units;`
      );
      setUnits(dbUnits);

      const uniqueCategories = [
        'All',
        ...new Set(dbExpenses.map((exp: Expense) => exp.category)),
      ];
      setCategories(uniqueCategories);
      const uniqueBlocks = [
        'All',
        ...new Set(dbExpenses.map((exp: Expense) => exp.blockName)),
      ];
      setBlocks(uniqueBlocks);

      setError('');
    } catch (err) {
      console.error('Error fetching data:', err);
      setError('Failed to get data - check console');
    } finally {
      setLoading(false);
    }
  };

  const handleEditExpenseSubmit = async (editedExpenseData: Expense) => {
    try {
      const db = await Database.load('sqlite:test.db');
      const result = await db.execute(
        `UPDATE expenses
         SET amount = $1, category = $2, description = $3, date = $4, unit_id = $5, payment_method = $6, vendor = $7
         WHERE id = $8;`,
        [
          editedExpenseData.amount,
          editedExpenseData.category,
          editedExpenseData.description,
          editedExpenseData.date,
          editedExpenseData.unitId,
          editedExpenseData.paymentMethod,
          editedExpenseData.vendor,
          editedExpenseData.id,
        ]
      );
      console.log('Update result:', result);

      await fetchData(); // Re-fetch expenses to update the UI
      setShowAddExpense(false);
      setCurrentExpense({
        // Reset form after submission
        amount: '',
        category: '',
        description: '',
        date: new Date().toISOString().split('T')[0],
        unitId: '',
        paymentMethod: '',
        vendor: '',
      });
      setIsEditing(false); // Exit edit mode
    } catch (err) {
      console.error('Error updating expense:', err);
      setError('Failed to update expense.');
    }
  };

  const handleDeleteExpense = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this expense?')) {
      return;
    }
    try {
      const db = await Database.load('sqlite:test.db');
      const result = await db.execute(`DELETE FROM expenses WHERE id = $1;`, [
        id,
      ]);
      console.log('Delete result:', result);
      setExpenses(expenses.filter((expense) => expense.id !== id)); // Optimistic UI update
      // Or, re-fetch data for a guaranteed fresh state: await fetchData();
    } catch (err) {
      console.error('Error deleting expense:', err);
      setError('Failed to delete expense.');
    }
  };

  const handleAddExpenseSubmit = async (newExpenseData: NewExpense) => {
    try {
      const db = await Database.load('sqlite:test.db');
      // Generate a new UUID for the expense ID (you might have a UUID generation utility)
      const newId = crypto.randomUUID(); // Requires crypto polyfill or similar
      const result = await db.execute(
        `INSERT INTO expenses (id, amount, category, description, date, unit_id,unit_name, payment_method, vendor,block_name)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8,$9,$10);`,
        [
          newId,
          newExpenseData.amount,
          newExpenseData.category,
          newExpenseData.description,
          newExpenseData.date,
          newExpenseData.unitId,
          units.find((unit) => unit.id === newExpenseData.unitId)
            ?.unit_number || '',
          newExpenseData.paymentMethod,
          newExpenseData.vendor,
          units.find((unit) => unit.id === newExpenseData.unitId)?.block || '',
        ]
      );
      console.log('Insert result:', result);

      // Re-fetch expenses to update the UI with the new data
      // Alternatively, optimistically update state if you have all necessary joined data
      await fetchData(); // Call the combined fetch function

      setShowAddExpense(false);
      setCurrentExpense({
        // Reset form after submission
        amount: '',
        category: '',
        description: '',
        date: new Date().toISOString().split('T')[0],
        unitId: '',
        paymentMethod: '',
        vendor: '',
      });
      setIsEditing(false); // Ensure we're not in edit mode after adding
    } catch (err) {
      console.error('Error adding expense:', err);
      setError('Failed to add expense.');
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

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
        selectedCategory === 'All' || expense.category === selectedCategory;
      const matchesBlock =
        selectedBlock === 'All' || expense.blockName === selectedBlock;
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
  const handleEditExpense = (expense: Expense) => {
    setCurrentExpense(expense);
    setIsEditing(true);
    setShowAddExpense(true);
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
                        ? 'text-green-600'
                        : 'text-red-600'
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
                          <button
                            className="text-blue-600 hover:text-blue-900 p-1"
                            onClick={() => handleEditExpense(expense)}
                          >
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
        {/* Add/Edit Expense Modal */}
        {showAddExpense && (
          <ExpenseForm
            initialData={isEditing ? (currentExpense as Expense) : undefined}
            onClose={() => setShowAddExpense(false)}
            onSubmit={
              isEditing ? handleEditExpenseSubmit : handleAddExpenseSubmit
            }
            categories={categories.filter((c) => c !== 'All')} // Pass actual categories
            units={units} // Pass fetched units
          />
        )}
      </div>
    </div>
  );
};

export default ExpensePage;
