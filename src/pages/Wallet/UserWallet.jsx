import { useState, useEffect, useRef } from "react";
import { CheckCircle, Shield, Zap, X, Clock, AlertCircle } from "lucide-react";
import { useAuth } from "../../contexts/AuthContext";
import { depositToWallet, fetchWalletBalance } from "../../api/axios";

const popularAmounts = [
  10000, 20000, 30000, 50000, 100000, 200000, 500000, 1000000,
];
const popularLabels = [50000, 100000, 200000];

export default function UserWallet() {
  const { user } = useAuth();
  const [balance, setBalance] = useState(0);
  const [selected, setSelected] = useState(null);
  const [custom, setCustom] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [paymentUrl, setPaymentUrl] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [paymentStatus, setPaymentStatus] = useState("pending"); // pending, success, failed, expired, cancelled
  const [timeLeft, setTimeLeft] = useState(300); // 5 minutes in seconds
  const [orderId, setOrderId] = useState("");

  const timerRef = useRef(null);
  const statusCheckRef = useRef(null);

  const MAX_AMOUNT = 20000000;
  const MIN_AMOUNT = 10000;

  useEffect(() => {
    const fetchBalance = async () => {
      try {
        console.log("Đang fetch balance cho user:", user);
        const res = await fetchWalletBalance();
        console.log("Response từ fetchWalletBalance:", res);

        // Kiểm tra cấu trúc response
        if (res && typeof res === "object") {
          let balanceValue = 0;

          // Kiểm tra nếu có wallet.balance (cấu trúc từ API doc)
          if (res.wallet && typeof res.wallet.balance !== "undefined") {
            balanceValue =
              typeof res.wallet.balance === "string"
                ? parseFloat(res.wallet.balance)
                : res.wallet.balance;
            console.log("Balance tìm thấy trong wallet:", balanceValue);
          }
          // Kiểm tra nếu balance trực tiếp trong response
          else if (typeof res.balance === "number") {
            balanceValue = res.balance;
            console.log("Balance tìm thấy (number):", balanceValue);
          }
          // Nếu balance là string và có thể parse thành number
          else if (
            typeof res.balance === "string" &&
            !isNaN(parseFloat(res.balance))
          ) {
            balanceValue = parseFloat(res.balance);
            console.log("Balance tìm thấy (string -> number):", balanceValue);
          }
          // Nếu response có cấu trúc khác trong data
          else if (res.data && typeof res.data.balance !== "undefined") {
            balanceValue =
              typeof res.data.balance === "string"
                ? parseFloat(res.data.balance)
                : res.data.balance;
            console.log("Balance tìm thấy trong data:", balanceValue);
          } else {
            console.log("Không tìm thấy balance trong response, set về 0");
          }

          console.log("Final balance value:", balanceValue);
          setBalance(balanceValue);
        } else {
          console.log("Response không hợp lệ, set balance về 0");
          setBalance(0);
        }
      } catch (e) {
        console.error("Lỗi khi fetch balance:", e);
        console.error("Error details:", e.response?.data || e.message);
        setBalance(0);
      }
    };
    fetchBalance();
  }, [user]);

  // Timer countdown
  useEffect(() => {
    if (showModal && paymentStatus === "pending" && timeLeft > 0) {
      timerRef.current = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            setPaymentStatus("expired");
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      clearInterval(timerRef.current);
    }

    return () => clearInterval(timerRef.current);
  }, [showModal, paymentStatus, timeLeft]);

  // Status checking (polling every 5 seconds)
  useEffect(() => {
    if (showModal && paymentStatus === "pending" && orderId) {
      statusCheckRef.current = setInterval(async () => {
        try {
          // Giả sử có API check status
          // const statusRes = await checkPaymentStatus(orderId);
          // Tạm thời comment vì chưa có API này
          // if (statusRes?.status === "PAID") {
          //   setPaymentStatus("success");
          //   await updateBalance();
          // } else if (statusRes?.status === "CANCELLED") {
          //   setPaymentStatus("cancelled");
          // } else if (statusRes?.status === "FAILED") {
          //   setPaymentStatus("failed");
          // }
        } catch (e) {
          console.error("Error checking payment status:", e);
        }
      }, 5000);
    } else {
      clearInterval(statusCheckRef.current);
    }

    return () => clearInterval(statusCheckRef.current);
  }, [showModal, paymentStatus, orderId]);

  // Auto close modal after success
  useEffect(() => {
    if (showModal && paymentStatus === "success") {
      const timeout = setTimeout(() => {
        closeModal();
      }, 2000); // Đóng modal sau 2 giây
      return () => clearTimeout(timeout);
    }
  }, [showModal, paymentStatus]);

  const updateBalance = async () => {
    try {
      console.log("Đang update balance...");
      const res = await fetchWalletBalance();
      console.log("Response khi update balance:", res);

      if (res && typeof res === "object") {
        let balanceValue = 0;

        // Kiểm tra nếu có wallet.balance (cấu trúc từ API doc)
        if (res.wallet && typeof res.wallet.balance !== "undefined") {
          balanceValue =
            typeof res.wallet.balance === "string"
              ? parseFloat(res.wallet.balance)
              : res.wallet.balance;
          console.log("Update balance từ wallet:", balanceValue);
        }
        // Kiểm tra nếu balance trực tiếp trong response
        else if (typeof res.balance === "number") {
          balanceValue = res.balance;
          console.log("Update balance (number):", balanceValue);
        }
        // Nếu balance là string và có thể parse thành number
        else if (
          typeof res.balance === "string" &&
          !isNaN(parseFloat(res.balance))
        ) {
          balanceValue = parseFloat(res.balance);
          console.log("Update balance (string -> number):", balanceValue);
        }
        // Nếu response có cấu trúc khác trong data
        else if (res.data && typeof res.data.balance !== "undefined") {
          balanceValue =
            typeof res.data.balance === "string"
              ? parseFloat(res.data.balance)
              : res.data.balance;
          console.log("Update balance từ data:", balanceValue);
        } else {
          console.log("Không update được balance, giữ nguyên");
          return;
        }

        console.log("Final update balance value:", balanceValue);
        setBalance(balanceValue);
      }
    } catch (e) {
      console.error("Error updating balance:", e);
      console.error(
        "Update balance error details:",
        e.response?.data || e.message
      );
    }
  };

  const handleSelect = (amount) => {
    setSelected(amount);
    setCustom("");
    setError("");
  };

  const handleCustomChange = (e) => {
    const value = e.target.value.replace(/\D/g, "");
    setCustom(value);
    setSelected(null);

    if (value === "") {
      setError("");
      return;
    }

    const numericValue = Number(value);
    if (numericValue < MIN_AMOUNT || numericValue > MAX_AMOUNT) {
      setError(
        `Số tiền nạp phải từ ${MIN_AMOUNT.toLocaleString()} đến ${MAX_AMOUNT.toLocaleString()} VND`
      );
    } else {
      setError("");
    }
  };

  const getAmount = () => {
    if (custom && custom.trim() !== "") {
      const customAmount = Number(custom);
      return isNaN(customAmount) ? 0 : customAmount;
    }
    if (selected !== null) {
      return selected;
    }
    return 0;
  };

  const isAmountValid = () => {
    const amount = getAmount();
    return (
      typeof amount === "number" &&
      !isNaN(amount) &&
      amount >= MIN_AMOUNT &&
      amount <= MAX_AMOUNT &&
      amount > 0
    );
  };

  const handleDeposit = async () => {
    const amount = getAmount();

    if (amount === 0) {
      setError("Vui lòng chọn hoặc nhập số tiền cần nạp.");
      return;
    }

    if (!isAmountValid()) {
      setError(
        `Số tiền nạp phải từ ${MIN_AMOUNT.toLocaleString()} đến ${MAX_AMOUNT.toLocaleString()} VND và chỉ được nhập số.`
      );
      return;
    }

    setLoading(true);
    setError("");

    try {
      const res = await depositToWallet(amount);
      console.log("Deposit response:", res);

      if (res?.data?.paymentUrl) {
        setPaymentUrl(res.data.paymentUrl);
        setOrderId(res.data.orderId || `order_${Date.now()}`);
        setPaymentStatus("pending");
        setTimeLeft(300); // Reset timer to 5 minutes
        setShowModal(true);
      } else {
        setError("Không lấy được link thanh toán. Vui lòng thử lại.");
      }
    } catch (e) {
      console.error("Deposit error:", e);
      setError(
        e?.response?.data?.message || "Có lỗi xảy ra, vui lòng thử lại."
      );
    } finally {
      setLoading(false);
    }
  };

  const closeModal = async () => {
    clearInterval(timerRef.current);
    clearInterval(statusCheckRef.current);
    setShowModal(false);
    setPaymentUrl("");
    setOrderId("");
    setPaymentStatus("pending");
    setTimeLeft(300);

    // Reset form
    setSelected(null);
    setCustom("");
    setError("");

    // Luôn update balance khi đóng modal
    await updateBalance();
  };

  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`;
  };

  const getStatusMessage = () => {
    switch (paymentStatus) {
      case "success":
        return {
          icon: <CheckCircle className="w-8 h-8 text-green-500" />,
          title: "Thanh toán thành công!",
          message: "Số tiền đã được nạp vào ví của bạn.",
          color: "text-green-600",
        };
      case "failed":
        return {
          icon: <X className="w-8 h-8 text-red-500" />,
          title: "Thanh toán thất bại!",
          message: "Giao dịch không thành công. Vui lòng thử lại.",
          color: "text-red-600",
        };
      case "expired":
        return {
          icon: <Clock className="w-8 h-8 text-orange-500" />,
          title: "Quá hạn thanh toán!",
          message: "Mã QR đã hết hạn. Vui lòng tạo giao dịch mới.",
          color: "text-orange-600",
        };
      case "cancelled":
        return {
          icon: <AlertCircle className="w-8 h-8 text-gray-500" />,
          title: "Giao dịch đã bị hủy!",
          message: "Giao dịch đã được hủy bởi người dùng hoặc hệ thống.",
          color: "text-gray-600",
        };
      default:
        return null;
    }
  };

  const statusInfo = getStatusMessage();

  return (
    <div className="min-h-screen bg-white flex flex-col items-center py-10 px-2">
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
          <div className="bg-white rounded-2xl shadow-xl p-6 max-w-4xl w-full relative flex flex-col items-center max-h-[90vh] overflow-y-auto">
            <button
              className="absolute top-4 right-4 p-2 rounded-full hover:bg-gray-100 text-gray-500 z-10"
              onClick={closeModal}
              aria-label="Đóng"
            >
              <X className="w-6 h-6" />
            </button>

            {paymentStatus === "pending" ? (
              <>
                <div className="font-bold text-xl text-pink-600 mb-4 text-center">
                  Thanh toán qua VietQR
                </div>

                {/* Timer */}
                <div className="flex items-center gap-2 mb-4 px-4 py-2 bg-orange-50 rounded-lg">
                  <Clock className="w-5 h-5 text-orange-500" />
                  <span className="text-orange-600 font-medium">
                    Thời gian còn lại: {formatTime(timeLeft)}
                  </span>
                </div>

                {/* Payment amount */}
                <div className="mb-4 text-center">
                  <div className="text-gray-600">Số tiền cần thanh toán:</div>
                  <div className="text-2xl font-bold text-pink-600">
                    {getAmount().toLocaleString()} VND
                  </div>
                </div>

                {/* QR Code iframe */}
                <div className="w-full">
                  <iframe
                    src={paymentUrl}
                    title="Thanh toán VietQR"
                    className="rounded-xl border border-pink-200 w-full h-[500px] min-h-[400px]"
                    allowFullScreen
                    sandbox="allow-same-origin allow-scripts allow-forms"
                    onError={(e) => {
                      console.log("Iframe error (ignored):", e);
                      e.preventDefault();
                    }}
                    style={{
                      filter: "none",
                    }}
                  />
                </div>

                {/* Instructions */}
                <div className="mt-4 text-center text-sm text-gray-600 max-w-md">
                  <p className="mb-2">
                    📱 Quét mã QR bằng ứng dụng ngân hàng của bạn
                  </p>
                  <p className="mb-2">
                    💳 Hoặc chuyển khoản theo thông tin hiển thị
                  </p>
                  <p className="text-orange-600 font-medium">
                    ⏰ Giao dịch sẽ tự động hủy sau {formatTime(timeLeft)}
                  </p>
                </div>
              </>
            ) : (
              statusInfo && (
                <div className="text-center py-8">
                  <div className="mb-4 flex justify-center">
                    {statusInfo.icon}
                  </div>
                  <h3 className={`text-xl font-bold mb-2 ${statusInfo.color}`}>
                    {statusInfo.title}
                  </h3>
                  <p className="text-gray-600 mb-6 max-w-md">
                    {statusInfo.message}
                  </p>

                  {paymentStatus === "success" && (
                    <div className="bg-green-50 rounded-lg p-4 mb-4">
                      <div className="text-green-800 font-medium">
                        Số dư mới: {balance.toLocaleString()} VND
                      </div>
                    </div>
                  )}

                  <button
                    onClick={closeModal}
                    className="px-6 py-2 bg-pink-500 text-white rounded-lg hover:bg-pink-600 transition-colors"
                  >
                    {paymentStatus === "success" ? "Hoàn tất" : "Thử lại"}
                  </button>
                </div>
              )
            )}
          </div>
        </div>
      )}

      <div className="w-full max-w-2xl bg-pink-50 rounded-2xl flex items-center p-6 mb-8 shadow">
        <div className="flex items-center gap-4 flex-1">
          <div className="bg-pink-200 rounded-full w-16 h-16 flex items-center justify-center">
            <CheckCircle className="w-8 h-8 text-pink-600" />
          </div>
          <div>
            <div className="font-semibold text-lg text-pink-700">
              {user?.full_name || user?.username || "Chưa đăng nhập"}
            </div>
            <div className="text-gray-500 text-sm">{user?.email || ""}</div>
          </div>
        </div>
        <div className="text-right">
          <div className="text-gray-600 text-sm">Số dư hiện tại</div>
          <div className="text-2xl font-bold text-pink-600">
            {(() => {
              console.log(
                "Hiển thị balance:",
                balance,
                "Type:",
                typeof balance
              );
              if (typeof balance === "number" && !isNaN(balance)) {
                return balance.toLocaleString();
              } else if (
                typeof balance === "string" &&
                !isNaN(parseFloat(balance))
              ) {
                return parseFloat(balance).toLocaleString();
              } else {
                return "0";
              }
            })()}{" "}
            đ
          </div>
        </div>
      </div>

      <div className="w-full max-w-4xl bg-white rounded-2xl shadow flex flex-col md:flex-row gap-8 p-8">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-4">
            <span className="text-2xl text-pink-500 font-bold">$</span>
            <span className="text-xl font-semibold text-pink-700">
              Chọn Số Tiền Nạp
            </span>
          </div>
          <div className="text-gray-500 mb-4">
            Chọn một trong các mức có sẵn hoặc nhập số tiền tuỳ chỉnh
          </div>

          <div className="grid grid-cols-3 sm:grid-cols-4 gap-4 mb-6">
            {popularAmounts.map((amount) => (
              <button
                key={amount}
                onClick={() => handleSelect(amount)}
                className={`relative rounded-xl border-2 px-0 py-0 h-16 flex flex-col items-center justify-center font-semibold text-lg transition-all
                  ${
                    selected === amount && !custom
                      ? "bg-pink-500 border-pink-500 text-white"
                      : "bg-white border-pink-200 text-pink-700 hover:bg-pink-50"
                  }`}
              >
                <span>{amount.toLocaleString()}</span>
                <span className="text-xs font-normal">VND</span>
                {popularLabels.includes(amount) && (
                  <span className="absolute -top-1 -right-1 text-xs px-2 py-0.5 rounded-full bg-orange-100 text-orange-600 font-medium">
                    Phổ biến
                  </span>
                )}
              </button>
            ))}
          </div>

          <div className="border-t border-gray-200 pt-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Hoặc nhập số tiền tùy chỉnh:
            </label>
            <input
              type="text"
              inputMode="numeric"
              pattern="[0-9]*"
              placeholder={`Nhập số tiền (${MIN_AMOUNT.toLocaleString()} - ${MAX_AMOUNT.toLocaleString()} VND)`}
              value={custom}
              onChange={handleCustomChange}
              className={`w-full border-2 rounded-lg px-4 py-3 text-lg focus:ring-2 focus:ring-pink-100 outline-none transition-colors
                ${custom ? "border-pink-500" : "border-pink-200"}
                ${error ? "border-red-300" : ""}
              `}
              autoComplete="off"
            />
            <div className="text-xs text-gray-400 mt-1">
              Số tiền nạp tối thiểu là {MIN_AMOUNT.toLocaleString()} VND, tối đa{" "}
              {MAX_AMOUNT.toLocaleString()} VND
            </div>
            {error && <div className="text-red-500 text-sm mt-2">{error}</div>}
          </div>
        </div>

        <div className="w-full md:w-80 bg-pink-50 rounded-2xl p-6 flex flex-col gap-4 shadow-sm">
          <div className="text-lg font-bold text-pink-700 mb-2 flex items-center gap-2">
            <Shield className="w-5 h-5 text-pink-400" /> Tóm Tắt Giao Dịch
          </div>
          <div className="flex justify-between text-gray-700">
            <span>Số tiền nạp:</span>
            <span className="font-semibold">
              {getAmount().toLocaleString()} đ
            </span>
          </div>
          <div className="flex justify-between text-gray-700">
            <span>Tổng thanh toán:</span>
            <span className="font-bold text-pink-600">
              {getAmount().toLocaleString()} đ
            </span>
          </div>
          <div className="flex items-center gap-2 text-gray-500 text-sm mt-2">
            <Zap className="w-4 h-4 text-pink-400" /> Xử lý:{" "}
            <span className="font-medium text-pink-600">Tức thì</span>
          </div>
          <div className="flex items-center gap-2 text-gray-500 text-sm">
            <Shield className="w-4 h-4 text-pink-400" /> Bảo mật 256-bit SSL
          </div>
          <div className="flex items-center gap-2 text-gray-500 text-sm">
            <CheckCircle className="w-4 h-4 text-pink-400" /> Không có phí ẩn
          </div>
          <button
            className="mt-4 w-full bg-pink-500 hover:bg-pink-600 text-white font-bold py-3 rounded-xl text-lg transition-all disabled:opacity-60 disabled:cursor-not-allowed"
            onClick={handleDeposit}
            disabled={loading || !isAmountValid()}
          >
            {loading ? "Đang tạo link..." : "+ Nạp Tiền Ngay"}
          </button>
          <div className="text-xs text-gray-400 text-center mt-2">
            Bằng cách nhấn "Nạp Tiền Ngay", bạn đồng ý với{" "}
            <a href="#" className="underline text-pink-500">
              Điều khoản dịch vụ
            </a>{" "}
            của Cake Story.
          </div>
        </div>
      </div>
    </div>
  );
}
