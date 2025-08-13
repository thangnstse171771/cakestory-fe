// NOTE: This file was originally for shop tracking but misnamed.
// Use OrderTrackingFormShop.jsx instead for shop view.
import { useState, useEffect, useRef } from "react";
import { useNavigate, useParams } from "react-router-dom";
import ComplaintModal from "../ComplaintManagement/ComplaintModal";
import { fetchOrderById } from "../../api/axios";
import { fetchShopByUserId } from "../../api/axios";
import { useAuth } from "../../contexts/AuthContext";
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

// Normalize backend status variants
const normalizeStatus = (s = "") => {
  const v = String(s).toLowerCase();
  if (
    ["accepted", "confirmed", "order_accepted", "received", "ordered"].includes(
      v
    )
  )
    return "ordered";
  if (
    [
      "ready",
      "ready_to_ship",
      "prepared",
      "preparing",
      "preparedfordelivery",
      "prepared_for_delivery",
    ].includes(v)
  )
    return "preparedForDelivery";
  if (["shipping", "delivering", "in_transit", "shipped"].includes(v))
    return "shipped";
  if (["done", "delivered", "completed", "complete"].includes(v))
    return "completed";
  if (["complaint", "complaining", "disputed"].includes(v))
    return "complaining";
  if (["cancel", "canceled", "cancelled"].includes(v)) return "cancelled";
  if (["pending", "new"].includes(v)) return "pending";
  return s;
};

