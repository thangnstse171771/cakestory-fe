import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import ComplaintModal from "../ComplaintManagement/ComplaintModal";
import { fetchOrderById } from "../../api/axios";
import {
  User,
  Package,
  Truck,
  CheckCircle,
  Clock,
  Sparkles,
  MessageSquareText,
  Hourglass,
  ClipboardCheck,
} from "lucide-react";

const statusMap = {
  pending: {
    label: "Đang chờ xử lý",
    icon: <Clock className="h-5 w-5" />,
    color: "text-yellow-500",
  },
  ordered: {
    label: "Đã tiếp nhận",
    icon: <ClipboardCheck className="h-5 w-5" />,
    color: "text-cyan-500",
  },
  preparedForDelivery: {
    label: "Sẵn sàng giao hàng",
    icon: <Package className="h-5 w-5" />,
    color: "text-blue-500",
  },
  shipped: {
    label: "Đang vận chuyển",
    icon: <Truck className="h-5 w-5" />,
    color: "text-orange-500",
  },
  completed: {
    label: "Hoàn tất",
    icon: <CheckCircle className="h-5 w-5" />,
    color: "text-emerald-500",
  },
  complaining: {
    label: "Đang khiếu nại",
    icon: <MessageSquareText className="h-5 w-5" />,
    color: "text-red-600",
  },
  cancelled: {
    label: "Đã hủy",
    icon: <Clock className="h-5 w-5" />,
    color: "text-red-500",
  },
};

