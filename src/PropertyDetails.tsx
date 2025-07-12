import React, { useState, useEffect, useMemo } from 'react';
import { useParams } from 'react-router-dom';
import Database from '@tauri-apps/plugin-sql';
import { Home, MapPin, Eye, Edit, Trash2 } from 'lucide-react';
import { endOfMonth, startOfMonth, differenceInMonths } from 'date-fns';
import { useNavigate } from 'react-router-dom';

import { ErrorBoundary } from './ErrorBoundary';

interface Property {
  property_id: number;
  name: string;
  address: string;
  total_units: number;
  property_type: string;
  status: string;
  last_inspection: string | null;
  manager_id: number;
  created_at: string;
  updated_at: string;
  manager_name?: string;
}

interface Unit {
  unit_id: number;
  unit_number: string;
  property_id: number;
  block_id: number | null;
  floor_number: number | null;
  unit_status: string;
  unit_type: string;
  bedroom_count: number;
  bathroom_count: number;
  monthly_rent: number;
  security_deposit: number;
  tenant_id: number | null;
  notes: string | null;
}

interface Tenant {
  tenant_id: number;
  full_name: string;
  phone_number: string;
  email: string;
  id_number: string;
  lease_start_date: string;
  rent_amount: number;
  deposit_amount: number;
  unit_id: number | null;
  status: string;
  created_at: string;
  updated_at: string;
}

interface Block {
  block_id: number;
  block_name: string;
  property_id: number;
  floor_count: number | null;
  notes: string | null;
}

interface Payment {
  payment_id: string;
  tenant_id: number;
  unit_id: number | null;
  property_id: number;
  payment_month: string;
  amount_paid: number;
  payment_date: string;
  due_date: string;
  payment_status: 'Paid' | 'Pending' | 'Overdue';
  payment_method:
    | 'Cash'
    | 'Bank Transfer'
    | 'Credit Card'
    | 'Mobile Money'
    | 'Check'
    | 'Other';
  payment_category: 'Rent' | 'Utilities' | 'Deposit' | 'Other';
  receipt_number?: string;
  transaction_reference?: string;
  remarks?: string;
  created_at?: string;
  updated_at?: string;
  tenant_name?: string;
  unit_number?: string;
}

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

const PropertyDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [property, setProperty] = useState<Property | null>(null);
  const [units, setUnits] = useState<Unit[]>([]);
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [blocks, setBlocks] = useState<Block[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [arrearsReport, setArrearsReport] = useState<ArrearsReport[]>([]);
  const [activeTab, setActiveTab] = useState<'units' | 'tenants' | 'blocks'>(
    'units'
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [unitSearch, setUnitSearch] = useState('');

  const [unitSort, setUnitSort] = useState<{
    key: keyof Unit;
    direction: 'asc' | 'desc';
  }>({
    key: 'unit_number',
    direction: 'asc',
  });

  const [blockSort, setBlockSort] = useState<{
    key: keyof Block;
    direction: 'asc' | 'desc';
  }>({
    key: 'block_name',
    direction: 'asc',
  });

  // Add inside PropertyDetails component
  const [blockSearch, setBlockSearch] = useState('');
  const [unitPage, setUnitPage] = useState(1);
  const [blockPage, setBlockPage] = useState(1);
  const blocksPerPage = 10;

  const navigate = useNavigate();

  const sortedUnits = useMemo(() => {
    return [...units].sort((a, b) => {
      const aValue = a[unitSort.key];
      const bValue = b[unitSort.key];
      if (unitSort.direction === 'asc') {
        return aValue < bValue ? -1 : aValue > bValue ? 1 : 0;
      }
      return aValue > bValue ? -1 : aValue < bValue ? 1 : 0;
    });
  }, [units, unitSort]);

  const handleUnitSort = (key: keyof Unit) => {
    setUnitSort((prev) => ({
      key,
      direction: prev.key === key && prev.direction === 'asc' ? 'desc' : 'asc',
    }));
  };

  const filteredUnits = useMemo(() => {
    const lowerSearch = unitSearch.toLowerCase();
    return sortedUnits.filter(
      (unit) =>
        unit.unit_number.toLowerCase().includes(lowerSearch) ||
        unit.unit_type.toLowerCase().includes(lowerSearch)
    );
  }, [sortedUnits, unitSearch]);

  const unitsPerPage = 10;

  const paginatedUnits = useMemo(() => {
    const start = (unitPage - 1) * unitsPerPage;
    return filteredUnits.slice(start, start + unitsPerPage);
  }, [filteredUnits, unitPage]);

  const totalUnitPages = Math.ceil(filteredUnits.length / unitsPerPage);

  const getCurrentDate = (): Date => {
    return new Date();
  };

  const calculateArrearsReport = async (
    db: Database,
    month?: string
  ): Promise<ArrearsReport[]> => {
    try {
      const arrearsReport: ArrearsReport[] = [];
      for (const tenant of tenants) {
        const leaseStartDate = new Date(tenant.lease_start_date);
        const endDate = month ? new Date(`${month}-01`) : getCurrentDate();
        if (isNaN(leaseStartDate.getTime())) {
          continue;
        }
        const monthsCounted =
          differenceInMonths(
            endOfMonth(endDate),
            startOfMonth(leaseStartDate)
          ) + 1;
        const rentAmount = await db.select<{ monthly_rent: number }[]>(
          `SELECT monthly_rent FROM units WHERE unit_id = $1`,
          [tenant.unit_id]
        );
        const totalExpected =
          monthsCounted * (rentAmount[0]?.monthly_rent || 0);
        const paymentsForTenant = await db.select<{ total_paid: number }[]>(
          `SELECT SUM(amount_paid) as total_paid
         FROM payments
         WHERE tenant_id = $1 AND payment_category = 'Rent' AND payment_date >= $2 AND payment_date <= $3`,
          [
            tenant.tenant_id,
            tenant.lease_start_date,
            month ? `${month}-31` : getCurrentDate().toISOString().slice(0, 10),
          ]
        );
        const totalPaid = paymentsForTenant[0]?.total_paid || 0;
        const balance = totalExpected - totalPaid;
        let status: 'Arrears' | 'Overpaid' | 'Current';
        if (balance > 0) {
          status = 'Arrears';
        } else if (balance < 0) {
          status = 'Overpaid';
        } else {
          status = 'Current';
        }
        arrearsReport.push({
          tenant_id: tenant.tenant_id,
          tenant_name: tenant.full_name,
          unit_number:
            units.find((u) => u.unit_id === tenant.unit_id)?.unit_number ||
            'N/A',
          expected_amount: totalExpected,
          total_paid: totalPaid,
          balance,
          status,
          months_counted: monthsCounted,
        });
      }
      return arrearsReport;
    } catch (err) {
      console.error('Error calculating arrears report:', err);
      setError('Failed to generate arrears report');
      return [];
    }
  };

  useEffect(() => {
    async function fetchData() {
      let db;
      try {
        setLoading(true);
        db = await Database.load('sqlite:productionv7.db');
        // Fetch property
        const properties = await db.select<Property[]>(
          `SELECT p.*, m.name AS manager_name 
           FROM properties p 
           LEFT JOIN managers m ON p.manager_id = m.manager_id 
           WHERE p.property_id = $1`,
          [id]
        );
        if (properties.length > 0) {
          setProperty(properties[0]);
        } else {
          setError('Property not found');
          return;
        }
        // Fetch units
        const unitsData = await db.select<Unit[]>(
          `SELECT * FROM units WHERE property_id = $1`,
          [id]
        );
        setUnits(unitsData);
        // Fetch tenants
        const tenantsData = await db.select<Tenant[]>(
          `SELECT t.* 
           FROM tenants t 
           JOIN units u ON t.unit_id = u.unit_id 
           WHERE u.property_id = $1`,
          [id]
        );
        setTenants(tenantsData);
        // Fetch blocks
        const blocksData = await db.select<Block[]>(
          `SELECT * FROM blocks WHERE property_id = $1`,
          [id]
        );
        setBlocks(blocksData);
        // Fetch payments
        const paymentsData = await db.select<Payment[]>(
          `SELECT p.*, t.full_name AS tenant_name, u.unit_number 
           FROM payments p 
           LEFT JOIN tenants t ON p.tenant_id = t.tenant_id 
           LEFT JOIN units u ON p.unit_id = u.unit_id 
           WHERE p.property_id = $1`,
          [id]
        );
        setPayments(paymentsData);

        if (tenants.length > 0) {
          calculateArrearsReport(db).then((data) => setArrearsReport(data));
        }
        setError(null);
      } catch (err) {
        console.error('Error fetching data:', err);
        setError('Failed to fetch data');
      } finally {
        setLoading(false);
        if (db) await db.close();
      }
    }
    fetchData();
  }, [id]);

  // Add inside PropertyDetails component, before the return statement
  const stats = useMemo(() => {
    const totalCollected = payments
      .filter((p) => p.payment_category === 'Rent')
      .reduce((sum, p) => sum + p.amount_paid, 0);
    const totalArrears = arrearsReport
      .filter((r) => r.status === 'Arrears')
      .reduce((sum, r) => sum + r.balance, 0);
    const tenantCount = tenants.length;

    return {
      totalCollected,
      totalArrears,
      tenantCount,
    };
  }, [payments, arrearsReport, tenants]);

  // Add inside PropertyDetails component

  const sortedBlocks = useMemo(() => {
    return [...blocks].sort((a, b) => {
      const aValue = a[blockSort.key];
      const bValue = b[blockSort.key];
      if (blockSort.direction === 'asc') {
        return aValue < bValue ? -1 : aValue > bValue ? 1 : 0;
      }
      return aValue > bValue ? -1 : aValue < bValue ? 1 : 0;
    });
  }, [blocks, blockSort]);

  const filteredBlocks = useMemo(() => {
    const lowerSearch = blockSearch.toLowerCase();
    return sortedBlocks.filter((block) =>
      block.block_name.toLowerCase().includes(lowerSearch)
    );
  }, [sortedBlocks, blockSearch]);

  const handleBlockSort = (key: keyof Block) => {
    setBlockSort((prev) => ({
      key,
      direction: prev.key === key && prev.direction === 'asc' ? 'desc' : 'asc',
    }));
  };

  const handleEditUnit = (unitId: number) => {
    console.log(`Edit unit ${unitId}`);
    // TODO: Implement edit functionality (e.g., open modal or navigate)
  };

  const paginatedBlocks = useMemo(() => {
    const start = (blockPage - 1) * blocksPerPage;
    return filteredBlocks.slice(start, start + blocksPerPage);
  }, [filteredBlocks, blockPage]);

  const totalBlockPages = Math.ceil(filteredBlocks.length / blocksPerPage);

  // Add inside PropertyDetails component
  const handleEditBlock = (blockId: number) => {
    console.log(`Edit block ${blockId}`);
    // TODO: Implement edit functionality
  };

  // Add inside PropertyDetails component
  const handleDeleteBlock = async (blockId: number) => {
    if (!confirm('Are you sure you want to delete this block?')) return;
    let db;
    try {
      db = await Database.load('sqlite:productionv7.db');
      await db.execute('DELETE FROM blocks WHERE block_id = $1', [blockId]);
      setBlocks(blocks.filter((b) => b.block_id !== blockId));
    } catch (err) {
      console.error('Error deleting block:', err);
      setError('Failed to delete block');
    } finally {
      if (db) await db.close();
    }
  };

  const handleDeleteUnit = async (unitId: number) => {
    if (!confirm('Are you sure you want to delete this unit?')) return;
    let db;
    try {
      db = await Database.load('sqlite:productionv7.db');
      await db.execute('DELETE FROM units WHERE unit_id = $1', [unitId]);
      setUnits(units.filter((u) => u.unit_id !== unitId));
    } catch (err) {
      console.error('Error deleting unit:', err);
      setError('Failed to delete unit');
    } finally {
      if (db) await db.close();
    }
  };

  if (loading)
    return <div className="p-6 text-center text-gray-600">Loading...</div>;
  if (error) return <div className="p-6 text-center text-red-600">{error}</div>;
  if (!property)
    return (
      <div className="p-6 text-center text-gray-600">No property found</div>
    );

  return (
    <ErrorBoundary>
      <div className="p-6 space-y-6">
        <div className="mb-4">
          <button
            onClick={() => navigate('/properties')}
            className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700"
          >
            Back to Properties
          </button>
        </div>
        {/* Header Section */}
        <div className="bg-white shadow rounded-lg p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Home className="w-8 h-8 text-blue-600" />
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  {property.name}
                </h1>
                <div className="flex items-center mt-1 text-gray-600">
                  <MapPin className="w-5 h-5 mr-1" />
                  <p>{property.address}</p>
                </div>
              </div>
            </div>
            <div className="text-right">
              <p className="text-sm text-gray-600">
                Property Type: {property.property_type}
              </p>
              <p className="text-sm text-gray-600">Status: {property.status}</p>
              <p className="text-sm text-gray-600">
                Manager: {property.manager_name || 'Unassigned'}
              </p>
              <p className="text-sm text-gray-600">
                Last Inspection: {property.last_inspection || 'N/A'}
              </p>
            </div>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white shadow rounded-lg p-4">
            <h3 className="text-sm font-medium text-gray-600">
              Total Rent Collected
            </h3>
            <p className="text-2xl font-bold text-gray-900">
              KES{stats.totalCollected.toFixed(2)}
            </p>
          </div>
          <div className="bg-white shadow rounded-lg p-4">
            <h3 className="text-sm font-medium text-gray-600">Total Arrears</h3>
            <p className="text-2xl font-bold text-red-600">
              KES{stats.totalArrears.toFixed(2)}
            </p>
          </div>
          <div className="bg-white shadow rounded-lg p-4">
            <h3 className="text-sm font-medium text-gray-600">Total Tenants</h3>
            <p className="text-2xl font-bold text-gray-900">
              {stats.tenantCount}
            </p>
          </div>
        </div>
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8" aria-label="Tabs">
            <button
              onClick={() => setActiveTab('units')}
              className={`${
                activeTab === 'units'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
            >
              Units
            </button>

            <button
              onClick={() => setActiveTab('blocks')}
              className={`${
                activeTab === 'blocks'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
            >
              Blocks
            </button>
          </nav>
        </div>
        {activeTab === 'units' && (
          <div className="bg-white shadow rounded-lg overflow-hidden">
            <div className="p-4">
              <input
                type="text"
                placeholder="Search units by number or type..."
                value={unitSearch}
                onChange={(e) => setUnitSearch(e.target.value)}
                className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {filteredUnits.length === 0 ? (
              <div className="p-6 text-center text-gray-600">
                No units found for this property.
              </div>
            ) : (
              <div className="bg-white shadow rounded-lg overflow-hidden">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                        onClick={() => handleUnitSort('unit_number')}
                      >
                        Unit Number{' '}
                        {unitSort.key === 'unit_number' &&
                          (unitSort.direction === 'asc' ? '↑' : '↓')}
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Type
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                        onClick={() => handleUnitSort('monthly_rent')}
                      >
                        Monthly Rent{' '}
                        {unitSort.key === 'monthly_rent' &&
                          (unitSort.direction === 'asc' ? '↑' : '↓')}
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Tenant
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {paginatedUnits.map((unit) => (
                      <tr key={unit.unit_id}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {unit.unit_number}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                          {unit.unit_type}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                          {unit.unit_status}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                          ${unit.monthly_rent.toFixed(2)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                          {tenants.length > 0
                            ? tenants.find((t) => t.unit_id === unit.unit_id)
                                ?.full_name || 'N/A'
                            : 'Vacant'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <button
                            onClick={() => navigate(`/units/${unit.unit_id}`)}
                            className="text-blue-600 hover:text-blue-800 mr-4"
                          >
                            <Eye className="w-5 h-5" />
                          </button>

                          <button
                            onClick={() => handleEditUnit(unit.unit_id)}
                            className="text-yellow-600 hover:text-yellow-800 mr-4"
                          >
                            <Edit className="w-5 h-5" />
                          </button>
                          <button
                            onClick={() => handleDeleteUnit(unit.unit_id)}
                            className="text-red-600 hover:text-red-800"
                          >
                            <Trash2 className="w-5 h-5" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                <div className="p-4 flex justify-between items-center">
                  <button
                    onClick={() => setUnitPage((p) => Math.max(p - 1, 1))}
                    disabled={unitPage === 1}
                    className="px-4 py-2 bg-blue-600 text-white rounded-md disabled:bg-gray-300"
                  >
                    Previous
                  </button>
                  <span>
                    Page {unitPage} of {totalUnitPages}
                  </span>
                  <button
                    onClick={() =>
                      setUnitPage((p) => Math.min(p + 1, totalUnitPages))
                    }
                    disabled={unitPage === totalUnitPages}
                    className="px-4 py-2 bg-blue-600 text-white rounded-md disabled:bg-gray-300"
                  >
                    Next
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
        {activeTab === 'blocks' && (
          <div className="bg-white shadow rounded-lg overflow-hidden">
            <div className="p-4">
              <input
                type="text"
                placeholder="Search blocks by name..."
                value={blockSearch}
                onChange={(e) => setBlockSearch(e.target.value)}
                className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            {filteredBlocks.length === 0 ? (
              <div className="p-6 text-center text-gray-600">
                No blocks found for this property.
              </div>
            ) : (
              <div className="bg-white shadow rounded-lg overflow-hidden">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                        onClick={() => handleBlockSort('block_name')}
                      >
                        Block Name{' '}
                        {blockSort.key === 'block_name' &&
                          (blockSort.direction === 'asc' ? '↑' : '↓')}
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Floor Count
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Notes
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {paginatedBlocks.map((block) => (
                      <tr key={block.block_id}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {block.block_name}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                          {block.floor_count || 'N/A'}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-600">
                          {block.notes || 'N/A'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <button
                            onClick={() =>
                              navigate(`/blocks/${block.block_id}`)
                            }
                            className="text-blue-600 hover:text-blue-800 mr-4"
                          >
                            <Eye className="w-5 h-5" />
                          </button>
                          <button
                            onClick={() => handleEditBlock(block.block_id)}
                            className="text-yellow-600 hover:text-yellow-800 mr-4"
                          >
                            <Edit className="w-5 h-5" />
                          </button>
                          <button
                            onClick={() => handleDeleteBlock(block.block_id)}
                            className="text-red-600 hover:text-red-800"
                          >
                            <Trash2 className="w-5 h-5" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>

                <div className="p-4 flex justify-between items-center">
                  <button
                    onClick={() => setBlockPage((p) => Math.max(p - 1, 1))}
                    disabled={blockPage === 1}
                    className="px-4 py-2 bg-blue-600 text-white rounded-md disabled:bg-gray-300"
                  >
                    Previous
                  </button>
                  <span>
                    Page {blockPage} of {totalBlockPages}
                  </span>
                  <button
                    onClick={() =>
                      setBlockPage((p) => Math.min(p + 1, totalBlockPages))
                    }
                    disabled={blockPage === totalBlockPages}
                    className="px-4 py-2 bg-blue-600 text-white rounded-md disabled:bg-gray-300"
                  >
                    Next
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </ErrorBoundary>
  );
};

export default PropertyDetails;
