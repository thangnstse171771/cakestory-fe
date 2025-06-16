// src/App.jsx
"use client";

import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { AuthProvider, useAuth } from "./contexts/AuthContext";

import Layout from "./components/Layout";
import Login from "./components/Login";
import Signup from "./components/Signup";
import Home from "./pages/Home";
import CakeDesign from "./pages/CakeDesign";
import MyPost from "./pages/MyPost/MyPost";
import Profile from "./pages/Profile";
import Marketplace from "./pages/Marketplace/Marketplace";
import ShopDetail from "./pages/Marketplace/ShopDetail";
import Messages from "./pages/Messages";
import Events from "./pages/Events";
import AdminDashboard from "./pages/AdminDashboard";
import AccountDetails from "./pages/AccountDetails";
import "./App.css";

// Protect routes — chỉ cho tiếp cận khi đã auth
function ProtectedRoute({ children }) {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return <div>Loading...</div>;
  }
  if (!isAuthenticated()) {
    return <Navigate to="/login" replace />;
  }
  return children;
}

// Public routes — nếu đã auth thì redirect về home
function PublicRoute({ children }) {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return <div>Loading...</div>;
  }
  if (isAuthenticated()) {
    return <Navigate to="/home" replace />;
  }
  return children;
}

export default function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          {/* Public */}
          <Route
            path="/login"
            element={
              <PublicRoute>
                <Login />
              </PublicRoute>
            }
          />
          <Route
            path="/signup"
            element={
              <PublicRoute>
                <Signup />
              </PublicRoute>
            }
          />

          {/* Protected + Layout */}
          <Route
            element={
              <ProtectedRoute>
                <Layout />
              </ProtectedRoute>
            }
          >
            <Route index element={<Navigate to="home" replace />} />

            <Route path="home" element={<Home />} />
            <Route path="cake-design" element={<CakeDesign />} />
            <Route path="mypost" element={<MyPost />} />
            <Route path="profile" element={<Profile />} />

            <Route path="marketplace" element={<Marketplace />} />
            <Route path="marketplace/shop/:id" element={<ShopDetail />} />

            <Route path="messages" element={<Messages />} />
            <Route path="events" element={<Events />} />

            <Route path="admin" element={<AdminDashboard />} />
            <Route path="admin/account/:id" element={<AccountDetails />} />
          </Route>

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}
