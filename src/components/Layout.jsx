import { Outlet, useLocation } from "react-router-dom";
import Sidebar from "./Sidebar";
import { useAuth } from "../contexts/AuthContext"; // Giả định bạn có hook này

const Layout = () => {
  const { user } = useAuth(); // kiểm tra người dùng đã đăng nhập chưa
  const location = useLocation();

  // Nếu đang ở trang login, signup hoặc landing thì không render Sidebar
  const isAuthPage =
    location.pathname === "/login" ||
    location.pathname === "/signup" ||
    location.pathname === "/";

  const isChatPage = location.pathname === "/chat";

  // Nếu là landing page thì không có padding và margin
  const isLandingPage = location.pathname === "/";

  return (
    <div className="min-h-screen">
      <div className="flex">
        {/* Luôn hiển thị Sidebar nếu không phải trang login/signup/landing */}
        {!isAuthPage && <Sidebar />}

        <main
          className={`flex-1 ${
            !isAuthPage && !isChatPage ? "ml-20 lg:ml-72" : ""
          } ${isLandingPage ? "" : "p-6"} transition-all duration-300`}
        >
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default Layout;
