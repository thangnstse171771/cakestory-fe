import { useState, useEffect, useRef } from "react";
import { checkPaymentStatus } from "../api/wallet";

export const usePaymentStatus = (orderId, isActive, onStatusChange) => {
  const [status, setStatus] = useState("pending");
  const intervalRef = useRef(null);

  useEffect(() => {
    if (!isActive || !orderId) {
      clearInterval(intervalRef.current);
      return;
    }

    const pollStatus = async () => {
      try {
        console.log("Kiểm tra trạng thái thanh toán cho orderId:", orderId);
        const response = await checkPaymentStatus(orderId);
        console.log("Payment status response:", response);

        const newStatus = response?.status?.toUpperCase();

        if (newStatus && newStatus !== status.toUpperCase()) {
          setStatus(newStatus.toLowerCase());
          if (onStatusChange) {
            onStatusChange(newStatus.toLowerCase());
          }

          // Dừng polling nếu trạng thái cuối cùng
          if (["PAID", "CANCELLED", "FAILED"].includes(newStatus)) {
            clearInterval(intervalRef.current);
          }
        }
      } catch (error) {
        console.error("Error checking payment status:", error);
        // Không thay đổi trạng thái nếu có lỗi, tiếp tục polling
      }
    };

    // Poll ngay lập tức
    pollStatus();

    // Sau đó poll mỗi 5 giây
    intervalRef.current = setInterval(pollStatus, 5000);

    return () => {
      clearInterval(intervalRef.current);
    };
  }, [orderId, isActive, status, onStatusChange]);

  const stopPolling = () => {
    clearInterval(intervalRef.current);
  };

  return {
    status,
    stopPolling,
  };
};
