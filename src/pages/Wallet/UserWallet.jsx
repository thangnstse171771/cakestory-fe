import { useState, useEffect, useRef } from "react";
import {
  CheckCircle,
  Shield,
  Zap,
  X,
  Clock,
  AlertCircle,
  History,
  ArrowUpRight,
  Receipt,
} from "lucide-react";
import { useAuth } from "../../contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import {
  depositToWallet,
  fetchWalletBalance,
  checkPaymentStatus,
} from "../../api/axios";
import PaymentHistory from "./PaymentHistory";

const popularAmounts = [
  10000, 20000, 30000, 50000, 100000, 200000, 500000, 1000000,
];
const popularLabels = [50000, 100000, 200000];

// Map API/network errors to friendly, banking-style messages
const humanizePaymentError = (err) => {
  try {
    const status = err?.response?.status;
    const rawMsg = err?.response?.data?.message || err?.message || "";
    const msg = (rawMsg || "").toString().toLowerCase();

    // Server overloaded / internal errors
    if ((status && status >= 500) || status === 429) {
      return (
        "Hệ thống thanh toán đang bận hoặc gặp sự cố. Quá trình xử lý đang diễn ra, vui lòng thử lại sau 1-2 phút. " +
        "Nếu tiền đã trừ, số dư sẽ tự động cập nhật khi giao dịch hoàn tất."
      );
    }
    // Gateway timeout / timeouts
    if (
      status === 504 ||
      msg.includes("timeout") ||
      msg.includes("timed out")
    ) {
      return (
        "Kết nối tới cổng thanh toán bị chậm. Vui lòng thử lại sau ít phút. " +
        "Không thao tác quá nhanh để tránh tạo nhiều giao dịch."
      );
    }
    // Network unreachable
    if (!err?.response) {
      return "Không thể kết nối máy chủ thanh toán. Vui lòng kiểm tra mạng và thử lại.";
    }
    // Validation or client errors with server message
    if (rawMsg) return rawMsg;
  } catch {}
  return "Có lỗi xảy ra trong quá trình xử lý. Vui lòng thử lại sau.";
};

