"use client";

import { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import {
  Mail,
  RefreshCw,
  ArrowLeft,
  Clock,
  CakeSlice,
  Sparkles,
  Heart,
  Star,
} from "lucide-react";
import { toast } from "react-toastify";

const VerifyEmail = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const email = location.state?.email || "";

  const [isResending, setIsResending] = useState(false);
  const [countdown, setCountdown] = useState(60);
  const [canResend, setCanResend] = useState(false);
  useEffect(() => {
    if (!email) {
      navigate("/signup");
      return;
    }

    let timer;
    if (countdown > 0 && !canResend) {
      timer = setTimeout(() => setCountdown(countdown - 1), 1000);
    } else {
      setCanResend(true);
    }

    return () => clearTimeout(timer);
  }, [countdown, canResend, email, navigate]);

  const handleResendEmail = async () => {
    setIsResending(true);
    try {
      // TODO: Implement API call to resend verification email
      // await resendVerificationEmail(email);

      toast.success("🎉 Email xác thực đã được gửi lại!", {
        position: "top-right",
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: false,
        draggable: true,
      });

      setCountdown(60);
      setCanResend(false);
    } catch (error) {
      toast.error("❌ Không thể gửi lại email. Vui lòng thử lại sau.", {
        position: "top-right",
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: false,
        draggable: true,
      });
    } finally {
      setIsResending(false);
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

      {/* Animated background elements */}
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
          <Mail size={30} />
        </div>
      </div>

      <div className="relative z-10 min-h-screen flex items-center justify-center p-4">
        <div className="w-full max-w-2xl mx-auto">
          <div className="bg-white/10 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/20 overflow-hidden p-8 lg:p-12">
            <div className="text-center">
              {/* Header */}
              <div className="flex items-center justify-center gap-3 mb-8">
                <div className="bg-gradient-to-r from-purple-500 to-pink-500 p-3 rounded-2xl">
                  <CakeSlice className="w-8 h-8 text-white" />
                </div>
                <h1 className="text-4xl lg:text-5xl font-bold bg-gradient-to-r from-purple-200 to-pink-200 bg-clip-text text-transparent">
                  CakeStory
                </h1>
              </div>

              {/* Mail icon */}
              <div className="mx-auto w-24 h-24 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center mb-8">
                <Mail className="w-12 h-12 text-white" />
              </div>

              {/* Main content */}
              <h2 className="text-3xl font-bold text-white mb-4">
                Xác Thực Email
              </h2>

              <p className="text-purple-200/90 text-lg mb-2">
                Chúng tôi đã gửi một email xác thực đến:
              </p>

              <p className="text-pink-300 font-semibold text-xl mb-8 break-all">
                {email}
              </p>

              <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl p-6 mb-8">
                <div className="flex items-center justify-center gap-2 text-purple-200 mb-4">
                  <Clock className="w-5 h-5" />
                  <span className="text-sm">Hướng dẫn xác thực:</span>
                </div>
                <ol className="text-left text-purple-100/80 space-y-2 text-sm">
                  <li>1. Kiểm tra hộp thư đến của bạn</li>
                  <li>2. Tìm email từ CakeStory</li>
                  <li>3. Nhấn vào liên kết xác thực trong email</li>
                  <li>4. Sau khi xác thực thành công, quay lại đăng nhập</li>
                </ol>
              </div>

              {/* Resend email section */}
              <div className="text-center mb-8">
                <p className="text-purple-200/80 mb-4">
                  Không nhận được email?
                </p>

                {canResend ? (
                  <button
                    onClick={handleResendEmail}
                    disabled={isResending}
                    className="bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white font-semibold py-2 px-6 rounded-xl transition-all duration-300 transform hover:scale-[1.02] focus:outline-none focus:ring-2 focus:ring-orange-400/50 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl"
                  >
                    {isResending ? (
                      <>
                        <RefreshCw className="w-4 h-4 inline mr-2 animate-spin" />
                        Đang gửi...
                      </>
                    ) : (
                      <>
                        <RefreshCw className="w-4 h-4 inline mr-2" />
                        Gửi lại email
                      </>
                    )}
                  </button>
                ) : (
                  <div className="text-purple-200/60">
                    <Clock className="w-4 h-4 inline mr-1" />
                    Gửi lại sau {countdown}s
                  </div>
                )}
              </div>

              {/* Navigation links */}
              <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mt-8">
                <Link
                  to="/signup"
                  className="flex items-center gap-2 text-purple-300 hover:text-purple-200 font-medium underline underline-offset-4 decoration-2 decoration-purple-300/50 hover:decoration-purple-200 transition-all"
                >
                  <ArrowLeft className="w-4 h-4" />
                  Quay lại đăng ký
                </Link>

                <span className="text-purple-200/40 hidden sm:block">•</span>

                <Link
                  to="/login"
                  className="text-pink-300 hover:text-pink-200 font-medium underline underline-offset-4 decoration-2 decoration-pink-300/50 hover:decoration-pink-200 transition-all"
                >
                  Đi đến đăng nhập
                </Link>
              </div>

              <div className="mt-8">
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
  );
};

export default VerifyEmail;
