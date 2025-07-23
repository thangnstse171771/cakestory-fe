import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";

const ProtectedRoute = ({ allowedRoles, children }) => {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) return <div>Loading...</div>;

  if (!user) {
    // Chưa đăng nhập, chuyển về login
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    // Không đủ quyền, chuyển về trang chủ hoặc trang báo lỗi
    return <Navigate to="/" replace />;
  }

  return children;
};

export default ProtectedRoute;
