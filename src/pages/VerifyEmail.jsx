"use client";

import { useState, useEffect } from "react";
import {
  Link,
  useNavigate,
  useLocation,
  useSearchParams,
} from "react-router-dom";
import {
  Mail,
  RefreshCw,
  ArrowLeft,
  Clock,
  CakeSlice,
  Sparkles,
  Heart,
  Star,
  CheckCircle,
  AlertCircle,
} from "lucide-react";
import { authAPI } from "../api/auth";
import { getAuth, applyActionCode } from "firebase/auth";

const VerifyEmail = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();

  // Check if this is a Firebase verification request
  const mode = searchParams.get("mode");
  const oobCode = searchParams.get("oobCode");
  const continueUrl = searchParams.get("continueUrl");
  const isFirebaseVerification = mode === "verifyEmail" && oobCode;

  // Extract email from continueUrl if available, otherwise use location.state
  const emailMatch = continueUrl?.match(/email=([^&]+)/);
  const email = emailMatch
    ? decodeURIComponent(emailMatch[1])
    : location.state?.email || "";

  const [isResending, setIsResending] = useState(false);
  const [countdown, setCountdown] = useState(60);
  const [canResend, setCanResend] = useState(false);

  // Firebase verification states
  const [isVerifying, setIsVerifying] = useState(isFirebaseVerification);
  const [verificationSuccess, setVerificationSuccess] = useState(false);
  const [verificationError, setVerificationError] = useState("");
  const [isRedirecting, setIsRedirecting] = useState(false);

  useEffect(() => {
    // Handle Firebase email verification
    if (isFirebaseVerification) {
      const verifyFirebaseEmail = async () => {
        try {
          setIsVerifying(true);

          // Apply the email verification code using Firebase
          const auth = getAuth();
          await applyActionCode(auth, oobCode);

          // After Firebase verification success, call backend API to activate account
          if (email) {
            try {
              const response = await authAPI.verifyEmail(email);
              console.log("Backend verification response:", response);

              if (response.verified) {
                setVerificationSuccess(true);
              } else {
                throw new Error("Backend verification failed");
              }
            } catch (backendError) {
              console.error("Backend verification failed:", backendError);
              // Still mark as success since Firebase verification worked
              setVerificationSuccess(true);
            }
          } else {
            setVerificationSuccess(true);
          }

          // Start redirect countdown
          setIsRedirecting(true);
          setTimeout(() => {
            // Always redirect to our domain's email-verified page
            const emailParam = email
              ? `?email=${encodeURIComponent(email)}`
              : "";
            navigate(`/email-verified${emailParam}`);
          }, 3000);
        } catch (error) {
          console.error("Firebase email verification failed:", error);
          let errorMessage = "Xác thực email thất bại";

          if (error.code === "auth/expired-action-code") {
            errorMessage =
              "Liên kết xác thực đã hết hạn. Vui lòng yêu cầu gửi lại email.";
          } else if (error.code === "auth/invalid-action-code") {
            errorMessage = "Liên kết xác thực không hợp lệ.";
          } else if (error.code === "auth/user-disabled") {
            errorMessage = "Tài khoản đã bị vô hiệu hóa.";
          }

          setVerificationError(errorMessage);
        } finally {
          setIsVerifying(false);
        }
      };

      verifyFirebaseEmail();
      return;
    }

    // Handle regular email verification flow
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
  }, [
    countdown,
    canResend,
    email,
    navigate,
    isFirebaseVerification,
    oobCode,
    continueUrl,
  ]);

  const handleResendEmail = async () => {
    setIsResending(true);
    try {
      await authAPI.resendVerificationEmail(email);

      setCountdown(60);
      setCanResend(false);
    } catch (error) {
      console.error("Failed to resend verification email:", error);
      const errorMessage =
        error.response?.data?.message ||
        "Không thể gửi lại email. Vui lòng thử lại sau.";
    } finally {
      setIsResending(false);
    }
  };

  // If this is Firebase verification, show Firebase UI
  if (isFirebaseVerification) {
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

                {/* Icon */}
                <div className="mx-auto w-24 h-24 rounded-full flex items-center justify-center mb-8">
                  {isVerifying ? (
                    <div className="bg-gradient-to-r from-blue-500 to-purple-500 rounded-full w-full h-full flex items-center justify-center">
                      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white"></div>
                    </div>
                  ) : verificationSuccess ? (
                    <div className="bg-gradient-to-r from-green-500 to-emerald-500 rounded-full w-full h-full flex items-center justify-center">
                      <CheckCircle className="w-12 h-12 text-white" />
                    </div>
                  ) : (
                    <div className="bg-gradient-to-r from-red-500 to-pink-500 rounded-full w-full h-full flex items-center justify-center">
                      <AlertCircle className="w-12 h-12 text-white" />
                    </div>
                  )}
                </div>

                {/* Content */}
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
                    {email && (
                      <p className="text-pink-300 font-semibold text-xl mb-8 break-all">
                        {email}
                      </p>
                    )}
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
                      Vui lòng thử lại hoặc liên hệ hỗ trợ.
                    </p>
                  </>
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

                {/* Navigation */}
                <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mt-8">
                  {verificationSuccess ? (
                    <Link
                      to="/login"
                      className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-semibold py-3 px-8 rounded-xl transition-all duration-300 transform hover:scale-[1.02]"
                    >
                      Đăng nhập ngay
                    </Link>
                  ) : (
                    <Link
                      to="/signup"
                      className="bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white font-semibold py-3 px-8 rounded-xl transition-all duration-300 transform hover:scale-[1.02]"
                    >
                      Đăng ký lại
                    </Link>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Regular verification UI
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
                    className="bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white font-semibold py-2 px-6 rounded-xl transition-all duration-300 transform hover:scale-[1.02] disabled:opacity-50"
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
                  className="flex items-center gap-2 text-purple-300 hover:text-purple-200 font-medium underline"
                >
                  <ArrowLeft className="w-4 h-4" />
                  Quay lại đăng ký
                </Link>
                <span className="text-purple-200/40 hidden sm:block">•</span>
                <Link
                  to="/login"
                  className="text-pink-300 hover:text-pink-200 font-medium underline"
                >
                  Đi đến đăng nhập
                </Link>
              </div>

              <div className="mt-8">
                <Link
                  to="/"
                  className="text-purple-300 hover:text-purple-200 text-sm underline"
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