export default function UserWallet() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [balance, setBalance] = useState(0);
  const [selected, setSelected] = useState(null);
  const [custom, setCustom] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [paymentUrl, setPaymentUrl] = useState("");
  const [qrCodeUrl, setQrCodeUrl] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [paymentStatus, setPaymentStatus] = useState("pending"); // pending, success, failed, expired, cancelled
  const [timeLeft, setTimeLeft] = useState(300); // 5 minutes in seconds
  const [orderId, setOrderId] = useState("");
  const [initialBalance, setInitialBalance] = useState(0); // Thêm state để lưu balance ban đầu
  const [refreshHistory, setRefreshHistory] = useState(0); // Trigger refresh lịch sử giao dịch
  const [showHistoryModal, setShowHistoryModal] = useState(false); // Modal lịch sử giao dịch

  const timerRef = useRef(null);
  const statusCheckRef = useRef(null);
  // Lock to prevent duplicate clicks and a small cooldown between attempts
  const depositLockRef = useRef(false);
  const [cooldown, setCooldown] = useState(0);

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

  // Cooldown ticker to avoid button spamming
  useEffect(() => {
    if (cooldown <= 0) return;
    const t = setInterval(() => setCooldown((c) => Math.max(0, c - 1)), 1000);
    return () => clearInterval(t);
  }, [cooldown]);

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

  // Status checking (polling balance every 5 seconds)
  useEffect(() => {
    if (showModal && paymentStatus === "pending" && orderId) {
      console.log("Bắt đầu auto check balance cho orderId:", orderId);
      console.log("Initial balance:", initialBalance);

      statusCheckRef.current = setInterval(async () => {
        try {
          console.log("Checking balance change...");
          const balanceRes = await fetchWalletBalance();

          let currentBalance = 0;
          if (balanceRes?.wallet?.balance !== undefined) {
            currentBalance =
              typeof balanceRes.wallet.balance === "string"
                ? parseFloat(balanceRes.wallet.balance)
                : balanceRes.wallet.balance;
          } else if (balanceRes?.balance !== undefined) {
            currentBalance =
              typeof balanceRes.balance === "string"
                ? parseFloat(balanceRes.balance)
                : balanceRes.balance;
          } else if (balanceRes?.data?.balance !== undefined) {
            currentBalance =
              typeof balanceRes.data.balance === "string"
                ? parseFloat(balanceRes.data.balance)
                : balanceRes.data.balance;
          }

          console.log(
            "Current balance:",
            currentBalance,
            "Initial balance:",
            initialBalance
          );

          // Nếu balance tăng lên = thanh toán thành công
          if (currentBalance > initialBalance) {
            console.log(
              "✅ Thanh toán thành công! Balance tăng từ",
              initialBalance,
              "lên",
              currentBalance
            );
            setPaymentStatus("success");
            setBalance(currentBalance); // Update balance ngay
            setRefreshHistory((prev) => prev + 1); // Trigger refresh lịch sử giao dịch
          }
        } catch (e) {
          console.error("Error checking balance:", e);
          // Không set error để tránh làm gián đoạn flow
        }
      }, 5000); // Check mỗi 5 giây
    } else {
      clearInterval(statusCheckRef.current);
    }

    return () => clearInterval(statusCheckRef.current);
  }, [showModal, paymentStatus, orderId, initialBalance]);

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
    // Loại bỏ tất cả ký tự không phải số (bao gồm dấu phẩy)
    let value = e.target.value.replace(/[^\d]/g, "");

    // Nếu không có gì thì return luôn
    if (value === "") {
      setCustom("");
      setSelected(null);
      setError("");
      return;
    }

    // Convert to number để kiểm tra giá trị
    const numericValue = Number(value);

    // Nếu vượt quá MAX_AMOUNT thì set về MAX_AMOUNT
    if (numericValue > MAX_AMOUNT) {
      value = MAX_AMOUNT.toString();
    }

    // Giới hạn tối đa 8 chữ số sau khi đã xử lý MAX_AMOUNT
    if (value.length > 8) {
      value = value.substring(0, 8);
    }

    setCustom(value);
    setSelected(null);

    const finalValue = Number(value);
    if (finalValue < MIN_AMOUNT) {
      setError(`Số tiền nạp tối thiểu là ${MIN_AMOUNT.toLocaleString()} VND`);
    } else if (finalValue > MAX_AMOUNT) {
      setError(`Số tiền nạp tối đa là ${MAX_AMOUNT.toLocaleString()} VND`);
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
    // Block when a pending transaction is already open
    if (showModal && paymentStatus === "pending") {
      setError(
        "Bạn đang có một giao dịch nạp tiền đang chờ. Vui lòng hoàn tất hoặc đóng trước khi tạo giao dịch mới."
      );
      return;
    }

    // Race-safe double-click guard
    if (depositLockRef.current) return;
    depositLockRef.current = true;

    const amount = getAmount();

    if (amount === 0) {
      setError("Vui lòng chọn hoặc nhập số tiền cần nạp.");
      depositLockRef.current = false;
      return;
    }

    if (!isAmountValid()) {
      setError(
        `Số tiền nạp phải từ ${MIN_AMOUNT.toLocaleString()} đến ${MAX_AMOUNT.toLocaleString()} VND và chỉ được nhập số.`
      );
      depositLockRef.current = false;
      return;
    }

    setLoading(true);
    setError("");

    try {
      const res = await depositToWallet(amount);
      console.log("Deposit response:", res);
      console.log("Response data structure:", JSON.stringify(res, null, 2));

      // Kiểm tra các field có thể có trong response
      const qrCode =
        res?.data?.qrCodeImageUrl ||
        res?.data?.qrCode ||
        res?.qrCode ||
        res?.data?.qr_code ||
        res?.qr_code;
      const paymentLink =
        res?.data?.paymentUrl ||
        res?.paymentUrl ||
        res?.data?.payment_url ||
        res?.payment_url;
      const orderCode =
        res?.data?.depositRecord?.depositCode ||
        res?.data?.orderId ||
        res?.orderId ||
        res?.data?.order_id ||
        res?.order_id ||
        res?.data?.depositRecord?.id;

      console.log("Extracted values:", {
        qrCode: qrCode ? `${qrCode.substring(0, 50)}...` : null,
        paymentLink,
        orderCode,
      });

      if (qrCode || paymentLink) {
        // Lưu balance hiện tại trước khi thanh toán
        setInitialBalance(balance);
        console.log("Lưu initial balance:", balance);

        setPaymentUrl(paymentLink || "");
        setQrCodeUrl(qrCode || paymentLink || "");
        setOrderId(orderCode || `order_${Date.now()}`);
        setPaymentStatus("pending");
        setTimeLeft(300); // Reset timer to 5 minutes
        setShowModal(true);

        // Debug QR code type
        if (qrCode) {
          console.log("QR Code type:", typeof qrCode);
          console.log(
            "QR Code starts with data:image?",
            qrCode.startsWith("data:image")
          );
          console.log("QR Code length:", qrCode.length);
        }
      } else {
        setError("Không lấy được link thanh toán. Vui lòng thử lại.");
      }
    } catch (e) {
      console.error("Deposit error:", e);
      setError(humanizePaymentError(e));
    } finally {
      setLoading(false);
      depositLockRef.current = false; // release lock
      setCooldown(15); // 15s cooldown per transaction (Fleen processing window)
    }
  };

  const closeModal = async () => {
    clearInterval(timerRef.current);
    clearInterval(statusCheckRef.current);
    setShowModal(false);
    setPaymentUrl("");
    setQrCodeUrl("");
    setOrderId("");
    setInitialBalance(0);
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

                {/* QR Code Image */}
                {qrCodeUrl ? (
                  <div className="w-full flex justify-center">
                    <div className="bg-white rounded-xl border border-pink-200 p-6 shadow-sm">
                      <div className="text-center mb-4">
                        <h3 className="text-lg font-semibold text-gray-800">
                          Quét mã QR để thanh toán
                        </h3>
                      </div>
                      <img
                        src={qrCodeUrl}
                        alt="QR Code thanh toán"
                        className="w-80 h-80 object-contain mx-auto border rounded-lg bg-white"
                        onError={(e) => {
                          console.error("QR Code image error:", e);
                          console.error(
                            "QR URL:",
                            qrCodeUrl?.substring(0, 100)
                          );
                          e.target.style.display = "none";
                          e.target.nextSibling.style.display = "block";
                        }}
                        onLoad={() => {
                          console.log("QR Code loaded successfully");
                        }}
                        style={{
                          maxWidth: "100%",
                          maxHeight: "100%",
                        }}
                      />
                      <div
                        className="text-center text-gray-500 py-20 hidden"
                        style={{ display: "none" }}
                      >
                        <p>❌ Không thể tải mã QR</p>
                        <p className="text-sm">Vui lòng thử lại sau</p>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="w-full flex justify-center">
                    <div className="bg-gray-50 rounded-xl border border-gray-200 p-6 text-center">
                      <p className="text-gray-500">⏳ Đang tạo mã QR...</p>
                    </div>
                  </div>
                )}

                {/* Instructions */}
                <div className="mt-6 text-center text-sm text-gray-600 max-w-md">
                  <div className="bg-blue-50 rounded-lg p-4 mb-4">
                    <p className="mb-2 font-medium text-blue-800">
                      🏦 Hướng dẫn thanh toán:
                    </p>
                    <p className="mb-2 text-blue-700">
                      📱 Mở ứng dụng ngân hàng và quét mã QR
                    </p>
                    <p className="mb-2 text-blue-700">
                      � Kiểm tra số tiền: {getAmount().toLocaleString()} VND
                    </p>
                    <p className="text-blue-700">
                      ✅ Xác nhận thanh toán trong ứng dụng
                    </p>
                  </div>

                  {/* Auto check status indicator */}
                  <div className="bg-green-50 rounded-lg p-3 mb-4">
                    <div className="flex items-center justify-center gap-2">
                      <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                      <span className="text-green-700 text-xs font-medium">
                        Đang tự động kiểm tra số dư ví...
                      </span>
                    </div>
                    <p className="text-green-600 text-xs mt-1">
                      Hệ thống sẽ tự động cập nhật khi phát hiện thay đổi số dư
                    </p>
                  </div>

                  <p className="text-orange-600 font-medium">
                    ⏰ Mã QR sẽ hết hạn sau {formatTime(timeLeft)}
                  </p>
                  <p className="text-xs text-gray-500 mt-2">
                    Sau khi thanh toán thành công, số dư sẽ được cập nhật tự
                    động
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

      <div className="w-full max-w-2xl bg-pink-50 rounded-2xl p-6 mb-8 shadow">
        {/* Thông tin ví và số dư nằm ngang */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
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

        {/* Các button nằm bên dưới */}
        <div className="flex items-center justify-center gap-4">
          <button
            onClick={() => navigate("/withdraw")}
            className="bg-orange-100 hover:bg-orange-200 rounded-2xl w-16 h-16 flex items-center justify-center transition-colors group"
            title="Rút tiền"
          >
            <ArrowUpRight className="w-6 h-6 text-orange-600 group-hover:text-orange-700" />
          </button>
          <button
            onClick={() => setShowHistoryModal(true)}
            className="bg-blue-100 hover:bg-blue-200 rounded-2xl w-16 h-16 flex items-center justify-center transition-colors group"
            title="Xem lịch sử giao dịch"
          >
            <History className="w-6 h-6 text-blue-600 group-hover:text-blue-700" />
          </button>
          <button
            onClick={() => navigate("/all-transactions")}
            className="bg-purple-100 hover:bg-purple-200 rounded-2xl w-16 h-16 flex items-center justify-center transition-colors group"
            title="Tất cả giao dịch"
          >
            <Receipt className="w-6 h-6 text-purple-600 group-hover:text-purple-700" />
          </button>
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
              value={custom ? Number(custom).toLocaleString() : ""}
              onChange={handleCustomChange}
              className={`w-full border-2 rounded-lg px-4 py-3 text-lg focus:ring-2 focus:ring-pink-100 outline-none transition-colors
                ${custom ? "border-pink-500" : "border-pink-200"}
                ${error ? "border-red-300" : ""}
              `}
              autoComplete="off"
              maxLength="11" // Tối đa 11 ký tự bao gồm dấu phẩy (20,000,000)
            />
            <div className="text-xs text-gray-400 mt-1">
              Số tiền nạp tối thiểu là {MIN_AMOUNT.toLocaleString()} VND, tối đa{" "}
              {MAX_AMOUNT.toLocaleString()} VND
              {custom && Number(custom) === MAX_AMOUNT && (
                <span className="block text-orange-500 font-medium mt-1">
                  ⚠️ Đã đạt giới hạn tối đa
                </span>
              )}
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
            <Shield className="w-4 h-4 text-pink-400" /> Thanh toán dễ dàng,
            nhanh chóng
          </div>
          <div className="flex items-center gap-2 text-gray-500 text-sm">
            <CheckCircle className="w-4 h-4 text-pink-400" /> Không có phí ẩn
          </div>
          <button
            className="mt-4 w-full bg-pink-500 hover:bg-pink-600 text-white font-bold py-3 rounded-xl text-lg transition-all disabled:opacity-60 disabled:cursor-not-allowed"
            onClick={handleDeposit}
            disabled={
              loading ||
              !isAmountValid() ||
              cooldown > 0 ||
              (showModal && paymentStatus === "pending")
            }
          >
            {loading
              ? "Đang tạo link..."
              : cooldown > 0
              ? `Vui lòng đợi ${cooldown}s`
              : "+ Nạp Tiền Ngay"}
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

      {/* Modal lịch sử giao dịch */}
      {showHistoryModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
          <div className="bg-white rounded-2xl shadow-xl max-w-5xl w-full mx-4 max-h-[90vh] overflow-hidden">
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h2 className="text-xl font-bold text-gray-800">
                Lịch Sử Giao Dịch
              </h2>
              <button
                onClick={() => setShowHistoryModal(false)}
                className="p-2 rounded-full hover:bg-gray-100 text-gray-500"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            <div className="overflow-y-auto max-h-[calc(90vh-80px)]">
              <PaymentHistory refreshTrigger={refreshHistory} />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
