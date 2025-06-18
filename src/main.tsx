import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "./App";
import { Routes, Route } from "react-router-dom";
import PropertyManagerDashboard from "./Dashboard";
import PropertiesPage from "./Property";
import Tenants from "./Tenants";
import PaymentManagement from "./Payments";
import Layout from "./Layout";

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <React.StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<PropertyManagerDashboard />} />
          <Route path="properties" element={<PropertiesPage />} />
          <Route path="tenants" element={<Tenants />} />
          <Route path="payments" element={<PaymentManagement />} />
        </Route>

        {/* <Route path="*" element={<NotFound />} /> */}
      </Routes>
    </BrowserRouter>
  </React.StrictMode>
);
