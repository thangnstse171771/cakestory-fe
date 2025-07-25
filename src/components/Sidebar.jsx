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
} from "lucide-react";
import { useAuth } from "../contexts/AuthContext";
import { useState, useEffect } from "react";

const Sidebar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [showMore, setShowMore] = useState(false);
  const [collapsed, setCollapsed] = useState(false);

  // Menu cho mọi người
  const publicMenu = [
    { icon: Home, label: "Home", path: "/home" },
    { icon: ShoppingBag, label: "Marketplace", path: "/marketplace" },
    { icon: Cake, label: "Cake Design", path: "/cake-design" },
    { icon: Calendar, label: "Events", path: "/events" },
    { icon: Trophy, label: "Challenge", path: "/challenge" },
  ];
  // Menu cho user thường
  const userMenu = [
    { icon: MessageCircle, label: "Messages", path: "/chat" },
    { icon: BookImage, label: "My Post", path: "/mypost" },
    { icon: User, label: "Profile", path: "/profile" },
  ];
  // Menu cho admin/staff
  const adminMenu = [
    { icon: Shield, label: "Admin Dashboard", path: "/admin" },
    { icon: Wallet, label: "Quản Lý Ví", path: "/admin/wallet" },
    {
      icon: CreditCard,
      label: "Yêu Cầu Rút Tiền",
      path: "/admin/withdraw-requests",
    },
    { icon: Trophy, label: "Admin Challenge", path: "/admin/challenge" },
    { icon: User, label: "Profile", path: "/profile" }, // Thêm mục Profile cho admin
  ];

  let menuItems = publicMenu;
  if (user) {
    if (["admin", "account_staff", "staff"].includes(user.role)) {
      menuItems = [...publicMenu, ...adminMenu];
    } else {
      menuItems = [...publicMenu, ...userMenu];
    }
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
