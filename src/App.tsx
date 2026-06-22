import { useState, useEffect } from "react";
import { Routes, Route, useLocation, Navigate } from "react-router-dom";

import LoginPage from "./pages/LoginPage";
import SidebarLayout from "./layouts/SidebarLayout";

import HomePage from "./pages/HomePage";
import BatchListPage from "./pages/BatchListPage";
import CustomerPage from "./pages/CustomerPage";
import UserPage from "./pages/UserPage";
import FundPage from "./pages/FundPage";
import ExpensePage from "./pages/ExpensePage";
import StatisticPage from "./pages/StatisticPage";
import SettingsPage from "./pages/SettingsPage";
import FormulaPage from "./pages/FormulaPage";
import CreateOrderPage from "./pages/CreateOrderPage";
import SystemLogsPage from "./pages/SystemLogsPage";

function App() {
  const [token, setToken] = useState<string | null>(
    localStorage.getItem("accessToken") || localStorage.getItem("token"),
  );

  const location = useLocation();

  useEffect(() => {
    const savedToken =
      localStorage.getItem("accessToken") || localStorage.getItem("token");
    setToken(savedToken);
  }, [location.pathname]);

  return (
    <Routes>
      {/* Public Routes */}
      <Route
        path="/login"
        element={token ? <Navigate to="/" replace /> : <LoginPage />}
      />
      <Route path="/signup" element={<Navigate to="/login" replace />} />

      {/* Protected Routes */}
      <Route element={<SidebarLayout />}>
        <Route path="/" element={<HomePage />} />
        <Route path="/batch" element={<BatchListPage />} />
        <Route path="/customer" element={<CustomerPage />} />
        <Route path="/user" element={<UserPage />} />
        <Route path="/fund" element={<FundPage />} />
        <Route path="/expense" element={<ExpensePage />} />
        <Route path="/statistic" element={<StatisticPage />} />
        <Route path="/settings" element={<SettingsPage />} />
        <Route path="/formulas" element={<FormulaPage />} />
        <Route path="/create-order" element={<CreateOrderPage />} />
        <Route path="/system-logs" element={<SystemLogsPage />} />
      </Route>

      <Route
        path="*"
        element={<Navigate to={token ? "/" : "/login"} replace />}
      />
    </Routes>
  );
}

export default App;
