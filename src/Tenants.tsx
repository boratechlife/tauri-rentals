import React, { useState, useEffect } from 'react';

interface Tenant {
  id: number;
  name: string;
  email: string;
  phone: string;
  status: 'active' | 'inactive';
}

const Tenants: React.FC = () => {
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // TODO: Replace with actual API call
    const fetchTenants = async () => {
      try {
        // Simulated data
        const mockTenants: Tenant[] = [
          {
            id: 1,
            name: 'John Doe',
            email: 'john@example.com',
            phone: '123-456-7890',
            status: 'active',
          },
          {
            id: 2,
            name: 'Jane Smith',
            email: 'jane@example.com',
            phone: '098-765-4321',
            status: 'active',
          },
        ];
        setTenants(mockTenants);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching tenants:', error);
        setLoading(false);
      }
    };

    fetchTenants();
  }, []);

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Tenants Management</h1>

      {loading ? (
        <p>Loading...</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white border border-gray-200">
            <thead>
              <tr>
                <th className="px-4 py-2 border">Name</th>
                <th className="px-4 py-2 border">Email</th>
                <th className="px-4 py-2 border">Phone</th>
                <th className="px-4 py-2 border">Status</th>
                <th className="px-4 py-2 border">Actions</th>
              </tr>
            </thead>
            <tbody>
              {tenants.map((tenant) => (
                <tr key={tenant.id}>
                  <td className="px-4 py-2 border">{tenant.name}</td>
                  <td className="px-4 py-2 border">{tenant.email}</td>
                  <td className="px-4 py-2 border">{tenant.phone}</td>
                  <td className="px-4 py-2 border">
                    <span
                      className={`px-2 py-1 rounded ${
                        tenant.status === 'active'
                          ? 'bg-green-100 text-green-800'
                          : 'bg-red-100 text-red-800'
                      }`}
                    >
                      {tenant.status}
                    </span>
                  </td>
                  <td className="px-4 py-2 border">
                    <button className="mr-2 px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600">
                      Edit
                    </button>
                    <button className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600">
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default Tenants;