export default function OrderTrackingForm({
  order,
  onUpdateStatus,
  onBackToList,
}) {
  const navigate = useNavigate();
  const { orderId } = useParams();

  // Local state để cập nhật trạng thái động
  const [orderDetail, setOrderDetail] = useState(order);
  const [note, setNote] = useState("");
  const [showComplaintModal, setShowComplaintModal] = useState(false);
  const [loading, setLoading] = useState(false);

  // Fetch order detail nếu có orderId từ URL params
  useEffect(() => {
    if (orderId && !order) {
      fetchOrderDetail();
    }
  }, [orderId]); // Chỉ depend vào orderId

  const fetchOrderDetail = async () => {
    try {
      setLoading(true);
      const response = await fetchOrderById(orderId);

      // Transform data để phù hợp với component
      const transformedOrder = {
        id: response.id || response._id,
        customerName: response.customer_id?.name || "Không có tên",
        customerEmail: response.customer_id?.email || "Không có email",
        customerPhone: response.customer_id?.phone || "Không có SĐT",
        items: response.items || [],
        total: response.total || 0,
        base_price:
          parseFloat(response.base_price) ||
          parseFloat(response.total_price) ||
          parseFloat(response.total) ||
          0,
        status: response.status || "pending",
        orderNumber: response.orderNumber || `ORD-${response.id}`,
        placeDate: response.placeDate || new Date().toISOString().split("T")[0],
        history: response.history || [
          {
            date: response.placeDate || new Date().toISOString().split("T")[0],
            time: new Date().toLocaleTimeString("vi-VN", {
              hour: "2-digit",
              minute: "2-digit",
            }),
            status: response.status || "pending",
            note: "Đơn hàng được tạo",
          },
        ],
      };

      setOrderDetail(transformedOrder);
    } catch (error) {
      console.error("Lỗi khi fetch order detail:", error);
      alert("Không thể tải thông tin đơn hàng");
    } finally {
      setLoading(false);
    }
  };

  const handleBackToList = () => {
    if (onBackToList) {
      onBackToList();
    } else {
      navigate("/order-tracking");
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-full p-8">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-500 mb-4"></div>
        <p className="text-gray-500">Đang tải thông tin đơn hàng...</p>
      </div>
    );
  }

  if (!orderDetail) {
    return (
      <div className="flex flex-col items-center justify-center h-full p-8">
        <h2 className="text-2xl font-bold mb-4">Không tìm thấy đơn hàng</h2>
        <p className="text-gray-500 mb-6">
          Vui lòng chọn một đơn hàng từ danh sách.
        </p>
        <button
          onClick={handleBackToList}
          className="bg-pink-500 hover:bg-pink-600 text-white font-semibold px-6 py-2 rounded-lg shadow"
        >
          Quay lại danh sách đơn hàng
        </button>
      </div>
    );
  }

  // Các trạng thái chính theo thứ tự flow
  const mainStatusFlow = [
    "pending",
    "ordered",
    "preparedForDelivery",
    "shipped",
    "completed",
  ];
  const currentStatusIndex = mainStatusFlow.indexOf(orderDetail.status);
  const progressPercentage =
    currentStatusIndex >= 0
      ? (currentStatusIndex / (mainStatusFlow.length - 1)) * 100
      : 0;

  // Hàm cập nhật trạng thái đơn hàng local
  const handleUpdateStatus = async (orderId, newStatus, newHistoryEntry) => {
    try {
      // Cập nhật local state trước
      setOrderDetail((prev) => {
        if (!prev) return prev;
        const updated = {
          ...prev,
          status: newStatus,
          history: newHistoryEntry
            ? [...prev.history, newHistoryEntry]
            : prev.history,
        };
        return updated;
      });

      // Gọi API để cập nhật trạng thái
      if (onUpdateStatus) {
        await onUpdateStatus(orderId, newStatus, newHistoryEntry);
      }

      // Hiển thị thông báo thành công
      alert(
        `Đã cập nhật trạng thái đơn hàng thành: ${
          statusMap[newStatus]?.label || newStatus
        }`
      );
    } catch (error) {
      console.error("Lỗi khi cập nhật trạng thái:", error);

      // Hiển thị thông báo lỗi chi tiết hơn
      const errorMessage =
        error.response?.data?.message ||
        error.message ||
        "Có lỗi khi cập nhật trạng thái đơn hàng";
      alert(errorMessage);

      // Revert lại trạng thái cũ nếu API call thất bại
      if (order) {
        setOrderDetail(order);
      }
    }
  };

  const handleAddNote = () => {
    if (note.trim()) {
      const newHistoryEntry = {
        date: new Date().toISOString().split("T")[0],
        time: new Date().toLocaleTimeString("vi-VN", {
          hour: "2-digit",
          minute: "2-digit",
        }),
        status: orderDetail.status,
        note: note.trim(),
      };
      handleUpdateStatus(orderDetail.id, orderDetail.status, newHistoryEntry);
      setNote("");
    }
  };

  return (
    <div className="p-8 bg-pink-50 min-h-screen">
      <div className="max-w-4xl mx-auto">
        <button
          onClick={handleBackToList}
          className="mb-6 bg-transparent border border-pink-300 text-pink-600 hover:bg-pink-100 px-6 py-2 rounded-lg font-semibold"
        >
          {"<"} Quay lại danh sách đơn hàng
        </button>

        {/* Hiện nút khiếu nại nếu trạng thái là shipped hoặc completed */}
        {(orderDetail.status === "shipped" ||
          orderDetail.status === "completed") && (
          <button
            className="mb-6 ml-4 bg-red-500 hover:bg-red-600 text-white font-semibold px-6 py-2 rounded-lg shadow"
            onClick={() => setShowComplaintModal(true)}
          >
            Tạo khiếu nại
          </button>
        )}

        <div className="p-6 shadow-lg rounded-xl border border-pink-100 bg-white mb-8">
          {/* Progress Bar */}
          <div className="relative pt-1 mb-8">
            <div className="flex mb-2 items-center justify-between text-xs font-semibold text-gray-600">
              {mainStatusFlow.map((statusKey, index) => {
                const status = statusMap[statusKey];
                return (
                  <div
                    key={statusKey}
                    className="flex flex-col items-center text-center flex-1"
                  >
                    <div
                      className={`p-3 rounded-full mb-1 transition-all duration-500 ${
                        index <= currentStatusIndex
                          ? "bg-pink-500 text-white"
                          : "bg-gray-200 text-gray-500"
                      }`}
                    >
                      {status.icon}
                    </div>
                    <span className="mt-1">{status.label}</span>
                  </div>
                );
              })}
            </div>
            <div className="overflow-hidden h-2 mb-4 text-xs flex rounded bg-pink-100">
              <div
                style={{ width: `${progressPercentage}%` }}
                className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-pink-500 transition-all duration-500 ease-out"
              ></div>
            </div>
          </div>

          {/* Customer Details */}
          <div className="p-4 bg-pink-50 border border-pink-100 rounded-xl mb-6">
            <h3 className="text-lg font-semibold mb-3 flex items-center gap-2 text-pink-600">
              <User className="h-5 w-5" />
              Thông tin khách hàng
            </h3>
            <ul className="space-y-1 text-gray-800">
              <li>
                <span className="font-medium">Tên:</span>{" "}
                {orderDetail.customerName}
              </li>
              <li>
                <span className="font-medium">Email:</span>{" "}
                {orderDetail.customerEmail}
              </li>
              <li>
                <span className="font-medium">Điện thoại:</span>{" "}
                {orderDetail.customerPhone}
              </li>
            </ul>
          </div>

          {/* Order Items */}
          <div className="p-4 bg-pink-50 border border-pink-100 rounded-xl mb-6">
            <h3 className="text-lg font-semibold mb-3 flex items-center gap-2 text-pink-600">
              <Package className="h-5 w-5" />
              Sản phẩm đơn hàng
            </h3>
            <ul className="space-y-3">
              {orderDetail.items?.map((item, index) => (
                <li
                  key={index}
                  className="flex justify-between items-start border-b border-pink-100 pb-3 last:border-b-0 last:pb-0"
                >
                  <div>
                    <p className="font-medium text-gray-800">{item.name}</p>
                    <p className="text-sm text-gray-600">
                      Số lượng: {item.quantity}
                    </p>
                    {item.customization && (
                      <div className="text-xs text-gray-500 mt-1 space-y-0.5">
                        <p>Kích thước: {item.customization.size}</p>
                        {item.customization.toppings?.length > 0 && (
                          <p>
                            Topping:{" "}
                            {item.customization.toppings
                              .map((t) => `${t.name} (${t.quantity})`)
                              .join(", ")}
                          </p>
                        )}
                      </div>
                    )}
                  </div>
                  <span className="font-semibold text-pink-600">
                    {(item.price * item.quantity).toLocaleString("vi-VN")}đ
                  </span>
                </li>
              ))}
            </ul>
            <div className="flex justify-between items-center mt-4 p-4 bg-pink-100 rounded-lg font-bold text-lg text-pink-800">
              <span>Tổng cộng:</span>
              <span>{orderDetail.base_price.toLocaleString("vi-VN")}đ</span>
            </div>
          </div>

          {/* Update Status (Admin/Internal Use) */}
          <div className="p-4 bg-pink-50 border border-pink-100 rounded-xl mb-6">
            <h3 className="text-lg font-semibold mb-3 flex items-center gap-2 text-pink-600">
              <MessageSquareText className="h-5 w-5" />
              Cập nhật trạng thái & Ghi chú
            </h3>
            <div className="flex flex-wrap gap-2 mb-4">
              {/* Nút chuyển sang ordered (chỉ hiện khi đang pending) */}
              {orderDetail.status === "pending" && (
                <button
                  onClick={() => handleUpdateStatus(orderDetail.id, "ordered")}
                  className="px-4 py-2 rounded-lg font-semibold border bg-cyan-500 text-white border-cyan-500 hover:bg-cyan-600 transition-colors duration-200"
                >
                  Tiếp nhận đơn hàng
                </button>
              )}

              {/* Nút chuyển sang shipped (hiện khi đang ordered hoặc preparedForDelivery) */}
              {(orderDetail.status === "ordered" ||
                orderDetail.status === "preparedForDelivery") && (
                <button
                  onClick={() => handleUpdateStatus(orderDetail.id, "shipped")}
                  className="px-4 py-2 rounded-lg font-semibold border bg-orange-500 text-white border-orange-500 hover:bg-orange-600 transition-colors duration-200"
                >
                  Giao hàng
                </button>
              )}

              {/* Nút chuyển sang completed (hiện khi đang shipped hoặc complaining) */}
              {(orderDetail.status === "shipped" ||
                orderDetail.status === "complaining") && (
                <button
                  onClick={() =>
                    handleUpdateStatus(orderDetail.id, "completed")
                  }
                  className="px-4 py-2 rounded-lg font-semibold border bg-emerald-500 text-white border-emerald-500 hover:bg-emerald-600 transition-colors duration-200"
                >
                  Hoàn thành đơn hàng
                </button>
              )}

              {/* Nút hủy đơn (hiện khi chưa hoàn thành) */}
              {orderDetail.status !== "completed" &&
                orderDetail.status !== "cancelled" && (
                  <button
                    onClick={() =>
                      handleUpdateStatus(orderDetail.id, "cancelled")
                    }
                    className="px-4 py-2 rounded-lg font-semibold border bg-red-500 text-white border-red-500 hover:bg-red-600 transition-colors duration-200"
                  >
                    Hủy đơn hàng
                  </button>
                )}
            </div>

            {/* Hiển thị thông tin về flow trạng thái */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-4">
              <p className="text-sm text-blue-700">
                <strong>Luồng trạng thái:</strong> Đang chờ xử lý → Đã tiếp nhận
                → Sẵn sàng giao hàng → Đang vận chuyển → Hoàn tất
              </p>
              <p className="text-xs text-blue-600 mt-1">
                * API hỗ trợ cập nhật: Tiếp nhận đơn hàng, Giao hàng, Hoàn thành
                đơn hàng, và Hủy đơn hàng
              </p>
            </div>
            <div className="flex gap-2 mb-4">
              <input
                type="text"
                placeholder="Thêm ghi chú..."
                value={note}
                onChange={(e) => setNote(e.target.value)}
                className="flex-1 border border-pink-200 focus:border-pink-400 focus:ring-pink-400 rounded-lg px-3 py-2 outline-none"
              />
              <button
                onClick={handleAddNote}
                className="bg-pink-500 hover:bg-pink-600 text-white font-semibold px-4 py-2 rounded-lg"
              >
                Thêm ghi chú
              </button>
            </div>

            {/* Status History */}
            <h4 className="text-md font-semibold mb-2 text-pink-600">
              Lịch sử trạng thái:
            </h4>
            <ul className="space-y-3">
              {orderDetail.history.map((entry, index) => (
                <li
                  key={index}
                  className="flex items-start gap-3 p-3 bg-white rounded-lg shadow-sm border border-pink-50"
                >
                  <div className="flex-shrink-0 mt-1">
                    {statusMap[entry.status]?.icon}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-sm font-medium text-gray-700">
                        {entry.date} {entry.time}
                      </span>
                      <span
                        className={`px-2 py-0.5 text-xs rounded-lg font-semibold ${
                          statusMap[entry.status]?.color ||
                          "bg-gray-200 text-gray-700"
                        }`}
                      >
                        {statusMap[entry.status]?.label || entry.status}
                      </span>
                    </div>
                    <p className="text-gray-700 text-sm">{entry.note}</p>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {/* Hiện form khiếu nại nếu showComplaintModal true */}
      {showComplaintModal && (
        <ComplaintModal
          isOpen={showComplaintModal}
          onClose={() => setShowComplaintModal(false)}
          order={orderDetail}
          onSubmit={() => setShowComplaintModal(false)}
        />
      )}
    </div>
  );
}
