"use client";

import { useState } from "react";
import {
  Eye,
  EyeOff,
  Palette,
  Store,
  Award,
  CakeSlice,
  Heart,
  Star,
  Sparkles,
  ShoppingCart,
} from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { toast } from "react-toastify";

const Signup = () => {
  const navigate = useNavigate();
  const { register } = useAuth();
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    fullName: "",
    avatarUrl: "https://api.dicebear.com/7.x/avataaars/svg?seed=Felix",
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

    if (!formData.username.trim()) {
      setError("Tên người dùng là bắt buộc.");
      return;
    }
    if (!formData.fullName.trim()) {
      setError("Họ và tên là bắt buộc.");
      return;
    }
    if (!formData.email.trim()) {
      setError("Email là bắt buộc.");
      return;
    }
    if (!/^\S+@\S+\.\S+$/.test(formData.email)) {
      setError("Vui lòng nhập địa chỉ email hợp lệ.");
      return;
    }
    if (!formData.password) {
      setError("Mật khẩu là bắt buộc.");
      return;
    }
    if (formData.password.length < 8) {
      setError("Mật khẩu phải có ít nhất 8 ký tự.");
      return;
    }

    setLoading(true);
    try {
      await register(formData);
      // Hiển thị toast thành công với emoji và animation đẹp
      toast.success("🎉 Đăng ký thành công! Hãy đăng nhập để tiếp tục.", {
        position: "top-right",
        autoClose: 4000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: false,
        draggable: true,
      });

      // Reset form sau khi đăng ký thành công
      setFormData({
        username: "",
        email: "",
        password: "",
        fullName: "",
        avatarUrl: "https://api.dicebear.com/7.x/avataaars/svg?seed=Felix",
      });

      // Chuyển hướng về trang login sau delay ngắn
      setTimeout(() => navigate("/login"), 1500);
    } catch (err) {
      const errorMessage =
        err.response?.data?.message || "Đăng ký thất bại. Vui lòng thử lại.";
      setError(errorMessage);
      // Hiển thị toast lỗi với style đẹp
      toast.error(`❌ ${errorMessage}`, {
        position: "top-right",
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: false,
        draggable: true,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen relative overflow-hidden">
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage: `url('https://images.unsplash.com/photo-1464349095431-e9a21285b5f3?w=1920&h=1080&fit=crop&crop=center')`,
        }}
      >
        <div className="absolute inset-0 bg-gradient-to-br from-purple-900/80 via-pink-900/70 to-orange-900/80"></div>
      </div>

      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 text-purple-300/30 animate-bounce">
          <CakeSlice size={40} />
        </div>
        <div className="absolute top-40 right-20 text-pink-300/30 animate-pulse">
          <Heart size={32} />
        </div>
        <div className="absolute bottom-40 left-20 text-orange-300/30 animate-bounce delay-1000">
          <Star size={28} />
        </div>
        <div className="absolute bottom-20 right-40 text-purple-300/30 animate-pulse delay-500">
          <Sparkles size={36} />
        </div>
        <div className="absolute top-60 left-40 text-pink-300/30 animate-bounce delay-700">
          <ShoppingCart size={30} />
        </div>
      </div>

      <div className="relative z-10 min-h-screen flex items-center justify-center p-4">
        <div className="w-full max-w-7xl mx-auto">
          <div className="bg-white/10 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/20 overflow-hidden">
            <div className="flex flex-col lg:flex-row min-h-[700px]">
              <div className="lg:w-3/5 p-12 lg:p-16 text-white relative">
                <div className="absolute inset-0 bg-gradient-to-br from-purple-500/20 to-pink-600/20 rounded-l-3xl"></div>
                <div className="relative z-10 h-full flex flex-col justify-center">
                  <div className="text-center lg:text-left mb-12">
                    <div className="flex items-center justify-center lg:justify-start gap-3 mb-6">
                      <div className="bg-gradient-to-r from-purple-500 to-pink-500 p-3 rounded-2xl">
                        <CakeSlice className="w-8 h-8 text-white" />
                      </div>
                      <h1 className="text-5xl lg:text-6xl font-bold bg-gradient-to-r from-purple-200 to-pink-200 bg-clip-text text-transparent">
                        CakeStory
                      </h1>
                    </div>
                    <p className="text-xl lg:text-2xl text-purple-100 font-light mb-4">
                      Bắt Đầu Hành Trình Bánh Ngọt Của Bạn
                    </p>
                    <p className="text-purple-200/80 max-w-lg">
                      Tham gia cộng đồng sáng tạo bánh ngọt lớn nhất Việt Nam
                    </p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
                    <div className="group">
                      <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20 hover:bg-white/20 transition-all duration-300">
                        <div className="bg-gradient-to-r from-purple-500 to-pink-500 p-3 rounded-xl w-fit mb-4 group-hover:scale-110 transition-transform">
                          <Palette className="w-6 h-6 text-white" />
                        </div>
                        <h3 className="font-bold text-lg mb-2">Tạo Hồ Sơ</h3>
                        <p className="text-purple-100/80 text-sm">
                          Thiết lập hồ sơ bánh kẹo cá nhân
                        </p>
                      </div>
                    </div>

                    <div className="group">
                      <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20 hover:bg-white/20 transition-all duration-300">
                        <div className="bg-gradient-to-r from-pink-500 to-orange-500 p-3 rounded-xl w-fit mb-4 group-hover:scale-110 transition-transform">
                          <Store className="w-6 h-6 text-white" />
                        </div>
                        <h3 className="font-bold text-lg mb-2">Mở Cửa Hàng</h3>
                        <p className="text-purple-100/80 text-sm">
                          Kinh doanh bánh trực tuyến dễ dàng
                        </p>
                      </div>
                    </div>

                    <div className="group">
                      <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20 hover:bg-white/20 transition-all duration-300">
                        <div className="bg-gradient-to-r from-orange-500 to-red-500 p-3 rounded-xl w-fit mb-4 group-hover:scale-110 transition-transform">
                          <Award className="w-6 h-6 text-white" />
                        </div>
                        <h3 className="font-bold text-lg mb-2">Thử Thách</h3>
                        <p className="text-purple-100/80 text-sm">
                          Tham gia cuộc thi làm bánh
                        </p>
                      </div>
                    </div>

                    <div className="group">
                      <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20 hover:bg-white/20 transition-all duration-300">
                        <div className="bg-gradient-to-r from-indigo-500 to-purple-500 p-3 rounded-xl w-fit mb-4 group-hover:scale-110 transition-transform">
                          <ShoppingCart className="w-6 h-6 text-white" />
                        </div>
                        <h3 className="font-bold text-lg mb-2">Mua Sắm</h3>
                        <p className="text-purple-100/80 text-sm">
                          Khám phá bánh từ cộng đồng
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="text-center lg:text-left">
                    <p className="text-purple-200/80 mb-6">
                      Đã có tài khoản?{" "}
                      <Link
                        to="/login"
                        className="text-pink-300 hover:text-pink-200 font-semibold underline underline-offset-4 decoration-2 decoration-pink-300/50 hover:decoration-pink-200 transition-all"
                      >
                        Đăng nhập ngay
                      </Link>
                    </p>
                  </div>
                </div>
              </div>

              <div className="lg:w-2/5 p-8 lg:p-12 bg-white/5 backdrop-blur-sm relative">
                <div className="absolute inset-0 bg-gradient-to-bl from-white/10 to-white/5 rounded-r-3xl"></div>
                <div className="relative z-10 h-full flex flex-col justify-center">
                  <div className="mb-8">
                    <h2 className="text-3xl font-bold text-white mb-2">
                      Tạo Tài Khoản
                    </h2>
                    <p className="text-purple-200/80">
                      Điền thông tin để bắt đầu
                    </p>
                  </div>

                  <form onSubmit={handleSubmit} className="space-y-6">
                    {error && (
                      <div className="bg-red-500/20 backdrop-blur-sm border border-red-400/30 text-red-200 px-4 py-3 rounded-xl">
                        {error}
                      </div>
                    )}

                    <div>
                      <label className="block text-white/90 text-sm font-medium mb-2">
                        Họ và tên
                      </label>
                      <input
                        type="text"
                        name="fullName"
                        value={formData.fullName}
                        onChange={handleChange}
                        className="w-full px-4 py-3 bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-purple-400/50 focus:border-transparent transition-all"
                        placeholder="Nhập họ và tên"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-white/90 text-sm font-medium mb-2">
                        Tên người dùng
                      </label>
                      <input
                        type="text"
                        name="username"
                        value={formData.username}
                        onChange={handleChange}
                        className="w-full px-4 py-3 bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-purple-400/50 focus:border-transparent transition-all"
                        placeholder="Nhập tên người dùng"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-white/90 text-sm font-medium mb-2">
                        Email
                      </label>
                      <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        className="w-full px-4 py-3 bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-purple-400/50 focus:border-transparent transition-all"
                        placeholder="Nhập địa chỉ email"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-white/90 text-sm font-medium mb-2">
                        Mật khẩu
                      </label>
                      <div className="relative">
                        <input
                          type={showPassword ? "text" : "password"}
                          name="password"
                          value={formData.password}
                          onChange={handleChange}
                          className="w-full px-4 py-3 bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-purple-400/50 focus:border-transparent transition-all pr-12"
                          placeholder="Nhập mật khẩu"
                          required
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3 top-1/2 transform -translate-y-1/2 text-white/60 hover:text-white transition-colors"
                        >
                          {showPassword ? (
                            <EyeOff size={20} />
                          ) : (
                            <Eye size={20} />
                          )}
                        </button>
                      </div>
                    </div>

                    <button
                      type="submit"
                      disabled={loading}
                      className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-semibold py-3 px-6 rounded-xl transition-all duration-300 transform hover:scale-[1.02] focus:outline-none focus:ring-2 focus:ring-purple-400/50 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl"
                    >
                      {loading ? "Đang đăng ký..." : "Tạo Tài Khoản"}
                    </button>
                  </form>

                  <div className="mt-8 text-center">
                    <Link
                      to="/"
                      className="text-purple-300 hover:text-purple-200 text-sm underline underline-offset-4 decoration-2 decoration-purple-300/50 hover:decoration-purple-200 transition-all"
                    >
                      ← Quay lại trang chủ
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Signup;
