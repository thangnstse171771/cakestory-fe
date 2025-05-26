import { Outlet } from "react-router-dom";
import Sidebar from "./Sidebar";

const Layout = ({ onLogout }) => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 to-pink-100">
      <div className="flex">
        <Sidebar onLogout={onLogout} />
        <main className="flex-1 ml-64">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default Layout;
