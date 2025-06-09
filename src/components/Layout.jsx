import { Outlet } from "react-router-dom";
import Sidebar from "./Sidebar";

const Layout = ({ onLogout }) => {
  return (
    <div className="min-h-screen">
      <div className="flex">
        <Sidebar onLogout={onLogout} />
        <main className="flex-1 ml-20 lg:ml-64 p-6 transition-all duration-300">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default Layout;
