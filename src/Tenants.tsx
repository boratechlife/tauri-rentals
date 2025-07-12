import React, { useState, useEffect } from 'react';
import { Search, Plus, Edit, Trash2 } from 'lucide-react';
import Database from '@tauri-apps/plugin-sql';
import { DeleteConfirmationModal } from './DeleteConfirmationModal';
import { TenantFormModal } from './TenantFormModal';
import { differenceInMonths, endOfMonth, startOfMonth } from 'date-fns';

// ---
// Interfaces
// ---

interface ArrearsReport {
  tenant_id: number;
  tenant_name: string;
  unit_number: string;
  expected_amount: number;
  total_paid: number;
  balance: number;
  status: 'Arrears' | 'Overpaid' | 'Current';
  months_counted: number;
}

interface TenantStats {
  totalTenants: number;
  totalRent: number;
  averageRent: number;
}
export interface Tenant {
  tenant_id: number;
  full_name: string;
  email: string;
  phone_number: string;
  status: 'active' | 'Moving Out' | 'Inactive'; // Updated to match schema default
  unit_id: number | null; // Nullable foreign key to units
  rent_amount: number;
  lease_start_date: string;

  unit_number?: string; // Derived from units table
  property_name?: string; // Derived from properties table
  arrears?: ArrearsReport;
}

const StatsDisplay: React.FC<{ stats: TenantStats }> = ({ stats }) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 text-center">
        <h3 className="text-sm font-medium text-gray-600">Total Tenants</h3>
        <p className="text-2xl font-bold text-gray-900">{stats.totalTenants}</p>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 text-center">
        <h3 className="text-sm font-medium text-gray-600">Total Rent</h3>
        <p className="text-2xl font-bold text-gray-900">
          KES {stats.totalRent.toLocaleString()}
        </p>
      </div>
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 text-center">
        <h3 className="text-sm font-medium text-gray-600">Average Rent</h3>
        <p className="text-2xl font-bold text-gray-900">
          KES {stats.averageRent.toFixed(2)}
        </p>
      </div>
    </div>
  );
};

