import { useState } from "react";
import ComplaintModal from "../ComplaintManagement/ComplaintModal";
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
  processing: {
    label: "Đang chuẩn bị",
    icon: <Sparkles className="h-5 w-5" />,
    color: "text-blue-500",
  },
  awaiting_shipment: {
    label: "Đợi vận chuyển",
    icon: <Hourglass className="h-5 w-5" />,
    color: "text-purple-500",
  },
  shipping: {
    label: "Đang vận chuyển",
    icon: <Truck className="h-5 w-5" />,
    color: "text-orange-500",
  },
  delivered: {
    label: "Đã giao hàng",
    icon: <CheckCircle className="h-5 w-5" />,
    color: "text-green-500",
  },
  completed: {
    label: "Hoàn tất",
    icon: <ClipboardCheck className="h-5 w-5" />,
    color: "text-emerald-500",
  },
};

export default function OrderTrackingForm({
  order,
  onUpdateStatus,
  onBackToList,
}) {
  // Local state để cập nhật trạng thái động
  const [orderDetail, setOrderDetail] = useState(order);
  const [note, setNote] = useState("");
  const [showComplaintModal, setShowComplaintModal] = useState(false);

  if (!orderDetail) {
    return (
      <div className="flex flex-col items-center justify-center h-full p-8">
        <h2 className="text-2xl font-bold mb-4">Không tìm thấy đơn hàng</h2>
        <p className="text-gray-500 mb-6">
          Vui lòng chọn một đơn hàng từ danh sách.
        </p>
        <button
          onClick={onBackToList}
          className="bg-pink-500 hover:bg-pink-600 text-white font-semibold px-6 py-2 rounded-lg shadow"
        >
          Quay lại danh sách đơn hàng
        </button>
      </div>
    );
  }

  const currentStatusIndex = Object.keys(statusMap).indexOf(orderDetail.status);
  const progressPercentage =
    (currentStatusIndex / (Object.keys(statusMap).length - 1)) * 100;

  // Hàm cập nhật trạng thái đơn hàng local
  const handleUpdateStatus = (orderId, newStatus, newHistoryEntry) => {
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
    if (onUpdateStatus) onUpdateStatus(orderId, newStatus, newHistoryEntry);
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
          onClick={onBackToList}
          className="mb-6 bg-transparent border border-pink-300 text-pink-600 hover:bg-pink-100 px-6 py-2 rounded-lg font-semibold"
        >
          {"<"} Quay lại danh sách đơn hàng
        </button>

        {/* Hiện nút khiếu nại nếu trạng thái là delivered hoặc completed */}
        {(orderDetail.status === "delivered" ||
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
              {Object.values(statusMap).map((s, index) => (
                <div
                  key={s.label}
                  className="flex flex-col items-center text-center w-1/6"
                >
                  <div
                    className={`p-3 rounded-full mb-1 transition-all duration-500 ${
                      index <= currentStatusIndex
                        ? "bg-pink-500 text-white"
                        : "bg-gray-200 text-gray-500"
                    }`}
                  >
                    {s.icon}
                  </div>
                  <span className="mt-1">{s.label}</span>
                </div>
              ))}
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
              <span>{orderDetail.total.toLocaleString("vi-VN")}đ</span>
            </div>
          </div>

          {/* Update Status (Admin/Internal Use) */}
          <div className="p-4 bg-pink-50 border border-pink-100 rounded-xl mb-6">
            <h3 className="text-lg font-semibold mb-3 flex items-center gap-2 text-pink-600">
              <MessageSquareText className="h-5 w-5" />
              Cập nhật trạng thái & Ghi chú
            </h3>
            <div className="flex flex-wrap gap-2 mb-4">
              {Object.keys(statusMap).map((statusKey) => (
                <button
                  key={statusKey}
                  onClick={() => handleUpdateStatus(orderDetail.id, statusKey)}
                  className={`px-4 py-2 rounded-lg font-semibold border transition-colors duration-200 ${
                    orderDetail.status === statusKey
                      ? "bg-pink-500 text-white border-pink-500 hover:bg-pink-600"
                      : "bg-transparent border-pink-300 text-pink-600 hover:bg-pink-100"
                  }`}
                >
                  {statusMap[statusKey].label}
                </button>
              ))}
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
