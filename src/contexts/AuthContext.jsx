import { createContext, useContext, useState, useEffect } from "react";
import { authAPI } from "../api/auth";
import { add } from "date-fns";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  // Initialize user from localStorage where we persist minimal user info
  const [user, setUser] = useState(() => {
    try {
      const raw = localStorage.getItem("user");
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Fallback: if localStorage is empty, try authAPI to hydrate
    (async () => {
      try {
        if (!user) {
          const currentUser = authAPI.getCurrentUser();
          if (currentUser) setUser(currentUser);
        }
      } catch (e) {
        // ignore
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const login = async (credentials) => {
    try {
      const response = await authAPI.login(credentials);
      localStorage.setItem("token", response.token);
      if (response.user) {
        // persist minimal, safe user fields
        const safe = {
          id: response.user.id,
          username: response.user.username,
          role: response.user.role,
          full_name: response.user.full_name,
          email: response.user.email,
          phone_number: response.user.phone_number,
          address: response.user.address,
          firebase_uid: response.user.firebase_uid,
        };
        try {
          localStorage.setItem("user", JSON.stringify(safe));
        } catch {}
        setUser(safe);
      }
      return response;
    } catch (error) {
      throw error;
    }
  };

  const register = async (userData) => {
    try {
      const response = await authAPI.register(userData);
      // Không tự động đăng nhập sau khi đăng ký
      return response;
    } catch (error) {
      throw error;
    }
  };

  const logout = () => {
    authAPI.logout();
    try {
      localStorage.removeItem("user");
      localStorage.removeItem("token");
    } catch {}
    setUser(null);
  };

  // Force re-fetch current user from API (e.g., after profile update)
  const refreshUser = async () => {
    try {
      if (!user?.id) return null;
      const data = await authAPI.getUserById(user.id);
      const fresh = data.user || data; // backend may wrap user
      if (fresh) {
        localStorage.setItem("user", JSON.stringify(fresh));
        setUser(fresh);
      }
      return fresh;
    } catch (e) {
      console.warn("refreshUser failed", e);
      return null;
    }
  };

  // Ensure isAuthenticated reads from the stored user state
  const value = {
    user,
    loading,
    login,
    register,
    logout,
    refreshUser,
    setUser, // optionally expose for advanced flows
    isAuthenticated: () => !!user,
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
