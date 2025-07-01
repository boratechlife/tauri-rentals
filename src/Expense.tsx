import React, { useState, useMemo, useEffect } from 'react';
import Database from '@tauri-apps/plugin-sql';
import {
  DollarSign,
  TrendingUp,
  TrendingDown,
  Plus,
  Search,
  Calendar,
  Building,
  Home,
  Wrench,
  Zap,
  Shield,
  Users,
  Edit,
  Trash2,
} from 'lucide-react';
import { ExpenseForm } from './ExpenseForm';

export interface Expense {
  expense_id: number;
  amount: number;
  category: string;
  description: string;
  expense_date: string;
  unit_id: number | null; // Nullable foreign key to units
  unit_number: string;
  block_id: number | null; // Nullable foreign key to blocks
  block_name: string;
  property_id: number | null; // Nullable foreign key to properties
  payment_method: string;
  vendor: string;
  invoice_number?: string;
  paid_by?: string;
  created_at?: string;
}

// Define the structure for a new expense form
export interface NewExpense {
  amount: number | '';
  category: string;
  description: string;
  expense_date: string;
  unit_id: string | null; // String for select value, will be parsed
  block_id: string | null; // String for select value, will be parsed
  property_id: string | null; // String for select value, will be parsed
  payment_method: string;
  vendor: string;
  invoice_number?: string;
  paid_by?: string;
}

