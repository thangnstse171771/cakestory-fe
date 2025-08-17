"use client";

import { useState } from "react";
import {
  Cake,
  Eye,
  EyeOff,
  Palette,
  Store,
  ShoppingCart,
  Heart,
  Star,
  Sparkles,
  CakeSlice,
} from "lucide-react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";

const Login = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const response = await login(formData);
      // Redirect theo role
      const user = response.user;
      if (
        user &&
        (user.role === "admin" ||
          user.role === "account_staff" ||
          user.role === "staff")
      ) {
        navigate("/admin", { replace: true });
      } else {
        // Redirect to the page they tried to visit or home
        const from = location.state?.from?.pathname || "/home";
        navigate(from, { replace: true });
      }
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Đăng nhập thất bại. Vui lòng kiểm tra lại thông tin đăng nhập."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Background Image */}
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage: `url('https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=1920&h=1080&fit=crop&crop=center')`,
        }}
      >
        <div className="absolute inset-0 bg-gradient-to-br from-pink-900/80 via-purple-900/70 to-orange-900/80"></div>
      </div>

      {/* Floating Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 text-pink-300/30 animate-bounce">
          <CakeSlice size={40} />
        </div>
        <div className="absolute top-40 right-20 text-orange-300/30 animate-pulse">
          <Heart size={32} />
        </div>
        <div className="absolute bottom-40 left-20 text-purple-300/30 animate-bounce delay-1000">
          <Star size={28} />
        </div>
        <div className="absolute bottom-20 right-40 text-pink-300/30 animate-pulse delay-500">
          <Sparkles size={36} />
        </div>
      </div>

      {/* Main Content */}
      <div className="relative z-10 min-h-screen flex items-center justify-center p-4">
        <div className="w-full max-w-7xl mx-auto">
          <div className="bg-white/10 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/20 overflow-hidden">
            <div className="flex flex-col lg:flex-row min-h-[700px]">
              {/* Left Side - Branding & Features */}
              <div className="lg:w-3/5 p-12 lg:p-16 text-white relative">
                <div className="absolute inset-0 bg-gradient-to-br from-pink-500/20 to-purple-600/20 rounded-l-3xl"></div>
                <div className="relative z-10 h-full flex flex-col justify-center">
                  {/* Brand Header */}
                  <div className="text-center lg:text-left mb-12">
                    <div className="flex items-center justify-center lg:justify-start gap-3 mb-6">
                      <div className="bg-gradient-to-r from-pink-500 to-orange-500 p-3 rounded-2xl">
                        <CakeSlice className="w-8 h-8 text-white" />
                      </div>
                      <h1 className="text-5xl lg:text-6xl font-bold bg-gradient-to-r from-pink-200 to-orange-200 bg-clip-text text-transparent">
                        CakeStory
                      </h1>
                    </div>
                    <p className="text-xl lg:text-2xl text-pink-100 font-light mb-4">
                      Nơi Mỗi Chiếc Bánh Kể Câu Chuyện Riêng
                    </p>
                    <p className="text-pink-200/80 max-w-lg">
                      Tham gia cộng đồng sáng tạo bánh ngọt lớn nhất Việt Nam
                    </p>
                  </div>

                  {/* Features Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
                    <div className="group">
                      <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20 hover:bg-white/20 transition-all duration-300">
                        <div className="bg-gradient-to-r from-pink-500 to-rose-500 p-3 rounded-xl w-fit mb-4 group-hover:scale-110 transition-transform">
                          <Palette className="w-6 h-6 text-white" />
                        </div>
                        <h3 className="font-bold text-lg mb-2">AI Designer</h3>
                        <p className="text-pink-100/80 text-sm">
                          Thiết kế bánh với AI thông minh
                        </p>
                      </div>
                    </div>

                    <div className="group">
                      <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20 hover:bg-white/20 transition-all duration-300">
                        <div className="bg-gradient-to-r from-purple-500 to-indigo-500 p-3 rounded-xl w-fit mb-4 group-hover:scale-110 transition-transform">
                          <Store className="w-6 h-6 text-white" />
                        </div>
                        <h3 className="font-bold text-lg mb-2">Marketplace</h3>
                        <p className="text-pink-100/80 text-sm">
                          Mua bán bánh trong cộng đồng
                        </p>
                      </div>
                    </div>

                    <div className="group">
                      <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20 hover:bg-white/20 transition-all duration-300">
                        <div className="bg-gradient-to-r from-orange-500 to-yellow-500 p-3 rounded-xl w-fit mb-4 group-hover:scale-110 transition-transform">
                          <ShoppingCart className="w-6 h-6 text-white" />
                        </div>
                        <h3 className="font-bold text-lg mb-2">Custom Order</h3>
                        <p className="text-pink-100/80 text-sm">
                          Đặt bánh theo yêu cầu riêng
                        </p>
                      </div>
                    </div>

                    <div className="group">
                      <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20 hover:bg-white/20 transition-all duration-300">
                        <div className="bg-gradient-to-r from-emerald-500 to-teal-500 p-3 rounded-xl w-fit mb-4 group-hover:scale-110 transition-transform">
                          <Sparkles className="w-6 h-6 text-white" />
                        </div>
                        <h3 className="font-bold text-lg mb-2">Challenges</h3>
                        <p className="text-pink-100/80 text-sm">
                          Tham gia thử thách sáng tạo
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Stats */}
                  <div className="grid grid-cols-3 gap-6 text-center">
                    <div className="bg-white/5 backdrop-blur-sm rounded-xl p-4 border border-white/10">
                      <div className="text-2xl font-bold text-pink-200">
                        25K+
                      </div>
                      <div className="text-pink-300/80 text-sm">Thành viên</div>
                    </div>
                    <div className="bg-white/5 backdrop-blur-sm rounded-xl p-4 border border-white/10">
                      <div className="text-2xl font-bold text-orange-200">
                        1.2K+
                      </div>
                      <div className="text-orange-300/80 text-sm">Cửa hàng</div>
                    </div>
                    <div className="bg-white/5 backdrop-blur-sm rounded-xl p-4 border border-white/10">
                      <div className="text-2xl font-bold text-purple-200">
                        50K+
                      </div>
                      <div className="text-purple-300/80 text-sm">
                        Bánh đã bán
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Right Side - Login Form */}
              <div className="lg:w-2/5 p-12 lg:p-16 bg-white/5 backdrop-blur-xl border-l border-white/20">
                <div className="h-full flex flex-col justify-center max-w-md mx-auto">
                  {/* Form Header */}
                  <div className="text-center mb-8">
                    <div className="bg-gradient-to-r from-pink-500 to-orange-500 w-20 h-20 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg">
                      <Cake className="w-10 h-10 text-white" />
                    </div>
                    <h2 className="text-3xl lg:text-4xl font-bold text-white mb-3">
                      Chào Mừng Trở Lại!
                    </h2>
                    <p className="text-pink-200/80">
                      Đăng nhập để tiếp tục hành trình sáng tạo của bạn
                    </p>
                  </div>

                  {/* Error Message */}
                  {error && (
                    <div className="mb-6 p-4 bg-red-500/20 backdrop-blur-sm border border-red-400/30 text-red-200 rounded-xl text-sm">
                      {error}
                    </div>
                  )}

                  {/* Login Form */}
                  <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                      <label className="block text-sm font-medium text-pink-200 mb-2">
                        Email
                      </label>
                      <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        required
                        className="w-full px-4 py-4 bg-white/10 backdrop-blur-sm border border-white/20 text-white placeholder-pink-300/60 rounded-xl focus:ring-2 focus:ring-pink-400 focus:border-transparent transition-all"
                        placeholder="Nhập email của bạn"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-pink-200 mb-2">
                        Mật khẩu
                      </label>
                      <div className="relative">
                        <input
                          type={showPassword ? "text" : "password"}
                          name="password"
                          value={formData.password}
                          onChange={handleChange}
                          required
                          className="w-full px-4 py-4 bg-white/10 backdrop-blur-sm border border-white/20 text-white placeholder-pink-300/60 rounded-xl focus:ring-2 focus:ring-pink-400 focus:border-transparent transition-all"
                          placeholder="Nhập mật khẩu"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-4 top-1/2 transform -translate-y-1/2 text-pink-300/70 hover:text-pink-200 transition-colors"
                        >
                          {showPassword ? (
                            <EyeOff className="w-5 h-5" />
                          ) : (
                            <Eye className="w-5 h-5" />
                          )}
                        </button>
                      </div>
                    </div>

                    <div className="flex justify-end">
                      <Link
                        to="/forgot-password"
                        className="text-sm text-pink-300 hover:text-pink-200 transition-colors"
                      >
                        Quên mật khẩu?
                      </Link>
                    </div>

                    <button
                      type="submit"
                      disabled={loading}
                      className={`w-full py-4 px-6 rounded-xl text-white font-semibold text-lg transition-all duration-300 transform hover:scale-105 shadow-lg ${
                        loading
                          ? "bg-pink-500/50 cursor-not-allowed"
                          : "bg-gradient-to-r from-pink-500 to-orange-500 hover:from-pink-600 hover:to-orange-600 hover:shadow-pink-500/25"
                      }`}
                    >
                      {loading ? (
                        <div className="flex items-center justify-center gap-2">
                          <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                          Đang đăng nhập...
                        </div>
                      ) : (
                        "Đăng Nhập"
                      )}
                    </button>

                    <div className="text-center">
                      <p className="text-pink-200/80">
                        Chưa có tài khoản?{" "}
                        <Link
                          to="/signup"
                          className="text-pink-300 hover:text-pink-200 font-semibold transition-colors"
                        >
                          Đăng ký ngay
                        </Link>
                      </p>
                    </div>

                    <div className="text-center pt-4">
                      <Link
                        to="/landing"
                        className="inline-flex items-center gap-2 text-pink-300/80 hover:text-pink-200 text-sm transition-colors"
                      >
                        ← Quay lại trang chủ
                      </Link>
                    </div>
                  </form>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
