import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import LoginPage from "./pages/LoginPage";
import Dashboard from "./pages/Dashboard";
import ModulePage from "./pages/ModulePage";
import OrderPlacement from "./pages/OrderPlacement";
import RegisteredClients from "./pages/RegisteredClients";
import ProductManagement from "./pages/ProductManagement";
import ManageMarketplace from "./pages/ManageMarketplace";

function RequireAuth({ children }) {
  const token = localStorage.getItem("scoms_token");
  if (!token) return <Navigate to="/admin-login" replace />;
  return children;
}

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/admin-login" replace />} />
      <Route path="/admin-login" element={<LoginPage role="admin" />} />
      <Route path="/client-login" element={<LoginPage role="client" />} />
      <Route
        path="/dashboard"
        element={
          <RequireAuth>
            <Dashboard />
          </RequireAuth>
        }
      />
      <Route path="/orders" element={<RequireAuth><OrderPlacement /></RequireAuth>} />
      <Route path="/clients" element={<RequireAuth><RegisteredClients /></RequireAuth>} />
      <Route path="/products" element={<RequireAuth><ProductManagement /></RequireAuth>} />
      <Route path="/marketplaces" element={<RequireAuth><ManageMarketplace /></RequireAuth>} />
      <Route path="/sourcing" element={<RequireAuth><ModulePage title="Sourcing" /></RequireAuth>} />
      <Route path="/inventory" element={<RequireAuth><ModulePage title="Inventory" /></RequireAuth>} />
      <Route path="/reporting" element={<RequireAuth><ModulePage title="Reporting" /></RequireAuth>} />
      <Route path="*" element={<Navigate to="/admin-login" replace />} />
    </Routes>
  );
}
