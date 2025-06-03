import { Outlet } from "react-router-dom";
import Sidebar from "./Sidebar";

const Layout = ({ onLogout }) => {
  return (
    <div className="min-h-screen">
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
