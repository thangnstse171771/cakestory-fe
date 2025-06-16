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
} from "lucide-react";

const Sidebar = ({ onLogout }) => {
  const navigate = useNavigate();

  const handleLogout = () => {
    onLogout();
    navigate("/login");
  };

  const menuItems = [
    { icon: Home, label: "Home", path: "/home" },
    { icon: ShoppingBag, label: "Marketplace", path: "/marketplace" },
    { icon: MessageCircle, label: "Messages", path: "/messages" },
    { icon: PlusCircle, label: "My Post", path: "/mypost" },
    { icon: User, label: "Profile", path: "/profile" },
    { icon: Cake, label: "Cake Design", path: "/cake-design" },
    { icon: Calendar, label: "Events", path: "/events" },
  ];

  return (
    <div className="fixed left-0 top-0 h-full bg-white shadow-lg z-50 transition-all duration-300 w-20 lg:w-64">
      <div className="p-6 border-b border-gray-200">
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

      <nav className="mt-6">
        <div className="px-4 space-y-2">
          {menuItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                `flex items-center justify-center lg:justify-start lg:space-x-3 px-4 py-3 rounded-lg transition-colors ${
                  isActive
                    ? "bg-pink-50 text-pink-600 border-r-2 border-pink-500"
                    : "text-gray-600 hover:bg-gray-50 hover:text-gray-800"
                }`
              }
            >
              <item.icon className="w-5 h-5" />
              <span className="hidden lg:block font-medium">{item.label}</span>
            </NavLink>
          ))}
        </div>
      </nav>

      <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-200">
        <button
          onClick={() => {}}
          className="flex items-center justify-center lg:justify-start lg:space-x-3 px-4 py-3 text-gray-600 hover:bg-gray-50 rounded-lg w-full transition-colors"
        >
          <MoreHorizontal className="w-5 h-5" />
          <span className="hidden lg:block font-medium">More options</span>
        </button>

        <button
          onClick={handleLogout}
          className="flex items-center justify-center lg:justify-start lg:space-x-3 px-4 py-3 text-red-600 hover:bg-red-50 rounded-lg w-full transition-colors mt-2"
        >
          <LogOut className="w-5 h-5" />
          <span className="hidden lg:block font-medium">Sign Out</span>
        </button>

        <div className="hidden lg:block text-center text-xs text-gray-500 mt-4">
          © 2025 CakeStory. All rights reserved.
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
