"use client";

import { useState } from "react";
import { Cake, Eye, EyeOff, Palette, Store, Award } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";

const Signup = () => {
  const navigate = useNavigate();
  const { register } = useAuth();
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    fullName: "",
    avatarUrl: "https://api.dicebear.com/7.x/avataaars/svg?seed=Felix", // Default avatar
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

    // Frontend validation
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
    // Simple email regex
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
      navigate("/home");
    } catch (err) {
      setError(
        err.response?.data?.message || "Đăng ký thất bại. Vui lòng thử lại."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-200 to-pink-300 flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl shadow-2xl overflow-hidden max-w-6xl w-full">
        <div className="flex flex-col lg:flex-row">
          {/* Left Side - Branding */}
          <div className="lg:w-1/2 bg-gradient-to-br from-pink-300 to-pink-400 p-12 text-white">
            <div className="h-full flex flex-col justify-center">
              <div className="text-center mb-12">
                <h1 className="text-4xl font-bold text-white mb-4">
                  CakeStory
                </h1>
                <p className="text-pink-100 text-lg">
                  Tham gia cộng đồng yêu bánh kẹo
                </p>
              </div>

              <div className="space-y-8">
                <div className="flex items-start space-x-4">
                  <div className="bg-white/20 p-3 rounded-full">
                    <Palette className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg mb-2">
                      Tạo Hồ Sơ Cá Nhân
                    </h3>
                    <p className="text-pink-100">
                      Thiết lập hồ sơ bánh kẹo của bạn và bắt đầu chia sẻ những
                      sáng tạo độc đáo.
                    </p>
                  </div>
                </div>

                <div className="flex items-start space-x-4">
                  <div className="bg-white/20 p-3 rounded-full">
                    <Store className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg mb-2">
                      Tham Gia Cộng Đồng
                    </h3>
                    <p className="text-pink-100">
                      Kết nối với những người yêu bánh kẹo và chia sẻ đam mê
                      cùng nhau.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Side - Signup Form */}
          <div className="lg:w-1/2 p-12">
            <div className="max-w-md mx-auto">
              <div className="text-center mb-8">
                <div className="bg-pink-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Cake className="w-8 h-8 text-pink-500" />
                </div>
                <h2 className="text-3xl font-bold text-gray-800 mb-2">
                  Tạo Tài Khoản
                </h2>
                <p className="text-gray-600">
                  Tham gia cộng đồng bánh kẹo hôm nay
                </p>
              </div>

              {error && (
                <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-600 rounded-lg text-sm">
                  {error}
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Tên người dùng
                  </label>
                  <input
                    type="text"
                    name="username"
                    value={formData.username}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                    placeholder="Chọn Tên người dùng"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Họ và tên
                  </label>
                  <input
                    type="text"
                    name="fullName"
                    value={formData.fullName}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                    placeholder="Nhập họ và tên đầy đủ"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Email
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                    placeholder="Nhập email của bạn"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Mật khẩu
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? "text" : "password"}
                      name="password"
                      value={formData.password}
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                      placeholder="Tạo mật khẩu"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      {showPassword ? (
                        <EyeOff className="w-5 h-5" />
                      ) : (
                        <Eye className="w-5 h-5" />
                      )}
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className={`w-full py-3 px-4 rounded-lg text-white font-medium transition-colors ${
                    loading
                      ? "bg-pink-400 cursor-not-allowed"
                      : "bg-pink-500 hover:bg-pink-600"
                  }`}
                >
                  {loading ? "Đang tạo tài khoản..." : "Tạo Tài Khoản"}
                </button>

                <p className="text-center text-sm text-gray-600">
                  Đã có tài khoản?{" "}
                  <Link
                    to="/login"
                    className="text-pink-500 hover:text-pink-600 font-medium"
                  >
                    Đăng nhập ngay
                  </Link>
                </p>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Signup;
