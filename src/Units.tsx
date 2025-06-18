import React, { useState, useEffect } from "react";
import {
  Home,
  Search,
  Filter,
  Plus,
  Grid,
  List,
  Eye,
  Edit,
  Trash2,
  Building,
  Bed,
  Bath,
  Square,
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
} from "lucide-react";

// Mock Data for demonstration purposes
const mockUnits = [
  {
    id: "U001",
    unitNumber: "SL-201",
    property: "Sunset Lofts",
    block: "A",
    floor: 2,
    status: "Occupied",
    type: "2BR/2BA",
    bedrooms: 2,
    bathrooms: 2,
    squareFootage: 1200,
    rent: 1800,
    securityDeposit: 1800,
    amenities: ["Parking", "AC", "Pool Access"],
    photos: [
      "https://placehold.co/200x150/FF5733/FFFFFF?text=SL-201-1",
      "https://placehold.co/200x150/33FF57/FFFFFF?text=SL-201-2",
    ],
    tenantInfo: {
      id: "T001",
      name: "Alice Johnson",
      leaseEndDate: "2025-01-14",
    },
    notes: "Recently renovated kitchen.",
  },
  {
    id: "U002",
    unitNumber: "GVA-105",
    property: "Green Valley Apartments",
    block: "B",
    floor: 1,
    status: "Available",
    type: "1BR/1BA",
    bedrooms: 1,
    bathrooms: 1,
    squareFootage: 750,
    rent: 1500,
    securityDeposit: 1500,
    amenities: ["Gym", "Balcony", "Wifi"],
    photos: ["https://placehold.co/200x150/3366FF/FFFFFF?text=GVA-105-1"],
    tenantInfo: null,
    notes: "Great view of the park.",
  },
  {
    id: "U003",
    unitNumber: "CVC-08",
    property: "City View Condos",
    block: "Main",
    floor: 5,
    status: "Maintenance",
    type: "3BR/2BA",
    bedrooms: 3,
    bathrooms: 2,
    squareFootage: 1800,
    rent: 2200,
    securityDeposit: 2200,
    amenities: ["Washer/Dryer", "Pet Friendly"],
    photos: ["https://placehold.co/200x150/33FF57/FFFFFF?text=CVC-08-1"],
    tenantInfo: null,
    notes: "Plumbing repair in progress. Estimated completion: 2024-07-01.",
  },
  {
    id: "U004",
    unitNumber: "SL-303",
    property: "Sunset Lofts",
    block: "A",
    floor: 3,
    status: "Occupied",
    type: "2BR/1BA",
    bedrooms: 2,
    bathrooms: 1,
    squareFootage: 1000,
    rent: 1950,
    securityDeposit: 1950,
    amenities: ["Parking", "Balcony"],
    photos: ["https://placehold.co/200x150/FF33CC/FFFFFF?text=SL-303-1"],
    tenantInfo: {
      id: "T004",
      name: "David Lee",
      leaseEndDate: "2025-08-31",
    },
    notes: "Quiet corner unit.",
  },
  {
    id: "U005",
    unitNumber: "GVA-210",
    property: "Green Valley Apartments",
    block: "C",
    floor: 2,
    status: "Reserved",
    type: "1BR/1BA",
    bedrooms: 1,
    bathrooms: 1,
    squareFootage: 800,
    rent: 1450,
    securityDeposit: 1450,
    amenities: ["AC", "Gym"],
    photos: ["https://placehold.co/200x150/5733FF/FFFFFF?text=GVA-210-1"],
    tenantInfo: null, // Could add a 'reservedBy' field later if needed
    notes: "Awaiting final approval for new tenant.",
  },
];

// Helper function to map amenity strings to Lucide icons
const getAmenityIcon = (amenity) => {
  switch (amenity.toLowerCase()) {
    case "parking":
      return <Car className="h-4 w-4 text-gray-500" />;
    case "ac":
      return <Snowflake className="h-4 w-4 text-gray-500" />;
    case "balcony":
      return <Home className="h-4 w-4 text-gray-500" />;
    case "pool access":
      return <Waves className="h-4 w-4 text-gray-500" />;
    case "gym":
      return <Dumbbell className="h-4 w-4 text-gray-500" />;
    case "washer/dryer":
      return <Droplet className="h-4 w-4 text-gray-500" />;
    case "pet friendly":
      return <Dog className="h-4 w-4 text-gray-500" />;
    case "wifi":
      return <Wifi className="h-4 w-4 text-gray-500" />;
    case "coffee":
      return <Coffee className="h-4 w-4 text-gray-500" />;
    default:
      return <QrCode className="h-4 w-4 text-gray-500" />; // Generic icon
  }
};

