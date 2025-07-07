import Database from '@tauri-apps/plugin-sql';
import { Download, Edit, Eye, Plus, Search, Trash2 } from 'lucide-react';
import React, { useEffect, useMemo, useState } from 'react';
import { DeleteConfirmationModal } from './DeleteConfirmationModal';
import ComplaintFormModal from './ComplaintFormModal';

export interface Complaint {
  complaint_id: number;
  unit_id: number;
  tenant_id: number | null;
  description: string;
  status: 'Open' | 'In Progress' | 'Resolved';
  created_at: string;
  updated_at: string;
  unit_number?: string;
  tenant_name?: string;
}

const ComplaintsPage: React.FC = () => {
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filterStatus, setFilterStatus] = useState<
    'all' | 'Open' | 'In Progress' | 'Resolved'
  >('all');
  const [searchText, setSearchText] = useState('');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const [sortColumn, setSortColumn] = useState<keyof Complaint>('complaint_id');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');

  const [showComplaintModal, setShowComplaintModal] = useState(false);
  const [selectedComplaint, setSelectedComplaint] = useState<Complaint | null>(
    null
  );

  const [units, setUnits] = useState<
    { unit_id: number; unit_number: string }[]
  >([]);
  const [tenants, setTenants] = useState<
    { tenant_id: number; full_name: string }[]
  >([]);

  async function fetchComplaints() {
    try {
      setLoading(true);
      const db = await Database.load('sqlite:productionv1.db');
      const dbComplaints = await db.select(`
      SELECT 
        c.complaint_id, c.unit_id, c.tenant_id, c.description, c.status, c.created_at, c.updated_at,
        u.unit_number, t.full_name AS tenant_name
      FROM complaints c
      LEFT JOIN units u ON c.unit_id = u.unit_id
      LEFT JOIN tenants t ON c.tenant_id = t.tenant_id
    `);
      setComplaints(dbComplaints as Complaint[]);
      setError(null);
    } catch (err) {
      console.error('Error fetching complaints:', err);
      setError('Failed to get complaints - check console');
    } finally {
      setLoading(false);
    }
  }

  async function fetchUnitsAndTenants() {
    try {
      const db = await Database.load('sqlite:productionv1.db');
      const dbUnits = await db.select('SELECT unit_id, unit_number FROM units');
      const dbTenants = await db.select(
        'SELECT tenant_id, full_name FROM tenants'
      );
      setUnits(dbUnits as { unit_id: number; unit_number: string }[]);
      setTenants(dbTenants as { tenant_id: number; full_name: string }[]);
    } catch (err) {
      console.error('Error fetching units/tenants:', err);
      setError('Failed to get units/tenants');
    }
  }

  async function handleSaveComplaint(
    data: Omit<Complaint, 'complaint_id' | 'created_at' | 'updated_at'>
  ) {
    try {
      const db = await Database.load('sqlite:productionv1.db');
      if (selectedComplaint) {
        await db.execute(
          `UPDATE complaints 
         SET unit_id = $1, tenant_id = $2, description = $3, status = $4, updated_at = datetime('now')
         WHERE complaint_id = $5`,
          [
            data.unit_id,
            data.tenant_id,
            data.description,
            data.status,
            selectedComplaint.complaint_id,
          ]
        );
      } else {
        await db.execute(
          `INSERT INTO complaints (unit_id, tenant_id, description, status, created_at, updated_at)
         VALUES ($1, $2, $3, $4, datetime('now'), datetime('now'))`,
          [data.unit_id, data.tenant_id, data.description, data.status]
        );
      }
      fetchComplaints();
    } catch (err) {
      console.error('Error saving complaint:', err);
      setError('Failed to save complaint');
    }
  }

  async function handleDeleteComplaint(complaintId: number) {
    try {
      const db = await Database.load('sqlite:productionv1.db');
      await db.execute('DELETE FROM complaints WHERE complaint_id = $1', [
        complaintId,
      ]);
      fetchComplaints();
    } catch (err) {
      console.error('Error deleting complaint:', err);
      setError('Failed to delete complaint');
    }
  }

  const filteredComplaints = useMemo(() => {
    return complaints.filter(
      (complaint) =>
        (complaint.description
          .toLowerCase()
          .includes(searchText.toLowerCase()) ||
          complaint.unit_number
            ?.toLowerCase()
            .includes(searchText.toLowerCase())) &&
        (filterStatus === 'all' || complaint.status === filterStatus)
    );
  }, [complaints, searchText, filterStatus]);

  const sortedComplaints = useMemo(() => {
    return [...filteredComplaints].sort((a, b) => {
      const aValue = a[sortColumn];
      const bValue = b[sortColumn];
      if (typeof aValue === 'number' && typeof bValue === 'number') {
        return sortDirection === 'asc' ? aValue - bValue : bValue - aValue;
      }
      return sortDirection === 'asc'
        ? String(aValue).localeCompare(String(bValue))
        : String(bValue).localeCompare(String(aValue));
    });
  }, [filteredComplaints, sortColumn, sortDirection]);
  useEffect(() => {
    fetchComplaints();
    fetchUnitsAndTenants();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="p-6 text-center text-gray-600">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500 mx-auto"></div>
          </div>
        </main>
      </div>
    );
  }
  if (error) {
    return (
      <div className="min-h-screen bg-gray-50">
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="p-6 text-center text-red-600">{error}</div>
        </main>
      </div>
    );
  }
  //   if (!loading && complaints.length === 0) {
  //     return (
  //       <div className="min-h-screen bg-gray-50">
  //         <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
  //           <div className="p-6 text-center text-gray-600">
  //             No complaints found.
  //           </div>
  //         </main>
  //       </div>
  //     );
  //   }

  return (
    <div className="min-h-screen bg-gray-50">
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h2 className="text-xl font-semibold mb-4">Complaints</h2>
          <div className="mb-4 flex flex-wrap gap-4 items-center">
            <div className="relative flex-1 min-w-64">
              <input
                type="text"
                placeholder="Search by description or unit..."
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
              onChange={(e) =>
                setFilterStatus(
                  e.target.value as 'all' | 'Open' | 'In Progress' | 'Resolved'
                )
              }
            >
              <option value="all">All Statuses</option>
              <option value="Open">Open</option>
              <option value="In Progress">In Progress</option>
              <option value="Resolved">Resolved</option>
            </select>

            <div className="mb-0 flex justify-end">
              <button
                onClick={() => {
                  setSelectedComplaint(null);
                  setShowComplaintModal(true);
                }}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <Plus size={16} /> Add Complaint
              </button>
            </div>
            <div className="mt- flex justify-end">
              <button
                onClick={() => {
                  const csv = [
                    'ID,Unit,Tenant,Description,Status,Created At',
                    ...sortedComplaints.map(
                      (c) =>
                        `${c.complaint_id},${c.unit_number || 'N/A'},${
                          c.tenant_name || 'N/A'
                        },${c.description},${c.status},${c.created_at}`
                    ),
                  ].join('\n');
                  const blob = new Blob([csv], { type: 'text/csv' });
                  const url = URL.createObjectURL(blob);
                  const a = document.createElement('a');
                  a.href = url;
                  a.download = 'complaints.csv';
                  a.click();
                  URL.revokeObjectURL(url);
                }}
                className="px-4 py-2 bg-blue-600 text-white rounded flex items-center gap-2"
              >
                <Download size={16} /> Download CSV
              </button>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th
                    className="text-left py-3 px-6 font-semibold text-gray-900 cursor-pointer"
                    onClick={() => {
                      setSortColumn('complaint_id');
                      setSortDirection(
                        sortColumn === 'complaint_id' && sortDirection === 'asc'
                          ? 'desc'
                          : 'asc'
                      );
                    }}
                  >
                    ID{' '}
                    {sortColumn === 'complaint_id' &&
                      (sortDirection === 'asc' ? '↑' : '↓')}
                  </th>
                  <th
                    className="text-left py-3 px-6 font-semibold text-gray-900 cursor-pointer"
                    onClick={() => {
                      setSortColumn('unit_number');
                      setSortDirection(
                        sortColumn === 'unit_number' && sortDirection === 'asc'
                          ? 'desc'
                          : 'asc'
                      );
                    }}
                  >
                    Unit{' '}
                    {sortColumn === 'unit_number' &&
                      (sortDirection === 'asc' ? '↑' : '↓')}
                  </th>
                  <th
                    className="text-left py-3 px-6 font-semibold text-gray-900 cursor-pointer"
                    onClick={() => {
                      setSortColumn('tenant_name');
                      setSortDirection(
                        sortColumn === 'tenant_name' && sortDirection === 'asc'
                          ? 'desc'
                          : 'asc'
                      );
                    }}
                  >
                    Tenant{' '}
                    {sortColumn === 'tenant_name' &&
                      (sortDirection === 'asc' ? '↑' : '↓')}
                  </th>
                  <th
                    className="text-left py-3 px-6 font-semibold text-gray-900 cursor-pointer"
                    onClick={() => {
                      setSortColumn('description');
                      setSortDirection(
                        sortColumn === 'description' && sortDirection === 'asc'
                          ? 'desc'
                          : 'asc'
                      );
                    }}
                  >
                    Description{' '}
                    {sortColumn === 'description' &&
                      (sortDirection === 'asc' ? '↑' : '↓')}
                  </th>
                  <th
                    className="text-left py-3 px-6 font-semibold text-gray-900 cursor-pointer"
                    onClick={() => {
                      setSortColumn('status');
                      setSortDirection(
                        sortColumn === 'status' && sortDirection === 'asc'
                          ? 'desc'
                          : 'asc'
                      );
                    }}
                  >
                    Status{' '}
                    {sortColumn === 'status' &&
                      (sortDirection === 'asc' ? '↑' : '↓')}
                  </th>
                  <th
                    className="text-left py-3 px-6 font-semibold text-gray-900 cursor-pointer"
                    onClick={() => {
                      setSortColumn('created_at');
                      setSortDirection(
                        sortColumn === 'created_at' && sortDirection === 'asc'
                          ? 'desc'
                          : 'asc'
                      );
                    }}
                  >
                    Created At{' '}
                    {sortColumn === 'created_at' &&
                      (sortDirection === 'asc' ? '↑' : '↓')}
                  </th>
                  <th className="text-left py-3 px-6 font-semibold text-gray-900">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredComplaints.map((complaint) => (
                  <tr
                    key={complaint.complaint_id}
                    className="hover:bg-gray-50 transition-colors"
                  >
                    <td className="py-4 px-6">{complaint.complaint_id}</td>
                    <td className="py-4 px-6">
                      {complaint.unit_number || 'N/A'}
                    </td>
                    <td className="py-4 px-6">
                      {complaint.tenant_name || 'N/A'}
                    </td>
                    <td className="py-4 px-6">{complaint.description}</td>
                    <td className="py-4 px-6">
                      <span
                        className={`px-2 py-1 rounded ${
                          complaint.status === 'Open'
                            ? 'bg-yellow-100 text-yellow-800'
                            : complaint.status === 'In Progress'
                            ? 'bg-blue-100 text-blue-800'
                            : 'bg-green-100 text-green-800'
                        }`}
                      >
                        {complaint.status}
                      </span>
                    </td>
                    <td className="py-4 px-6">
                      {new Date(complaint.created_at).toLocaleDateString()}
                    </td>
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-2">
                        <button className="p-1 text-blue-600 hover:text-blue-800 transition-colors">
                          <Eye size={16} />
                        </button>
                        <button
                          onClick={() => {
                            setSelectedComplaint(complaint);
                            setShowComplaintModal(true);
                          }}
                          className="p-1 text-green-600 hover:text-green-800 transition-colors"
                        >
                          <Edit size={16} />
                        </button>
                        <button
                          onClick={() => {
                            setSelectedComplaint(complaint);
                            setShowDeleteConfirm(true);
                          }}
                          className="p-1 text-red-600 hover:text-red-800 transition-colors"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </main>
      <DeleteConfirmationModal
        isOpen={showDeleteConfirm}
        onClose={() => {
          setShowDeleteConfirm(false);
          setSelectedComplaint(null);
        }}
        onConfirm={() => {
          if (selectedComplaint) {
            handleDeleteComplaint(selectedComplaint.complaint_id);
          }
        }}
        itemName={selectedComplaint?.description || 'this complaint'}
      />

      <ComplaintFormModal
        isOpen={showComplaintModal}
        onClose={() => {
          setShowComplaintModal(false);
          setSelectedComplaint(null);
        }}
        onSave={handleSaveComplaint}
        initialData={selectedComplaint}
        units={units}
        tenants={tenants}
      />
    </div>
  );
};

export default ComplaintsPage;
