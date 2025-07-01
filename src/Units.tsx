import React, { useState, useEffect } from 'react';
import Database from '@tauri-apps/plugin-sql';
import {
  Home,
  Search,
  Plus,
  Eye,
  Edit,
  Trash2,
  Building,
  Bed,
  Bath,
  DollarSign,
  Key,
  Car,
  Coffee,
  Wifi,
  Snowflake,
  Droplet,
  Dumbbell,
  Waves,
  QrCode,
  Building2,
  LayoutGrid,
  LayoutList,
  CheckCircle,
  CircleDot,
  Wrench,
  Calendar,
  Ruler,
  Users,
  Dog,
} from 'lucide-react';

// Define precise UnitType for database-driven data
interface UnitType {
  unit_id: number;
  unit_number: string;
  property_id: number;
  property_name: string;
  block_label: string | null;
  floor_number: number | null;
  unit_status: string;
  unit_type: string;
  bedroom_count: number | null;
  bathroom_count: number | null;
  monthly_rent: number | null;
  security_deposit: number | null;
  tenant_id: string | null;
  notes: string | null;
  tenantInfo: { id: string; name: string; leaseEndDate: string } | null;
  photos?: string[];
  amenities?: string[];
  squareFootage?: number;
}

// Helper function to map amenity strings to Lucide icons
const getAmenityIcon = (amenity: string) => {
  switch (amenity.toLowerCase()) {
    case 'parking':
      return <Car className="h-4 w-4 text-gray-500" />;
    case 'ac':
      return <Snowflake className="h-4 w-4 text-gray-500" />;
    case 'balcony':
      return <Home className="h-4 w-4 text-gray-500" />;
    case 'pool access':
      return <Waves className="h-4 w-4 text-gray-500" />;
    case 'gym':
      return <Dumbbell className="h-4 w-4 text-gray-500" />;
    case 'washer/dryer':
      return <Droplet className="h-4 w-4 text-gray-500" />;
    case 'pet friendly':
      return <Dog className="h-4 w-4 text-gray-500" />;
    case 'wifi':
      return <Wifi className="h-4 w-4 text-gray-500" />;
    case 'coffee':
      return <Coffee className="h-4 w-4 text-gray-500" />;
    default:
      return <QrCode className="h-4 w-4 text-gray-500" />;
  }
};

