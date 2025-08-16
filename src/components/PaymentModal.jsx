import { X, Clock, CheckCircle, AlertCircle } from "lucide-react";

const PaymentModal = ({
  showModal,
  paymentStatus,
  paymentUrl,
  timeLeft,
  getAmount,
  formatTime,
  closeModal,
  balance,
}) => {
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

  if (!showModal) return null;

  return (
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

            <div className="flex items-center gap-2 mb-4 px-4 py-2 bg-orange-50 rounded-lg">
              <Clock className="w-5 h-5 text-orange-500" />
              <span className="text-orange-600 font-medium">
                Thời gian còn lại: {formatTime(timeLeft)}
              </span>
            </div>

            <div className="mb-4 text-center">
              <div className="text-gray-600">Số tiền cần thanh toán:</div>
              <div className="text-2xl font-bold text-pink-600">
                {getAmount().toLocaleString()} VND
              </div>
            </div>

            <div className="w-full">
              <iframe
                src={paymentUrl}
                title="Thanh toán VietQR"
                className="rounded-xl border border-pink-200 w-full h-[500px] min-h-[400px]"
                allowFullScreen
                sandbox="allow-same-origin allow-scripts allow-forms"
                onError={(e) => {
                  console.error("Iframe load error:", e);
                }}
                style={{
                  filter: "none",
                }}
              />
            </div>

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
              <div className="mb-4 flex justify-center">{statusInfo.icon}</div>
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
  );
};

export default PaymentModal;
