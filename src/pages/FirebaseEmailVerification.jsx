"use client";

import { useEffect, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import {
  CheckCircle,
  CakeSlice,
  Sparkles,
  Heart,
  Star,
  Mail,
  AlertCircle,
} from "lucide-react";
import { toast } from "react-toastify";
import { getAuth, applyActionCode } from "firebase/auth";

const FirebaseEmailVerification = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  // Get Firebase action parameters
  const mode = searchParams.get("mode");
  const oobCode = searchParams.get("oobCode");
  const continueUrl = searchParams.get("continueUrl");

  // Extract email from continueUrl if available
  const emailMatch = continueUrl?.match(/email=([^&]+)/);
  const email = emailMatch ? decodeURIComponent(emailMatch[1]) : "";

  const [isVerifying, setIsVerifying] = useState(true);
  const [verificationSuccess, setVerificationSuccess] = useState(false);
  const [verificationError, setVerificationError] = useState("");
  const [isRedirecting, setIsRedirecting] = useState(false);

  useEffect(() => {
    const verifyEmail = async () => {
      // Check if this is an email verification request
      if (mode !== "verifyEmail" || !oobCode) {
        setVerificationError("Liên kết xác thực không hợp lệ");
        setIsVerifying(false);
        return;
      }

      try {
        setIsVerifying(true);

        // Apply the email verification code using Firebase
        const auth = getAuth();
        await applyActionCode(auth, oobCode);

        setVerificationSuccess(true);

        // Show success message
        toast.success("🎉 Email đã được xác thực thành công!", {
          position: "top-right",
          autoClose: 4000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: false,
          draggable: true,
        });

        // Start redirect countdown
        setIsRedirecting(true);
        const redirectTimer = setTimeout(() => {
          // Redirect to the continue URL if available, otherwise go to login
          if (continueUrl) {
            window.location.href = continueUrl;
          } else {
            navigate("/login");
          }
        }, 3000);

        return () => clearTimeout(redirectTimer);
      } catch (error) {
        console.error("Firebase email verification failed:", error);
        let errorMessage = "Xác thực email thất bại";

        // Handle specific Firebase errors
        if (error.code === "auth/expired-action-code") {
          errorMessage =
            "Liên kết xác thực đã hết hạn. Vui lòng yêu cầu gửi lại email.";
        } else if (error.code === "auth/invalid-action-code") {
          errorMessage = "Liên kết xác thực không hợp lệ.";
        } else if (error.code === "auth/user-disabled") {
          errorMessage = "Tài khoản đã bị vô hiệu hóa.";
        }

        setVerificationError(errorMessage);

        toast.error(`❌ ${errorMessage}`, {
          position: "top-right",
          autoClose: 5000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: false,
          draggable: true,
        });
      } finally {
        setIsVerifying(false);
      }
    };

    verifyEmail();
  }, [mode, oobCode, continueUrl, navigate]);

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

              {/* Success/Error/Loading icon */}
              <div className="mx-auto w-24 h-24 rounded-full flex items-center justify-center mb-8">
                {isVerifying ? (
                  <div className="bg-gradient-to-r from-blue-500 to-purple-500 rounded-full w-full h-full flex items-center justify-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white"></div>
                  </div>
                ) : verificationSuccess ? (
                  <div className="bg-gradient-to-r from-green-500 to-emerald-500 rounded-full w-full h-full flex items-center justify-center animate-pulse">
                    <CheckCircle className="w-12 h-12 text-white" />
                  </div>
                ) : (
                  <div className="bg-gradient-to-r from-red-500 to-pink-500 rounded-full w-full h-full flex items-center justify-center">
                    <AlertCircle className="w-12 h-12 text-white" />
                  </div>
                )}
              </div>

              {/* Main content */}
              {isVerifying ? (
                <>
                  <h2 className="text-3xl font-bold text-white mb-4">
                    Đang xác thực email... 🔄
                  </h2>
                  <p className="text-purple-200/90 text-lg mb-8">
                    Vui lòng đợi trong giây lát...
                  </p>
                </>
              ) : verificationSuccess ? (
                <>
                  <h2 className="text-3xl font-bold text-white mb-4">
                    Xác Thực Email Thành Công! 🎉
                  </h2>
                  <p className="text-purple-200/90 text-lg mb-2">
                    Chúc mừng! Email của bạn đã được xác thực thành công.
                  </p>
                </>
              ) : (
                <>
                  <h2 className="text-3xl font-bold text-white mb-4">
                    Xác Thực Email Thất Bại ❌
                  </h2>
                  <p className="text-red-300 text-lg mb-4">
                    {verificationError}
                  </p>
                  <p className="text-purple-200/90 text-sm mb-8">
                    Vui lòng thử lại hoặc liên hệ hỗ trợ nếu vấn đề vẫn tiếp
                    tục.
                  </p>
                </>
              )}

              {email && (
                <p className="text-pink-300 font-semibold text-xl mb-8 break-all">
                  {email}
                </p>
              )}

              {!isVerifying && (
                <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl p-6 mb-8">
                  {verificationSuccess ? (
                    <>
                      <div className="text-green-300 mb-4">
                        <CheckCircle className="w-8 h-8 mx-auto mb-2" />
                        <h3 className="font-semibold text-lg">
                          Tài khoản đã được kích hoạt!
                        </h3>
                      </div>
                      <p className="text-purple-100/80 text-sm">
                        Bây giờ bạn có thể đăng nhập và bắt đầu khám phá thế
                        giới bánh ngọt tuyệt vời của CakeStory.
                      </p>
                    </>
                  ) : (
                    <>
                      <div className="text-red-300 mb-4">
                        <AlertCircle className="w-8 h-8 mx-auto mb-2" />
                        <h3 className="font-semibold text-lg">
                          Xác thực không thành công
                        </h3>
                      </div>
                      <p className="text-purple-100/80 text-sm">
                        Có thể liên kết xác thực đã hết hạn hoặc không hợp lệ.
                        Vui lòng thử đăng ký lại hoặc yêu cầu gửi lại email xác
                        thực.
                      </p>
                    </>
                  )}
                </div>
              )}

              {isRedirecting && verificationSuccess && (
                <div className="mb-8">
                  <div className="flex items-center justify-center gap-2 text-purple-200 mb-4">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-purple-300"></div>
                    <span className="text-sm">Đang chuyển hướng...</span>
                  </div>
                  <div className="w-full bg-white/20 rounded-full h-2">
                    <div className="bg-gradient-to-r from-purple-500 to-pink-500 h-2 rounded-full animate-pulse"></div>
                  </div>
                </div>
              )}

              {/* Navigation links */}
              <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mt-8">
                {verificationSuccess ? (
                  <>
                    <Link
                      to="/login"
                      className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-semibold py-3 px-8 rounded-xl transition-all duration-300 transform hover:scale-[1.02] focus:outline-none focus:ring-2 focus:ring-purple-400/50 shadow-lg hover:shadow-xl"
                    >
                      Đăng nhập ngay
                    </Link>

                    <span className="text-purple-200/40 hidden sm:block">
                      •
                    </span>

                    <Link
                      to="/"
                      className="text-purple-300 hover:text-purple-200 font-medium underline underline-offset-4 decoration-2 decoration-purple-300/50 hover:decoration-purple-200 transition-all"
                    >
                      Quay lại trang chủ
                    </Link>
                  </>
                ) : !isVerifying ? (
                  <>
                    <Link
                      to="/signup"
                      className="bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white font-semibold py-3 px-8 rounded-xl transition-all duration-300 transform hover:scale-[1.02] focus:outline-none focus:ring-2 focus:ring-orange-400/50 shadow-lg hover:shadow-xl"
                    >
                      Đăng ký lại
                    </Link>

                    <span className="text-purple-200/40 hidden sm:block">
                      •
                    </span>

                    <Link
                      to="/login"
                      className="text-purple-300 hover:text-purple-200 font-medium underline underline-offset-4 decoration-2 decoration-purple-300/50 hover:decoration-purple-200 transition-all"
                    >
                      Đăng nhập
                    </Link>

                    <span className="text-purple-200/40 hidden sm:block">
                      •
                    </span>

                    <Link
                      to="/"
                      className="text-purple-300 hover:text-purple-200 font-medium underline underline-offset-4 decoration-2 decoration-purple-300/50 hover:decoration-purple-200 transition-all"
                    >
                      Quay lại trang chủ
                    </Link>
                  </>
                ) : null}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FirebaseEmailVerification;
