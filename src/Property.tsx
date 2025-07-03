import React, { useState, useMemo, useEffect } from 'react';
import Database from '@tauri-apps/plugin-sql';
import {
  Search,
  Filter,
  Plus,
  MapPin,
  Home,
  Grid,
  List,
  Eye,
  Edit,
  Trash2,
} from 'lucide-react';

// Define precise Property interface
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
}

interface Manager {
  manager_id: number;
  name: string;
}

const PropertiesPage = () => {
  // State definitions with precise types
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedBlock, setSelectedBlock] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [selectedType, setSelectedType] = useState('all');
  const [showFilters, setShowFilters] = useState(false);
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [managers, setManagers] = useState<Manager[]>([]);
  // const [blocks, setBlocks] = useState<string[]>(['all']); // Populated with 'all'
  const [error, setError] = useState<string | null>(null);
  const [types, setTypes] = useState<string[]>(['all']); // Populated with 'all'
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [editingPropertyId, setEditingPropertyId] = useState<number | null>(
    null
  );
  const [deleteMode, setDeleteMode] = useState(false);
  const [deletingPropertyId, setDeletingPropertyId] = useState<number | null>(
    null
  );

  // Form data aligned with Property interface
  const [formData, setFormData] = useState({
    property_id: 0,
    name: '',
    address: '',
    total_units: 0,
    property_type: '',
    status: 'active',
    last_inspection: '',
    manager_id: 0,
    created_at: '',
    updated_at: '',
  });

  // Handle input changes with typed event
  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]:
        name === 'total_units' || name === 'manager_id' ? Number(value) : value,
    }));
  };

  // Fetch properties and populate types
  useEffect(() => {
    async function fetchProperties() {
      let db;
      try {
        setLoading(true);
        db = await Database.load('sqlite:test6.db');
        const dbProperties = await db.select<Property[]>(
          `SELECT property_id, name, address, total_units, property_type, status, last_inspection, manager_id, created_at, updated_at FROM properties`
        );
        setProperties(dbProperties);
        // Populate types from fetched properties
        const uniqueTypes = [
          'all',
          ...new Set(dbProperties.map((p) => p.property_type)),
        ];
        setTypes(uniqueTypes);
        setError(null);
        console.log('Properties fetched successfully:', dbProperties);
      } catch (err) {
        console.error('Error fetching properties:', err);
        console.log('Error details:', error);
        console.log('Loading', loading);
        setError('Failed to get properties - check console');
      } finally {
        setLoading(false);
        if (db) await db.close();
      }
    }
    async function fetchManagers() {
      let db;
      try {
        setLoading(true);
        db = await Database.load('sqlite:test6.db');
        const dbManagers = await db.select<Manager[]>(
          `SELECT manager_id, name FROM managers`
        );
        setManagers(dbManagers);
        setError(null);
        console.log('Managers fetched successfully:', dbManagers);
      } catch (err) {
        console.error('Error fetching managers:', err);
        setError('Failed to get managers - check console');
      } finally {
        setLoading(false);
        if (db) await db.close();
      }
    }

    fetchProperties();
    fetchManagers();
  }, []);

  // Available statuses and blocks (assuming blocks are not in DB)
  const statuses = ['all', 'active', 'maintenance'];
  // Blocks could be fetched from DB if available; here we use a static list
  const availableBlocks = ['all', 'Block A', 'Block B', 'Block C'];

  // Filter properties based on search and filters
  const filteredProperties = useMemo(() => {
    return properties.filter((property) => {
      const matchesSearch =
        property.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        property.address.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus =
        selectedStatus === 'all' ||
        property.status.toLowerCase() === selectedStatus;
      const matchesType =
        selectedType === 'all' || property.property_type === selectedType;
      // Block filter is not used since block is not in Property interface
      return matchesSearch && matchesStatus && matchesType;
    });
  }, [searchTerm, selectedStatus, selectedType, properties]);

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); // Prevent page reload
    let db;
    try {
      db = await Database.load('sqlite:test6.db');
      setLoading(true);

      if (editMode) {
        await db.execute(
          `UPDATE properties SET name = $1, address = $2, total_units = $3, property_type = $4, status = $5, last_inspection = $6, manager_id = $7, updated_at = $8 WHERE property_id = $9`,
          [
            formData.name,
            formData.address,
            formData.total_units,
            formData.property_type,
            formData.status,
            formData.last_inspection || null,
            formData.manager_id,
            new Date().toISOString(),
            editingPropertyId,
          ]
        );
      } else {
        // Let the database generate property_id (auto-increment)
        await db.execute(
          `INSERT INTO properties (name, address, total_units, property_type, status, last_inspection, manager_id, created_at, updated_at) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`,
          [
            formData.name,
            formData.address,
            formData.total_units,
            formData.property_type,
            formData.status,
            formData.last_inspection || null,
            formData.manager_id,
            new Date().toISOString(),
            new Date().toISOString(),
          ]
        );
      }

      const dbProperties = await db.select<Property[]>(
        `SELECT property_id, name, address, total_units, property_type, status, last_inspection, manager_id, created_at, updated_at FROM properties`
      );
      setProperties(dbProperties);
      setTypes(['all', ...new Set(dbProperties.map((p) => p.property_type))]);
      setIsFormModalOpen(false);
      setFormData({
        property_id: 0,
        name: '',
        address: '',
        total_units: 0,
        property_type: '',
        status: 'active',
        last_inspection: '',
        manager_id: 0,
        created_at: '',
        updated_at: '',
      });
      setEditMode(false);
      setEditingPropertyId(null);
      setError(null);
    } catch (err) {
      console.error('Error submitting property:', err);
      setError('Failed to submit property');
    } finally {
      setLoading(false);
      if (db) await db.close();
    }
  };

  // Handle edit property
  const handleEditProperty = (id: number) => {
    const property = properties.find((p) => p.property_id === id);
    if (property) {
      setFormData({
        property_id: property.property_id,
        name: property.name,
        address: property.address,
        total_units: property.total_units,
        property_type: property.property_type,
        status: property.status,
        last_inspection: property.last_inspection || '',
        manager_id: property.manager_id,
        created_at: property.created_at,
        updated_at: property.updated_at,
      });
      setEditingPropertyId(id);
      setEditMode(true);
      setIsFormModalOpen(true);
    }
  };

  // Handle delete property
  const handleDeleteProperty = (id: number) => {
    setDeletingPropertyId(id);
    setDeleteMode(true);
  };

  // Confirm delete
  const handleConfirmDelete = async () => {
    let db;
    try {
      db = await Database.load('sqlite:test6.db');
      setLoading(true);
      await db.execute(`DELETE FROM properties WHERE property_id = $1`, [
        deletingPropertyId,
      ]);
      setProperties(
        properties.filter((p) => p.property_id !== deletingPropertyId)
      );
      setDeleteMode(false);
      setDeletingPropertyId(null);
      setError(null);
    } catch (err) {
      console.error('Error deleting property:', err);
      setError('Failed to delete property');
    } finally {
      setLoading(false);
      if (db) await db.close();
    }
  };

  // Handle close modal
  const handleCloseModal = () => {
    setIsFormModalOpen(false);
    setEditMode(false);
    setEditingPropertyId(null);
    setFormData({
      property_id: 0,
      name: '',
      address: '',
      total_units: 0,
      property_type: '',
      status: 'active',
      last_inspection: '',
      manager_id: 0,
      created_at: '',
      updated_at: '',
    });
  };

  // Get status badge classes
  const getStatusClass = (status: string) => {
    switch (status.toLowerCase()) {
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'maintenance':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-red-100 text-red-800';
    }
  };

  // PropertyCardView component
  // Update PropertyCardView
  const PropertyCardView = ({ property }: { property: Property }) => {
    const manager = managers.find((m) => m.manager_id === property.manager_id);
    return (
      <div className="bg-white rounded-lg border border-gray-200 shadow-sm hover:shadow-md hover:-translate-y-1 transition-all duration-200">
        <div className="w-full h-48 bg-gray-200 flex items-center justify-center text-gray-400">
          <Home size={40} />
        </div>
        <div className="p-5">
          <div className="flex items-start justify-between mb-3">
            <div>
              <h3 className="text-lg font-semibold text-gray-900">
                {property.name}
              </h3>
              <p className="text-sm text-gray-600 flex items-center gap-1">
                <MapPin size={14} />
                {property.address}
              </p>
            </div>
            <span
              className={`px-2 py-1 rounded-full text-xs font-semibold ${getStatusClass(
                property.status
              )}`}
            >
              {property.status}
            </span>
          </div>
          <div className="grid grid-cols-3 gap-3 mb-4">
            <div className="text-center bg-gray-50 p-2 rounded-md">
              <p className="text-base font-semibold text-gray-900">
                {property.total_units}
              </p>
              <p className="text-xs text-gray-600">Total Units</p>
            </div>
            <div className="text-center bg-gray-50 p-2 rounded-md">
              <p className="text-base font-semibold text-gray-900">-</p>
              <p className="text-xs text-gray-600">Occupied</p>
            </div>
            <div className="text-center bg-gray-50 p-2 rounded-md">
              <p className="text-base font-semibold text-gray-900">-</p>
              <p className="text-xs text-gray-600">Vacant</p>
            </div>
          </div>
          <div className="flex items-center justify-between pt-4 border-t border-gray-100">
            <div className="text-sm text-gray-600">
              <div>Last Inspection: {property.last_inspection || 'N/A'}</div>
              <div>Manager: {manager ? manager.name : 'N/A'}</div>
            </div>
            <div className="flex gap-2">
              <button
                className="p-2 rounded-md bg-gray-100 text-gray-600 hover:bg-gray-200 transition-colors"
                aria-label="View Property"
              >
                <Eye size={16} />
              </button>
              <button
                className="p-2 rounded-md bg-gray-100 text-gray-600 hover:bg-gray-200 transition-colors"
                onClick={() => handleEditProperty(property.property_id)}
                aria-label="Edit Property"
              >
                <Edit size={16} />
              </button>
              <button
                className="p-2 rounded-md bg-gray-100 text-red-600 hover:bg-red-100 transition-colors"
                onClick={() => handleDeleteProperty(property.property_id)}
                aria-label="Delete Property"
              >
                <Trash2 size={16} />
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // Update PropertyListView
  const PropertyListView = ({ property }: { property: Property }) => {
    const manager = managers.find((m) => m.manager_id === property.manager_id);
    return (
      <div className="bg-white rounded-lg border border-gray-200 p-5 flex items-center gap-5 hover:shadow-md transition-shadow">
        <div className="w-20 h-20 bg-gray-200 rounded-md flex items-center justify-center text-gray-400 flex-shrink-0">
          <Home size={32} />
        </div>
        <div className="grid grid-cols-[2fr_1fr_1fr_auto] gap-5 items-center flex-1">
          <div className="flex flex-col gap-1">
            <h3 className="text-base font-semibold text-gray-900">
              {property.name}
            </h3>
            <p className="text-sm text-gray-600 flex items-center gap-1">
              <MapPin size={12} />
              {property.address}
            </p>
            <span
              className={`px-2 py-1 rounded-full text-xs font-semibold ${getStatusClass(
                property.status
              )}`}
            >
              {property.status}
            </span>
          </div>
          <div className="flex flex-col gap-1 text-sm text-gray-600">
            <div>Total Units: {property.total_units}</div>
            <div>Manager: {manager ? manager.name : 'N/A'}</div>
            <div>Last Inspection: {property.last_inspection || 'N/A'}</div>
          </div>
          <div className="flex flex-col gap-1 text-sm text-gray-600">
            {/* Placeholder for additional stats */}
          </div>
          <div className="flex gap-2">
            <button
              className="p-2 rounded-md bg-gray-100 text-gray-600 hover:bg-gray-200 transition-colors"
              aria-label="View Property"
            >
              <Eye size={16} />
            </button>
            <button
              className="p-2 rounded-md bg-gray-100 text-gray-600 hover:bg-gray-200 transition-colors"
              onClick={() => handleEditProperty(property.property_id)}
              aria-label="Edit Property"
            >
              <Edit size={16} />
            </button>
            <button
              className="p-2 rounded-md bg-gray-100 text-red-600 hover:bg-red-100 transition-colors"
              onClick={() => handleDeleteProperty(property.property_id)}
              aria-label="Delete Property"
            >
              <Trash2 size={16} />
            </button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50 font-sans text-gray-900 p-6">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 p-5 mb-6">
        <div className="flex items-center justify-between mb-5">
          <h1 className="text-2xl font-bold text-gray-900">Properties</h1>
          <button
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            onClick={() => setIsFormModalOpen(true)}
          >
            <Plus size={16} />
            Add Property
          </button>
        </div>
        <div className="flex flex-col sm:flex-row items-center gap-4 flex-wrap">
          <div className="relative flex-1 max-w-md">
            <Search
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
              size={16}
            />
            <input
              type="text"
              placeholder="Search properties, addresses, or managers..."
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 transition-colors"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <button
            className={`flex items-center gap-2 px-4 py-2 border rounded-lg transition-colors ${
              showFilters
                ? 'bg-blue-600 text-white border-blue-600'
                : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-100'
            }`}
            onClick={() => setShowFilters(!showFilters)}
          >
            <Filter size={16} />
            Filters
          </button>
          <div className="flex bg-gray-100 rounded-lg p-1">
            <button
              className={`flex items-center gap-2 px-3 py-2 rounded-md transition-colors ${
                viewMode === 'grid'
                  ? 'bg-white text-blue-600 shadow-sm'
                  : 'text-gray-600 hover:bg-gray-200'
              }`}
              onClick={() => setViewMode('grid')}
            >
              <Grid size={16} />
              Grid
            </button>
            <button
              className={`flex items-center gap-2 px-3 py-2 rounded-md transition-colors ${
                viewMode === 'list'
                  ? 'bg-white text-blue-600 shadow-sm'
                  : 'text-gray-600 hover:bg-gray-200'
              }`}
              onClick={() => setViewMode('list')}
            >
              <List size={16} />
              List
            </button>
          </div>
        </div>
      </header>

      {/* Filters Panel */}
      {showFilters && (
        <div className="bg-white border-b border-gray-200 p-4 mb-6">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Block
              </label>
              <select
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 transition-colors"
                value={selectedBlock}
                onChange={(e) => setSelectedBlock(e.target.value)}
              >
                {availableBlocks.map((block) => (
                  <option key={block} value={block}>
                    {block === 'all' ? 'All Blocks' : block}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Status
              </label>
              <select
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 transition-colors"
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
              >
                {statuses.map((status) => (
                  <option key={status} value={status}>
                    {status === 'all' ? 'All Statuses' : status}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Property Type
              </label>
              <select
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 transition-colors"
                value={selectedType}
                onChange={(e) => setSelectedType(e.target.value)}
              >
                {types.map((type) => (
                  <option key={type} value={type}>
                    {type === 'all' ? 'All Types' : type}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
      )}

      {/* Main Content */}
      <main className="p-6">
        <div className="flex items-center justify-between mb-5">
          <p className="text-gray-600">
            Showing {filteredProperties.length} of {properties.length}{' '}
            properties
          </p>
        </div>

        {filteredProperties.length === 0 ? (
          <div className="text-center p-10 text-gray-500">
            <Home size={48} className="mx-auto mb-4 opacity-50" />
            <h3 className="text-lg font-medium mb-2">No properties found</h3>
            <p>Try adjusting your search or filter criteria</p>
          </div>
        ) : viewMode === 'grid' ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredProperties.map((property) => (
              <PropertyCardView
                key={property.property_id}
                property={property}
              />
            ))}
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            {filteredProperties.map((property) => (
              <PropertyListView
                key={property.property_id}
                property={property}
              />
            ))}
          </div>
        )}
      </main>

      {/* Form Modal */}
      {isFormModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white p-6 rounded-lg w-full max-w-2xl max-h-[80vh] overflow-y-auto">
            <h2 className="text-xl font-bold mb-4">
              {editMode ? 'Edit Property' : 'Add Property'}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label
                  htmlFor="name"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Name
                </label>
                <input
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  placeholder="Name"
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  required
                />
              </div>
              <div>
                <label
                  htmlFor="address"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Address
                </label>
                <input
                  id="address"
                  name="address"
                  value={formData.address}
                  onChange={handleInputChange}
                  placeholder="Address"
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  required
                />
              </div>
              <div>
                <label
                  htmlFor="total_units"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Total Units
                </label>
                <input
                  id="total_units"
                  name="total_units"
                  type="number"
                  value={formData.total_units}
                  onChange={handleInputChange}
                  placeholder="Total Units"
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  required
                />
              </div>
              <div>
                <label
                  htmlFor="property_type"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Property Type
                </label>
                <select
                  id="property_type"
                  name="property_type"
                  value={formData.property_type}
                  onChange={handleInputChange}
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  required
                >
                  <option value="">Select Property Type</option>
                  <option value="Single">Single</option>
                  <option value="1bedroom">1 Bedroom</option>
                  <option value="2bedroom">2 Bedroom</option>
                  <option value="3bedroom">3 Bedroom</option>
                  <option value="4bedroom">4 Bedroom</option>
                  <option value="5bedroom">5 Bedroom</option>
                  <option value="6bedroom">6 Bedroom</option>
                  <option value="7bedroom">7 Bedroom</option>
                  <option value="8bedroom">8 Bedroom</option>
                  <option value="9bedroom">9 Bedroom</option>
                  <option value="10bedroom">10 Bedroom</option>
                </select>
              </div>
              <div>
                <label
                  htmlFor="status"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Status
                </label>
                <select
                  id="status"
                  name="status"
                  value={formData.status}
                  onChange={handleInputChange}
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  required
                >
                  <option value="active">Active</option>
                  <option value="maintenance">Maintenance</option>
                </select>
              </div>
              <div>
                <label
                  htmlFor="last_inspection"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Last Inspection
                </label>
                <input
                  id="last_inspection"
                  name="last_inspection"
                  type="date"
                  value={formData.last_inspection}
                  onChange={handleInputChange}
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div>
                <label
                  htmlFor="manager_id"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Property Manager <span className="text-red-500">*</span>
                </label>
                <select
                  id="manager_id"
                  name="manager_id"
                  value={formData.manager_id}
                  onChange={handleInputChange}
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  required
                >
                  <option value="0">Select Manager</option>
                  {managers.map((manager) => (
                    <option key={manager.manager_id} value={manager.manager_id}>
                      {manager.name}
                    </option>
                  ))}
                </select>
              </div>
              <div className="flex gap-3 mt-4">
                <button
                  type="button"
                  onClick={handleCloseModal}
                  className="flex-1 px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  {editMode ? 'Update Property' : 'Add Property'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteMode && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white p-6 rounded-lg max-w-lg">
            <h2 className="text-xl font-bold mb-4">Confirm Delete</h2>
            <p className="mb-4">
              Are you sure you want to delete this property?
            </p>
            <div className="flex gap-3 mt-4">
              <button
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                onClick={handleConfirmDelete}
              >
                Yes
              </button>
              <button
                className="flex-1 px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors"
                onClick={() => setDeleteMode(false)}
              >
                No
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PropertiesPage;
