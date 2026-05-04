import React, { useState, useEffect } from "react";
import {
  Routes,
  Route,
  useNavigate,
  useLocation,
  Navigate,
} from "react-router-dom";

import LoginPage from "./pages/LoginPage";
import SignUpPage from "./pages/SignUpPage";
import SidebarLayout from "./layouts/SidebarLayout";

import HomePage from "./pages/HomePage";
import BatchListPage from "./pages/BatchListPage";
import CustomerPage from "./pages/CustomerPage";
import UserPage from "./pages/UserPage";
import FundPage from "./pages/FundPage";
import ExpensePage from "./pages/ExpensePage";
import StatisticPage from "./pages/StatisticPage";

function App() {
  const [token, setToken] = useState<string | null>(
    localStorage.getItem("accessToken") || localStorage.getItem("token")
  );

  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const savedToken = localStorage.getItem("accessToken") || localStorage.getItem("token");
    setToken(savedToken);
  }, [location.pathname]);

  const handleLoginSuccess = (newToken: string) => {
    localStorage.setItem("accessToken", newToken);
    setToken(newToken);
    navigate("/");
  };

  const handleLogout = () => {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("token");
    setToken(null);
    navigate("/login");
  };

  return (
    <Routes>
      {/* Public Routes */}
      <Route 
        path="/login" 
        element={token ? <Navigate to="/" replace /> : <LoginPage onLogin={handleLoginSuccess} />} 
      />
      <Route 
        path="/signup" 
        element={token ? <Navigate to="/" replace /> : <SignUpPage />} 
      />

      {/* Protected Routes */}
      <Route element={<SidebarLayout />}>
        <Route path="/" element={<HomePage />} />
        <Route path="/batch" element={<BatchListPage />} />
        <Route path="/customer" element={<CustomerPage />} />
        <Route path="/user" element={<UserPage />} />
        <Route path="/fund" element={<FundPage />} />
        <Route path="/expense" element={<ExpensePage />} />
        <Route path="/statistic" element={<StatisticPage />} />
      </Route>

      <Route path="*" element={<Navigate to={token ? "/" : "/login"} replace />} />
    </Routes>
  );
}

export default App;