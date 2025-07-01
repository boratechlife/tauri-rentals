import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';

import { Routes, Route } from 'react-router-dom';
import PropertyManagerDashboard from './Dashboard';
import PropertiesPage from './Property';
import Tenants from './Tenants';
import './App.css';

import Layout from './Layout';
import PropertyManagementDashboard from './Payments';
import ExpensePage from './Expense';
import Unit from './Units';
import ManagersList from './ManagersList';
import BlocksList from './BlocksList';

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <React.StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<PropertyManagerDashboard />} />
          <Route path="properties" element={<PropertiesPage />} />
          <Route path="tenants" element={<Tenants />} />
          <Route path="payments" element={<PropertyManagementDashboard />} />
          <Route path="expenses" element={<ExpensePage />} />
          <Route path="units" element={<Unit />} />
          <Route path="managers" element={<ManagersList />} />
          <Route path="blocks" element={<BlocksList />} />
          {/* Add other routes as needed */}
        </Route>

        {/* <Route path="*" element={<NotFound />} /> */}
      </Routes>
    </BrowserRouter>
  </React.StrictMode>
);
