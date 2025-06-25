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
import WalletManagement from "./pages/Admin/WalletManagement";
import WithdrawRequests from "./pages/Admin/WithdrawRequests";
import AccountDetails from "./pages/AccountDetails";
import WithdrawRequestDetail from "./pages/Admin/WithdrawRequestDetail";
import EditProfile from "./pages/EditProfile";
import Settings from "./pages/Settings";
import Report from "./pages/Report";
import ChallengeList from "./pages/Challenge/ChallengeList";
import ChallengeGroup from "./pages/Challenge/ChallengeGroup";
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

          {/* Public pages (guest xem được) */}
          <Route element={<Layout />}>
            <Route index element={<Navigate to="home" replace />} />
            <Route path="home" element={<Home />} />
            <Route path="marketplace" element={<Marketplace />} />
            <Route path="marketplace/shop/:id" element={<ShopDetail />} />
            <Route path="events" element={<Events />} />
            <Route path="cake-design" element={<CakeDesign />} />
            <Route path="challenge" element={<ChallengeList />} />
            <Route path="challenge/:id/group" element={<ChallengeGroup />} />
          </Route>

          {/* Protected pages (chỉ login mới xem được) */}
          <Route
            element={
              <ProtectedRoute>
                <Layout />
              </ProtectedRoute>
            }
          >
            <Route path="profile" element={<Profile />} />
            <Route path="edit-profile" element={<EditProfile />} />
            <Route path="mypost" element={<MyPost />} />
            <Route path="messages" element={<Messages />} />
            <Route path="admin" element={<AdminDashboard />} />
            <Route path="admin/account/:id" element={<AccountDetails />} />
            <Route path="admin/wallet" element={<WalletManagement />} />
            <Route
              path="admin/withdraw-requests"
              element={<WithdrawRequests />}
            />
            <Route
              path="admin/withdraw-requests/:id"
              element={<WithdrawRequestDetail />}
            />
            <Route path="/settings" element={<Settings />} />
            <Route path="/report" element={<Report />} />
          </Route>

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}
