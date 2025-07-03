import React, { useState, useEffect } from 'react';
import { Search, Plus, Edit, Trash2 } from 'lucide-react';
import Database from '@tauri-apps/plugin-sql';
import { DeleteConfirmationModal } from './DeleteConfirmationModal';
import { TenantFormModal } from './TenantFormModal';

// ---
// Interfaces
// ---
export interface Tenant {
  tenant_id: number;
  full_name: string;
  email: string;
  phone_number: string;
  status: 'active' | 'Moving Out' | 'Inactive'; // Updated to match schema default
  unit_id: number | null; // Nullable foreign key to units
  rent_amount: number;
  lease_start_date: string;
  lease_end_date: string;
  unit_number?: string; // Derived from units table
  property_name?: string; // Derived from properties table
}

// ---
// TenantsList Component
// ---
const TenantsList: React.FC = () => {
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [searchText, setSearchText] = useState<string>('');
  const [error, setError] = useState<string | null>(null);

  // CRUD Modal States
  const [showAddEditTenantModal, setShowAddEditTenantModal] = useState(false);
  const [showDeleteTenantConfirm, setShowDeleteTenantConfirm] = useState(false);
  const [selectedTenant, setSelectedTenant] = useState<Tenant | null>(null);

  async function fetchTenants() {
    try {
      setLoading(true);
      const db = await Database.load('sqlite:test6.db');
      const dbTenants: any = await db.select(`
        SELECT 
          t.tenant_id, t.full_name, t.email, t.phone_number, t.status,
          t.unit_id, t.rent_amount, t.lease_start_date, t.lease_end_date,
          u.unit_number, p.name AS property_name
        FROM tenants t
        LEFT JOIN units u ON t.unit_id = u.unit_id
        LEFT JOIN properties p ON u.property_id = p.property_id
      `);
      setError('');
      setTenants(dbTenants);
    } catch (err) {
      console.error('Error fetching tenants:', err);
      setError('Failed to get tenants - check console');
    } finally {
      setLoading(false);
    }
  }

  const handleDeleteTenant = async () => {
    if (!selectedTenant) return;
    const db = await Database.load('sqlite:test6.db');
    setLoading(true);
    try {
      await db.execute(`DELETE FROM tenants WHERE tenant_id = $1`, [
        selectedTenant.tenant_id,
      ]);
      console.log(
        'Tenant deleted successfully from SQLite:',
        selectedTenant.tenant_id
      );
      fetchTenants();
      setShowDeleteTenantConfirm(false);
      setSelectedTenant(null);
    } catch (err) {
      console.error('Error deleting tenant from SQLite:', err);
      setError('Failed to delete tenant.');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveTenant = async (
    tenantData: Omit<Tenant, 'tenant_id'> | Tenant
  ) => {
    const db = await Database.load('sqlite:test6.db');
    setLoading(true);
    try {
      if ('tenant_id' in tenantData && tenantData.tenant_id !== null) {
        // Update existing tenant
        await db.execute(
          `UPDATE tenants SET full_name = $1, email = $2, phone_number = $3, status = $4, unit_id = $5, rent_amount = $6, lease_start_date = $7, lease_end_date = $8 WHERE tenant_id = $9`,
          [
            tenantData.full_name,
            tenantData.email,
            tenantData.phone_number,
            tenantData.status,
            tenantData.unit_id || null,
            tenantData.rent_amount,
            tenantData.lease_start_date,
            tenantData.lease_end_date,
            tenantData.tenant_id,
          ]
        );
        console.log(
          'Tenant updated successfully in SQLite:',
          tenantData.tenant_id
        );
      } else {
        // Add new tenant
        await db.execute(
          `INSERT INTO tenants (full_name, email, phone_number, status, unit_id, rent_amount, lease_start_date, lease_end_date) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
          [
            tenantData.full_name,
            tenantData.email,
            tenantData.phone_number,
            tenantData.status,
            tenantData.unit_id || null,
            tenantData.rent_amount,
            tenantData.lease_start_date,
            tenantData.lease_end_date,
          ]
        );
        console.log('New tenant added successfully to SQLite.');
      }
      fetchTenants();
      setShowAddEditTenantModal(false);
      setSelectedTenant(null);
    } catch (err) {
      console.error('Error saving tenant to SQLite:', err);
      setError('Failed to save tenant.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTenants();
  }, []);

  const filteredTenants = tenants.filter(
    (tenant) =>
      tenant.full_name.toLowerCase().includes(searchText.toLowerCase()) ||
      tenant.email.toLowerCase().includes(searchText.toLowerCase()) ||
      tenant.phone_number.includes(searchText) ||
      (tenant.property_name || '')
        .toLowerCase()
        .includes(searchText.toLowerCase()) ||
      (tenant.unit_number || '')
        .toLowerCase()
        .includes(searchText.toLowerCase())
  );

  const handleViewDetails = (tenantId: number) => {
    console.log(`View details for tenant ID: ${tenantId}`);
  };

  if (loading) {
    return (
      <div className="p-6 text-center text-gray-600">Loading tenants...</div>
    );
  }

  if (error) {
    return (
      <div className="p-6 text-center text-red-600">
        <p>{error}</p>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6 bg-gray-50 min-h-screen">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Tenant Management</h1>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex flex-wrap gap-4 items-center justify-between">
          <div className="relative flex-1 min-w-64">
            <input
              type="text"
              placeholder="Search by name, email, phone, property, or unit..."
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
              setSelectedTenant(null);
              setShowAddEditTenantModal(true);
            }}
            className="flex items-center gap-2 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shadow-md"
          >
            <Plus className="w-4 h-4" />
            Add New Tenant
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {filteredTenants.length > 0 ? (
          filteredTenants.map((tenant) => (
            <div
              key={tenant.tenant_id}
              className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 flex flex-col justify-between hover:shadow-md transition-shadow duration-200"
            >
              <div>
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="font-semibold text-lg text-gray-900 mb-1">
                      {tenant.full_name}
                    </h3>
                    <p className="text-sm text-gray-600">
                      {tenant.unit_number || 'N/A'} •{' '}
                      {tenant.property_name || 'N/A'}
                    </p>
                  </div>
                  <span
                    className={`inline-flex px-3 py-1 rounded-full text-xs font-medium uppercase tracking-wide ${
                      tenant.status === 'active'
                        ? 'bg-green-100 text-green-800'
                        : tenant.status === 'Moving Out'
                        ? 'bg-yellow-100 text-yellow-800'
                        : 'bg-red-100 text-red-800'
                    }`}
                  >
                    {tenant.status}
                  </span>
                </div>

                <div className="space-y-2 text-sm text-gray-700">
                  <p>
                    <span className="font-medium text-gray-800">Email:</span>{' '}
                    {tenant.email}
                  </p>
                  <p>
                    <span className="font-medium text-gray-800">Phone:</span>{' '}
                    {tenant.phone_number}
                  </p>
                  <p>
                    <span className="font-medium text-gray-800">Rent:</span> $
                    {tenant.rent_amount.toLocaleString()}/month
                  </p>
                  <p>
                    <span className="font-medium text-gray-800">Lease:</span>{' '}
                    {tenant.lease_start_date} to {tenant.lease_end_date}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3 mt-6 pt-4 border-t border-gray-200">
                <button
                  onClick={() => handleViewDetails(tenant.tenant_id)}
                  className="flex-1 px-4 py-2 text-sm bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 transition-colors duration-200 font-medium"
                >
                  View Details
                </button>
                <button
                  onClick={() => {
                    setSelectedTenant(tenant);
                    setShowAddEditTenantModal(true);
                  }}
                  className="p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors duration-200"
                  title="Edit Tenant"
                >
                  <Edit className="w-5 h-5" />
                </button>
                <button
                  onClick={() => {
                    setSelectedTenant(tenant);
                    setShowDeleteTenantConfirm(true);
                  }}
                  className="p-2 text-red-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors duration-200"
                  title="Delete Tenant"
                >
                  <Trash2 className="w-5 h-5" />
                </button>
              </div>
            </div>
          ))
        ) : (
          <div className="col-span-full text-center py-10 text-gray-600 text-lg">
            No tenants found matching your search.
          </div>
        )}
      </div>

      <TenantFormModal
        isOpen={showAddEditTenantModal}
        onClose={() => setShowAddEditTenantModal(false)}
        onSave={handleSaveTenant}
        initialData={selectedTenant}
      />

      <DeleteConfirmationModal
        isOpen={showDeleteTenantConfirm}
        onClose={() => setShowDeleteTenantConfirm(false)}
        onConfirm={handleDeleteTenant}
        itemName={selectedTenant?.full_name || 'this tenant'}
      />
    </div>
  );
};

export default TenantsList;
