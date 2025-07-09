import { useState } from 'react';
import { HelpCircle, X } from 'lucide-react'; // Changed Settings to HelpCircle, added X for close button
import { NavLink, Outlet } from 'react-router-dom';

// Define navigation items type
interface NavItem {
  tab: string;
  to: string;
}

const Layout = () => {
  // Added for functional search
  const [isHelpSidebarOpen, setIsHelpSidebarOpen] = useState(false); // State for help sidebar visibility

  // Navigation items
  const navItems: NavItem[] = [
    { tab: 'overview', to: '/' },
    { tab: 'managers', to: '/managers' },
    { tab: 'properties', to: '/properties' },
    { tab: 'units', to: '/units' },
    { tab: 'tenants', to: '/tenants' },
    { tab: 'finances', to: '/payments' },
    { tab: 'expenses', to: '/expenses' },

    { tab: 'blocks', to: '/blocks' },
    { tab: 'complaints', to: '/complaints' },
  ];

  // Services offered by BORATECHLIFE SYSTEMS

  return (
    <div className="min-h-screen bg-gray-50 font-sans text-gray-900">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 shadow-sm p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <h1 className="text-2xl font-bold text-gray-900">
              Property Management System
            </h1>
          </div>
          <div className="flex items-center gap-3">
            {/* Help Button */}
            <button
              className="p-2 rounded-md text-gray-400 hover:text-gray-600 transition-colors"
              aria-label="Help"
              onClick={() => setIsHelpSidebarOpen(!isHelpSidebarOpen)} // Toggle sidebar
            >
              <HelpCircle size={20} />
            </button>
            <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white text-sm font-medium">
              B
            </div>
          </div>
        </div>
      </header>

      {/* Help Sidebar */}
      <div
        className={`fixed inset-y-0 right-0 bg-gradient-to-br from-slate-50 to-white w-80 shadow-2xl transform transition-all duration-300 ease-in-out z-50 border-l border-gray-100 ${
          isHelpSidebarOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        {/* Header Section */}
        <div className="relative bg-gradient-to-r from-blue-600 to-indigo-700 text-white p-6 shadow-lg">
          <button
            onClick={() => setIsHelpSidebarOpen(false)}
            className="absolute top-4 right-4 text-white/80 hover:text-white hover:bg-white/20 rounded-full p-2 transition-all duration-200"
            aria-label="Close Help Sidebar"
          >
            <X size={20} />
          </button>

          <div className="pr-8">
            <h2 className="text-2xl font-bold mb-2 tracking-wide">
              BORATECHLIFE
            </h2>
            <p className="text-sm text-blue-100 font-medium">SYSTEMS</p>
          </div>
        </div>

        {/* Content Section */}
        <div className="p-6 space-y-6">
          {/* Contact Information */}
          <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
            <h3 className="text-lg font-semibold text-gray-800 mb-3 flex items-center">
              <span className="w-2 h-2 bg-blue-600 rounded-full mr-2"></span>
              Contact Information
            </h3>
            <div className="space-y-2">
              <div className="flex items-center text-sm text-gray-600">
                <span className="font-medium text-gray-700 w-16">Phone:</span>
                <span className="text-blue-600 font-mono">0799012907</span>
              </div>
              <div className="flex items-center text-sm text-gray-600">
                <span className="font-medium text-gray-700 w-16">Email:</span>
                <span className="text-blue-600 break-all">
                  boratechlife@gmail.com
                </span>
              </div>
            </div>
          </div>

          {/* Mission Statement */}
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-4 border border-blue-100">
            <blockquote className="text-gray-700 italic text-center font-medium leading-relaxed">
              "Developers of real estate and property management systems"
            </blockquote>
          </div>

          {/* Services Section */}
        </div>

        {/* Footer */}
        <div className="absolute bottom-0 left-0 right-0 p-4 bg-gray-50 border-t border-gray-200">
          <p className="text-xs text-gray-500 text-center">
            Professional Property Management Solutions
          </p>
        </div>
      </div>

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
      {/* Overlay to close sidebar when clicking outside */}
      {isHelpSidebarOpen && (
        <div
          className="fixed inset-0 bg-black opacity-25 z-40"
          onClick={() => setIsHelpSidebarOpen(false)}
        ></div>
      )}
    </div>
  );
};

export default Layout;
