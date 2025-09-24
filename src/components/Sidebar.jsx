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
  ChevronDown,
  ChevronRight,
  Store,
  LogIn,
  Star,
  Search,
  FileText,
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
  const [expandedMenus, setExpandedMenus] = useState({});

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
  const [userShop, setUserShop] = useState(null);

  useEffect(() => {
    setHasShopResolved(computedHasShop);
  }, [computedHasShop]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const userId = user?.id ?? user?.user_id;
        if (userId) {
          const shopsData = await fetchAllShops();
          // Support different response shapes
          let shops = [];
          if (Array.isArray(shopsData?.shops)) shops = shopsData.shops;
          else if (Array.isArray(shopsData?.data?.shops))
            shops = shopsData.data.shops;
          else if (Array.isArray(shopsData?.data)) shops = shopsData.data;
          else if (Array.isArray(shopsData)) shops = shopsData;

          const foundShop = shops.find(
            (s) => String(s?.user_id) === String(userId)
          );
          if (!cancelled) {
            if (foundShop) {
              setHasShopResolved(true);
              setUserShop(foundShop);
            } else {
              setHasShopResolved(false);
              setUserShop(null);
            }
          }
        }
      } catch (_) {
        // silent: sidebar visibility shouldn't crash the app
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [user?.id, user?.user_id, computedHasShop]);

  // Auto-expand menus based on current location
  useEffect(() => {
    const currentPath = location.pathname;
    const newExpandedMenus = {};

    // Define path patterns for each parent menu
    const menuPathMappings = {
      "Khu Mua Sắm": [
        "/marketplace",
        "/order-tracking",
        "/my-complaints",
        "/order-tracking-user",
        "/my-orders-reviews",
        "/complaints",
      ],
      "Thiết kế bánh": ["/cake-design", "/cake-quotes", "/shop-quotes"],
      "Hồ sơ cá nhân": ["/profile", "/mypost", "/myalbum"],
      "Ví tiền": [
        "/wallet",
        "/withdraw",
        "/all-transactions",
        "/wallet/transactions",
      ],
      "Cửa Hàng của Tôi": ["/order-tracking", "/complaints"],
      "Tùy chọn khác": ["/settings", "/change-password"],
    };

    // Check if current path belongs to any parent menu
    Object.entries(menuPathMappings).forEach(([menuKey, paths]) => {
      if (paths.some((path) => currentPath.startsWith(path))) {
        newExpandedMenus[menuKey] = true;
      }
    });

    setExpandedMenus((prev) => ({
      ...prev,
      ...newExpandedMenus,
    }));
  }, [location.pathname]);

  // Menu công khai
  const publicMenu = [
    { icon: Home, label: "Trang Chủ", path: "/home" },
    {
      icon: ShoppingBag,
      label: "Khu Mua Sắm",
      path: "/marketplace",
      submenu: [
        // Submenu cho shop owner
        ...(hasShopResolved && userShop
          ? [
              {
                icon: Store,
                label: "Cửa Hàng của Tôi",
                path: `/marketplace/shop/${userShop.user_id}`,
                submenu: [
                  {
                    icon: ListOrdered,
                    label: "Đơn hàng",
                    path: "/order-tracking",
                  },
                  {
                    icon: MessageSquareWarning,
                    label: "Khiếu nại khách hàng",
                    path: "/complaints",
                  },
                ],
              },
            ]
          : []),
        // Submenu cho user thường (lịch sử mua hàng và khiếu nại)
        ...(user
          ? [
              {
                icon: ListOrdered,
                label: "Lịch sử mua hàng",
                path: "/order-tracking-user",
              },
              {
                icon: Star,
                label: "Đơn hàng & Đánh giá",
                path: "/my-orders-reviews",
              },
              {
                icon: MessageSquareWarning,
                label: "Khiếu nại của tôi",
                path: "/my-complaints",
              },
            ]
          : []),
      ],
    },
    {
      icon: Cake,
      label: "Thiết kế bánh",
      path: "/cake-design",
      submenu: [
        {
          icon: Search,
          label: "Tìm Thợ Làm Bánh",
          path: "/cake-quotes",
        },
        {
          icon: FileText,
          label: "Thiết Kế Cần Báo Giá",
          path: "/shop-quotes",
        },
      ],
    },
    { icon: Trophy, label: "Thử thách", path: "/challenge" },
  ];

  // Menu cho user thường
  const userMenu = [
    { icon: MessageCircle, label: "Tin nhắn", path: "/chat" },
    {
      icon: User,
      label: "Hồ sơ cá nhân",
      path: "/profile",
      submenu: [
        { icon: BookImage, label: "Bài viết của tôi", path: "/mypost" },
        { icon: SquareLibrary, label: "Album của tôi", path: "/myalbum" },
      ],
    },
    {
      icon: Wallet,
      label: "Ví tiền",
      path: "/wallet",
      submenu: [
        { icon: ArrowDownToLine, label: "Yêu cầu rút tiền", path: "/withdraw" },
        { icon: Receipt, label: "Tất cả giao dịch", path: "/all-transactions" },
        // {
        //   icon: Receipt,
        //   label: "Giao dịch ví chi tiết",
        //   path: "/wallet/transactions",
        // },
      ],
    },
  ];

  // Menu cho admin/staff
  const isAdmin = user?.role === "admin";
  const adminMenu = [
    // Chỉ admin mới thấy bảng điều khiển quản trị
    ...(isAdmin
      ? [{ icon: Shield, label: "Bảng điều khiển quản trị", path: "/admin" }]
      : []),
    {
      icon: ListOrdered,
      label: "Tất cả đơn hàng",
      path: "/admin/order-tracking",
    },
    { icon: MessageCircle, label: "Tin nhắn", path: "/chat" },
    {
      icon: MessageSquareWarning,
      label: "Tất cả khiếu nại",
      path: "/admin/complaints",
    },
    { icon: Wallet, label: "Quản lý ví hệ thống", path: "/admin/wallet" },
    {
      icon: CreditCard,
      label: "Tất cả yêu cầu rút tiền",
      path: "/admin/withdraw-requests",
    },
    { icon: Trophy, label: "Quản lý thử thách", path: "/admin/challenge" },
    { icon: User, label: "Hồ sơ cá nhân", path: "/profile" },
  ];

  // Build menu based on role and shop ownership
  const isAdminRole = ["admin", "account_staff", "staff"].includes(user?.role);

  let menuItems = publicMenu;
  if (user) {
    if (isAdminRole) {
      menuItems = [...publicMenu, ...adminMenu];
    } else {
      menuItems = [...publicMenu, ...userMenu];
    }
  }

  const toggleMenu = (menuKey) => {
    if (collapsed) return; // Không expand khi sidebar bị collapsed

    const currentPath = location.pathname;
    const menuPathMappings = {
      "Khu Mua Sắm": [
        "/marketplace",
        "/order-tracking",
        "/my-complaints",
        "/order-tracking-user",
        "/my-orders-reviews",
        "/complaints",
      ],
      "Thiết kế bánh": ["/cake-design", "/cake-quotes", "/shop-quotes"],
      "Hồ sơ cá nhân": ["/profile", "/mypost", "/myalbum"],
      "Ví tiền": [
        "/wallet",
        "/withdraw",
        "/all-transactions",
        "/wallet/transactions",
      ],
      "Cửa Hàng của Tôi": ["/order-tracking", "/complaints"],
      "Tùy chọn khác": ["/settings", "/change-password"],
    };

    // Nếu đang ở trong trang con của menu này, không đóng menu
    const isCurrentlyInThisMenu = menuPathMappings[menuKey]?.some((path) =>
      currentPath.startsWith(path)
    );

    setExpandedMenus((prev) => ({
      ...prev,
      [menuKey]: isCurrentlyInThisMenu ? true : !prev[menuKey],
    }));
  };

  const renderMenuItem = (item, depth = 0) => {
    const hasSubmenu = item.submenu && item.submenu.length > 0;
    const isExpanded = expandedMenus[item.label];
    const paddingLeft = depth === 0 ? "px-4" : depth === 1 ? "px-6" : "px-8";

    return (
      <div key={item.path || item.label}>
        {/* Main menu item */}
        {item.path && !hasSubmenu ? (
          // Trường hợp 1: Chỉ có path, không có submenu
          <NavLink
            to={item.path}
            end={
              ["/admin", "/chat", "/mypost", "/profile"].includes(item.path)
                ? true
                : undefined
            }
            className={({ isActive }) =>
              `flex items-center justify-center ${
                !collapsed ? "lg:justify-start lg:space-x-3" : ""
              } ${paddingLeft} py-3 rounded-xl transition-all duration-200 group ${
                isActive
                  ? "bg-gradient-to-r from-pink-50 to-pink-100 text-pink-700 border-r-4 border-pink-500 shadow-sm font-medium"
                  : "text-gray-600 hover:bg-pink-50 hover:text-pink-800 hover:shadow-sm"
              }`
            }
          >
            <item.icon className="w-5 h-5 transition-all duration-200" />
            {!collapsed && (
              <span className="hidden lg:block font-medium text-sm tracking-wide">
                {item.label}
              </span>
            )}
          </NavLink>
        ) : hasSubmenu && item.path ? (
          // Trường hợp 2: Có cả path và submenu
          <>
            <div className="flex items-center">
              <NavLink
                to={item.path}
                className={({ isActive }) =>
                  `flex items-center justify-center ${
                    !collapsed ? "lg:justify-start lg:space-x-3" : ""
                  } ${paddingLeft} py-3 rounded-xl transition-all duration-200 group flex-1 ${
                    isActive
                      ? "bg-gradient-to-r from-pink-50 to-pink-100 text-pink-700 border-r-4 border-pink-500 shadow-sm font-medium"
                      : "text-gray-600 hover:bg-pink-50 hover:text-pink-800 hover:shadow-sm"
                  }`
                }
              >
                <item.icon className="w-5 h-5 transition-all duration-200" />
                {!collapsed && (
                  <span className="hidden lg:block font-medium text-sm tracking-wide">
                    {item.label}
                  </span>
                )}
              </NavLink>
              {!collapsed && (
                <button
                  onClick={() => toggleMenu(item.label)}
                  className="px-2 py-3 text-gray-400 hover:text-pink-500 transition-colors duration-200"
                >
                  {isExpanded ? (
                    <ChevronDown className="w-4 h-4" />
                  ) : (
                    <ChevronRight className="w-4 h-4" />
                  )}
                </button>
              )}
            </div>
          </>
        ) : hasSubmenu ? (
          // Trường hợp 3: Chỉ có submenu, không có path
          <>
            <button
              onClick={() => toggleMenu(item.label)}
              className={`flex items-center justify-center ${
                !collapsed ? "lg:justify-between" : ""
              } ${paddingLeft} py-3 rounded-xl transition-all duration-200 text-gray-600 hover:bg-pink-50 hover:text-pink-800 hover:shadow-sm w-full group`}
            >
              <div
                className={`flex items-center ${
                  !collapsed ? "lg:space-x-3" : ""
                }`}
              >
                <item.icon className="w-5 h-5 transition-all duration-200 group-hover:scale-110" />
                {!collapsed && (
                  <span className="hidden lg:block font-medium text-sm tracking-wide">
                    {item.label}
                  </span>
                )}
              </div>
              {!collapsed && hasSubmenu && (
                <div className="hidden lg:block">
                  {isExpanded ? (
                    <ChevronDown className="w-4 h-4 transition-all duration-200 text-gray-400 group-hover:text-pink-500" />
                  ) : (
                    <ChevronRight className="w-4 h-4 transition-all duration-200 text-gray-400 group-hover:text-pink-500" />
                  )}
                </div>
              )}
            </button>
          </>
        ) : null}

        {/* Submenu items */}
        {hasSubmenu && isExpanded && !collapsed && (
          <div className="ml-6 mt-1 space-y-1 border-l-2 border-pink-100 pl-4">
            {item.submenu.map((subItem) => renderMenuItem(subItem, depth + 1))}
          </div>
        )}
      </div>
    );
  };

  useEffect(() => {
    setCollapsed(location.pathname === "/chat");
  }, [location.pathname]);

  return (
    <div
      className={`fixed left-0 top-0 h-full bg-white shadow-xl z-50 transition-all duration-300 border-r border-pink-200 ${
        collapsed ? "w-20" : "w-20 lg:w-72"
      } flex flex-col`}
    >
      {/* Nút toggle ẩn/hiện sidebar */}
      <button
        className="absolute top-4 left-4 z-50 bg-pink-100 hover:bg-pink-200 rounded-lg p-2 focus:outline-none lg:hidden shadow-sm transition-all duration-200"
        onClick={() => setCollapsed((v) => !v)}
        aria-label="Ẩn/hiện menu"
      >
        <Menu className="w-5 h-5 text-pink-600" />
      </button>
      {/* Logo & Home button */}
      <div className="p-6 border-b border-pink-200 flex-shrink-0 bg-gradient-to-r from-pink-50 to-white">
        <button
          onClick={() => navigate("/home")}
          className="flex items-center justify-center lg:justify-start lg:space-x-3 w-full hover:opacity-90 transition-all duration-200 group"
        >
          <div className="bg-gradient-to-br from-pink-500 to-pink-600 p-2.5 rounded-xl shadow-lg group-hover:shadow-xl transition-all duration-200">
            <Cake className="w-6 h-6 text-white" />
          </div>
          {!collapsed && (
            <div className="hidden lg:block">
              <span className="text-xl font-bold text-gray-800 tracking-tight">
                CakeStory
              </span>
            </div>
          )}
        </button>
      </div>
      {/* Menu chính */}
      <nav className="flex-grow overflow-y-auto py-4 bg-gradient-to-b from-pink-50/50 to-white">
        <div className="px-3 space-y-1">
          {menuItems.map((item) => renderMenuItem(item))}
        </div>
      </nav>
      {/* Logout & More options */}
      <div className="p-4 border-t border-pink-200 flex-shrink-0 bg-pink-50/50">
        <div className="relative">
          <button
            onClick={() => setShowMore((v) => !v)}
            className="flex items-center justify-center lg:justify-start lg:space-x-3 px-4 py-3 text-gray-600 hover:bg-white hover:shadow-sm rounded-xl w-full transition-all duration-200 group border border-transparent hover:border-pink-200"
          >
            <MoreHorizontal className="w-5 h-5 group-hover:scale-110 transition-transform duration-200" />
            {!collapsed && (
              <span className="hidden lg:block font-medium text-sm tracking-wide">
                Tùy chọn khác
              </span>
            )}
          </button>
          {showMore && (
            <div className="absolute left-0 w-56 bg-white shadow-2xl rounded-xl mb-2 bottom-full z-50 border border-pink-200 overflow-hidden">
              <button
                onClick={() => {
                  setShowMore(false);
                  navigate("/change-password");
                }}
                className="flex w-full items-center px-4 py-3 text-gray-700 hover:bg-pink-50 transition-all duration-200 group"
              >
                <span className="mr-3 text-lg">🔐</span>
                <span className="font-medium text-sm">Đổi mật khẩu</span>
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
            className="flex items-center justify-center lg:justify-start lg:space-x-3 px-4 py-3 text-red-600 hover:bg-red-50 rounded-xl w-full transition-all duration-200 mt-2 group border border-transparent hover:border-red-200 hover:shadow-sm"
          >
            <LogOut className="w-5 h-5 group-hover:scale-110 transition-transform duration-200" />
            {!collapsed && (
              <span className="hidden lg:block font-medium text-sm tracking-wide">
                Đăng xuất
              </span>
            )}
          </button>
        ) : (
          <button
            onClick={() => navigate("/login")}
            className="flex items-center justify-center lg:justify-start lg:space-x-3 px-4 py-3 text-pink-600 hover:bg-pink-50 rounded-xl w-full transition-all duration-200 mt-2 group border border-transparent hover:border-pink-200 hover:shadow-sm"
          >
            <LogIn className="w-5 h-5 group-hover:scale-110 transition-transform duration-200" />
            {!collapsed && (
              <span className="hidden lg:block font-medium text-sm tracking-wide">
                Đăng nhập
              </span>
            )}
          </button>
        )}
        {!collapsed && (
          <div className="hidden lg:block text-center text-xs text-pink-400 mt-4 font-medium">
            © 2025 CakeStory Enterprise. Tất cả quyền được bảo lưu.
          </div>
        )}
      </div>
    </div>
  );
};

export default Sidebar;
