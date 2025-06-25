// src/components/Sidebar.jsx
import { NavLink, useNavigate } from "react-router-dom";
import {
  Home,
  ShoppingBag,
  MessageCircle,
  PlusCircle,
  User,
  Cake,
  Calendar,
  LogOut,
  MoreHorizontal,
  Shield,
  Wallet,
  CreditCard,
  Trophy,
} from "lucide-react";
import { useAuth } from "../contexts/AuthContext";

const Sidebar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login", { replace: true });
  };

  // Các mục public cho guest và user
  const publicMenu = [
    { icon: Home, label: "Home", path: "/home" },
    { icon: ShoppingBag, label: "Marketplace", path: "/marketplace" },
    { icon: Cake, label: "Cake Design", path: "/cake-design" },
    { icon: Calendar, label: "Events", path: "/events" },
    { icon: Trophy, label: "Challenge", path: "/challenge" },
  ];
  // Các mục chỉ dành cho user đã login
  const privateMenu = [
    { icon: MessageCircle, label: "Messages", path: "/messages" },
    { icon: PlusCircle, label: "My Post", path: "/mypost" },
    { icon: User, label: "Profile", path: "/profile" },
    { icon: Shield, label: "Admin Dashboard", path: "/admin" },
    { icon: Wallet, label: "Quản Lý Ví", path: "/admin/wallet" },
    {
      icon: CreditCard,
      label: "Yêu Cầu Rút Tiền",
      path: "/admin/withdraw-requests",
    },
  ];
  const menuItems = user ? [...publicMenu, ...privateMenu] : publicMenu;

  return (
    <div className="fixed left-0 top-0 h-full bg-white shadow-lg z-50 transition-all duration-300 w-20 lg:w-64 flex flex-col">
      {/* Logo & Home button */}
      <div className="p-6 border-b border-gray-200 flex-shrink-0">
        <button
          onClick={() => navigate("/home")}
          className="flex items-center justify-center lg:justify-start lg:space-x-3 w-full hover:opacity-80 transition-opacity"
        >
          <div className="bg-pink-500 p-2 rounded-lg">
            <Cake className="w-6 h-6 text-white" />
          </div>
          <span className="hidden lg:block text-xl font-bold text-gray-800">
            Cake Story
          </span>
        </button>
      </div>

      {/* Menu chính */}
      <nav className="flex-grow overflow-y-auto py-6">
        <div className="px-4 space-y-2">
          {menuItems.map(({ icon: Icon, label, path }) => (
            <NavLink
              key={path}
              to={path}
              className={({ isActive }) =>
                `flex items-center justify-center lg:justify-start lg:space-x-3 px-4 py-3 rounded-lg transition-colors ${
                  isActive
                    ? "bg-pink-50 text-pink-600 border-r-2 border-pink-500"
                    : "text-gray-600 hover:bg-gray-50 hover:text-gray-800"
                }`
              }
            >
              <Icon className="w-5 h-5" />
              <span className="hidden lg:block font-medium">{label}</span>
            </NavLink>
          ))}
        </div>
      </nav>

      {/* Logout & More options */}
      <div className="p-4 border-t border-gray-200 flex-shrink-0">
        <button
          onClick={() => {}}
          className="flex items-center justify-center lg:justify-start lg:space-x-3 px-4 py-3 text-gray-600 hover:bg-gray-50 rounded-lg w-full transition-colors"
        >
          <MoreHorizontal className="w-5 h-5" />
          <span className="hidden lg:block font-medium">More options</span>
        </button>
        {user ? (
          <button
            onClick={handleLogout}
            className="flex items-center justify-center lg:justify-start lg:space-x-3 px-4 py-3 text-red-600 hover:bg-red-50 rounded-lg w-full transition-colors mt-2"
          >
            <LogOut className="w-5 h-5" />
            <span className="hidden lg:block font-medium">Sign Out</span>
          </button>
        ) : (
          <button
            onClick={() => navigate("/login")}
            className="flex items-center justify-center lg:justify-start lg:space-x-3 px-4 py-3 text-pink-600 hover:bg-pink-50 rounded-lg w-full transition-colors mt-2"
          >
            <LogOut className="w-5 h-5" />
            <span className="hidden lg:block font-medium">Login</span>
          </button>
        )}
        <div className="hidden lg:block text-center text-xs text-gray-500 mt-4">
          © 2025 CakeStory. All rights reserved.
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