export default function OrderTrackingFormByShop({
  order,
  onBackToList,
  onUpdateStatus,
}) {
  const navigate = useNavigate();
  const { orderId } = useParams();
  const { user } = useAuth();
  const role = String(user?.role || "").toLowerCase();
  const shopRoleSet = new Set([
    "admin",
    "account_staff",
    "staff",
    "shop",
    "seller",
    "owner",
    "manager",
    "shop_owner",
    "shopowner",
    "shop_admin",
    "vendor",
    "store",
    "shop_member",
  ]);
  const [viewerShopId, setViewerShopId] = useState(null);
  // Also infer a shop id directly from the user object if present
  const inferredUserShopId =
    user?.shop_id || user?.shopId || user?.shop?.id || null;
  // Consider as shop actor if role suggests it OR a shop id is present
  const isShopActor = shopRoleSet.has(role) || Boolean(inferredUserShopId);
  const hasFetchedShopIdRef = useRef(false);

  // Local state để hiển thị thông tin đơn hàng
  const [orderDetail, setOrderDetail] = useState(
    order
      ? {
          ...order,
          status: normalizeStatus(order.status),
          shop_id:
            order.shop_id ||
            order.shopId ||
            order.shop?.id ||
            order.marketplace_post?.shop_id ||
            order.order_details?.[0]?.marketplace_post?.shop_id ||
            order.orderDetails?.[0]?.shop_id ||
            null,
        }
      : order
  );
  const [showComplaintModal, setShowComplaintModal] = useState(false);
  const [hasComplaint, setHasComplaint] = useState(
    Boolean(
      (order &&
        (order.status === "complaining" ||
          order.complaint_id ||
          order.complaintId ||
          order.has_complaint ||
          order.hasComplaint)) ||
        false
    )
  );
  const [loading, setLoading] = useState(false);

  // Fetch order detail nếu có orderId từ URL params
  useEffect(() => {
    if (orderId && !order) {
      fetchOrderDetail();
    }
  }, [orderId]);

  // Keep local detail in sync if parent passes a new order
  useEffect(() => {
    if (order) {
      setOrderDetail({
        ...order,
        status: normalizeStatus(order.status),
        shop_id:
          order.shop_id ||
          order.shopId ||
          order.shop?.id ||
          order.marketplace_post?.shop_id ||
          order.order_details?.[0]?.marketplace_post?.shop_id ||
          order.orderDetails?.[0]?.shop_id ||
          null,
      });
    }
  }, [order]);

  const fetchOrderDetail = async () => {
    try {
      setLoading(true);
      const response = await fetchOrderById(orderId);
      console.log("[OrderTrackingFormByShop] Raw response:", response);

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
        size:
          response.size ||
          response.order_details?.[0]?.size ||
          response.orderDetails?.[0]?.size ||
          "-",
        status: normalizeStatus(response.status || "pending"),
        orderNumber: response.orderNumber || `ORD-${response.id}`,
        placeDate:
          response.created_at ||
          response.createdAt ||
          response.placeDate ||
          new Date().toISOString(),
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
        shop_id:
          response.shop_id ||
          response.shopId ||
          response.shop?.id ||
          response.marketplace_post?.shop_id ||
          response.order_details?.[0]?.marketplace_post?.shop_id ||
          response.orderDetails?.[0]?.shop_id ||
          null,
      };

      setOrderDetail(transformedOrder);
      setHasComplaint(
        Boolean(
          transformedOrder.status === "complaining" ||
            transformedOrder.complaint_id ||
            transformedOrder.complaintId ||
            transformedOrder.has_complaint ||
            transformedOrder.hasComplaint
        )
      );
    } catch (error) {
      console.error("Lỗi khi fetch order detail:", error);
      alert("Không thể tải thông tin đơn hàng");
    } finally {
      setLoading(false);
    }
  };

  // Resolve viewer's shop id for permission checks
  useEffect(() => {
    if (hasFetchedShopIdRef.current) return;
    hasFetchedShopIdRef.current = true;
    const inferFromUser = () => {
      const cand = user?.shop_id || user?.shopId || user?.shop?.id;
      return cand != null ? String(cand) : null;
    };
    (async () => {
      try {
        if (!user?.id) {
          setViewerShopId(inferFromUser());
          return;
        }
        const shopResp = await fetchShopByUserId(user.id);
        const sid =
          shopResp?.shop?.shop_id ||
          shopResp?.shop_id ||
          shopResp?.id ||
          shopResp?.shop?.id ||
          null;
        setViewerShopId(sid != null ? String(sid) : inferFromUser());
      } catch (e) {
        console.warn(
          "Không thể lấy shopId của người dùng hiện tại:",
          e?.message || e
        );
        setViewerShopId(inferFromUser());
      }
    })();
  }, [user?.id]);

  // Update status locally and optionally via parent
  const handleUpdateStatus = async (oid, newStatus) => {
    try {
      const normalized = normalizeStatus(newStatus);
      setOrderDetail((prev) => (prev ? { ...prev, status: normalized } : prev));
      if (onUpdateStatus) await onUpdateStatus(oid, normalized, undefined);
      alert(
        `Đã cập nhật trạng thái đơn hàng thành: ${
          statusMap[normalized]?.label || normalized
        }`
      );
    } catch (error) {
      const viewerShopIdStr = viewerShopId
        ? String(viewerShopId)
        : inferredUserShopId
        ? String(inferredUserShopId)
        : null;
      const canShopControl = Boolean(
        viewerShopIdStr
          ? !orderShopIdStr || viewerShopIdStr === orderShopIdStr
          : isShopActor && !orderShopIdStr
      );
      console.debug("[OrderTrackingFormByShop] perm check:", {
        viewerShopId,
        inferredUserShopId,
        orderShopId: orderDetail?.shop_id,
        canShopControl,
      });
      alert(errorMessage);
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

  // Permission: only the shop owner of this order can control these buttons.
  const orderShopIdStr =
    orderDetail?.shop_id != null ? String(orderDetail.shop_id) : null;
  const viewerShopIdStr = viewerShopId
    ? String(viewerShopId)
    : inferredUserShopId
    ? String(inferredUserShopId)
    : null;
  const canShopControl = Boolean(
    viewerShopIdStr && (!orderShopIdStr || viewerShopIdStr === orderShopIdStr)
  );

  return (
    <div className="p-8 bg-pink-50 min-h-screen">
      <div className="max-w-4xl mx-auto">
        <button
          onClick={handleBackToList}
          className="mb-6 bg-transparent border border-pink-300 text-pink-600 hover:bg-pink-100 px-6 py-2 rounded-lg font-semibold"
        >
          {"<"} Quay lại danh sách đơn hàng
        </button>

        {/* Shop view: không hiển thị nút khiếu nại */}

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

          {/* Cập nhật trạng thái - chỉ shop owner của đơn được thao tác */}
          <div className="p-4 bg-pink-50 border border-pink-100 rounded-xl mb-6">
            <h3 className="text-lg font-semibold mb-3 flex items-center gap-2 text-pink-600">
              <MessageSquareText className="h-5 w-5" />
              Cập nhật trạng thái
            </h3>
            {isShopActor && !canShopControl && (
              <div className="mb-3 text-sm text-rose-600 bg-rose-50 border border-rose-200 rounded-lg px-3 py-2">
                Bạn đang đăng nhập bằng tài khoản Shop nhưng không phải chủ shop
                của đơn này nên không thể thao tác cập nhật trạng thái.
              </div>
            )}
            <div className="flex flex-wrap gap-2 mb-4">
              {/* pending -> ordered */}
              {canShopControl && orderDetail.status === "pending" && (
                <button
                  onClick={() => handleUpdateStatus(orderDetail.id, "ordered")}
                  className="px-4 py-2 rounded-lg font-semibold border bg-cyan-500 text-white border-cyan-500 hover:bg-cyan-600 transition-colors duration-200"
                >
                  Tiếp nhận đơn hàng
                </button>
              )}

              {/* ordered -> preparedForDelivery */}
              {canShopControl && orderDetail.status === "ordered" && (
                <button
                  onClick={() =>
                    handleUpdateStatus(orderDetail.id, "preparedForDelivery")
                  }
                  className="px-4 py-2 rounded-lg font-semibold border bg-blue-500 text-white border-blue-500 hover:bg-blue-600 transition-colors duration-200"
                >
                  Sẵn sàng giao hàng
                </button>
              )}

              {/* preparedForDelivery -> shipped */}
              {canShopControl &&
                orderDetail.status === "preparedForDelivery" && (
                  <button
                    onClick={() =>
                      handleUpdateStatus(orderDetail.id, "shipped")
                    }
                    className="px-4 py-2 rounded-lg font-semibold border bg-orange-500 text-white border-orange-500 hover:bg-orange-600 transition-colors duration-200"
                  >
                    Giao hàng
                  </button>
                )}

              {/* Hủy đơn: shop có thể hủy khi chưa hoàn thành/đã hủy */}
              {canShopControl &&
                orderDetail.status !== "completed" &&
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

            <div className="flex items-center gap-2 mb-2">
              <span className="text-md font-semibold text-pink-600">
                Trạng thái hiện tại:
              </span>
              <span
                className={`px-2 py-1 text-sm rounded-lg font-semibold ${
                  statusMap[orderDetail.status]?.color ||
                  "bg-gray-200 text-gray-700"
                }`}
              >
                {statusMap[orderDetail.status]?.label || orderDetail.status}
              </span>
            </div>
          </div>

          {/* Order Basic Info */}
          {/* <div className="p-4 bg-pink-50 border border-pink-100 rounded-xl mb-6">
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
                <p>Kích thước: {orderDetail.size}</p>
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
          </div> */}

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
                        {entry.datetime ||
                          (entry.date && entry.time
                            ? `${entry.date} ${entry.time}`
                            : "-")}
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
          onSubmit={() => {
            setShowComplaintModal(false);
            setHasComplaint(true);
          }}
        />
      )}
    </div>
  );
}
