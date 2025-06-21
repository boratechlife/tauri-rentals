import React, { useState, useEffect, useCallback } from 'react';
import { Search, Plus, Edit, Trash2 } from 'lucide-react';
import Database from '@tauri-apps/plugin-sql';
import { invoke } from '@tauri-apps/api/core';
import { DeleteConfirmationModal } from './DeleteConfirmationModal';
import { TenantFormModal } from './TenantFormModal';

// ---
// Interfaces
// ---
export interface Tenant {
  id: number;
  name: string;
  email: string;
  phone: string;
  status: 'Active' | 'Moving Out' | 'Inactive'; // More specific status types
  unit: string;
  property: string;
  rent_amount: number;
  leaseStart: string;
  leaseEnd: string;
}

// ---
// TenantsList Component (Renamed for clarity and reusability)
// ---
const TenantsList: React.FC = () => {
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [searchText, setSearchText] = useState<string>('');
  const [error, setError] = useState<string | null>(null);

  // CRUD Modal States - NEW
  const [showAddEditTenantModal, setShowAddEditTenantModal] = useState(false);
  const [showDeleteTenantConfirm, setShowDeleteTenantConfirm] = useState(false);
  const [selectedTenant, setSelectedTenant] = useState<Tenant | null>(null); // For editing or deleting

  async function fetchTenants() {
    try {
      setLoading(true);
      const db = await Database.load('sqlite:test.db');
      // Adjust column names to match your 'tenants' and 'units' table schema
      const dbTenants = await db.select(
        `SELECT
             t.id, t.name, t.email, t.phone, t.status,
             u.unit_number as unit, p.name as property,
             t.rent_amount, t.lease_start, t.lease_end
           FROM tenants t
           LEFT JOIN units u ON t.unit = u.id
           LEFT JOIN properties p ON u.property = p.id;`
      );
      setError('');
      setTenants(dbTenants);
      console.log('Tenants fetched successfully:', dbTenants);
    } catch (err) {
      console.error('Error fetching tenants:', err);
      setError('Failed to get tenants - check console');
    } finally {
      setLoading(false);
    }
  }

  // Step 9: Implement Delete Functionality with Confirmation Modal - MODIFIED
  const handleDeleteTenant = async () => {
    const db = await Database.load('sqlite:test.db');

    setLoading(true);
    try {
      await db.execute(`DELETE FROM tenants WHERE id = $1`, [
        selectedTenant.id,
      ]);
      console.log(
        'Tenant deleted successfully from SQLite:',
        selectedTenant.id
      );
      fetchTenants(); // Refresh the list after deletion
      setShowDeleteTenantConfirm(false); // Close the confirmation modal
      setSelectedTenant(null); // Clear selected tenant
    } catch (err) {
      console.error('Error deleting tenant from SQLite:', err);
      setError('Failed to delete tenant.');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveTenant = async (tenantData: Omit<Tenant, 'id'> | Tenant) => {
    const db = await Database.load('sqlite:test.db');

    setLoading(true);
    try {
      if ('id' in tenantData && tenantData.id !== null) {
        // Update existing tenant (Step 7) - MODIFIED
        console.log('Updating tenant:', tenantData);
        await db.execute(
          `UPDATE tenants SET name = $1, email = $2, phone = $3, status = $4, unit = $5, property = $6, rent_amount = $7, lease_start = $8, lease_end = $9 WHERE id = $10`,
          [
            tenantData.name,
            tenantData.email,
            tenantData.phone,
            tenantData.status,
            tenantData.unit,
            tenantData.property,
            tenantData.rent_amount,
            tenantData.leaseStart || selectedTenant?.lease_start,
            tenantData.leaseEnd || selectedTenant?.lease_end,
            tenantData.id, // Use ID for the WHERE clause
          ]
        );
        console.log('Tenant updated successfully in SQLite:', tenantData.id);
      } else {
        // Add new tenant (Step 5)
        await db.execute(
          `INSERT INTO tenants (name, email, phone, status, unit, property, rent_amount, lease_start, lease_end) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`,
          [
            tenantData.name,
            tenantData.email,
            tenantData.phone,
            tenantData.status,
            tenantData.unit,
            tenantData.property,
            tenantData.rent_amount,
            tenantData.leaseStart,
            tenantData.leaseEnd,
          ]
        );
        console.log('New tenant added successfully to SQLite.');
      }
      fetchTenants(); // Refresh the list after save
      setShowAddEditTenantModal(false); // Close the modal
      setSelectedTenant(null); // Clear selected tenant
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

  // Filter tenants based on search text
  const filteredTenants = tenants.filter(
    (tenant) =>
      tenant.name.toLowerCase().includes(searchText.toLowerCase()) ||
      tenant.email.toLowerCase().includes(searchText.toLowerCase()) ||
      tenant.phone.includes(searchText) ||
      tenant.property.toLowerCase().includes(searchText.toLowerCase()) ||
      tenant.unit.toLowerCase().includes(searchText.toLowerCase())
  );

  const handleViewDetails = (tenantId: number) => {
    console.log(`View details for tenant ID: ${tenantId}`);
    // Implement navigation to a tenant detail page
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
      {/* Page Header */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Tenant Management</h1>
      </div>

      {/* Search and Add Section */}
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
              setSelectedTenant(null); // Clear selected tenant for 'add' mode
              setShowAddEditTenantModal(true);
            }}
            className="flex items-center gap-2 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shadow-md"
          >
            <Plus className="w-4 h-4" />
            Add New Tenant
          </button>
        </div>
      </div>

      {/* Tenants Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {filteredTenants.length > 0 ? (
          filteredTenants.map((tenant, index) => (
            <div
              key={tenant.id + '' + index}
              className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 flex flex-col justify-between hover:shadow-md transition-shadow duration-200"
            >
              <div>
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="font-semibold text-lg text-gray-900 mb-1">
                      {tenant.name}
                    </h3>
                    <p className="text-sm text-gray-600">
                      {tenant.unit} • {tenant.property}
                    </p>
                  </div>
                  <span
                    className={`inline-flex px-3 py-1 rounded-full text-xs font-medium uppercase tracking-wide ${
                      tenant.status === 'Active'
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
                    {tenant.phone}
                  </p>
                  <p>
                    <span className="font-medium text-gray-800">Rent:</span> $
                    {tenant.rent_amount.toLocaleString()}/month
                  </p>
                  <p>
                    <span className="font-medium text-gray-800">Lease:</span>{' '}
                    {tenant.leaseStart} to {tenant.leaseEnd}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3 mt-6 pt-4 border-t border-gray-200">
                <button
                  onClick={() => handleViewDetails(tenant.id)}
                  className="flex-1 px-4 py-2 text-sm bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 transition-colors duration-200 font-medium"
                >
                  View Details
                </button>
                <button
                  onClick={() => {
                    setSelectedTenant(tenant); // Set tenant for editing
                    setShowAddEditTenantModal(true); // Open edit modal
                  }}
                  className="p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors duration-200"
                  title="Edit Tenant"
                >
                  <Edit className="w-5 h-5" />
                </button>
                <button
                  onClick={() => {
                    setSelectedTenant(tenant); // Set tenant for deletion
                    setShowDeleteTenantConfirm(true); // Open delete confirmation modal
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
        itemName={selectedTenant?.name || 'this tenant'}
      />
    </div>
  );
};

export default TenantsList;
