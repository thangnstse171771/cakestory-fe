import React, { useState, useMemo } from "react";
import { toast } from "react-toastify";
import { createCakeOrderFromQuote } from "../api/cakeOrder";

const CakeQuoteOrder = ({ isOpen, onClose, cakeQuote }) => {
  const [loading, setLoading] = useState(false);
  const [deliveryTime, setDeliveryTime] = useState("");

  const minDeliveryTime = useMemo(() => {
    if (!cakeQuote?.preparationTime) return new Date();
    const now = new Date();
    const prepHours = parseInt(cakeQuote.preparationTime) || 0;
    now.setHours(now.getHours() + prepHours);
    return now;
  }, [cakeQuote]);

  if (!isOpen) return null;

  // Format to datetime-local value (YYYY-MM-DDTHH:mm) using local time
  const formatDateTimeLocal = (date) => {
    const pad = (n) => String(n).padStart(2, "0");
    const y = date.getFullYear();
    const m = pad(date.getMonth() + 1);
    const d = pad(date.getDate());
    const hh = pad(date.getHours());
    const mm = pad(date.getMinutes());
    return `${y}-${m}-${d}T${hh}:${mm}`;
  };

  // Convert local datetime (from <input>) to ISO string (for API)
  const toISOStringWithLocalTime = (localDateTime) => {
    const date = new Date(localDateTime);
    return date.toISOString();
  };

  const handleConfirm = async () => {
    if (!cakeQuote) return;

    try {
      setLoading(true);

      if (!deliveryTime) {
        toast.error("Vui lòng chọn thời gian giao hàng!");
        return;
      }

      const selectedTime = new Date(deliveryTime);

      // Validate: selected must be >= minDeliveryTime
      if (selectedTime < minDeliveryTime) {
        toast.error(
          `Thời gian giao hàng phải sau ít nhất ${cakeQuote.preparationTime} giờ từ bây giờ`
        );
        return;
      }

      const orderData = {
        shop_quote_id: cakeQuote.id,
        delivery_time: toISOStringWithLocalTime(deliveryTime),
      };

      const response = await createCakeOrderFromQuote(cakeQuote.id, orderData);

      console.log("Order created:", response);
      toast.success("Đặt hàng thành công!");
      onClose();
    } catch (error) {
      console.error("Error creating order:", error);

      const apiMessage = error.response?.data?.message;

      let userMessage = "Có lỗi xảy ra khi đặt hàng!";

      if (apiMessage) {
        if (apiMessage.includes("Insufficient balance")) {
          userMessage = "Tài khoản không đủ tiền!";
        } else if (
          apiMessage.includes("An order already exists for this shop quote")
        ) {
          userMessage = "Bạn đã đặt đơn cho bánh này rồi!";
        } else {
          userMessage = "Có lỗi xảy ra khi đặt hàng!"; // fallback to API message if unrecognized
        }
      }

      toast.error(userMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl shadow-xl p-6 w-[400px] relative">
        <button
          onClick={onClose}
          className="absolute top-3 right-3 text-gray-500 hover:text-gray-700"
        >
          ✕
        </button>

        <h2 className="text-xl font-bold mb-4">Chi tiết đơn hàng</h2>

        {cakeQuote ? (
          <div className="space-y-3">
            {/* <p>ID: {cakeQuote.id}</p> */}
            <p>
              <strong>Tiệm:</strong> {cakeQuote.shop?.name}
            </p>
            <p>
              <strong>Giá:</strong> {cakeQuote.price} đ
            </p>
            <p>
              <strong>Thời gian chuẩn bị:</strong> {cakeQuote.preparationTime}{" "}
              giờ
            </p>
            <p>
              <strong>Lời nhắn:</strong> {cakeQuote.message}
            </p>

            {/* Delivery time picker */}
            <div>
              <label className="text-base font-medium mb-2 block">
                Thời gian giao hàng
              </label>
              <input
                type="datetime-local"
                value={deliveryTime}
                onChange={(e) => setDeliveryTime(e.target.value)}
                min={formatDateTimeLocal(minDeliveryTime)}
                className="w-full border-2 rounded-lg px-3 py-2"
                required
              />
              {!deliveryTime && (
                <p className="text-sm text-gray-500 mt-1">
                  Vui lòng chọn thời gian giao hàng (không sớm hơn thời gian sớm
                  nhất)
                </p>
              )}
              {deliveryTime && new Date(deliveryTime) < minDeliveryTime && (
                <p className="text-sm text-red-600 mt-1">
                  {`Thời gian giao hàng phải sau ít nhất ${
                    cakeQuote.preparationTime || 0
                  } giờ từ bây giờ`}
                </p>
              )}
              <p className="text-sm text-gray-500 mt-1">
                * Thời gian sớm nhất:{" "}
                {formatDateTimeLocal(minDeliveryTime).replace("T", " ")}
              </p>
            </div>
          </div>
        ) : (
          <p>Không có dữ liệu.</p>
        )}

        <div className="mt-6 flex justify-end gap-2">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg bg-gray-200 hover:bg-gray-300"
          >
            Hủy
          </button>
          <button
            onClick={handleConfirm}
            disabled={
              loading ||
              !deliveryTime ||
              (deliveryTime && new Date(deliveryTime) < minDeliveryTime)
            }
            className={`px-4 py-2 rounded-lg text-white ${
              loading
                ? "bg-gray-400 cursor-not-allowed"
                : "bg-blue-600 hover:bg-blue-700"
            }`}
          >
            {loading ? "Đang xử lý..." : "Xác nhận đặt hàng"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default CakeQuoteOrder;
