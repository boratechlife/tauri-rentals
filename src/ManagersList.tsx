import Database from '@tauri-apps/plugin-sql';
import { Edit, Plus, Search, Trash2 } from 'lucide-react';
import React, { useEffect, useState } from 'react';
import ManagerFormModal from './ManagerFormModal';
import { DeleteConfirmationModal } from './DeleteConfirmationModal';

export interface Manager {
  manager_id: number;
  name: string;
  email: string | null;
  phone: string;
  hire_date: string;
}

const ManagersList: React.FC = () => {
  const [managers, setManagers] = useState<Manager[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [searchText, setSearchText] = useState<string>('');
  const [showAddEditManagerModal, setShowAddEditManagerModal] = useState(false);
  const [showDeleteManagerConfirm, setShowDeleteManagerConfirm] =
    useState(false);
  const [selectedManager, setSelectedManager] = useState<Manager | null>(null);

  async function fetchManagers() {
    const db = await Database.load('sqlite:productionv2.db');
    try {
      setLoading(true);

      const dbManagers = await db.select<Manager[]>(
        'SELECT manager_id, name, email, phone, hire_date FROM managers'
      );
      setManagers(dbManagers);
      setError(null);
    } catch (err) {
      console.error('Error fetching managers:', err);
      setError('Failed to get managers - check console');
    } finally {
      setLoading(false);
      db.close();
    }
  }

  useEffect(() => {
    fetchManagers();
  }, []);

  const filteredManagers = managers.filter(
    (manager) =>
      manager.name.toLowerCase().includes(searchText.toLowerCase()) ||
      (manager.email || '').toLowerCase().includes(searchText.toLowerCase()) ||
      manager.phone.includes(searchText)
  );

  const handleSaveManager = async (
    managerData: Omit<Manager, 'manager_id'> | Manager
  ) => {
    const db = await Database.load('sqlite:productionv2.db');
    setLoading(true);
    try {
      if ('manager_id' in managerData && managerData.manager_id !== null) {
        await db.execute(
          `UPDATE managers SET name = $1, email = $2, phone = $3, hire_date = $4 WHERE manager_id = $5`,
          [
            managerData.name,
            managerData.email || null,
            managerData.phone,
            managerData.hire_date,
            managerData.manager_id,
          ]
        );
        console.log('Manager updated:', managerData.manager_id);
      } else {
        await db.execute(
          `INSERT INTO managers (name, email, phone, hire_date) VALUES ($1, $2, $3, $4)`,
          [
            managerData.name,
            managerData.email || null,
            managerData.phone,
            managerData.hire_date,
          ]
        );
        console.log('New manager added.');
      }
      fetchManagers();
      setShowAddEditManagerModal(false);
      setSelectedManager(null);
    } catch (err) {
      console.error('Error saving manager:', err);
      setError('Failed to save manager.');
    } finally {
      setLoading(false);
    }
  };

  const handleExportCsv = () => {
    if (filteredManagers.length === 0) {
      alert('No managers to export.');
      return;
    }

    const headers = ['Manager ID', 'Name', 'Email', 'Phone', 'Hire Date'];

    const csvRows = filteredManagers.map((manager) => {
      // Helper to safely format a string for CSV
      const escapeCsv = (text: string | number | null | undefined) => {
        if (text === null || text === undefined) return '';
        const str = String(text);
        // If the string contains a comma, double quote, or newline, wrap it in double quotes
        // And escape any double quotes within the string by doubling them
        if (str.includes(',') || str.includes('"') || str.includes('\n')) {
          return `"${str.replace(/"/g, '""')}"`;
        }
        return str;
      };

      return [
        escapeCsv(manager.manager_id),
        escapeCsv(manager.name),
        escapeCsv(manager.email),
        escapeCsv(manager.phone),
        escapeCsv(manager.hire_date),
      ].join(',');
    });

    const csvContent = [headers.join(','), ...csvRows].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', 'managers.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url); // Clean up the URL object
  };
  const handleDeleteManager = async () => {
    if (!selectedManager) return;
    const db = await Database.load('sqlite:productionv2.db');
    setLoading(true);
    try {
      await db.execute(`DELETE FROM managers WHERE manager_id = $1`, [
        selectedManager.manager_id,
      ]);
      console.log('Manager deleted:', selectedManager.manager_id);
      fetchManagers();
      setShowDeleteManagerConfirm(false);
      setSelectedManager(null);
    } catch (err) {
      console.error('Error deleting manager:', err);
      setError('Failed to delete manager.');
    } finally {
      setLoading(false);
    }
  };
  return (
    <div className="p-6 space-y-6 bg-gray-50 min-h-screen">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Manager Management</h1>
      </div>
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex flex-wrap gap-4 items-center justify-between">
          <div className="relative flex-1 min-w-64">
            <input
              type="text"
              placeholder="Search by name, email, or phone..."
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
            />
            <Search
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
              size={18}
            />
          </div>
          <button
            onClick={() => {
              setSelectedManager(null);
              setShowAddEditManagerModal(true);
            }}
            className="flex items-center gap-2 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shadow-md"
          >
            <Plus className="w-4 h-4" />
            Add New Manager
          </button>
          <button
            className="flex items-center gap-2 px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors shadow-md"
            onClick={handleExportCsv}
          >
            Export CSV
          </button>
        </div>
      </div>
      {loading && (
        <div className="p-6 text-center text-gray-600">Loading managers...</div>
      )}
      {error && <div className="p-6 text-center text-red-600">{error}</div>}
      {!loading && !error && filteredManagers.length === 0 && (
        <div className="col-span-full text-center py-10 text-gray-600 text-lg">
          No managers found.
        </div>
      )}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredManagers.map((manager) => (
          <div
            key={manager.manager_id}
            className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 flex flex-col"
          >
            <h3 className="font-semibold text-lg text-gray-900 mb-1">
              {manager.name}
            </h3>
            <div className="space-y-2 text-sm text-gray-700">
              <p>
                <span className="font-medium text-gray-800">Email:</span>{' '}
                {manager.email || 'N/A'}
              </p>
              <p>
                <span className="font-medium text-gray-800">Phone:</span>{' '}
                {manager.phone}
              </p>
              <p>
                <span className="font-medium text-gray-800">Hire Date:</span>{' '}
                {manager.hire_date}
              </p>
            </div>
            <div className="flex items-center gap-3 mt-6 pt-4 border-t border-gray-200">
              <button
                onClick={() => {
                  setSelectedManager(manager);
                  setShowAddEditManagerModal(true);
                }}
                className="p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors duration-200"
                title="Edit Manager"
              >
                <Edit className="w-5 h-5" />
              </button>

              <button
                onClick={() => {
                  setSelectedManager(manager);
                  setShowDeleteManagerConfirm(true);
                }}
                className="p-2 text-red-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors duration-200"
                title="Delete Manager"
              >
                <Trash2 className="w-5 h-5" />
              </button>
            </div>
          </div>
        ))}
      </div>
      <ManagerFormModal
        isOpen={showAddEditManagerModal}
        onClose={() => setShowAddEditManagerModal(false)}
        onSave={handleSaveManager}
        initialData={selectedManager}
      />
      <DeleteConfirmationModal
        isOpen={showDeleteManagerConfirm}
        onClose={() => setShowDeleteManagerConfirm(false)}
        onConfirm={handleDeleteManager}
        itemName={selectedManager?.name || 'this manager'}
      />
    </div>
  );
};

export default ManagersList;