// ---
// TenantsList Component
// ---
const TenantsList: React.FC = () => {
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [searchText, setSearchText] = useState<string>('');
  const [error, setError] = useState<string | null>(null);

  const [stats, setStats] = useState<TenantStats>({
    totalTenants: 0,
    totalRent: 0,
    averageRent: 0,
  });
  // CRUD Modal States
  const [showAddEditTenantModal, setShowAddEditTenantModal] = useState(false);
  const [showDeleteTenantConfirm, setShowDeleteTenantConfirm] = useState(false);
  const [selectedTenant, setSelectedTenant] = useState<Tenant | null>(null);
  const [arrearsData, setArrearsData] = useState<ArrearsReport[]>([]);

  async function calculateArrears(
    tenants: Tenant[] = []
  ): Promise<ArrearsReport[]> {
    try {
      const db = await Database.load('sqlite:productionv7.db');
      const arrearsReport: ArrearsReport[] = [];
      const currentDate = new Date();

      if (!Array.isArray(tenants)) {
        console.error('calculateArrears: tenants is not an array', tenants);
        return [];
      }

      for (const tenant of tenants) {
        const leaseStartDate = new Date(tenant.lease_start_date);
        if (isNaN(leaseStartDate.getTime())) continue;

        const monthsCounted =
          differenceInMonths(
            endOfMonth(currentDate),
            startOfMonth(leaseStartDate)
          ) + 1;

        const rentAmount = await db.select(
          `SELECT monthly_rent FROM units WHERE unit_id = $1`,
          [tenant.unit_id]
        );
        const monthlyRent =
          rentAmount[0]?.monthly_rent || tenant.rent_amount || 0;
        const totalExpected = monthsCounted * monthlyRent;

        const paymentsForTenant = await db.select(
          `SELECT SUM(amount_paid) as total_paid
         FROM payments
         WHERE tenant_id = $1 AND payment_category = 'Rent'
         AND payment_date >= $2 AND payment_date <= $3`,
          [
            tenant.tenant_id,
            tenant.lease_start_date,
            currentDate.toISOString().slice(0, 10),
          ]
        );

        const totalPaid = paymentsForTenant[0]?.total_paid || 0;
        const balance = totalExpected - totalPaid;
        const status =
          balance > 0 ? 'Arrears' : balance < 0 ? 'Overpaid' : 'Current';

        arrearsReport.push({
          tenant_id: tenant.tenant_id,
          tenant_name: tenant.full_name,
          unit_number: tenant.unit_number || 'N/A',
          expected_amount: totalExpected,
          total_paid: totalPaid,
          balance,
          status,
          months_counted: monthsCounted,
        });
      }
      return arrearsReport;
    } catch (err) {
      console.error('Error calculating arrears:', err);
      setError('Failed to calculate arrears');
      return [];
    }
  }

  async function fetchTenants() {
    try {
      setLoading(true);
      const db = await Database.load('sqlite:productionv7.db');
      const dbTenants: any = await db.select(`
      SELECT 
        t.tenant_id, t.full_name, t.email, t.phone_number, t.status,
        t.unit_id, t.rent_amount, t.lease_start_date, 
        u.unit_number, p.name AS property_name
      FROM tenants t
      LEFT JOIN units u ON t.unit_id = u.unit_id
      LEFT JOIN properties p ON u.property_id = p.property_id
    `);
      const arrears = await calculateArrears(dbTenants);
      const tenantsWithArrears = dbTenants.map((tenant: Tenant) => ({
        ...tenant,
        arrears: arrears.find((a) => a.tenant_id === tenant.tenant_id),
      }));
      setError('');
      setTenants(tenantsWithArrears);
      setStats(computeStats(tenantsWithArrears));
    } catch (err) {
      console.error('Error fetching tenants:', err);
      setError('Failed to get tenants - check console');
    } finally {
      setLoading(false);
    }
  }

  const computeStats = (tenants: Tenant[]): TenantStats => {
    const totalTenants = tenants.length;
    const totalRent = tenants.reduce((sum, t) => sum + (t.rent_amount || 0), 0);
    const averageRent = totalTenants > 0 ? totalRent / totalTenants : 0;

    return {
      totalTenants,
      totalRent,
      averageRent,
    };
  };

  const handleDeleteTenant = async () => {
    if (!selectedTenant) return;

    const db = await Database.load('sqlite:productionv7.db');
    setLoading(true);

    try {
      // 1. Get the unit_id associated with the tenant's active lease
      // We assume a tenant can only have one active lease at a time for this logic.
      const result: any = await db.select(
        `
      SELECT unit_id FROM leases WHERE tenant_id = $1 AND status = 'active' LIMIT 1
    `,
        [selectedTenant.tenant_id]
      );

      let unitIdToUpdate: number | null = null;
      if (result && result.length > 0) {
        unitIdToUpdate = result[0].unit_id;
      }

      // 2. Delete the tenant
      await db.execute(`DELETE FROM tenants WHERE tenant_id = $1`, [
        selectedTenant.tenant_id,
      ]);
      console.log(
        'Tenant deleted successfully from SQLite:',
        selectedTenant.tenant_id
      );

      // 3. If a unit_id was found, update the unit status to 'available'
      if (unitIdToUpdate !== null) {
        await db.execute(
          `
        UPDATE units
        SET status = 'available'
        WHERE unit_id = $1
      `,
          [unitIdToUpdate]
        );
        console.log(`Unit ${unitIdToUpdate} status updated to 'available'.`);
      }

      // 4. Optionally, you might want to mark the lease as 'ended' or delete it as well.
      // This depends on your business logic. For now, we'll assume deleting the tenant
      // also logically severs the lease relationship.
      // If you prefer to update the lease status:
      await db.execute(
        `
      UPDATE leases
      SET status = 'ended', end_date = $1
      WHERE tenant_id = $2 AND status = 'active'
    `,
        [new Date().toISOString().split('T')[0], selectedTenant.tenant_id]
      );
      console.log(
        `Lease for tenant ${selectedTenant.tenant_id} marked as 'ended'.`
      );

      // Refresh data and close modal
      fetchTenants().then(() => {
        calculateArrears().then((data) => setArrearsData(data));
      });
      setStats(computeStats(tenants));
      setShowDeleteTenantConfirm(false);
      setSelectedTenant(null);
    } catch (err) {
      console.error(
        'Error deleting tenant or updating unit status from SQLite:',
        err
      );
      setError('Failed to delete tenant and/or update unit status.');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveTenant = async (
    tenantData: Omit<Tenant, 'tenant_id'> | Tenant
  ) => {
    const db = await Database.load('sqlite:productionv7.db');
    setLoading(true);
    try {
      if ('tenant_id' in tenantData && tenantData.tenant_id !== null) {
        // --- Update existing tenant ---

        // Fetch the current tenant data to get the old unit_id
        const oldTenantData: any = await db.execute(
          `SELECT unit_id FROM tenants WHERE tenant_id = $1`,
          [tenantData.tenant_id]
        );
        const oldUnitId = oldTenantData[0]?.unit_id;

        await db.execute(
          `UPDATE tenants SET full_name = $1, email = $2, phone_number = $3, status = $4, unit_id = $5, rent_amount = $6, lease_start_date = $7 WHERE tenant_id = $8`,
          [
            tenantData.full_name,
            tenantData.email,
            tenantData.phone_number,
            tenantData.status,
            tenantData.unit_id || null, // Ensure null is passed if unit_id is empty
            tenantData.rent_amount,
            tenantData.lease_start_date,
            tenantData.tenant_id,
          ]
        );
        console.log(
          'Tenant updated successfully in SQLite:',
          tenantData.tenant_id
        );

        // --- NEW: Update unit status if a unit_id is provided during an update ---
        if (tenantData.unit_id) {
          await db.execute(
            `UPDATE units SET unit_status = 'Occupied' WHERE unit_id = $1`,
            [tenantData.unit_id]
          );
          console.log(
            `Unit ${tenantData.unit_id} status updated to 'Occupied'.`
          );
        }

        // --- Handle old unit status if the tenant was reassigned from a unit ---
        // If the tenant had an old unit and is now assigned to a different one (or unassigned)
        if (oldUnitId && oldUnitId !== tenantData.unit_id) {
          // Check if the old unit is now truly vacant (no other tenant assigned to it)
          const tenantsInOldUnit: any = await db.select(
            `SELECT COUNT(*) as count FROM tenants WHERE unit_id = $1`,
            [oldUnitId]
          );
          if (tenantsInOldUnit[0]?.count === 0) {
            await db.execute(
              `UPDATE units SET unit_status = 'Available' WHERE unit_id = $1`,
              [oldUnitId]
            );
            console.log(
              `Old Unit ${oldUnitId} status updated to 'Available' as it is now vacant.`
            );
          }
        }
      } else {
        // --- Add new tenant ---
        await db.execute(
          `INSERT INTO tenants (full_name, email, phone_number, status, unit_id, rent_amount, lease_start_date) VALUES ($1, $2, $3, $4, $5, $6, $7)`,
          [
            tenantData.full_name,
            tenantData.email,
            tenantData.phone_number,
            tenantData.status,
            tenantData.unit_id || null, // Ensure null is passed if unit_id is empty
            tenantData.rent_amount,
            tenantData.lease_start_date,
          ]
        );
        console.log('New tenant added successfully to SQLite.');

        // --- NEW: Update unit status if a unit_id is provided during an insert ---
        if (tenantData.unit_id) {
          await db.execute(
            `UPDATE units SET unit_status = 'Occupied' WHERE unit_id = $1`,
            [tenantData.unit_id]
          );
          console.log(
            `Unit ${tenantData.unit_id} status updated to 'Occupied'.`
          );
        }
      }

      fetchTenants(); // Re-fetch tenants to update UI
      // You might also want to re-fetch units if your UI displays unit statuses directly
      // fetchUnits(); // Assuming you have a similar fetchUnits function

      setShowAddEditTenantModal(false);
      setSelectedTenant(null);
    } catch (err) {
      console.error('Error saving tenant to SQLite:', err);
      // More robust error handling: check if the error is due to a non-existent unit_id
      setError('Failed to save tenant. Please ensure the unit ID is valid.');
    } finally {
      setLoading(false);
      // 	if (db) await db.close(); // Ensure the database connection is closed
    }
  };

  useEffect(() => {
    // Refresh data and close modal
    fetchTenants().then(() => {
      calculateArrears().then((data) => setArrearsData(data));
    });
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

  const handleExportCsv = async () => {
    if (filteredTenants.length === 0) {
      alert('No tenants to export.');
      return;
    }

    const headers = [
      'Tenant ID',
      'Full Name',
      'Email',
      'Phone Number',
      'Status',
      'Unit ID',
      'Unit Number',
      'Property Name',
      'Rent Amount',
      'Lease Start Date',
    ];

    const csvRows = filteredTenants.map((tenant) => {
      return [
        tenant.tenant_id,
        `"${tenant.full_name.replace(/"/g, '""')}"`, // Handle quotes in full_name
        `"${tenant.email.replace(/"/g, '""')}"`, // Handle quotes in email
        `"${tenant.phone_number.replace(/"/g, '""')}"`, // Handle quotes in phone_number
        tenant.status,
        tenant.unit_id || 'N/A',
        tenant.unit_number || 'N/A',
        `"${(tenant.property_name || 'N/A').replace(/"/g, '""')}"`, // Handle quotes in property_name
        tenant.rent_amount,
        tenant.lease_start_date, // Dates are already strings from DB
      ]
        .map((field) => (typeof field === 'string' ? field : String(field))) // Ensure all fields are strings
        .join(',');
    });

    const csvContent = [headers.join(','), ...csvRows].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', 'tenants.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url); // Clean up the URL object
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

      <StatsDisplay stats={stats} />

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
          <button
            className="flex items-center gap-2 px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors shadow-md"
            onClick={handleExportCsv}
          >
            Export CSV
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
                      Unit no. {tenant.unit_number || 'N/A'} • Property{' '}
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
                    <span className="font-medium text-gray-800">
                      lease start date:
                    </span>{' '}
                    {tenant.lease_start_date}
                  </p>

                  <div className="mt-2">
                    <p>
                      <span className="font-medium text-gray-800">
                        Arrears:
                      </span>{' '}
                      {tenant.arrears ? (
                        <span
                          className={`${
                            tenant.arrears.status === 'Arrears'
                              ? 'text-red-600'
                              : tenant.arrears.status === 'Overpaid'
                              ? 'text-green-600'
                              : 'text-blue-600'
                          }`}
                        >
                          KES{' '}
                          {Math.abs(tenant.arrears.balance).toLocaleString()} (
                          {tenant.arrears.status})
                        </span>
                      ) : (
                        'N/A'
                      )}
                    </p>
                  </div>
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
