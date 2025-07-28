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
import AIGenGalleryPage from "./pages/AIGenGalleryPage";
import MyPost from "./pages/MyPost/MyPost";
import Profile from "./pages/Profile";
import Marketplace from "./pages/Marketplace/Marketplace";
import ShopDetail from "./pages/Marketplace/ShopDetail";
import ShopAnalystic from "./pages/Marketplace/ShopAnalystic";
import Chat from "./pages/Chat/Chat";
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
import AdminChallengeDashboard from "./pages/AdminChallenge/AdminDashboard";
import UserProfile from "./pages/UserProfile";
import CreateShop from "./pages/Marketplace/CreateShop";
import UserWallet from "./pages/Wallet/UserWallet";
import CustomizedOrderDetails from "./pages/CustomizedOrderForm/CustomizedOrderDetails";
import OrderDetailPayment from "./pages/CustomizedOrderForm/OrderDetailPayment";
import "./App.css";
import ToastNotify from "./components/ToastNotify";
import SyncUserIdToStore from "./pages/Chat/libs/SyncUserIdToStore";

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
      <SyncUserIdToStore />
      <Router>
        <ToastNotify />
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
            <Route path="marketplace/create-shop" element={<CreateShop />} />
            <Route
              path="order/customize/:shopId"
              element={<CustomizedOrderDetails />}
            />
            <Route path="order/payment" element={<OrderDetailPayment />} />
            <Route
              path="marketplace/shop-analytics"
              element={<ShopAnalystic onBack={() => window.history.back()} />}
            />
            <Route path="events" element={<Events />} />
            <Route path="cake-design" element={<CakeDesign />} />
            <Route path="ai-generated-images" element={<AIGenGalleryPage />} />
            <Route path="challenge" element={<ChallengeList />} />
            <Route path="challenge/:id/group" element={<ChallengeGroup />} />
            <Route path="user/:id" element={<UserProfile />} />
            <Route path="wallet" element={<UserWallet />} />
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
            <Route path="chat" element={<Chat />} />
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
            <Route
              path="admin/challenge"
              element={<AdminChallengeDashboard />}
            />
          </Route>

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}