const ExpensePage: React.FC = () => {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedBlock, setSelectedBlock] = useState('All');
  const [dateRange, setDateRange] = useState('This Month');
  const [showAddExpense, setShowAddExpense] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [units, setUnits] = useState<
    { unit_id: number; unit_number: string; block_id: number }[]
  >([]);
  const [properties, setProperties] = useState<any[]>([]);
  const [blocksData, setBlocksData] = useState<
    { block_id: number; block_name: string }[]
  >([]);
  const [currentExpense, setCurrentExpense] = useState<NewExpense | Expense>({
    amount: '',
    category: '',
    description: '',
    expense_date: new Date('2025-06-28T22:06:00+03:00')
      .toISOString()
      .split('T')[0], // Today's date: 10:06 PM EAT, June 28, 2025
    unit_id: '',
    block_id: '',
    property_id: '',
    payment_method: '',
    vendor: '',
    invoice_number: undefined,
    paid_by: undefined,
  });
  const [isEditing, setIsEditing] = useState(false);

  const fetchData = async () => {
    try {
      setLoading(true);
      const db = await Database.load('sqlite:test4.db');

      // Use a safer query that handles missing block_id by making it optional
      const dbExpenses: any = await db.select(
        `SELECT
          e.expense_id, e.amount, e.category, e.description, e.expense_date,
          u.unit_id, u.unit_number,
          b.block_id, b.block_name,
          p.property_id, p.name AS property_name,
          e.payment_method, e.vendor, e.invoice_number, e.paid_by, e.created_at
        FROM expenses e
        LEFT JOIN units u ON e.unit_id = u.unit_id
        LEFT JOIN blocks b ON e.block_id = b.block_id OR e.block_id IS NULL
        LEFT JOIN properties p ON e.property_id = p.property_id`
      );
      console.log('Expenses', dbExpenses);
      setExpenses(dbExpenses as Expense[]);

      const dbUnits = await db.select(
        `SELECT unit_id, unit_number, block_label as block_id FROM units`
      );
      setUnits(
        dbUnits as { unit_id: number; unit_number: string; block_id: number }[]
      );
      console.log('Units', dbUnits);

      const dbProperties: any = await db.select(
        `SELECT property_id, name FROM properties`
      );
      setProperties(dbProperties);

      const dbBlocks: any = await db.select(
        `SELECT block_id, block_name FROM blocks`
      );
      setBlocksData(dbBlocks);

      const uniqueCategories: any = [
        'All',
        ...new Set(dbExpenses.map((exp: Expense) => exp.category || '')),
      ];
      setCategories(uniqueCategories);

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
      const db = await Database.load('sqlite:test4.db');
      const result = await db.execute(
        `UPDATE expenses
         SET amount = $1, category = $2, description = $3, expense_date = $4, unit_id = $5, block_id = $6, property_id = $7,
             payment_method = $8, vendor = $9, invoice_number = $10, paid_by = $11
         WHERE expense_id = $12`,
        [
          editedExpenseData.amount,
          editedExpenseData.category,
          editedExpenseData.description,
          editedExpenseData.expense_date,
          editedExpenseData.unit_id || null,
          editedExpenseData.block_id || null,
          editedExpenseData.property_id || null,
          editedExpenseData.payment_method,
          editedExpenseData.vendor,
          editedExpenseData.invoice_number || null,
          editedExpenseData.paid_by || null,
          editedExpenseData.expense_id,
        ]
      );
      console.log('Update result:', result);

      await fetchData();
      setShowAddExpense(false);
      setCurrentExpense({
        amount: '',
        category: '',
        description: '',
        expense_date: new Date('2025-06-28T22:06:00+03:00')
          .toISOString()
          .split('T')[0],
        unit_id: '',
        block_id: '',
        property_id: '',
        payment_method: '',
        vendor: '',
        invoice_number: undefined,
        paid_by: undefined,
      });
      setIsEditing(false);
    } catch (err) {
      console.error('Error updating expense:', err);
      setError('Failed to update expense.');
    }
  };

  const handleDeleteExpense = async (expense_id: number) => {
    if (!window.confirm('Are you sure you want to delete this expense?'))
      return;
    try {
      const db = await Database.load('sqlite:test4.db');
      const result = await db.execute(
        `DELETE FROM expenses WHERE expense_id = $1`,
        [expense_id]
      );
      console.log('Delete result:', result);
      setExpenses(
        expenses.filter((expense) => expense.expense_id !== expense_id)
      );
    } catch (err) {
      console.error('Error deleting expense:', err);
      setError('Failed to delete expense.');
    }
  };

  const handleAddExpenseSubmit = async (newExpenseData: NewExpense) => {
    try {
      const db = await Database.load('sqlite:test4.db');
      const result = await db.execute(
        `INSERT INTO expenses (expense_id, amount, category, description, expense_date, unit_id, block_id, property_id,
          payment_method, vendor, invoice_number, paid_by, created_at)
         VALUES (NULL, $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, CURRENT_TIMESTAMP)`,
        [
          newExpenseData.amount,
          newExpenseData.category,
          newExpenseData.description,
          newExpenseData.expense_date,
          newExpenseData.unit_id ? parseInt(newExpenseData.unit_id) : null,
          newExpenseData.block_id ? parseInt(newExpenseData.block_id) : null,
          newExpenseData.property_id
            ? parseInt(newExpenseData.property_id)
            : null,
          newExpenseData.payment_method,
          newExpenseData.vendor,
          newExpenseData.invoice_number || null,
          newExpenseData.paid_by || null,
        ]
      );
      console.log('Insert result:', result);

      await fetchData();
      setShowAddExpense(false);
      setCurrentExpense({
        amount: '',
        category: '',
        description: '',
        expense_date: new Date('2025-06-28T22:06:00+03:00')
          .toISOString()
          .split('T')[0],
        unit_id: '',
        block_id: '',
        property_id: '',
        payment_method: '',
        vendor: '',
        invoice_number: undefined,
        paid_by: undefined,
      });
      setIsEditing(false);
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

  const filteredExpenses = useMemo(() => {
    return expenses.filter((expense) => {
      const matchesSearch =
        expense.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        expense.vendor?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        expense.unit_number.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory =
        selectedCategory === 'All' || expense.category === selectedCategory;
      const matchesBlock =
        selectedBlock === 'All' ||
        (expense.block_name || '').includes(selectedBlock);
      return matchesSearch && matchesCategory && matchesBlock;
    });
  }, [expenses, searchTerm, selectedCategory, selectedBlock]);

  const summaryStats = useMemo(() => {
    const totalExpenses = filteredExpenses.reduce(
      (sum, expense) => sum + expense.amount,
      0
    );
    const thisMonthExpenses = filteredExpenses.filter((expense) => {
      const expenseDate = new Date(expense.expense_date);
      const now = new Date('2025-06-28T22:06:00+03:00');
      return (
        expenseDate.getMonth() === now.getMonth() &&
        expenseDate.getFullYear() === now.getFullYear()
      );
    });
    const thisMonthTotal = thisMonthExpenses.reduce(
      (sum, expense) => sum + expense.amount,
      0
    );

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
            <Plus className="w-4 h-4" /> Add Expense
          </button>
        </div>

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
              {blocksData.map((block) => (
                <option key={block.block_id} value={block.block_name}>
                  {block.block_name}
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
                    <tr key={expense.expense_id} className="hover:bg-gray-50">
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
                              {new Date(
                                expense.expense_date
                              ).toLocaleDateString()}
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
                        <div>{expense.unit_number}</div>
                        <div className="text-xs text-gray-500">
                          {expense.block_name || 'N/A'}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        ${expense.amount.toLocaleString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {expense.payment_method}
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
                            onClick={() =>
                              handleDeleteExpense(expense.expense_id)
                            }
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

        {showAddExpense && (
          <ExpenseForm
            initialData={isEditing ? (currentExpense as Expense) : undefined}
            onClose={() => setShowAddExpense(false)}
            onSubmit={
              isEditing ? handleEditExpenseSubmit : handleAddExpenseSubmit
            }
            categories={categories.filter((c) => c !== 'All')}
            units={units}
            blocks={blocksData}
            properties={properties}
          />
        )}
      </div>
    </div>
  );
};

export default ExpensePage;
