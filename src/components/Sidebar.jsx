// src/components/Sidebar.jsx
import { NavLink } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";

const Sidebar = () => {
  const { user } = useAuth();

  // Menu chuẩn hóa roles
  const menu = [
    {
      label: "Home",
      path: "/",
      roles: ["Customer", "Admin", "Manager", "Staff"],
    },
    {
      label: "About",
      path: "/about",
      roles: ["Customer", "Admin", "Manager", "Staff"],
    },
    { label: "Manage Koi", path: "/manage-koi", roles: ["Customer"] },
    { label: "My Koi", path: "/manage-koi/my-koi", roles: ["Customer"] },
    {
      label: "My Koi Profile",
      path: "/manage-koi/my-koi/:id",
      roles: ["Customer", "Admin", "Manager", "Staff"],
    },
    {
      label: "My Pond",
      path: "/manage-koi/my-pond",
      roles: ["Customer", "Admin", "Manager", "Staff"],
    },
    {
      label: "Water Parameters",
      path: "/manage-koi/water-parameters",
      roles: ["Customer", "Admin", "Manager"],
    },
    {
      label: "Profile",
      path: "/profile",
      roles: ["Customer", "Admin", "Manager", "Staff"],
    },
    {
      label: "Shop Center",
      path: "/ShopCenter",
      roles: ["Customer", "Admin", "Manager", "Staff"],
    },
    {
      label: "Pond Profile",
      path: "/pond-profile/:id",
      roles: ["Customer", "Admin", "Manager", "Staff"],
    },
    {
      label: "Manage Workplace",
      path: "/ManageWorkplace",
      roles: ["Admin", "Manager", "Staff"],
    },
    {
      label: "Recommendations",
      path: "/manage-koi/recommendations",
      roles: ["Customer", "Manager", "Staff"],
    },
    {
      label: "Recommendations Detail",
      path: "/manage-koi/recommendations/:id",
      roles: ["Customer", "Manager", "Staff"],
    },
    {
      label: "Blog Management",
      path: "/BlogManagement",
      roles: ["Admin", "Manager", "Staff"],
    },
    {
      label: "Blog",
      path: "/blog",
      roles: ["Customer", "Admin", "Manager", "Staff"],
    },
    {
      label: "Product Details",
      path: "/productDetails/:id",
      roles: ["Manager", "Staff"],
    },
  ];

  // Menu public cho guest
  const publicMenu = [
    { label: "Home", path: "/" },
    { label: "About", path: "/about" },
    { label: "Blog", path: "/blog" },
  ];

  let filteredMenu = publicMenu;
  if (user) {
    filteredMenu = menu.filter((item) => item.roles.includes(user.role));
  }

  return (
    <nav className="sidebar-menu">
      {filteredMenu.map((item) => (
        <NavLink
          key={item.path}
          to={item.path}
          end={item.path === "/" ? true : undefined}
        >
          {item.label}
        </NavLink>
      ))}
    </nav>
  );
};

export default Sidebar;
