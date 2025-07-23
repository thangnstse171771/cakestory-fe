import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";

/**
 * @param {ReactNode} children - Component con
 * @param {Array<string>} allowedRoles - Danh sách role được phép truy cập
 */
const ProtectedRoute = ({ children, allowedRoles }) => {
  const { user, loading, isAuthenticated } = useAuth();
  const location = useLocation();

  if (loading) return <div>Loading...</div>;

  if (!isAuthenticated()) {
    // Chưa đăng nhập, chuyển về login
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (allowedRoles && allowedRoles.length > 0) {
    // Nếu user không có role phù hợp thì chuyển về home hoặc trang 403
    if (!user || !allowedRoles.includes(user.role)) {
      return <Navigate to="/home" replace />;
    }
  }

  return children;
};

export default ProtectedRoute;