const Unit = () => {
  // Main state for units and filtered view
  const [units, setUnits] = useState(mockUnits);
  const [filteredUnits, setFilteredUnits] = useState(mockUnits);

  // State for search and filters
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("All");
  const [filterProperty, setFilterProperty] = useState("All");
  const [filterUnitType, setFilterUnitType] = useState("All");
  const [viewMode, setViewMode] = useState("grid"); // 'grid' or 'list'

  // State for Add New Unit Modal
  const [isAddUnitModalOpen, setIsAddUnitModalOpen] = useState(false);
  const [newUnitData, setNewUnitData] = useState({
    unitNumber: "",
    property: "",
    block: "",
    floor: "",
    status: "Available",
    type: "",
    bedrooms: "",
    bathrooms: "",
    squareFootage: "",
    rent: "",
    securityDeposit: "",
    amenities: [],
    photos: [],
    notes: "",
  });

  // State for View Unit Details Modal
  const [isViewUnitModalOpen, setIsViewUnitModalOpen] = useState(false);
  const [selectedUnit, setSelectedUnit] = useState(null);

  // Available properties for filter and add modal
  const availableProperties = [...new Set(mockUnits.map((u) => u.property))];
  const availableUnitTypes = [...new Set(mockUnits.map((u) => u.type))].sort();

  // Effect to filter units whenever search term or filters change
  useEffect(() => {
    let currentFilteredUnits = units.filter((unit) => {
      // Search by unit number, property name, or block
      const matchesSearch =
        searchTerm === "" ||
        unit.unitNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
        unit.property.toLowerCase().includes(searchTerm.toLowerCase()) ||
        unit.block.toLowerCase().includes(searchTerm.toLowerCase());

      // Filter by status
      const matchesStatus =
        filterStatus === "All" || unit.status === filterStatus;

      // Filter by property
      const matchesProperty =
        filterProperty === "All" || unit.property === filterProperty;

      // Filter by unit type
      const matchesUnitType =
        filterUnitType === "All" || unit.type === filterUnitType;

      return (
        matchesSearch && matchesStatus && matchesProperty && matchesUnitType
      );
    });

    setFilteredUnits(currentFilteredUnits);
  }, [searchTerm, filterStatus, filterProperty, filterUnitType, units]);

  // Handle adding a new unit
  const handleAddUnit = (e) => {
    e.preventDefault();
    const newId = `U${String(units.length + 1).padStart(3, "0")}`;
    const unitWithId = { ...newUnitData, id: newId, tenantInfo: null }; // New units are initially available
    setUnits([...units, unitWithId]);
    setIsAddUnitModalOpen(false);
    setNewUnitData({
      unitNumber: "",
      property: "",
      block: "",
      floor: "",
      status: "Available",
      type: "",
      bedrooms: "",
      bathrooms: "",
      squareFootage: "",
      rent: "",
      securityDeposit: "",
      amenities: [],
      photos: [],
      notes: "",
    });
  };

  // Handle viewing unit details
  const handleViewUnit = (unit) => {
    setSelectedUnit(unit);
    setIsViewUnitModalOpen(true);
  };

  // Handle editing a unit (placeholder for now, would open an edit modal)
  const handleEditUnit = (unitId) => {
    console.log(`Edit unit with ID: ${unitId}`);
    // In a real app, you would open an edit modal pre-filled with unit data
    alert(`Editing unit ${unitId}. (Not fully implemented in this demo)`);
  };

  // Handle deleting a unit
  const handleDeleteUnit = (unitId) => {
    if (window.confirm(`Are you sure you want to delete unit ${unitId}?`)) {
      setUnits(units.filter((unit) => unit.id !== unitId));
    }
  };

  // Unit Dashboard Stats
  const totalUnits = units.length;
  const availableUnits = units.filter((u) => u.status === "Available").length;
  const occupiedUnits = units.filter((u) => u.status === "Occupied").length;
  const maintenanceUnits = units.filter(
    (u) => u.status === "Maintenance"
  ).length;
  const reservedUnits = units.filter((u) => u.status === "Reserved").length;

  const occupancyRate =
    totalUnits > 0 ? ((occupiedUnits / totalUnits) * 100).toFixed(1) : "0.0";
  const averageRent =
    totalUnits > 0
      ? (units.reduce((sum, u) => sum + u.rent, 0) / totalUnits).toFixed(2)
      : "0.00";

  // Helper to get status badge color
  const getStatusColor = (status) => {
    switch (status) {
      case "Available":
        return "bg-green-100 text-green-800";
      case "Occupied":
        return "bg-blue-100 text-blue-800";
      case "Maintenance":
        return "bg-yellow-100 text-yellow-800";
      case "Reserved":
        return "bg-purple-100 text-purple-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  // Common button styling
  const primaryButtonClass =
    "px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 transition duration-200 ease-in-out shadow-md hover:shadow-lg";
  const secondaryButtonClass =
    "px-3 py-1 rounded-md bg-gray-200 text-gray-700 hover:bg-gray-300 transition duration-200 ease-in-out text-sm";
  const iconButtonClass =
    "p-2 rounded-full hover:bg-gray-200 transition duration-200 ease-in-out";

  // Modal styling
  const modalOverlayClass =
    "fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4";
  const modalContentClass =
    "bg-white p-6 rounded-xl shadow-2xl max-h-[90vh] overflow-y-auto w-full max-w-3xl transform transition-all duration-300 ease-in-out scale-95 opacity-0 data-[state=open]:scale-100 data-[state=open]:opacity-100";

  return (
    <div className="min-h-screen bg-gray-50 font-sans text-gray-900 antialiased p-4 sm:p-6 lg:p-8">
      {/* Page Header */}
      <header className="mb-8">
        <h1 className="text-3xl font-extrabold text-gray-900 flex items-center gap-3">
          <Building className="w-8 h-8 text-blue-600" /> Unit Management
        </h1>
        <p className="mt-2 text-gray-600 text-lg">
          Oversee all your property units, their status, tenants, and details.
        </p>
      </header>

      {/* Dashboard Overview */}
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

      {/* Filter and Action Bar */}
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
            onClick={() => setViewMode("grid")}
            className={`${iconButtonClass} ${
              viewMode === "grid"
                ? "bg-blue-100 text-blue-600"
                : "text-gray-600"
            }`}
            aria-label="Grid View"
          >
            <LayoutGrid size={20} />
          </button>
          <button
            onClick={() => setViewMode("list")}
            className={`${iconButtonClass} ${
              viewMode === "list"
                ? "bg-blue-100 text-blue-600"
                : "text-gray-600"
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

      {/* Unit Listings */}
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
        ) : viewMode === "grid" ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredUnits.map((unit) => (
              <div
                key={unit.id}
                className="bg-white rounded-xl shadow-md border border-gray-200 overflow-hidden transform hover:scale-[1.02] transition duration-200 ease-in-out"
              >
                {unit.photos && unit.photos.length > 0 && (
                  <img
                    src={unit.photos[0]}
                    alt={`Unit ${unit.unitNumber}`}
                    className="w-full h-40 object-cover"
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = `https://placehold.co/200x150/E0E0E0/666666?text=Unit+${unit.unitNumber}`;
                    }}
                  />
                )}
                <div className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-xl font-bold text-gray-900">
                      {unit.unitNumber}
                    </h3>
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(
                        unit.status
                      )}`}
                    >
                      {unit.status}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 flex items-center gap-2 mb-1">
                    <Building2 className="w-4 h-4" /> {unit.property}, Block{" "}
                    {unit.block}, Floor {unit.floor}
                  </p>
                  <p className="text-sm text-gray-600 flex items-center gap-2 mb-1">
                    <Bed className="w-4 h-4" /> {unit.bedrooms} BR /{" "}
                    <Bath className="w-4 h-4" /> {unit.bathrooms} BA (
                    {unit.type})
                  </p>
                  <p className="text-sm text-gray-600 flex items-center gap-2 mb-1">
                    <Ruler className="w-4 h-4" /> {unit.squareFootage} sqft
                  </p>
                  <p className="text-sm text-gray-600 flex items-center gap-2 mt-2">
                    <DollarSign className="w-4 h-4" /> Rent: ${unit.rent}/month
                  </p>
                  {unit.tenantInfo && (
                    <p className="text-sm text-gray-600 flex items-center gap-2 mt-2">
                      <Users className="w-4 h-4" /> Tenant:{" "}
                      {unit.tenantInfo.name} (Lease ends:{" "}
                      {unit.tenantInfo.leaseEndDate})
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
                    onClick={() => handleEditUnit(unit.id)}
                    className={secondaryButtonClass}
                    aria-label="Edit Unit"
                  >
                    <Edit className="w-4 h-4 mr-1 inline-block" /> Edit
                  </button>
                  <button
                    onClick={() => handleDeleteUnit(unit.id)}
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
                  <tr key={unit.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {unit.unitNumber}
                      </div>
                      <div className="text-sm text-gray-500">ID: {unit.id}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {unit.property} (Block {unit.block}, Floor {unit.floor})
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {unit.type} ({unit.bedrooms}BR/{unit.bathrooms}BA)
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      ${unit.rent}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(
                          unit.status
                        )}`}
                      >
                        {unit.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {unit.tenantInfo
                        ? `${unit.tenantInfo.name} (ends: ${unit.tenantInfo.leaseEndDate})`
                        : "None"}
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
                          onClick={() => handleEditUnit(unit.id)}
                          className={`${secondaryButtonClass} p-2`}
                          aria-label="Edit Unit"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteUnit(unit.id)}
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

      {/* Add New Unit Modal */}
      {isAddUnitModalOpen && (
        <div className={modalOverlayClass} data-state="open">
          <div className={modalContentClass} role="dialog" aria-modal="true">
            <h2 className="text-2xl font-bold mb-6 text-gray-900">
              Add New Unit
            </h2>
            <form
              onSubmit={handleAddUnit}
              className="grid grid-cols-1 md:grid-cols-2 gap-6"
            >
              {/* Unit Identification */}
              <div className="md:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label
                    htmlFor="unitNumber"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Unit Number <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    id="unitNumber"
                    className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                    value={newUnitData.unitNumber}
                    onChange={(e) =>
                      setNewUnitData({
                        ...newUnitData,
                        unitNumber: e.target.value,
                      })
                    }
                    required
                  />
                </div>
                <div>
                  <label
                    htmlFor="property"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Property <span className="text-red-500">*</span>
                  </label>
                  <select
                    id="property"
                    className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                    value={newUnitData.property}
                    onChange={(e) =>
                      setNewUnitData({
                        ...newUnitData,
                        property: e.target.value,
                      })
                    }
                    required
                  >
                    <option value="">Select Property</option>
                    {availableProperties.map((prop) => (
                      <option key={prop} value={prop}>
                        {prop}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label
                    htmlFor="block"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Block
                  </label>
                  <input
                    type="text"
                    id="block"
                    className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                    value={newUnitData.block}
                    onChange={(e) =>
                      setNewUnitData({ ...newUnitData, block: e.target.value })
                    }
                  />
                </div>
                <div>
                  <label
                    htmlFor="floor"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Floor
                  </label>
                  <input
                    type="number"
                    id="floor"
                    className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                    value={newUnitData.floor}
                    onChange={(e) =>
                      setNewUnitData({
                        ...newUnitData,
                        floor: parseInt(e.target.value) || "",
                      })
                    }
                  />
                </div>
              </div>

              {/* Unit Details */}
              <div className="md:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label
                    htmlFor="type"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Unit Type <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    id="type"
                    placeholder="e.g., 2BR/2BA, Studio"
                    className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                    value={newUnitData.type}
                    onChange={(e) =>
                      setNewUnitData({ ...newUnitData, type: e.target.value })
                    }
                    required
                  />
                </div>
                <div>
                  <label
                    htmlFor="bedrooms"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Bedrooms
                  </label>
                  <input
                    type="number"
                    id="bedrooms"
                    className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                    value={newUnitData.bedrooms}
                    onChange={(e) =>
                      setNewUnitData({
                        ...newUnitData,
                        bedrooms: parseInt(e.target.value) || "",
                      })
                    }
                  />
                </div>
                <div>
                  <label
                    htmlFor="bathrooms"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Bathrooms
                  </label>
                  <input
                    type="number"
                    id="bathrooms"
                    className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                    value={newUnitData.bathrooms}
                    onChange={(e) =>
                      setNewUnitData({
                        ...newUnitData,
                        bathrooms: parseInt(e.target.value) || "",
                      })
                    }
                  />
                </div>
                <div>
                  <label
                    htmlFor="squareFootage"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Square Footage
                  </label>
                  <input
                    type="number"
                    id="squareFootage"
                    className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                    value={newUnitData.squareFootage}
                    onChange={(e) =>
                      setNewUnitData({
                        ...newUnitData,
                        squareFootage: parseInt(e.target.value) || "",
                      })
                    }
                  />
                </div>
                <div>
                  <label
                    htmlFor="rent"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Monthly Rent <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    id="rent"
                    className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                    value={newUnitData.rent}
                    onChange={(e) =>
                      setNewUnitData({
                        ...newUnitData,
                        rent: parseFloat(e.target.value) || "",
                      })
                    }
                    required
                  />
                </div>
                <div>
                  <label
                    htmlFor="securityDeposit"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Security Deposit
                  </label>
                  <input
                    type="number"
                    id="securityDeposit"
                    className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                    value={newUnitData.securityDeposit}
                    onChange={(e) =>
                      setNewUnitData({
                        ...newUnitData,
                        securityDeposit: parseFloat(e.target.value) || "",
                      })
                    }
                  />
                </div>
              </div>

              {/* Photos (simple text input for URLs) */}
              <div className="md:col-span-2">
                <label
                  htmlFor="photos"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Photo URLs (comma-separated, optional)
                </label>
                <input
                  type="text"
                  id="photos"
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  value={newUnitData.photos.join(", ")}
                  onChange={(e) =>
                    setNewUnitData({
                      ...newUnitData,
                      photos: e.target.value
                        .split(",")
                        .map((url) => url.trim())
                        .filter((url) => url !== ""),
                    })
                  }
                />
              </div>

              {/* Notes */}
              <div className="md:col-span-2">
                <label
                  htmlFor="notes"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Notes
                </label>
                <textarea
                  id="notes"
                  rows="3"
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  value={newUnitData.notes}
                  onChange={(e) =>
                    setNewUnitData({ ...newUnitData, notes: e.target.value })
                  }
                ></textarea>
              </div>

              {/* Amenities - Simple Multi-select */}
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Amenities
                </label>
                <div className="flex flex-wrap gap-2">
                  {[
                    "Parking",
                    "AC",
                    "Balcony",
                    "Pool Access",
                    "Gym",
                    "Washer/Dryer",
                    "Pet Friendly",
                    "Wifi",
                    "Coffee",
                  ].map((amenity) => (
                    <button
                      key={amenity}
                      type="button"
                      className={`flex items-center gap-2 px-3 py-1 rounded-full border ${
                        newUnitData.amenities.includes(amenity)
                          ? "bg-blue-100 border-blue-500 text-blue-800"
                          : "bg-gray-100 border-gray-300 text-gray-700"
                      } hover:bg-blue-50 transition duration-200`}
                      onClick={() => {
                        setNewUnitData((prev) => ({
                          ...prev,
                          amenities: prev.amenities.includes(amenity)
                            ? prev.amenities.filter((a) => a !== amenity)
                            : [...prev.amenities, amenity],
                        }));
                      }}
                    >
                      {getAmenityIcon(amenity)} {amenity}
                    </button>
                  ))}
                </div>
              </div>

              {/* Form Actions */}
              <div className="md:col-span-2 flex justify-end gap-3 mt-6">
                <button
                  type="button"
                  onClick={() => setIsAddUnitModalOpen(false)}
                  className="px-4 py-2 rounded-lg bg-gray-200 text-gray-800 hover:bg-gray-300 transition duration-200 ease-in-out shadow-md"
                >
                  Cancel
                </button>
                <button type="submit" className={primaryButtonClass}>
                  Add Unit
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* View Unit Details Modal */}
      {isViewUnitModalOpen && selectedUnit && (
        <div className={modalOverlayClass} data-state="open">
          <div className={modalContentClass} role="dialog" aria-modal="true">
            <h2 className="text-2xl font-bold mb-6 text-gray-900 flex items-center gap-3">
              <Building className="w-6 h-6 text-blue-600" /> Unit Details:{" "}
              {selectedUnit.unitNumber}
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              {/* Unit Overview */}
              <div className="bg-blue-50 p-6 rounded-xl flex flex-col items-center justify-center border border-blue-200 shadow-sm">
                {selectedUnit.photos && selectedUnit.photos.length > 0 ? (
                  <img
                    src={selectedUnit.photos[0]}
                    alt={`Unit ${selectedUnit.unitNumber}`}
                    className="w-full max-w-48 h-auto rounded-lg object-cover border-4 border-blue-400 shadow-md mb-4"
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = `https://placehold.co/200x150/E0E0E0/666666?text=Unit+${selectedUnit.unitNumber}`;
                    }}
                  />
                ) : (
                  <div className="w-full max-w-48 h-auto rounded-lg border-4 border-gray-400 bg-gray-200 flex items-center justify-center text-gray-500 text-sm py-8 mb-4">
                    No Image
                  </div>
                )}
                <h3 className="text-xl font-bold text-gray-900">
                  {selectedUnit.unitNumber}
                </h3>
                <p className="text-sm text-gray-600 mb-2">
                  {selectedUnit.property}, Block {selectedUnit.block}, Floor{" "}
                  {selectedUnit.floor}
                </p>
                <span
                  className={`px-3 py-1 rounded-full text-sm font-semibold ${getStatusColor(
                    selectedUnit.status
                  )}`}
                >
                  {selectedUnit.status}
                </span>
              </div>

              {/* Basic Information */}
              <div className="bg-gray-50 p-6 rounded-xl border border-gray-200 shadow-sm">
                <h3 className="text-lg font-semibold text-gray-800 mb-3">
                  Basic Information
                </h3>
                <p className="flex items-center gap-2 text-gray-700 mb-2">
                  <Bed className="w-5 h-5 text-gray-500" /> Bedrooms:{" "}
                  <span className="font-medium">{selectedUnit.bedrooms}</span>
                </p>
                <p className="flex items-center gap-2 text-gray-700 mb-2">
                  <Bath className="w-5 h-5 text-gray-500" /> Bathrooms:{" "}
                  <span className="font-medium">{selectedUnit.bathrooms}</span>
                </p>
                <p className="flex items-center gap-2 text-gray-700 mb-2">
                  <Ruler className="w-5 h-5 text-gray-500" /> Square Footage:{" "}
                  <span className="font-medium">
                    {selectedUnit.squareFootage} sqft
                  </span>
                </p>
                <p className="flex items-center gap-2 text-gray-700 mb-2">
                  <DollarSign className="w-5 h-5 text-gray-500" /> Monthly Rent:{" "}
                  <span className="font-medium">${selectedUnit.rent}</span>
                </p>
                <p className="flex items-center gap-2 text-gray-700">
                  <Key className="w-5 h-5 text-gray-500" /> Security Deposit:{" "}
                  <span className="font-medium">
                    ${selectedUnit.securityDeposit}
                  </span>
                </p>
              </div>

              {/* Tenant Information (if applicable) */}
              <div className="md:col-span-2 bg-gray-50 p-6 rounded-xl border border-gray-200 shadow-sm">
                <h3 className="text-lg font-semibold text-gray-800 mb-3">
                  Tenant Information
                </h3>
                {selectedUnit.tenantInfo ? (
                  <>
                    <p className="flex items-center gap-2 text-gray-700 mb-2">
                      <Users className="w-5 h-5 text-gray-500" /> Tenant Name:{" "}
                      <span className="font-medium">
                        {selectedUnit.tenantInfo.name}
                      </span>
                    </p>
                    <p className="flex items-center gap-2 text-gray-700">
                      <Calendar className="w-5 h-5 text-gray-500" /> Lease Ends:{" "}
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

              {/* Amenities */}
              <div className="md:col-span-2 bg-gray-50 p-6 rounded-xl border border-gray-200 shadow-sm">
                <h3 className="text-lg font-semibold text-gray-800 mb-3">
                  Amenities
                </h3>
                <div className="flex flex-wrap gap-3">
                  {selectedUnit.amenities.length > 0 ? (
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

              {/* Notes */}
              <div className="md:col-span-2 bg-gray-50 p-6 rounded-xl border border-gray-200 shadow-sm">
                <h3 className="text-lg font-semibold text-gray-800 mb-3">
                  Notes
                </h3>
                <p className="text-gray-700 text-sm italic">
                  {selectedUnit.notes || "No specific notes for this unit."}
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
