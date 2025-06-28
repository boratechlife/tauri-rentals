import React, { useState, useMemo, useEffect } from 'react';
import Database from '@tauri-apps/plugin-sql';
import {
  Search,
  Filter,
  Plus,
  MapPin,
  Users,
  DollarSign,
  Settings,
  Grid,
  List,
  Eye,
  Edit,
  Trash2,
  Home,
  Calendar,
} from 'lucide-react';
import { invoke } from '@tauri-apps/api/core';

const PropertiesPage = () => {
  const [viewMode, setViewMode] = useState('grid');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedBlock, setSelectedBlock] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [selectedType, setSelectedType] = useState('all');
  const [showFilters, setShowFilters] = useState(false);
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [blocks, setBlocks] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [types, setTypes] = useState([]); //
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [editingPropertyId, setEditingPropertyId] = useState<string | null>(
    null
  );
  const [deleteMode, setDeleteMode] = useState(false);
  const [deletingPropertyId, setDeletingPropertyId] = useState(null);

  const modalOverlayStyle = {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    display: isFormModalOpen ? 'flex' : 'none',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  };

  const modalContentStyle = {
    backgroundColor: '#FFFFFF',
    padding: '24px',
    borderRadius: '12px',
    width: '500px',
    maxHeight: '80vh',
    overflowY: 'auto',
  };
  const [formData, setFormData] = useState({
    name: '',
    address: '',
    block: 'Block A',
    totalUnits: 0,
    occupiedUnits: 0,
    vacantUnits: 0,
    monthlyRent: 0,
    propertyType: 'Apartment',
    status: 'Active',
    image: '',
    lastInspection: '',
    manager: '',
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };
  useEffect(() => {
    async function fetchProperties() {
      try {
        setLoading(true);
        const db = await Database.load('sqlite:test.db');
        // Adjust column names to match your 'properties' and 'units' table schema
        const dbProperties = await db.select(
          `SELECT
             p.id, p.name, p.address, p.block,
             COUNT(u.id) as totalUnits,
             SUM(CASE WHEN u.status = 'Occupied' THEN 1 ELSE 0 END) as occupiedUnits,
             SUM(CASE WHEN u.status = 'Vacant' THEN 1 ELSE 0 END) as vacantUnits,
             SUM(u.rent) as monthlyRent,
             p.property_type as propertyType, p.status, p.last_inspection as lastInspection, p.manager, p.image
           FROM properties p
           LEFT JOIN units u ON p.id = u.property
           GROUP BY p.id, p.name, p.address, p.block, p.property_type, p.status, p.last_inspection, p.manager, p.image;`
        );
        setError('');
        setProperties(dbProperties);
        console.log('Properties fetched successfully:', dbProperties);
      } catch (err) {
        console.error('Error fetching properties:', err);
        setError('Failed to get properties - check console');
      } finally {
        setLoading(false);
      }
    }
    fetchProperties();
  }, []);

  const statuses = ['all', 'Active', 'Maintenance', 'Vacant'];

  // Filter properties based on search and filters
  const filteredProperties = useMemo(() => {
    return properties.filter((property) => {
      const matchesSearch =
        property.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        property.address.toLowerCase().includes(searchTerm.toLowerCase()) ||
        property.manager.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesBlock =
        selectedBlock === 'all' || property.block === selectedBlock;
      const matchesStatus =
        selectedStatus === 'all' || property.status === selectedStatus;
      const matchesType =
        selectedType === 'all' || property.type === selectedType;

      return matchesSearch && matchesBlock && matchesStatus && matchesType;
    });
  }, [searchTerm, selectedBlock, selectedStatus, selectedType]);

  const styles = {
    container: {
      minHeight: '100vh',
      backgroundColor: '#F9FAFB',
      fontFamily:
        '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    },
    header: {
      backgroundColor: '#FFFFFF',
      borderBottom: '1px solid #E5E7EB',
      padding: '20px 24px',
    },
    headerContent: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginBottom: '20px',
    },
    title: {
      fontSize: '28px',
      fontWeight: 'bold',
      color: '#111827',
      margin: 0,
    },
    addButton: {
      backgroundColor: '#3B82F6',
      color: 'white',
      border: 'none',
      borderRadius: '8px',
      padding: '10px 16px',
      fontSize: '14px',
      fontWeight: '500',
      cursor: 'pointer',
      display: 'flex',
      alignItems: 'center',
      gap: '8px',
      transition: 'background-color 0.2s',
    },
    controlsRow: {
      display: 'flex',
      alignItems: 'center',
      gap: '16px',
      flexWrap: 'wrap',
    },
    searchContainer: {
      position: 'relative',
      flex: 1,
      maxWidth: '400px',
    },
    searchInput: {
      width: '100%',
      paddingLeft: '40px',
      paddingRight: '16px',
      paddingTop: '10px',
      paddingBottom: '10px',
      border: '1px solid #D1D5DB',
      borderRadius: '8px',
      fontSize: '14px',
      outline: 'none',
      transition: 'border-color 0.2s',
    },
    searchIcon: {
      position: 'absolute',
      left: '12px',
      top: '50%',
      transform: 'translateY(-50%)',
      color: '#9CA3AF',
      width: '16px',
      height: '16px',
    },
    filterButton: {
      backgroundColor: '#FFFFFF',
      border: '1px solid #D1D5DB',
      borderRadius: '8px',
      padding: '10px 16px',
      fontSize: '14px',
      cursor: 'pointer',
      display: 'flex',
      alignItems: 'center',
      gap: '8px',
      transition: 'all 0.2s',
    },
    viewToggle: {
      display: 'flex',
      backgroundColor: '#F3F4F6',
      borderRadius: '8px',
      padding: '4px',
    },
    viewButton: {
      border: 'none',
      backgroundColor: 'transparent',
      padding: '8px 12px',
      borderRadius: '6px',
      cursor: 'pointer',
      display: 'flex',
      alignItems: 'center',
      gap: '4px',
      fontSize: '14px',
      transition: 'all 0.2s',
    },
    viewButtonActive: {
      backgroundColor: '#FFFFFF',
      color: '#3B82F6',
      boxShadow: '0 1px 2px rgba(0, 0, 0, 0.1)',
    },
    viewButtonInactive: {
      color: '#6B7280',
    },
    filtersPanel: {
      backgroundColor: '#FFFFFF',
      borderBottom: '1px solid #E5E7EB',
      padding: '16px 24px',
      display: showFilters ? 'block' : 'none',
    },
    filtersGrid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
      gap: '16px',
    },
    filterGroup: {
      display: 'flex',
      flexDirection: 'column',
      gap: '4px',
    },
    filterLabel: {
      fontSize: '14px',
      fontWeight: '500',
      color: '#374151',
    },
    filterSelect: {
      padding: '8px 12px',
      border: '1px solid #D1D5DB',
      borderRadius: '6px',
      fontSize: '14px',
      backgroundColor: '#FFFFFF',
      outline: 'none',
      transition: 'border-color 0.2s',
    },
    main: {
      padding: '24px',
    },
    resultsHeader: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginBottom: '20px',
    },
    resultsCount: {
      fontSize: '16px',
      color: '#6B7280',
    },
    propertiesGrid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
      gap: '24px',
    },
    propertiesList: {
      display: 'flex',
      flexDirection: 'column',
      gap: '16px',
    },
    propertyCard: {
      backgroundColor: '#FFFFFF',
      borderRadius: '12px',
      border: '1px solid #E5E7EB',
      boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
      overflow: 'hidden',
      transition: 'box-shadow 0.2s, transform 0.2s',
    },
    propertyImage: {
      width: '100%',
      height: '200px',
      backgroundColor: '#E5E7EB',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      color: '#9CA3AF',
    },
    propertyContent: {
      padding: '20px',
    },
    propertyHeader: {
      display: 'flex',
      alignItems: 'flex-start',
      justifyContent: 'space-between',
      marginBottom: '12px',
    },
    propertyTitle: {
      fontSize: '18px',
      fontWeight: '600',
      color: '#111827',
      margin: '0 0 4px 0',
    },
    propertyAddress: {
      fontSize: '14px',
      color: '#6B7280',
      margin: 0,
      display: 'flex',
      alignItems: 'center',
      gap: '4px',
    },
    statusBadge: {
      padding: '4px 8px',
      borderRadius: '12px',
      fontSize: '12px',
      fontWeight: '500',
    },
    statusActive: {
      backgroundColor: '#D1FAE5',
      color: '#065F46',
    },
    statusMaintenance: {
      backgroundColor: '#FEF3C7',
      color: '#92400E',
    },
    statusVacant: {
      backgroundColor: '#FEE2E2',
      color: '#991B1B',
    },
    propertyStats: {
      display: 'grid',
      gridTemplateColumns: 'repeat(3, 1fr)',
      gap: '12px',
      marginBottom: '16px',
    },
    statItem: {
      textAlign: 'center',
      padding: '8px',
      backgroundColor: '#F9FAFB',
      borderRadius: '6px',
    },
    statValue: {
      fontSize: '16px',
      fontWeight: '600',
      color: '#111827',
      margin: '0 0 2px 0',
    },
    statLabel: {
      fontSize: '12px',
      color: '#6B7280',
      margin: 0,
    },
    propertyFooter: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingTop: '16px',
      borderTop: '1px solid #F3F4F6',
    },
    propertyMeta: {
      fontSize: '14px',
      color: '#6B7280',
    },
    propertyActions: {
      display: 'flex',
      gap: '8px',
    },
    actionButton: {
      padding: '6px',
      border: 'none',
      borderRadius: '6px',
      cursor: 'pointer',
      backgroundColor: '#F3F4F6',
      color: '#6B7280',
      transition: 'all 0.2s',
    },
    listCard: {
      backgroundColor: '#FFFFFF',
      borderRadius: '8px',
      border: '1px solid #E5E7EB',
      padding: '20px',
      display: 'flex',
      alignItems: 'center',
      gap: '20px',
      transition: 'box-shadow 0.2s',
    },
    listImage: {
      width: '80px',
      height: '80px',
      backgroundColor: '#E5E7EB',
      borderRadius: '8px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      color: '#9CA3AF',
      flexShrink: 0,
    },
    listContent: {
      flex: 1,
      display: 'grid',
      gridTemplateColumns: '2fr 1fr 1fr 1fr auto',
      gap: '20px',
      alignItems: 'center',
    },
    listProperty: {
      display: 'flex',
      flexDirection: 'column',
      gap: '4px',
    },
    listStats: {
      display: 'flex',
      flexDirection: 'column',
      gap: '2px',
      fontSize: '14px',
    },
  };

  const handleCloseModal = () => setIsFormModalOpen(false);

  const handleConfirmDelete = async () => {
    let db;
    try {
      db = await Database.load('sqlite:test.db');
      setLoading(true);
      await db.execute(`DELETE FROM properties WHERE id = $1`, [
        deletingPropertyId,
      ]);
      console.log('Property deleted successfully:', deletingPropertyId);
      setProperties(properties.filter((p) => p.id !== deletingPropertyId));
      setDeleteMode(false);
      setDeletingPropertyId(null);
      setError('');
    } catch (err) {
      console.error('Error deleting property:', err);
      setError('Failed to delete property');
    } finally {
      setLoading(false);
      if (db) await db.close();
    }
  };

  const handleEditProperty = (id) => {
    const property = properties.find((p) => p.id === id);
    setFormData(property);
    setEditingPropertyId(id);
    setEditMode(true);
    setIsFormModalOpen(true);
  };
  const handleSubmit = async () => {
    let db;
    try {
      db = await Database.load('sqlite:test.db');
      setLoading(true);
      const existingProperty = await db.select(
        `SELECT id FROM properties WHERE id = $1`,
        [editMode ? formData.id : null]
      );

      if (editMode && existingProperty.length > 0) {
        await db.execute(
          `UPDATE properties SET name = $1, address = $2, block = $3, total_units = $4, occupied_units = $5, vacant_units = $6, monthly_rent = $7, property_type = $8, status = $9, image = $10, last_inspection = $11, manager = $12 WHERE id = $13`,
          [
            formData.name,
            formData.address,
            formData.block,
            formData.totalUnits,
            formData.occupiedUnits,
            formData.vacantUnits,
            formData.monthlyRent,
            formData.propertyType,
            formData.status,
            formData.image,
            formData.lastInspection,
            formData.manager,
            formData.id,
          ]
        );
        console.log('Property updated successfully:', formData.id);
      } else {
        const newId = String(properties.length + 1);
        await db.execute(
          `INSERT INTO properties (id, name, address, block, total_units, occupied_units, vacant_units, monthly_rent, property_type, status, image, last_inspection, manager) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)`,
          [
            newId,
            formData.name,
            formData.address,
            formData.block,
            formData.totalUnits,
            formData.occupiedUnits,
            formData.vacantUnits,
            formData.monthlyRent,
            formData.propertyType,
            formData.status,
            formData.image,
            formData.lastInspection,
            formData.manager,
          ]
        );
        console.log('New property added successfully:', newId);
      }

      const dbProperties = await db.select(`SELECT * FROM properties`);
      setProperties(dbProperties);
      setIsFormModalOpen(false);
      setFormData({
        name: '',
        address: '',
        block: 'Block A',
        totalUnits: 0,
        occupiedUnits: 0,
        vacantUnits: 0,
        monthlyRent: 0,
        propertyType: 'Apartment',
        status: 'Active',
        image: '',
        lastInspection: '',
        manager: '',
      });
      setEditMode(false);
      setEditingPropertyId(null);
      setError('');
    } catch (err) {
      console.error('Error submitting property:', err);
      setError('Failed to submit property');
    } finally {
      setLoading(false);
      if (db) await db.close();
    }
  };
  const getStatusStyle = (status) => {
    switch (status) {
      case 'Active':
        return { ...styles.statusBadge, ...styles.statusActive };
      case 'Maintenance':
        return { ...styles.statusBadge, ...styles.statusMaintenance };
      default:
        return { ...styles.statusBadge, ...styles.statusVacant };
    }
  };

  const handleDeleteProperty = (id) => {
    setDeletingPropertyId(id);
    setDeleteMode(true);
  };

  const PropertyCardView = ({ property }) => (
    <div
      style={styles.propertyCard}
      onMouseEnter={(e) => {
        e.currentTarget.style.boxShadow = '0 4px 6px -1px rgba(0, 0, 0, 0.1)';
        e.currentTarget.style.transform = 'translateY(-2px)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.boxShadow = '0 1px 3px rgba(0, 0, 0, 0.1)';
        e.currentTarget.style.transform = 'translateY(0)';
      }}
    >
      <div style={styles.propertyImage}>
        <Home size={40} />
      </div>
      <div style={styles.propertyContent}>
        <div style={styles.propertyHeader}>
          <div>
            <h3 style={styles.propertyTitle}>{property.name}</h3>
            <p style={styles.propertyAddress}>
              <MapPin size={14} />
              {property.address}
            </p>
          </div>
          <span style={getStatusStyle(property.status)}>{property.status}</span>
        </div>

        <div style={styles.propertyStats}>
          <div style={styles.statItem}>
            <p style={styles.statValue}>{property.totalUnits}</p>
            <p style={styles.statLabel}>Total Units</p>
          </div>
          <div style={styles.statItem}>
            <p style={styles.statValue}>{property.occupiedUnits}</p>
            <p style={styles.statLabel}>Occupied</p>
          </div>
          <div style={styles.statItem}>
            <p style={styles.statValue}>{property.vacantUnits}</p>
            <p style={styles.statLabel}>Vacant</p>
          </div>
        </div>

        <div style={styles.propertyFooter}>
          <div style={styles.propertyMeta}>
            <div>Block: {property.block}</div>
            <div>Rent: ${property.monthly_rent}/month</div>
          </div>
          <div style={styles.propertyActions}>
            <button
              style={styles.actionButton}
              onMouseEnter={(e) => (e.target.style.backgroundColor = '#E5E7EB')}
              onMouseLeave={(e) => (e.target.style.backgroundColor = '#F3F4F6')}
            >
              <Eye size={16} />
            </button>
            <button
              style={styles.actionButton}
              onClick={() => handleEditProperty(property.id)}
              onMouseEnter={(e) => (e.target.style.backgroundColor = '#E5E7EB')}
              onMouseLeave={(e) => (e.target.style.backgroundColor = '#F3F4F6')}
            >
              <Edit size={16} />
            </button>
            <button
              style={styles.actionButton}
              onClick={() => handleDeleteProperty(property.id)}
              onMouseEnter={(e) => (e.target.style.backgroundColor = '#E5E7EB')}
              onMouseLeave={(e) => (e.target.style.backgroundColor = '#F3F4F6')}
            >
              <Trash2 size={16} />
            </button>
            {/* <button
              style={styles.actionButton}
              onMouseEnter={(e) => (e.target.style.backgroundColor = '#E5E7EB')}
              onMouseLeave={(e) => (e.target.style.backgroundColor = '#F3F4F6')}
            >
              <Settings size={16} />
            </button> */}
          </div>
        </div>
      </div>
    </div>
  );

  const PropertyListView = ({ property }) => (
    <div
      style={styles.listCard}
      onMouseEnter={(e) =>
        (e.currentTarget.style.boxShadow = '0 4px 6px -1px rgba(0, 0, 0, 0.1)')
      }
      onMouseLeave={(e) => (e.currentTarget.style.boxShadow = 'none')}
    >
      <div style={styles.listImage}>
        <Home size={32} />
      </div>
      <div style={styles.listContent}>
        <div style={styles.listProperty}>
          <h3 style={{ ...styles.propertyTitle, fontSize: '16px' }}>
            {property.name}
          </h3>
          <p style={styles.propertyAddress}>
            <MapPin size={12} />
            {property.address}
          </p>
          <span style={getStatusStyle(property.status)}>{property.status}</span>
        </div>
        <div style={styles.listStats}>
          <div>
            <strong>{property.totalUnits}</strong> Total Units
          </div>
          <div>
            <strong>{property.occupiedUnits}</strong> Occupied
          </div>
          <div>
            <strong>{property.vacantUnits}</strong> Vacant
          </div>
        </div>
        <div style={styles.listStats}>
          <div>{property.block}</div>
          <div>{property.type}</div>
          <div>${property.monthly_rent}/month</div>
        </div>
        <div style={styles.listStats}>
          <div>Manager: {property.manager}</div>
          <div>Last Inspection:</div>
          <div>{property.lastInspection}</div>
        </div>
        <div style={styles.propertyActions}>
          <button
            style={styles.actionButton}
            onMouseEnter={(e) => (e.target.style.backgroundColor = '#E5E7EB')}
            onMouseLeave={(e) => (e.target.style.backgroundColor = '#F3F4F6')}
          >
            <Eye size={16} />
          </button>
          <button
            style={styles.actionButton}
            onMouseEnter={(e) => (e.target.style.backgroundColor = '#E5E7EB')}
            onMouseLeave={(e) => (e.target.style.backgroundColor = '#F3F4F6')}
          >
            <Edit size={16} />
          </button>
          <button
            style={styles.actionButton}
            onMouseEnter={(e) => (e.target.style.backgroundColor = '#E5E7EB')}
            onMouseLeave={(e) => (e.target.style.backgroundColor = '#F3F4F6')}
          >
            <Settings size={16} />
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <div style={styles.container}>
      {/* Header */}
      <header style={styles.header}>
        <div style={styles.headerContent}>
          <h1 style={styles.title}>Properties</h1>
          <button
            style={styles.addButton}
            onClick={() => setIsFormModalOpen(true)}
            onMouseEnter={(e) => (e.target.style.backgroundColor = '#2563EB')}
            onMouseLeave={(e) => (e.target.style.backgroundColor = '#3B82F6')}
          >
            <Plus size={16} />
            Add Property
          </button>
        </div>

        <div style={styles.controlsRow}>
          <div style={styles.searchContainer}>
            <Search style={styles.searchIcon} />
            <input
              type="text"
              placeholder="Search properties, addresses, or managers..."
              style={styles.searchInput}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onFocus={(e) => (e.target.style.borderColor = '#3B82F6')}
              onBlur={(e) => (e.target.style.borderColor = '#D1D5DB')}
            />
          </div>

          <button
            style={{
              ...styles.filterButton,
              backgroundColor: showFilters ? '#3B82F6' : '#FFFFFF',
              color: showFilters ? '#FFFFFF' : '#374151',
              borderColor: showFilters ? '#3B82F6' : '#D1D5DB',
            }}
            onClick={() => setShowFilters(!showFilters)}
            onMouseEnter={(e) => {
              if (!showFilters) {
                e.target.style.backgroundColor = '#F9FAFB';
                e.target.style.borderColor = '#9CA3AF';
              }
            }}
            onMouseLeave={(e) => {
              if (!showFilters) {
                e.target.style.backgroundColor = '#FFFFFF';
                e.target.style.borderColor = '#D1D5DB';
              }
            }}
          >
            <Filter size={16} />
            Filters
          </button>

          <div style={styles.viewToggle}>
            <button
              style={{
                ...styles.viewButton,
                ...(viewMode === 'grid'
                  ? styles.viewButtonActive
                  : styles.viewButtonInactive),
              }}
              onClick={() => setViewMode('grid')}
            >
              <Grid size={16} />
              Grid
            </button>
            <button
              style={{
                ...styles.viewButton,
                ...(viewMode === 'list'
                  ? styles.viewButtonActive
                  : styles.viewButtonInactive),
              }}
              onClick={() => setViewMode('list')}
            >
              <List size={16} />
              List
            </button>
          </div>
        </div>
      </header>

      {/* Filters Panel */}
      <div style={styles.filtersPanel}>
        <div style={styles.filtersGrid}>
          <div style={styles.filterGroup}>
            <label style={styles.filterLabel}>Block</label>
            <select
              style={styles.filterSelect}
              value={selectedBlock}
              onChange={(e) => setSelectedBlock(e.target.value)}
              onFocus={(e) => (e.target.style.borderColor = '#3B82F6')}
              onBlur={(e) => (e.target.style.borderColor = '#D1D5DB')}
            >
              {blocks.map((block) => (
                <option key={block} value={block}>
                  {block === 'all' ? 'All Blocks' : block}
                </option>
              ))}
            </select>
          </div>

          <div style={styles.filterGroup}>
            <label style={styles.filterLabel}>Status</label>
            <select
              style={styles.filterSelect}
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              onFocus={(e) => (e.target.style.borderColor = '#3B82F6')}
              onBlur={(e) => (e.target.style.borderColor = '#D1D5DB')}
            >
              {statuses.map((status) => (
                <option key={status} value={status}>
                  {status === 'all' ? 'All Statuses' : status}
                </option>
              ))}
            </select>
          </div>

          <div style={styles.filterGroup}>
            <label style={styles.filterLabel}>Property Type</label>
            <select
              style={styles.filterSelect}
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
              onFocus={(e) => (e.target.style.borderColor = '#3B82F6')}
              onBlur={(e) => (e.target.style.borderColor = '#D1D5DB')}
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

      {/* Main Content */}
      <main style={styles.main}>
        <div style={styles.resultsHeader}>
          <p style={styles.resultsCount}>
            Showing {filteredProperties.length} of {properties.length}{' '}
            properties
          </p>
        </div>

        {viewMode === 'grid' ? (
          <div style={styles.propertiesGrid}>
            {searchTerm.length > 0
              ? filteredProperties.map((property) => (
                  <PropertyCardView key={property.id} property={property} />
                ))
              : properties.map((property) => (
                  <PropertyCardView key={property.id} property={property} />
                ))}
          </div>
        ) : (
          <div style={styles.propertiesList}>
            {searchTerm.length > 0
              ? filteredProperties.map((property) => (
                  <PropertyCardView key={property.id} property={property} />
                ))
              : properties.map((property) => (
                  <PropertyCardView key={property.id} property={property} />
                ))}
          </div>
        )}

        {filteredProperties.length === 0 && (
          <div
            style={{
              textAlign: 'center',
              padding: '60px 20px',
              color: '#6B7280',
            }}
          >
            <Home size={48} style={{ margin: '0 auto 16px', opacity: 0.5 }} />
            <h3
              style={{
                fontSize: '18px',
                fontWeight: '500',
                margin: '0 0 8px 0',
              }}
            >
              No properties found
            </h3>
            <p style={{ margin: 0 }}>
              Try adjusting your search or filter criteria
            </p>
          </div>
        )}
      </main>

      {isFormModalOpen && (
        <div style={modalOverlayStyle}>
          <div style={modalContentStyle}>
            <h2
              style={{
                fontSize: '20px',
                fontWeight: 'bold',
                marginBottom: '16px',
              }}
            >
              {editMode ? 'Edit Property' : 'Add Property'}
            </h2>
            <form>
              <label
                htmlFor="name"
                style={{ ...styles.filterLabel, marginBottom: '4px' }}
              >
                Name
              </label>
              <input
                id="name"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                placeholder="Name"
                style={{
                  ...styles.filterSelect,
                  width: '100%',
                  marginBottom: '12px',
                }}
              />
              <label
                htmlFor="address"
                style={{ ...styles.filterLabel, marginBottom: '4px' }}
              >
                Address
              </label>
              <input
                id="address"
                name="address"
                value={formData.address}
                onChange={handleInputChange}
                placeholder="Address"
                style={{
                  ...styles.filterSelect,
                  width: '100%',
                  marginBottom: '12px',
                }}
              />
              <label
                htmlFor="block"
                style={{ ...styles.filterLabel, marginBottom: '4px' }}
              >
                Block
              </label>
              <select
                id="block"
                name="block"
                value={formData.block}
                onChange={handleInputChange}
                style={{
                  ...styles.filterSelect,
                  width: '100%',
                  marginBottom: '12px',
                }}
              >
                <option value="Block A">Block A</option>
                <option value="Block B">Block B</option>
                <option value="Block C">Block C</option>
              </select>
              <label
                htmlFor="totalUnits"
                style={{ ...styles.filterLabel, marginBottom: '4px' }}
              >
                Total Units
              </label>
              <input
                id="totalUnits"
                name="totalUnits"
                type="number"
                value={formData.totalUnits}
                onChange={handleInputChange}
                placeholder="Total Units"
                style={{
                  ...styles.filterSelect,
                  width: '100%',
                  marginBottom: '12px',
                }}
              />
              <label
                htmlFor="occupiedUnits"
                style={{ ...styles.filterLabel, marginBottom: '4px' }}
              >
                Occupied Units
              </label>
              <input
                id="occupiedUnits"
                name="occupiedUnits"
                type="number"
                value={formData.occupiedUnits}
                onChange={handleInputChange}
                placeholder="Occupied Units"
                style={{
                  ...styles.filterSelect,
                  width: '100%',
                  marginBottom: '12px',
                }}
              />
              <label
                htmlFor="vacantUnits"
                style={{ ...styles.filterLabel, marginBottom: '4px' }}
              >
                Vacant Units
              </label>
              <input
                id="vacantUnits"
                name="vacantUnits"
                type="number"
                value={formData.vacantUnits}
                onChange={handleInputChange}
                placeholder="Vacant Units"
                style={{
                  ...styles.filterSelect,
                  width: '100%',
                  marginBottom: '12px',
                }}
              />
              <label
                htmlFor="monthlyRent"
                style={{ ...styles.filterLabel, marginBottom: '4px' }}
              >
                Monthly Rent
              </label>
              <input
                id="monthlyRent"
                name="monthlyRent"
                type="number"
                value={formData.monthlyRent}
                onChange={handleInputChange}
                placeholder="Monthly Rent"
                style={{
                  ...styles.filterSelect,
                  width: '100%',
                  marginBottom: '12px',
                }}
              />
              <label
                htmlFor="propertyType"
                style={{ ...styles.filterLabel, marginBottom: '4px' }}
              >
                Property Type
              </label>
              <select
                id="propertyType"
                name="propertyType"
                value={formData.propertyType}
                onChange={handleInputChange}
                style={{
                  ...styles.filterSelect,
                  width: '100%',
                  marginBottom: '12px',
                }}
              >
                <option value="Apartment">Apartment</option>
                <option value="Townhouse">Townhouse</option>
                <option value="House">House</option>
                <option value="Studio">Studio</option>
                <option value="Villa">Villa</option>
              </select>
              <label
                htmlFor="status"
                style={{ ...styles.filterLabel, marginBottom: '4px' }}
              >
                Status
              </label>
              <select
                id="status"
                name="status"
                value={formData.status}
                onChange={handleInputChange}
                style={{
                  ...styles.filterSelect,
                  width: '100%',
                  marginBottom: '12px',
                }}
              >
                <option value="Active">Active</option>
                <option value="Maintenance">Maintenance</option>
                <option value="Vacant">Vacant</option>
              </select>
              <label
                htmlFor="image"
                style={{ ...styles.filterLabel, marginBottom: '4px' }}
              >
                Image URL
              </label>
              <input
                id="image"
                name="image"
                value={formData.image}
                onChange={handleInputChange}
                placeholder="Image URL"
                style={{
                  ...styles.filterSelect,
                  width: '100%',
                  marginBottom: '12px',
                }}
              />
              <label
                htmlFor="lastInspection"
                style={{ ...styles.filterLabel, marginBottom: '4px' }}
              >
                Last Inspection
              </label>
              <input
                id="lastInspection"
                name="lastInspection"
                type="date"
                value={formData.lastInspection}
                onChange={handleInputChange}
                style={{
                  ...styles.filterSelect,
                  width: '100%',
                  marginBottom: '12px',
                }}
              />
              <label
                htmlFor="manager"
                style={{ ...styles.filterLabel, marginBottom: '4px' }}
              >
                Manager
              </label>
              <input
                id="manager"
                name="manager"
                value={formData.manager}
                onChange={handleInputChange}
                placeholder="Manager"
                style={{
                  ...styles.filterSelect,
                  width: '100%',
                  marginBottom: '12px',
                }}
              />
            </form>

            <button
              style={{ ...styles.actionButton, marginLeft: 'auto' }}
              onClick={handleCloseModal}
            >
              Close
            </button>

            <button
              style={{ ...styles.addButton, width: '100%', marginTop: '12px' }}
              onClick={handleSubmit}
            >
              Submit
            </button>
          </div>
        </div>
      )}
      {deleteMode && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
          <div className="bg-white p-6 rounded-lg w-[500px] max-h-[80vh] overflow-y-auto">
            <h2 className="text-2xl font-bold mb-4">Confirm Delete</h2>
            <p className="mb-4">
              Are you sure you want to delete this property?
            </p>
            <div className="flex gap-3 mt-4">
              <button
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                onClick={handleConfirmDelete}
              >
                Yes
              </button>
              <button
                className="bg-gray-200 text-gray-800 px-4 py-2 rounded-lg hover:bg-gray-300 transition-colors w-full"
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
