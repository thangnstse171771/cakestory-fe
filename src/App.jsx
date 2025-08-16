// src/App.jsx
"use client";

import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
  useParams,
} from "react-router-dom";
import { AuthProvider, useAuth } from "./contexts/AuthContext";

import Layout from "./components/Layout";
import Login from "./components/Login";
import Signup from "./components/Signup";
import Home from "./pages/Home/Home";
import CakeDesign from "./pages/CakeDesign";
import MyPost from "./pages/MyPost/MyPost";
import Profile from "./pages/Profile";
import Marketplace from "./pages/Marketplace/Marketplace";
import ShopDetail from "./pages/Marketplace/ShopDetail";

// Wrapper component to ensure ShopDetail re-renders when id changes
const ShopDetailWrapper = () => {
  const { id } = useParams();
  return <ShopDetail key={id} />;
};
import ShopAnalystic from "./pages/Marketplace/ShopAnalystic";
import ShopGalleryPage from "./pages/ShopGalleryPage";
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
import ChallengeDetail from "./pages/Challenge/ChallengeDetail";
import ChallengeGroup from "./pages/Challenge/ChallengeGroup";
import AdminChallengeDashboard from "./pages/AdminChallenge/AdminDashboard";
import AdminChallengeDetail from "./pages/AdminChallenge/AdminChallengeDetail";
import UserProfile from "./pages/UserProfile";
import CreateShop from "./pages/Marketplace/CreateShop";
import UserWallet from "./pages/Wallet/UserWallet";
import WithdrawRequest from "./pages/Wallet/WithdrawRequest";
import WithdrawHistory from "./pages/Wallet/WithdrawHistory";
import AllPaymentHistory from "./pages/Wallet/AllPaymentHistory";
import CustomizedOrderDetails from "./pages/CustomizedOrderForm/CustomizedOrderDetails";
import OrderDetailPayment from "./pages/CustomizedOrderForm/OrderDetailPayment";
import "./App.css";
import ToastNotify from "./components/ToastNotify";
import SyncUserIdToStore from "./pages/Chat/libs/SyncUserIdToStore";
import SuggestedUsers from "./pages/Home/SuggestedUsers";
import MyAlbum from "./pages/MyAlbum/MyAlbum";
import AlbumDetail from "./pages/MyAlbum/AlbumDetail";
import OrderTrackingList from "./pages/OrderTrackingForm/OrderTrackingList";
// import OrderTrackingFormByShop from "./pages/OrderTrackingForm/OrderTrackingFormByShop";
import OrderTrackingUserList from "./pages/OrderTrackingForm/OrderTrackingUserList";
import OrderTrackingAdminAllList from "./pages/OrderTrackingForm/OrderTrackingAdminAllList";
import ComplaintList from "./pages/ComplaintManagement/ComplaintList";
import AllShopCakes from "./pages/AllShopCakes";
import AIGeneratedImages from "./pages/AIGeneratedImages";
import ProductDetail from "./pages/Marketplace/ProductDetail";
import UserComplaint from "./pages/ComplaintManagement/UserComplaint";
import UserComplaintDetailPage from "./pages/ComplaintManagement/UserComplaintDetailPage";
import ShopComplaintDetailPage from "./pages/ComplaintManagement/ShopComplaintDetailPage.jsx";
import AdminComplaintList from "./pages/ComplaintManagement/AdminComplaintList.jsx";
import SearchResults from "./pages/Home/SearchResults.jsx";

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
  if (loading) return <div>Loading...</div>;
  if (isAuthenticated()) return <Navigate to="/home" replace />;
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

          {/* Public pages (guest) */}
          <Route element={<Layout />}>
            <Route index element={<Navigate to="home" replace />} />
            <Route path="home" element={<Home />} />
            <Route path="search" element={<SearchResults />} />
            <Route path="marketplace" element={<Marketplace />} />
            <Route
              path="marketplace/product/:productId"
              element={<ProductDetail />}
            />
            <Route
              path="marketplace/shop/:id"
              element={<ShopDetailWrapper />}
            />
            <Route
              path="marketplace/shop/:id/all-cakes"
              element={<AllShopCakes />}
            />
            <Route path="shop-gallery/:shopId" element={<ShopGalleryPage />} />
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
            <Route
              path="order-tracking"
              element={
                <OrderTrackingList orders={[]} onSelectOrder={() => {}} />
              }
            />
            <Route
              path="order-tracking/:orderId"
              element={<OrderTrackingList showOrderDetails={true} />}
            />

            <Route
              path="order-tracking-user"
              element={<OrderTrackingUserList />}
            />
            <Route
              path="order-tracking-user/:orderId"
              element={<OrderTrackingUserList showOrderDetails={true} />}
            />
            <Route
              path="admin/order-tracking"
              element={<OrderTrackingAdminAllList />}
            />
            <Route
              path="admin/order-tracking/:orderId"
              element={<OrderTrackingAdminAllList showOrderDetails={true} />}
            />
            <Route path="cake-design" element={<CakeDesign />} />
            <Route path="ai-generated-images" element={<AIGeneratedImages />} />
            <Route path="challenge" element={<ChallengeList />} />
            <Route path="challenge/details/:id" element={<ChallengeDetail />} />
            <Route
              path="challenge/details/group/:id"
              element={<ChallengeGroup />}
            />
            <Route path="challenge-group/:id" element={<ChallengeGroup />} />
            <Route path="user/:id" element={<UserProfile />} />
            <Route path="wallet" element={<UserWallet />} />
            <Route path="withdraw" element={<WithdrawRequest />} />
            <Route path="withdraw-history" element={<WithdrawHistory />} />
            <Route path="all-transactions" element={<AllPaymentHistory />} />
            <Route path="suggested-users" element={<SuggestedUsers />} />
            <Route path="album/:id" element={<AlbumDetail />} />
            <Route path="complaints" element={<ComplaintList />} />
            <Route
              path="complaints/:id"
              element={<ShopComplaintDetailPage />}
            />
          </Route>

          {/* Protected pages */}
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
            <Route path="myalbum" element={<MyAlbum />} />
            <Route path="my-complaints" element={<UserComplaint />} />
            <Route
              path="my-complaints/:id"
              element={<UserComplaintDetailPage />}
            />
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
            <Route path="admin/complaints" element={<AdminComplaintList />} />
            <Route
              path="admin/complaints/:id"
              element={<ShopComplaintDetailPage />}
            />
            <Route path="/settings" element={<Settings />} />
            <Route path="/report" element={<Report />} />
            <Route
              path="admin/challenge"
              element={<AdminChallengeDashboard />}
            />
            <Route
              path="admin/challenge/:id"
              element={<AdminChallengeDetail />}
            />
          </Route>

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}
