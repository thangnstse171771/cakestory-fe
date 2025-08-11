// NOTE: This file was originally for shop tracking but misnamed.
// Use OrderTrackingFormShop.jsx instead for shop view.
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
  MessageSquareText,
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

export default function OrderTrackingFormByShop({ order, onBackToList }) {
  const navigate = useNavigate();
  const { orderId } = useParams();

  // Local state để hiển thị thông tin đơn hàng
  const [orderDetail, setOrderDetail] = useState(order);
  const [showComplaintModal, setShowComplaintModal] = useState(false);
  const [loading, setLoading] = useState(false);

  // Fetch order detail nếu có orderId từ URL params
  useEffect(() => {
    if (orderId && !order) {
      fetchOrderDetail();
    }
  }, [orderId]);

  const fetchOrderDetail = async () => {
    try {
      setLoading(true);
      const response = await fetchOrderById(orderId);

      // Normalize numeric prices with heuristics
      const parseAmount = (v) => {
        if (v === null || v === undefined || v === "") return 0;
        const n = parseFloat(v);
        return Number.isFinite(n) ? n : 0;
      };
      const baseRaw = parseAmount(response.base_price || response.basePrice);
      const ingRaw = parseAmount(
        response.ingredient_total || response.ingredientTotal
      );
      let totalRaw = parseAmount(
        response.total_price || response.total || response.final_price
      );

      // Heuristic: if total missing -> base + ingredients
      if (totalRaw === 0) totalRaw = baseRaw + ingRaw;
      // Case: API sets base_price already = total (includes ingredients) and also gives ingredient_total
      // Example: baseRaw = 44, ingRaw = 14, totalRaw = 44. We want basePrice = 30, ingredientTotal=14, total=44.
      let basePrice = baseRaw;
      let ingredientTotal = ingRaw;
      if (totalRaw === baseRaw && ingRaw > 0 && baseRaw > ingRaw) {
        basePrice = baseRaw - ingRaw; // derive core cake price
      }
      const totalPrice = totalRaw;

      // Transform data để phù hợp với component
      const transformedOrder = {
        id: response.id || response._id,
        customerName: response.customer_id?.name || "Không có tên",
        customerEmail: response.customer_id?.email || "Không có email",
        customerPhone: response.customer_id?.phone || "Không có SĐT",
        items: response.items || [],
        basePrice,
        ingredientTotal,
        total: basePrice, // total must equal base price per requirement
        base_price: basePrice,
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
      navigate("/my-orders"); // Navigate về trang đơn hàng của user
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

  // Tính progress dựa trên flow chính, bỏ qua complaining và cancelled
  let currentStatusIndex = mainStatusFlow.indexOf(orderDetail.status);

  // Nếu đang ở trạng thái complaining, coi như đang ở shipped để hiển thị progress
  if (orderDetail.status === "complaining") {
    currentStatusIndex = mainStatusFlow.indexOf("shipped");
  }

  const progressPercentage =
    currentStatusIndex >= 0
      ? (currentStatusIndex / (mainStatusFlow.length - 1)) * 100
      : 0;

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

          {/* Order Basic Info */}
          <div className="p-4 bg-pink-50 border border-pink-100 rounded-xl mb-6">
            <h3 className="text-lg font-semibold mb-3 flex items-center gap-2 text-pink-600">
              <Package className="h-5 w-5" />
              Thông tin đơn hàng
            </h3>
            <div className="grid grid-cols-2 gap-4 text-gray-800">
              <div>
                <span className="font-medium">Mã đơn hàng:</span>{" "}
                {orderDetail.orderNumber}
              </div>
              <div>
                <span className="font-medium">Ngày đặt:</span>{" "}
                {new Date(orderDetail.placeDate).toLocaleDateString("vi-VN")}
              </div>
              <div>
                <span className="font-medium">Trạng thái:</span>{" "}
                <span
                  className={`px-2 py-1 rounded-lg text-sm font-semibold ${
                    statusMap[orderDetail.status]?.color || "text-gray-500"
                  }`}
                >
                  {statusMap[orderDetail.status]?.label || orderDetail.status}
                </span>
              </div>
              <div>
                <span className="font-medium">Giá bánh:</span>{" "}
                <span>{orderDetail.basePrice.toLocaleString("vi-VN")}đ</span>
              </div>
              {orderDetail.ingredientTotal > 0 && (
                <div>
                  <span className="font-medium">Nguyên liệu thêm:</span>{" "}
                  <span>
                    {orderDetail.ingredientTotal.toLocaleString("vi-VN")}đ
                  </span>
                </div>
              )}
              <div className="col-span-2">
                <span className="font-medium">Tổng tiền:</span>{" "}
                <span className="text-pink-600 font-bold">
                  {orderDetail.base_price.toLocaleString("vi-VN")}đ
                </span>
              </div>
            </div>
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

          {/* Status History */}
          <div className="p-4 bg-pink-50 border border-pink-100 rounded-xl mb-6">
            <h3 className="text-lg font-semibold mb-3 flex items-center gap-2 text-pink-600">
              <MessageSquareText className="h-5 w-5" />
              Lịch sử trạng thái
            </h3>
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
