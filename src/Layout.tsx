import { useState } from 'react';
import { Settings, Bell, Search } from 'lucide-react';
import { NavLink, Outlet } from 'react-router-dom';

// Define navigation items type
interface NavItem {
  tab: string;
  to: string;
}

const Layout = () => {
  // Remove unused activeTab state
  const [searchTerm, setSearchTerm] = useState(''); // Added for functional search

  // Navigation items
  const navItems: NavItem[] = [
    { tab: 'overview', to: '/' },
    { tab: 'properties', to: '/properties' },
    { tab: 'units', to: '/units' },
    { tab: 'tenants', to: '/tenants' },
    { tab: 'finances', to: '/payments' },
    { tab: 'expenses', to: '/expenses' },
    { tab: 'managers', to: '/managers' },
    { tab: 'blocks', to: '/blocks' },
    { tab: 'complaints', to: '/complaints' },
  ];

  return (
    <div className="min-h-screen bg-gray-50 font-sans text-gray-900">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 shadow-sm p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <h1 className="text-2xl font-bold text-gray-900">PropertyHub</h1>
            <div className="relative max-w-xs">
              <Search
                className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                size={16}
              />
              <input
                type="text"
                placeholder="Search properties, tenants, or units..."
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 transition-colors"
                value={searchTerm}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  setSearchTerm(e.target.value)
                }
              />
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button
              className="p-2 rounded-md text-gray-400 hover:text-gray-600 relative transition-colors"
              aria-label="Notifications"
              onMouseEnter={(e: React.MouseEvent<HTMLButtonElement>) =>
                e.currentTarget.classList.add('text-gray-600')
              }
              onMouseLeave={(e: React.MouseEvent<HTMLButtonElement>) =>
                e.currentTarget.classList.remove('text-gray-600')
              }
            >
              <Bell size={20} />
              <span className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full w-4 h-4 flex items-center justify-center text-xs">
                3
              </span>
            </button>
            <button
              className="p-2 rounded-md text-gray-400 hover:text-gray-600 transition-colors"
              aria-label="Settings"
              onMouseEnter={(e: React.MouseEvent<HTMLButtonElement>) =>
                e.currentTarget.classList.add('text-gray-600')
              }
              onMouseLeave={(e: React.MouseEvent<HTMLButtonElement>) =>
                e.currentTarget.classList.remove('text-gray-600')
              }
            >
              <Settings size={20} />
            </button>
            <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white text-sm font-medium">
              JD
            </div>
          </div>
        </div>
      </header>

      {/* Navigation */}
      <nav className="bg-white border-b border-gray-200 p-4">
        <div className="flex gap-8">
          {navItems.map(({ tab, to }) => (
            <NavLink
              key={tab}
              to={to}
              end={tab === 'overview'}
              className={({ isActive }) =>
                `px-1 py-4 text-sm font-medium capitalize border-b-2 transition-colors ${
                  isActive
                    ? 'border-blue-600 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`
              }
            >
              {tab}
            </NavLink>
          ))}
        </div>
      </nav>

      {/* Main Content */}
      <main className="p-6">
        <Outlet />
      </main>
    </div>
  );
};

export default Layout;
