// src/components/Sidebar.jsx
import { NavLink, useNavigate, useLocation } from "react-router-dom";
import {
  Home,
  ShoppingBag,
  MessageCircle,
  BookImage,
  User,
  Cake,
  Calendar,
  LogOut,
  MoreHorizontal,
  Shield,
  Wallet,
  CreditCard,
  Trophy,
  Menu,
  SquareLibrary,
  ListOrdered,
  MessageSquareWarning,
  ArrowDownToLine,
  Receipt,
} from "lucide-react";
import { useAuth } from "../contexts/AuthContext";
import { useState, useEffect } from "react";
import { fetchAllShops } from "../api/axios";

const Sidebar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [showMore, setShowMore] = useState(false);
  const [collapsed, setCollapsed] = useState(false);

  // Determine if current user owns/has a shop (quick client-side check)
  const computedHasShop = Boolean(
    user?.shop ||
      user?.shopId ||
      user?.shop_id ||
      user?.isShopOwner ||
      (Array.isArray(user?.shops) && user?.shops.length > 0) ||
      (Array.isArray(user?.ownedShops) && user?.ownedShops.length > 0)
  );

  // Robust: verify from API if the quick check fails
  const [hasShopResolved, setHasShopResolved] = useState(computedHasShop);
  useEffect(() => {
    setHasShopResolved(computedHasShop);
  }, [computedHasShop]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const userId = user?.id ?? user?.user_id;
        if (userId && !computedHasShop) {
          const shopsData = await fetchAllShops();
          // Support different response shapes
          let shops = [];
          if (Array.isArray(shopsData?.shops)) shops = shopsData.shops;
          else if (Array.isArray(shopsData?.data?.shops))
            shops = shopsData.data.shops;
          else if (Array.isArray(shopsData?.data)) shops = shopsData.data;
          else if (Array.isArray(shopsData)) shops = shopsData;

          const found = shops.some(
            (s) => String(s?.user_id) === String(userId)
          );
          if (!cancelled && found) setHasShopResolved(true);
        }
      } catch (_) {
        // silent: sidebar visibility shouldn't crash the app
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [user?.id, user?.user_id, computedHasShop]);

  // Menu công khai (giữ mục track orders chung cho shop owners nếu có shop)
  const publicMenu = [
    { icon: Home, label: "Trang Chủ", path: "/home" },
    { icon: ShoppingBag, label: "Khu Mua Sắm", path: "/marketplace" },
    { icon: Cake, label: "Thiết kế bánh", path: "/cake-design" },
    { icon: Trophy, label: "Thử thách", path: "/challenge" },
    // Shop order tracking (dùng component lấy theo shop của user hiện tại)
    { icon: ListOrdered, label: "Đơn hàng của shop", path: "/order-tracking" },
    {
      icon: MessageSquareWarning,
      label: "Khiếu nại của shop",
      path: "/complaints",
    },
  ];

  // Menu cho user thường
  const userMenu = [
    { icon: MessageCircle, label: "Tin nhắn", path: "/chat" },
    { icon: BookImage, label: "Bài viết của tôi", path: "/mypost" },
    { icon: SquareLibrary, label: "Album của tôi", path: "/myalbum" },
    {
      icon: ListOrdered,
      label: "Lịch sử mua hàng",
      path: "/order-tracking-user",
    },
    {
      icon: MessageSquareWarning,
      label: "Khiếu nại của tôi",
      path: "/my-complaints",
    },
    { icon: User, label: "Hồ sơ cá nhân", path: "/profile" },
    { icon: Wallet, label: "Ví tiền", path: "/wallet" },
    { icon: ArrowDownToLine, label: "Yêu cầu rút tiền", path: "/withdraw" },
    { icon: Receipt, label: "Tất cả giao dịch", path: "/all-transactions" },
  ];

  // Menu cho admin/staff
  const adminMenu = [
    { icon: Shield, label: "Admin Dashboard", path: "/admin" },
    {
      icon: ListOrdered,
      label: "Tất cả đơn hàng",
      path: "/admin/order-tracking",
    },
    {
      icon: MessageSquareWarning,
      label: "Tất cả khiếu nại",
      path: "/admin/complaints",
    },
    { icon: Wallet, label: "Quản lý ví tiền", path: "/admin/wallet" },
    {
      icon: CreditCard,
      label: "Tất cả yêu cầu rút tiền",
      path: "/admin/withdraw-requests",
    },
    { icon: Trophy, label: "Admin Challenge", path: "/admin/challenge" },
    { icon: User, label: "Hồ sơ cá nhân", path: "/profile" },
  ];

  // Build menu based on role and shop ownership
  const isAdminRole = ["admin", "account_staff", "staff"].includes(user?.role);

  let menuItems = publicMenu;
  if (user) {
    if (isAdminRole) {
      menuItems = [...publicMenu, ...adminMenu];
      // Optional: also hide Shop Orders if admin account has no shop
      if (!hasShopResolved) {
        menuItems = menuItems.filter((i) => i.path !== "/order-tracking");
      }
    } else {
      menuItems = [...publicMenu, ...userMenu];
      // User thường: chỉ hiển thị mục Khiếu nại (shop) và Shop Orders nếu có shop
      if (!hasShopResolved) {
        menuItems = menuItems.filter(
          (item) =>
            item.path !== "/Khiếu nại đơn hàng" &&
            item.path !== "/order-tracking"
        );
      }
    }
  } else {
    // Khách: ẩn mục Khiếu nại (shop) và Shop Orders
    menuItems = publicMenu.filter(
      (item) =>
        item.path !== "/Khiếu nại của tôi" && item.path !== "/order-tracking"
    );
  }

  useEffect(() => {
    setCollapsed(location.pathname === "/chat");
  }, [location.pathname]);

  return (
    <div
      className={`fixed left-0 top-0 h-full bg-white shadow-lg z-50 transition-all duration-300 ${
        collapsed ? "w-20" : "w-20 lg:w-64"
      } flex flex-col`}
    >
      {/* Nút toggle ẩn/hiện sidebar */}
      <button
        className="absolute top-4 left-4 z-50 bg-pink-100 hover:bg-pink-200 rounded-full p-2 focus:outline-none lg:hidden"
        onClick={() => setCollapsed((v) => !v)}
        aria-label="Ẩn/hiện menu"
      >
        <Menu className="w-6 h-6 text-pink-600" />
      </button>
      {/* Logo & Home button */}
      <div className="p-6 border-b border-gray-200 flex-shrink-0">
        <button
          onClick={() => navigate("/home")}
          className="flex items-center justify-center lg:justify-start lg:space-x-3 w-full hover:opacity-80 transition-opacity"
        >
          <div className="bg-pink-500 p-2 rounded-lg">
            <Cake className="w-6 h-6 text-white" />
          </div>
          {!collapsed && (
            <span className="hidden lg:block text-xl font-bold text-gray-800">
              Cake Story
            </span>
          )}
        </button>
      </div>
      {/* Menu chính */}
      <nav className="flex-grow overflow-y-auto py-6">
        <div className="px-4 space-y-2">
          {menuItems.map(({ icon: Icon, label, path }) => (
            <NavLink
              key={path}
              to={path}
              end={
                ["/admin", "/chat", "/mypost", "/profile"].includes(path)
                  ? true
                  : undefined
              }
              className={({ isActive }) =>
                `flex items-center justify-center ${
                  !collapsed ? "lg:justify-start lg:space-x-3" : ""
                } px-4 py-3 rounded-lg transition-colors ${
                  isActive
                    ? "bg-pink-50 text-pink-600 border-r-2 border-pink-500"
                    : "text-gray-600 hover:bg-gray-50 hover:text-gray-800"
                }`
              }
            >
              <Icon className="w-5 h-5" />
              {!collapsed && (
                <span className="hidden lg:block font-medium">{label}</span>
              )}
            </NavLink>
          ))}
        </div>
      </nav>
      {/* Logout & More options */}
      <div className="p-4 border-t border-gray-200 flex-shrink-0">
        <div className="relative">
          <button
            onClick={() => setShowMore((v) => !v)}
            className="flex items-center justify-center lg:justify-start lg:space-x-3 px-4 py-3 text-gray-600 hover:bg-gray-50 rounded-lg w-full transition-colors"
          >
            <MoreHorizontal className="w-5 h-5" />
            {!collapsed && (
              <span className="hidden lg:block font-medium">My options</span>
            )}
          </button>
          {showMore && (
            <div className="absolute left-0 w-48 bg-white shadow-lg rounded-lg mb-2 bottom-full z-50 border border-gray-100">
              <button
                onClick={() => {
                  setShowMore(false);
                  navigate("/settings");
                }}
                className="flex w-full items-center px-4 py-3 text-gray-700 hover:bg-pink-50 rounded-t-lg"
              >
                <span className="mr-2">⚙️</span> Setting
              </button>
              <button
                onClick={() => {
                  setShowMore(false); /* handle theme toggle here */
                }}
                className="flex w-full items-center px-4 py-3 text-gray-700 hover:bg-pink-50"
              >
                <span className="mr-2">🌗</span> Chuyển chế độ sáng tối
              </button>
              <button
                onClick={() => {
                  setShowMore(false);
                  navigate("/report");
                }}
                className="flex w-full items-center px-4 py-3 text-gray-700 hover:bg-pink-50 rounded-b-lg"
              >
                <span className="mr-2">🚩</span> Report
              </button>
            </div>
          )}
        </div>
        {user ? (
          <button
            onClick={() => {
              logout();
              navigate("/login", { replace: true });
            }}
            className="flex items-center justify-center lg:justify-start lg:space-x-3 px-4 py-3 text-red-600 hover:bg-red-50 rounded-lg w-full transition-colors mt-2"
          >
            <LogOut className="w-5 h-5" />
            {!collapsed && (
              <span className="hidden lg:block font-medium">Sign Out</span>
            )}
          </button>
        ) : (
          <button
            onClick={() => navigate("/login")}
            className="flex items-center justify-center lg:justify-start lg:space-x-3 px-4 py-3 text-pink-600 hover:bg-pink-50 rounded-lg w-full transition-colors mt-2"
          >
            <LogOut className="w-5 h-5" />
            {!collapsed && (
              <span className="hidden lg:block font-medium">Login</span>
            )}
          </button>
        )}
        {!collapsed && (
          <div className="hidden lg:block text-center text-xs text-gray-500 mt-4">
            © 2025 CakeStory. All rights reserved.
          </div>
        )}
      </div>
    </div>
  );
};

export default Sidebar;