const Unit = () => {
  // State definitions with precise types
  const [units, setUnits] = useState<UnitType[]>([]);
  const [properties, setProperties] = useState<
    { property_id: number; name: string }[]
  >([]);
  const [filteredUnits, setFilteredUnits] = useState<UnitType[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [modalMode, setModalMode] = useState<'add' | 'edit'>('add');
  const [editingUnitId, setEditingUnitId] = useState<number | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('All');
  const [filterProperty, setFilterProperty] = useState<string>('All');
  const [filterUnitType, setFilterUnitType] = useState<string>('All');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [isAddUnitModalOpen, setIsAddUnitModalOpen] = useState(false);
  const [isViewUnitModalOpen, setIsViewUnitModalOpen] = useState(false);
  const [selectedUnit, setSelectedUnit] = useState<UnitType | null>(null);

  // State for new unit form data
  const [newUnitData, setNewUnitData] = useState<{
    unit_number: string;
    property_id: string;
    block_label: string;
    floor_number: string;
    unit_status: string;
    unit_type: string;
    bedroom_count: string;
    bathroom_count: string;
    monthly_rent: string;
    security_deposit: string;
    tenant_id: string;
    notes: string;
  }>({
    unit_number: '',
    property_id: '',
    block_label: '',
    floor_number: '',
    unit_status: 'Available',
    unit_type: '',
    bedroom_count: '',
    bathroom_count: '',
    monthly_rent: '',
    security_deposit: '',
    tenant_id: '',
    notes: '',
  });

  // Available properties and unit types for filters
  const availableProperties = [...new Set(properties.map((p) => p.name))];
  const availableUnitTypes = [...new Set(units.map((u) => u.unit_type))].sort();

  useEffect(() => {
    async function fetchProperties() {
      let db;
      try {
        setLoading(true);
        db = await Database.load('sqlite:test4.db');
        const dbProperties: any = await db.select(
          `SELECT property_id, name FROM properties`
        );
        setProperties(dbProperties);
      } catch (err) {
        console.error('Error fetching properties:', err);
        setError('Failed to load properties.');
        console.log('Error details:', error);
      } finally {
        setLoading(false);
        if (db) await db.close();
      }
    }
    fetchProperties();

    async function fetchUnits() {
      let db;
      try {
        setLoading(true);
        db = await Database.load('sqlite:test4.db');
        const dbUnits = await db.select<
          {
            unit_id: number;
            unit_number: string;
            property_id: number;
            property_name: string;
            block_label: string | null;
            floor_number: number | null;
            unit_status: string;
            unit_type: string;
            bedroom_count: number | null;
            bathroom_count: number | null;
            monthly_rent: number | null;
            security_deposit: number | null;
            tenant_id: string | null;
            notes: string | null;
            tenant_name: string | null;
            lease_end_date: string | null;
            squareFootage?: number;
            photos?: string[];
            amenities?: string[];
          }[]
        >(`
          SELECT u.unit_id, u.unit_number, u.property_id, p.name AS property_name, 
                 u.block_label, u.floor_number, u.unit_status, u.unit_type, 
                 u.bedroom_count, u.bathroom_count, u.monthly_rent, u.security_deposit, 
                 u.tenant_id, u.notes, t.full_name AS tenant_name, t.lease_end_date
          FROM units u
          LEFT JOIN properties p ON u.property_id = p.property_id
          LEFT JOIN tenants t ON u.tenant_id = t.tenant_id
        `);
        console.log('Fetched units from DB:', dbUnits);
        const processedUnits = dbUnits.map((unit) => ({
          unit_id: unit.unit_id,
          unit_number: unit.unit_number,
          property_id: unit.property_id,
          property_name: unit.property_name,
          block_label: unit.block_label,
          floor_number: unit.floor_number,
          unit_status: unit.unit_status,
          unit_type: unit.unit_type,
          bedroom_count: unit.bedroom_count,
          bathroom_count: unit.bathroom_count,
          monthly_rent: unit.monthly_rent,
          security_deposit: unit.security_deposit,
          tenant_id: unit.tenant_id,
          notes: unit.notes,
          tenantInfo: unit.tenant_id
            ? {
                id: unit.tenant_id,
                name: unit.tenant_name || '',
                leaseEndDate: unit.lease_end_date || '',
              }
            : null,
          photos: unit.photos || [],
          amenities: unit.amenities || [],
          squareFootage: unit.squareFootage,
        }));
        setUnits(processedUnits);
        setFilteredUnits(processedUnits);
      } catch (err) {
        console.error('Error fetching units:', err);
        setError('Failed to get units - check console');
      } finally {
        setLoading(false);
        if (db) await db.close();
      }
    }
    fetchUnits();
  }, []);

  useEffect(() => {
    let currentFilteredUnits = units.filter((unit) => {
      const matchesSearch =
        searchTerm === '' ||
        unit.unit_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
        unit.property_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (unit.block_label?.toLowerCase().includes(searchTerm.toLowerCase()) ??
          false);
      const matchesStatus =
        filterStatus === 'All' || unit.unit_status === filterStatus;
      const matchesProperty =
        filterProperty === 'All' || unit.property_name === filterProperty;
      const matchesUnitType =
        filterUnitType === 'All' || unit.unit_type === filterUnitType;
      return (
        matchesSearch && matchesStatus && matchesProperty && matchesUnitType
      );
    });
    setFilteredUnits(currentFilteredUnits);
  }, [searchTerm, filterStatus, filterProperty, filterUnitType, units]);

  const handleSaveUnit = async (unitData: any) => {
    let db;
    try {
      db = await Database.load('sqlite:test4.db');
      setLoading(true);

      const propertyCheck = await db.select<{ property_id: number }[]>(
        `SELECT property_id FROM properties WHERE property_id = $1`,
        [parseInt(unitData.property_id)]
      );
      if (propertyCheck.length === 0 && unitData.property_id) {
        throw new Error('Invalid property_id. Please select a valid property.');
      }

      if (unitData.tenant_id) {
        const tenantCheck = await db.select<{ tenant_id: string }[]>(
          `SELECT tenant_id FROM tenants WHERE tenant_id = $1`,
          [unitData.tenant_id]
        );
        if (tenantCheck.length === 0) {
          throw new Error('Invalid tenant_id. Please enter a valid tenant ID.');
        }
      }

      const existingUnit = await db.select<{ unit_id: number }[]>(
        `SELECT unit_id FROM units WHERE unit_id = $1`,
        [unitData.unit_id]
      );

      if (existingUnit.length > 0) {
        await db.execute(
          `UPDATE units SET unit_number = $1, property_id = $2, block_label = $3, 
           floor_number = $4, unit_status = $5, unit_type = $6, bedroom_count = $7, 
           bathroom_count = $8, monthly_rent = $9, security_deposit = $10, notes = $11, tenant_id = $12 
           WHERE unit_id = $13`,
          [
            unitData.unit_number,
            parseInt(unitData.property_id) || null,
            unitData.block_label || null,
            parseInt(unitData.floor_number) || null,
            unitData.unit_status,
            unitData.unit_type,
            parseInt(unitData.bedroom_count) || null,
            parseInt(unitData.bathroom_count) || null,
            parseFloat(unitData.monthly_rent) || null,
            parseFloat(unitData.security_deposit) || null,
            unitData.notes || null,
            unitData.tenant_id || null,
            unitData.unit_id,
          ]
        );
      } else {
        await db.execute(
          `INSERT INTO units (unit_number, property_id, block_label, 
           floor_number, unit_status, unit_type, bedroom_count, bathroom_count, 
           monthly_rent, security_deposit, notes, tenant_id) 
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)`,
          [
            unitData.unit_number,
            parseInt(unitData.property_id) || null,
            unitData.block_label || null,
            parseInt(unitData.floor_number) || null,
            unitData.unit_status,
            unitData.unit_type,
            parseInt(unitData.bedroom_count) || null,
            parseInt(unitData.bathroom_count) || null,
            parseFloat(unitData.monthly_rent) || null,
            parseFloat(unitData.security_deposit) || null,
            unitData.notes || null,
            unitData.tenant_id || null,
          ]
        );
      }

      const dbUnits = await db.select<
        {
          unit_id: number;
          unit_number: string;
          property_id: number;
          property_name: string;
          block_label: string | null;
          floor_number: number | null;
          unit_status: string;
          unit_type: string;
          bedroom_count: number | null;
          bathroom_count: number | null;
          monthly_rent: number | null;
          security_deposit: number | null;
          tenant_id: string | null;
          notes: string | null;
          tenant_name: string | null;
          lease_end_date: string | null;
          squareFootage?: number;
          photos?: string[];
          amenities?: string[];
        }[]
      >(`
        SELECT u.unit_id, u.unit_number, u.property_id, p.name AS property_name, 
               u.block_label, u.floor_number, u.unit_status, u.unit_type, 
               u.bedroom_count, u.bathroom_count, u.monthly_rent, u.security_deposit, 
               u.tenant_id, u.notes, t.full_name AS tenant_name, t.lease_end_date
        FROM units u
        LEFT JOIN properties p ON u.property_id = p.property_id
        LEFT JOIN tenants t ON u.tenant_id = t.tenant_id
      `);
      const processedUnits = dbUnits.map((unit) => ({
        unit_id: unit.unit_id,
        unit_number: unit.unit_number,
        property_id: unit.property_id,
        property_name: unit.property_name,
        block_label: unit.block_label,
        floor_number: unit.floor_number,
        unit_status: unit.unit_status,
        unit_type: unit.unit_type,
        bedroom_count: unit.bedroom_count,
        bathroom_count: unit.bathroom_count,
        monthly_rent: unit.monthly_rent,
        security_deposit: unit.security_deposit,
        tenant_id: unit.tenant_id,
        notes: unit.notes,
        tenantInfo: unit.tenant_id
          ? {
              id: unit.tenant_id,
              name: unit.tenant_name || '',
              leaseEndDate: unit.lease_end_date || '',
            }
          : null,
        photos: unit.photos || [],
        amenities: unit.amenities || [],
        squareFootage: unit.squareFootage,
      }));
      setUnits(processedUnits);
      setFilteredUnits(processedUnits);
      setIsAddUnitModalOpen(false);
      setNewUnitData({
        unit_number: '',
        property_id: '',
        block_label: '',
        floor_number: '',
        unit_status: 'Available',
        unit_type: '',
        bedroom_count: '',
        bathroom_count: '',
        monthly_rent: '',
        security_deposit: '',
        tenant_id: '',
        notes: '',
      });
      setError('');
    } catch (err) {
      console.error('Error saving unit:', err);
      setError(
        typeof err === 'object' && err !== null && 'message' in err
          ? (err as { message: string }).message
          : 'Failed to save unit.'
      );
    } finally {
      setLoading(false);
      if (db) await db.close();
    }
  };

  const handleUpdateUnit = async (e: React.FormEvent) => {
    e.preventDefault();
    const updatedUnit = { ...newUnitData, unit_id: editingUnitId };
    await handleSaveUnit(updatedUnit);
    setIsAddUnitModalOpen(false);
    setNewUnitData({
      unit_number: '',
      property_id: '',
      block_label: '',
      floor_number: '',
      unit_status: 'Available',
      unit_type: '',
      bedroom_count: '',
      bathroom_count: '',
      monthly_rent: '',
      security_deposit: '',
      tenant_id: '',
      notes: '',
    });
    setEditingUnitId(null);
    setModalMode('add');
  };

  const handleAddUnit = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Adding new unit with data:', newUnitData);
    await handleSaveUnit(newUnitData);
  };

  const handleViewUnit = (unit: UnitType) => {
    setSelectedUnit(unit);
    setIsViewUnitModalOpen(true);
  };

  const handleEditUnit = (unitId: number) => {
    console.log('units', units);
    console.log(`Attempting to edit unit with ID: ${unitId}`);
    const unitToEdit = units.find((unit) => unit.unit_id === unitId);
    if (unitToEdit) {
      console.log(`Found unit to edit:`, unitToEdit);
      setNewUnitData({
        unit_number: unitToEdit.unit_number,
        property_id: unitToEdit.property_id.toString(),
        block_label: unitToEdit.block_label || '',
        floor_number: unitToEdit.floor_number?.toString() || '',
        unit_status: unitToEdit.unit_status,
        unit_type: unitToEdit.unit_type,
        bedroom_count: unitToEdit.bedroom_count?.toString() || '',
        bathroom_count: unitToEdit.bathroom_count?.toString() || '',
        monthly_rent: unitToEdit.monthly_rent?.toString() || '',
        security_deposit: unitToEdit.security_deposit?.toString() || '',
        tenant_id: unitToEdit.tenant_id || '',
        notes: unitToEdit.notes || '',
      });
      setEditingUnitId(unitId);
      setModalMode('edit');
      setIsAddUnitModalOpen(true);
      console.log(`Opened edit modal for unit ID: ${unitId}`);
    } else {
      console.error(`Unit with ID ${unitId} not found`);
      setError(`Unit with ID ${unitId} not found`);
    }
  };

  const handleDeleteUnit = async (unitId: number) => {
    if (window.confirm(`Are you sure you want to delete unit ${unitId}?`)) {
      try {
        setLoading(true);
        const db = await Database.load('sqlite:test4.db');
        await db.execute(`DELETE FROM units WHERE unit_id = $1`, [unitId]);
        setUnits(units.filter((unit) => unit.unit_id !== unitId));
        setError('');
      } catch (err) {
        console.error('Error deleting unit:', err);
        setError('Failed to delete unit.');
      } finally {
        setLoading(false);
      }
    }
  };

  // Unit Dashboard Stats
  const totalUnits = units.length;
  const availableUnits = units.filter(
    (u) => u.unit_status === 'Available'
  ).length;
  const occupiedUnits = units.filter(
    (u) => u.unit_status === 'Occupied'
  ).length;
  const maintenanceUnits = units.filter(
    (u) => u.unit_status === 'Maintenance'
  ).length;
  const occupancyRate =
    totalUnits > 0 ? ((occupiedUnits / totalUnits) * 100).toFixed(1) : '0.0';

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Available':
        return 'bg-green-100 text-green-800';
      case 'Occupied':
        return 'bg-blue-100 text-blue-800';
      case 'Maintenance':
        return 'bg-yellow-100 text-yellow-800';
      case 'Reserved':
        return 'bg-purple-100 text-purple-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  // Common button styling
  const primaryButtonClass =
    'px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 transition duration-200 ease-in-out shadow-md hover:shadow-lg';
  const secondaryButtonClass =
    'px-3 py-1 rounded-md bg-gray-200 text-gray-700 hover:bg-gray-300 transition duration-200 ease-in-out text-sm';
  const iconButtonClass =
    'p-2 rounded-full hover:bg-gray-200 transition duration-200 ease-in-out';

  // Modal styling
  const modalOverlayClass =
    'fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4';
  const modalContentClass =
    'bg-white p-6 rounded-xl shadow-2xl max-h-[90vh] overflow-y-auto w-full max-w-3xl transform transition-all duration-300 ease-in-out scale-95';

  {
    loading && (
      <div className="fixed inset-0 bg-white bg-opacity-75 flex items-center justify-center z-50">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 font-sans text-gray-900 antialiased p-4 sm:p-6 lg:p-8">
      <header className="mb-8">
        <h1 className="text-3xl font-extrabold text-gray-900 flex items-center gap-3">
          <Building className="w-8 h-8 text-blue-600" /> Unit Management
        </h1>
        <p className="mt-2 text-gray-600 text-lg">
          Oversee all your property units, their status, tenants, and details.
        </p>
      </header>

      <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
        <div className="bg-white p-6 rounded-xl shadow-md border border-gray-200 flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-500">Total Units</p>
            <p className="text-3xl font-bold text-gray-900 mt-1">
              {totalUnits}
            </p>
          </div>
          <Building2 className="h-10 w-10 text-blue-500 opacity-20" />
        </div>
        <div className="bg-white p-6 rounded-xl shadow-md border border-gray-200 flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-500">Available</p>
            <p className="text-3xl font-bold text-gray-900 mt-1">
              {availableUnits}
            </p>
          </div>
          <CheckCircle className="h-10 w-10 text-green-500 opacity-20" />
        </div>
        <div className="bg-white p-6 rounded-xl shadow-md border border-gray-200 flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-500">Occupied</p>
            <p className="text-3xl font-bold text-gray-900 mt-1">
              {occupiedUnits}
            </p>
          </div>
          <Users className="h-10 w-10 text-blue-500 opacity-20" />
        </div>
        <div className="bg-white p-6 rounded-xl shadow-md border border-gray-200 flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-500">Maintenance</p>
            <p className="text-3xl font-bold text-gray-900 mt-1">
              {maintenanceUnits}
            </p>
          </div>
          <Wrench className="h-10 w-10 text-yellow-500 opacity-20" />
        </div>
        <div className="bg-white p-6 rounded-xl shadow-md border border-gray-200 flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-500">Occupancy Rate</p>
            <p className="text-3xl font-bold text-gray-900 mt-1">
              {occupancyRate}%
            </p>
          </div>
          <CircleDot className="h-10 w-10 text-purple-500 opacity-20" />
        </div>
      </section>

      <section className="bg-white p-4 rounded-xl shadow-md border border-gray-200 mb-8 flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="relative flex-grow w-full md:w-auto">
          <Search
            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
            size={20}
          />
          <input
            type="text"
            placeholder="Search by unit#, property, block..."
            className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-300 focus:ring-blue-500 focus:border-blue-500 transition duration-200 ease-in-out"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
          <select
            className="p-2 rounded-lg border border-gray-300 focus:ring-blue-500 focus:border-blue-500 transition duration-200 ease-in-out flex-grow"
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
          >
            <option value="All">All Statuses</option>
            <option value="Available">Available</option>
            <option value="Occupied">Occupied</option>
            <option value="Maintenance">Maintenance</option>
            <option value="Reserved">Reserved</option>
          </select>
          <select
            className="p-2 rounded-lg border border-gray-300 focus:ring-blue-500 focus:border-blue-500 transition duration-200 ease-in-out flex-grow"
            value={filterProperty}
            onChange={(e) => setFilterProperty(e.target.value)}
          >
            <option value="All">All Properties</option>
            {availableProperties.map((prop) => (
              <option key={prop} value={prop}>
                {prop}
              </option>
            ))}
          </select>
          <select
            className="p-2 rounded-lg border border-gray-300 focus:ring-blue-500 focus:border-blue-500 transition duration-200 ease-in-out flex-grow"
            value={filterUnitType}
            onChange={(e) => setFilterUnitType(e.target.value)}
          >
            <option value="All">All Unit Types</option>
            {availableUnitTypes.map((type) => (
              <option key={type} value={type}>
                {type}
              </option>
            ))}
          </select>
        </div>

        <div className="flex gap-2 w-full md:w-auto justify-end">
          <button
            onClick={() => setViewMode('grid')}
            className={`${iconButtonClass} ${
              viewMode === 'grid'
                ? 'bg-blue-100 text-blue-600'
                : 'text-gray-600'
            }`}
            aria-label="Grid View"
          >
            <LayoutGrid size={20} />
          </button>
          <button
            onClick={() => setViewMode('list')}
            className={`${iconButtonClass} ${
              viewMode === 'list'
                ? 'bg-blue-100 text-blue-600'
                : 'text-gray-600'
            }`}
            aria-label="List View"
          >
            <LayoutList size={20} />
          </button>
          <button
            onClick={() => setIsAddUnitModalOpen(true)}
            className={`${primaryButtonClass} flex items-center gap-2`}
          >
            <Plus size={20} /> Add New Unit
          </button>
        </div>
      </section>

      <section>
        {filteredUnits.length === 0 ? (
          <div className="bg-white p-8 rounded-xl shadow-md border border-gray-200 text-center text-gray-500">
            <p className="text-xl font-semibold mb-3">No units found!</p>
            <p>Adjust your filters or add a new unit to get started.</p>
            <button
              onClick={() => setIsAddUnitModalOpen(true)}
              className={`${primaryButtonClass} mt-6 inline-flex items-center gap-2`}
            >
              <Plus size={20} /> Add New Unit
            </button>
          </div>
        ) : viewMode === 'grid' ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredUnits.map((unit) => (
              <div
                key={unit.unit_id}
                className="bg-white rounded-xl shadow-md border border-gray-200 overflow-hidden transform hover:scale-[1.02] transition duration-200 ease-in-out"
              >
                {unit.photos && unit.photos.length > 0 && (
                  <img
                    src={unit.photos[0]}
                    alt={`Unit ${unit.unit_number}`}
                    className="w-full h-40 object-cover"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.onerror = null;
                      target.src = `https://placehold.co/200x150/E0E0E0/666666?text=Unit+${unit.unit_number}`;
                    }}
                  />
                )}
                <div className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-xl font-bold text-gray-900">
                      {unit.unit_number}
                    </h3>
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(
                        unit.unit_status
                      )}`}
                    >
                      {unit.unit_status}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 flex items-center gap-2 mb-1">
                    <Building2 className="w-4 h-4" /> {unit.property_name},
                    Block {unit.block_label || 'N/A'}, Floor{' '}
                    {unit.floor_number || 'N/A'}
                  </p>
                  <p className="text-sm text-gray-600 flex items-center gap-2 mb-1">
                    <Bed className="w-4 h-4" /> {unit.bedroom_count || 0} BR /{' '}
                    <Bath className="w-4 h-4" /> {unit.bathroom_count || 0} BA (
                    {unit.unit_type})
                  </p>
                  <p className="text-sm text-gray-600 flex items-center gap-2 mb-1">
                    <Ruler className="w-4 h-4" /> {unit.squareFootage || 0} sqft
                  </p>
                  <p className="text-sm text-gray-600 flex items-center gap-2 mt-2">
                    <DollarSign className="w-4 h-4" /> Rent: $
                    {unit.monthly_rent || 0}/month
                  </p>
                  {unit.tenantInfo ? (
                    <p className="text-sm text-gray-600 flex items-center gap-2 mt-2">
                      <Users className="w-4 h-4" /> Tenant:{' '}
                      {unit.tenantInfo.name} (Lease ends:{' '}
                      {unit.tenantInfo.leaseEndDate})
                    </p>
                  ) : (
                    <p className="text-sm text-gray-600 flex items-center gap-2 mt-2">
                      <Users className="w-4 h-4" /> Tenant: None
                    </p>
                  )}
                </div>
                <div className="bg-gray-50 border-t border-gray-200 flex justify-end p-4 gap-2">
                  <button
                    onClick={() => handleViewUnit(unit)}
                    className={secondaryButtonClass}
                    aria-label="View Unit"
                  >
                    <Eye className="w-4 h-4 mr-1 inline-block" /> View
                  </button>
                  <button
                    onClick={() => handleEditUnit(unit.unit_id)}
                    className={secondaryButtonClass}
                    aria-label="Edit Unit"
                  >
                    <Edit className="w-4 h-4 mr-1 inline-block" /> Edit
                  </button>
                  <button
                    onClick={() => handleDeleteUnit(unit.unit_id)}
                    className={`${secondaryButtonClass} text-red-600 hover:bg-red-100`}
                    aria-label="Delete Unit"
                  >
                    <Trash2 className="w-4 h-4 mr-1 inline-block" /> Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-xl shadow-md border border-gray-200 overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Unit #
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Property
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Type
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Rent
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Current Tenant
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredUnits.map((unit) => (
                  <tr key={unit.unit_id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {unit.unit_number}
                      </div>
                      <div className="text-sm text-gray-500">
                        ID: {unit.unit_id}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {unit.property_name} (Block {unit.block_label || 'N/A'},
                      Floor {unit.floor_number || 'N/A'})
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {unit.unit_type} ({unit.bedroom_count || 0}BR/
                      {unit.bathroom_count || 0}BA)
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      ${unit.monthly_rent || 0}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(
                          unit.unit_status
                        )}`}
                      >
                        {unit.unit_status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {unit.tenantInfo
                        ? `${unit.tenantInfo.name} (ends: ${unit.tenantInfo.leaseEndDate})`
                        : 'None'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() => handleViewUnit(unit)}
                          className={`${secondaryButtonClass} p-2`}
                          aria-label="View Unit"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleEditUnit(unit.unit_id)}
                          className={`${secondaryButtonClass} p-2`}
                          aria-label="Edit Unit"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteUnit(unit.unit_id)}
                          className={`${secondaryButtonClass} p-2 text-red-600 hover:bg-red-100`}
                          aria-label="Delete Unit"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {isAddUnitModalOpen && (
        <div className={modalOverlayClass} data-state="open">
          <div className={modalContentClass}>
            <h2 className="text-2xl font-bold mb-6 text-gray-900">
              {modalMode === 'edit' ? 'Edit Unit' : 'Add New Unit'}
            </h2>
            <form
              onSubmit={modalMode === 'edit' ? handleUpdateUnit : handleAddUnit}
              className="grid grid-cols-1 md:grid-cols-2 gap-6"
            >
              <div className="md:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label
                    htmlFor="unit_number"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Unit Number <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    id="unit_number"
                    className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                    value={newUnitData.unit_number}
                    onChange={(e) =>
                      setNewUnitData({
                        ...newUnitData,
                        unit_number: e.target.value,
                      })
                    }
                    required
                  />
                </div>
                <div>
                  <label
                    htmlFor="property_id"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Property <span className="text-red-500">*</span>
                  </label>
                  <select
                    id="property_id"
                    className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                    value={newUnitData.property_id}
                    onChange={(e) =>
                      setNewUnitData({
                        ...newUnitData,
                        property_id: e.target.value,
                      })
                    }
                    required
                  >
                    <option value="">Select Property</option>
                    {properties.map((prop) => (
                      <option key={prop.property_id} value={prop.property_id}>
                        {prop.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label
                    htmlFor="block_label"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Block
                  </label>
                  <input
                    type="text"
                    id="block_label"
                    className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                    value={newUnitData.block_label}
                    onChange={(e) =>
                      setNewUnitData({
                        ...newUnitData,
                        block_label: e.target.value,
                      })
                    }
                  />
                </div>
                <div>
                  <label
                    htmlFor="floor_number"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Floor
                  </label>
                  <input
                    type="number"
                    id="floor_number"
                    className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                    value={newUnitData.floor_number}
                    onChange={(e) =>
                      setNewUnitData({
                        ...newUnitData,
                        floor_number: e.target.value,
                      })
                    }
                  />
                </div>
                <div>
                  <label
                    htmlFor="unit_status"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Status <span className="text-red-500">*</span>
                  </label>
                  <select
                    id="unit_status"
                    className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                    value={newUnitData.unit_status}
                    onChange={(e) =>
                      setNewUnitData({
                        ...newUnitData,
                        unit_status: e.target.value,
                      })
                    }
                    required
                  >
                    <option value="Available">Available</option>
                    <option value="Occupied">Occupied</option>
                    <option value="Maintenance">Maintenance</option>
                    <option value="Reserved">Reserved</option>
                  </select>
                </div>
                <div>
                  <label
                    htmlFor="unit_type"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Unit Type <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    id="unit_type"
                    className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                    value={newUnitData.unit_type}
                    onChange={(e) =>
                      setNewUnitData({
                        ...newUnitData,
                        unit_type: e.target.value,
                      })
                    }
                    required
                  />
                </div>
                <div>
                  <label
                    htmlFor="bedroom_count"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Bedrooms
                  </label>
                  <input
                    type="number"
                    id="bedroom_count"
                    className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                    value={newUnitData.bedroom_count}
                    onChange={(e) =>
                      setNewUnitData({
                        ...newUnitData,
                        bedroom_count: e.target.value,
                      })
                    }
                  />
                </div>
                <div>
                  <label
                    htmlFor="bathroom_count"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Bathrooms
                  </label>
                  <input
                    type="number"
                    id="bathroom_count"
                    className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                    value={newUnitData.bathroom_count}
                    onChange={(e) =>
                      setNewUnitData({
                        ...newUnitData,
                        bathroom_count: e.target.value,
                      })
                    }
                  />
                </div>
                <div>
                  <label
                    htmlFor="monthly_rent"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Monthly Rent <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    id="monthly_rent"
                    className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                    value={newUnitData.monthly_rent}
                    onChange={(e) =>
                      setNewUnitData({
                        ...newUnitData,
                        monthly_rent: e.target.value,
                      })
                    }
                    required
                  />
                </div>
                <div>
                  <label
                    htmlFor="security_deposit"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Security Deposit
                  </label>
                  <input
                    type="number"
                    id="security_deposit"
                    className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                    value={newUnitData.security_deposit}
                    onChange={(e) =>
                      setNewUnitData({
                        ...newUnitData,
                        security_deposit: e.target.value,
                      })
                    }
                  />
                </div>
                <div className="md:col-span-2">
                  <label
                    htmlFor="notes"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Notes
                  </label>
                  <textarea
                    id="notes"
                    rows={3}
                    className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                    value={newUnitData.notes}
                    onChange={(e) =>
                      setNewUnitData({ ...newUnitData, notes: e.target.value })
                    }
                  ></textarea>
                </div>
              </div>

              <div className="md:col-span-2 flex justify-end gap-3 mt-6">
                <button
                  type="button"
                  onClick={() => setIsAddUnitModalOpen(false)}
                  className="px-4 py-2 rounded-lg bg-gray-200 text-gray-800 hover:bg-gray-300 transition duration-200 ease-in-out shadow-md"
                >
                  Cancel
                </button>
                <button type="submit" className={primaryButtonClass}>
                  {modalMode === 'edit' ? 'Update Unit' : 'Add Unit'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {isViewUnitModalOpen && selectedUnit && (
        <div className={modalOverlayClass} data-state="open">
          <div className={modalContentClass} role="dialog" aria-modal="true">
            <h2 className="text-2xl font-bold mb-6 text-gray-900 flex items-center gap-3">
              <Building className="w-6 h-6 text-blue-600" /> Unit Details:{' '}
              {selectedUnit.unit_number}
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div className="bg-blue-50 p-6 rounded-xl flex flex-col items-center justify-center border border-blue-200 shadow-sm">
                {selectedUnit.photos && selectedUnit.photos.length > 0 ? (
                  <img
                    src={selectedUnit.photos[0]}
                    alt={`Unit ${selectedUnit.unit_number}`}
                    className="w-full max-w-48 h-auto rounded-lg object-cover border-4 border-blue-400 shadow-md mb-4"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.onerror = null;
                      target.src = `https://placehold.co/200x150/E0E0E0/666666?text=Unit+${selectedUnit.unit_number}`;
                    }}
                  />
                ) : (
                  <div className="w-full max-w-48 h-auto rounded-lg border-4 border-gray-400 bg-gray-200 flex items-center justify-center text-gray-500 text-sm py-8 mb-4">
                    No Image
                  </div>
                )}
                <h3 className="text-xl font-bold text-gray-900">
                  {selectedUnit.unit_number}
                </h3>
                <p className="text-sm text-gray-600 mb-2">
                  {selectedUnit.property_name}, Block{' '}
                  {selectedUnit.block_label || 'N/A'}, Floor{' '}
                  {selectedUnit.floor_number || 'N/A'}
                </p>
                <span
                  className={`px-3 py-1 rounded-full text-sm font-semibold ${getStatusColor(
                    selectedUnit.unit_status
                  )}`}
                >
                  {selectedUnit.unit_status}
                </span>
              </div>

              <div className="bg-gray-50 p-6 rounded-xl border border-gray-200 shadow-sm">
                <h3 className="text-lg font-semibold text-gray-800 mb-3">
                  Basic Information
                </h3>
                <p className="flex items-center gap-2 text-gray-700 mb-2">
                  <Bed className="w-5 h-5 text-gray-500" /> Bedrooms:{' '}
                  <span className="font-medium">
                    {selectedUnit.bedroom_count || 0}
                  </span>
                </p>
                <p className="flex items-center gap-2 text-gray-700 mb-2">
                  <Bath className="w-5 h-5 text-gray-500" /> Bathrooms:{' '}
                  <span className="font-medium">
                    {selectedUnit.bathroom_count || 0}
                  </span>
                </p>
                <p className="flex items-center gap-2 text-gray-700 mb-2">
                  <Ruler className="w-5 h-5 text-gray-500" /> Square Footage:{' '}
                  <span className="font-medium">
                    {selectedUnit.squareFootage || 0} sqft
                  </span>
                </p>
                <p className="flex items-center gap-2 text-gray-700 mb-2">
                  <DollarSign className="w-5 h-5 text-gray-500" /> Monthly Rent:{' '}
                  <span className="font-medium">
                    ${selectedUnit.monthly_rent || 0}
                  </span>
                </p>
                <p className="flex items-center gap-2 text-gray-700">
                  <Key className="w-5 h-5 text-gray-500" /> Security Deposit:{' '}
                  <span className="font-medium">
                    ${selectedUnit.security_deposit || 0}
                  </span>
                </p>
              </div>

              <div className="md:col-span-2 bg-gray-50 p-6 rounded-xl border border-gray-200 shadow-sm">
                <h3 className="text-lg font-semibold text-gray-800 mb-3">
                  Tenant Information
                </h3>
                {selectedUnit.tenantInfo ? (
                  <>
                    <p className="flex items-center gap-2 text-gray-700 mb-2">
                      <Users className="w-5 h-5 text-gray-500" /> Tenant Name:{' '}
                      <span className="font-medium">
                        {selectedUnit.tenantInfo.name}
                      </span>
                    </p>
                    <p className="flex items-center gap-2 text-gray-700">
                      <Calendar className="w-5 h-5 text-gray-500" /> Lease Ends:{' '}
                      <span className="font-medium">
                        {selectedUnit.tenantInfo.leaseEndDate}
                      </span>
                    </p>
                  </>
                ) : (
                  <p className="text-gray-600 italic">
                    This unit is currently unoccupied.
                  </p>
                )}
              </div>

              <div className="md:col-span-2 bg-gray-50 p-6 rounded-xl border border-gray-200 shadow-sm">
                <h3 className="text-lg font-semibold text-gray-800 mb-3">
                  Amenities
                </h3>
                <div className="flex flex-wrap gap-3">
                  {selectedUnit.amenities &&
                  selectedUnit.amenities.length > 0 ? (
                    selectedUnit.amenities.map((amenity) => (
                      <span
                        key={amenity}
                        className="flex items-center gap-2 px-3 py-1 rounded-full bg-blue-100 text-blue-800 text-sm font-medium"
                      >
                        {getAmenityIcon(amenity)} {amenity}
                      </span>
                    ))
                  ) : (
                    <p className="text-gray-600 text-sm">
                      No amenities listed for this unit.
                    </p>
                  )}
                </div>
              </div>

              <div className="md:col-span-2 bg-gray-50 p-6 rounded-xl border border-gray-200 shadow-sm">
                <h3 className="text-lg font-semibold text-gray-800 mb-3">
                  Notes
                </h3>
                <p className="text-gray-700 text-sm italic">
                  {selectedUnit.notes || 'No specific notes for this unit.'}
                </p>
              </div>
            </div>
            <div className="flex justify-end gap-3 mt-6">
              <button
                type="button"
                onClick={() => setIsViewUnitModalOpen(false)}
                className="px-4 py-2 rounded-lg bg-gray-200 text-gray-800 hover:bg-gray-300 transition duration-200 ease-in-out shadow-md"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Unit;
