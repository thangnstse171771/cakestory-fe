// NOTE: This file was originally for shop tracking but misnamed.
// Use OrderTrackingFormShop.jsx instead for shop view.
import { useState, useEffect, useRef, useMemo } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import ComplaintModal from "../ComplaintManagement/ComplaintModal";
import { fetchOrderById, fetchMarketplacePostById } from "../../api/axios";
import {
  User,
  Package,
  Truck,
  CheckCircle,
  Clock,
  MessageSquareText,
  ClipboardCheck,
} from "lucide-react";
// Use shared statusMap + add icons locally (avoid duplicating labels/colors)
import { statusMap as sharedStatusMap, buildOrderSummary } from "./orderUtils";

const iconFor = {
  pending: <Clock className="h-5 w-5" />,
  ordered: <ClipboardCheck className="h-5 w-5" />,
  preparedForDelivery: <Package className="h-5 w-5" />,
  shipped: <Truck className="h-5 w-5" />,
  completed: <CheckCircle className="h-5 w-5" />,
  complaining: <MessageSquareText className="h-5 w-5" />,
  cancelled: <Clock className="h-5 w-5" />,
};

// Enrich shared map with icons (memoized)
const useEnrichedStatusMap = () =>
  useMemo(() => {
    const enriched = {};
    Object.entries(sharedStatusMap).forEach(([k, v]) => {
      enriched[k] = { ...v, icon: iconFor[k] };
    });
    return enriched;
  }, []);

export default function OrderTrackingFormByUser({ order, onBackToList }) {
  const navigate = useNavigate();
  const { orderId } = useParams();
  const statusMap = useEnrichedStatusMap();

  // Local state để hiển thị thông tin đơn hàng
  const [orderDetail, setOrderDetail] = useState(order || null);
  const [showComplaintModal, setShowComplaintModal] = useState(false);
  const [hasComplaint, setHasComplaint] = useState(
    Boolean(
      order &&
        (order.status === "complaining" ||
          order.complaint_id ||
          order.complaintId ||
          order.has_complaint ||
          order.hasComplaint)
    )
  );
  const [loading, setLoading] = useState(false);
  // Marketplace post preview
  const [marketplacePost, setMarketplacePost] = useState(null);
  const [marketplaceImage, setMarketplaceImage] = useState(null);
  const [isLoadingMarketplace, setIsLoadingMarketplace] = useState(false);
  const hasFetchedMarketplaceRef = useRef(false);

  // Fetch order detail nếu có orderId từ URL và không truyền sẵn order
  useEffect(() => {
    if (orderId && !order) {
      fetchOrderDetail();
    } else if (order && !orderDetail) {
      setOrderDetail(order);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [orderId]);

  const fetchOrderDetail = async () => {
    try {
      setLoading(true);
      const response = await fetchOrderById(orderId);
      const raw = response?.order || response?.data || response;
      const summary = buildOrderSummary(raw);
      setOrderDetail(summary);
      setHasComplaint(
        Boolean(
          summary.status === "complaining" ||
            summary.complaint_id ||
            summary.complaintId ||
            summary.has_complaint ||
            summary.hasComplaint
        )
      );
    } catch (error) {
      console.error("Lỗi khi fetch order detail:", error);
      alert("Không thể tải thông tin đơn hàng");
    } finally {
      setLoading(false);
    }
  };

  // Load marketplace post and image (once)
  useEffect(() => {
    const embedded = orderDetail?.marketplace_post;
    const postId = orderDetail?.marketplace_post_id;

    if (marketplaceImage) return;

    if (!marketplacePost && embedded && Object.keys(embedded).length) {
      setMarketplacePost(embedded);
      const img = extractImageFromMarketplacePost(embedded);
      if (img) setMarketplaceImage(img);
      return;
    }

    if (
      !hasFetchedMarketplaceRef.current &&
      postId &&
      !marketplacePost &&
      !isLoadingMarketplace
    ) {
      hasFetchedMarketplaceRef.current = true;
      setIsLoadingMarketplace(true);
      (async () => {
        try {
          const res = await fetchMarketplacePostById(postId);
          const postData = res?.post || res?.data || res;
          if (postData) {
            setMarketplacePost(postData);
            const img = extractImageFromMarketplacePost(postData);
            if (img) setMarketplaceImage(img);
          }
        } catch (e) {
          hasFetchedMarketplaceRef.current = false;
        } finally {
          setIsLoadingMarketplace(false);
        }
      })();
    }
  }, [
    orderDetail?.marketplace_post_id,
    orderDetail?.marketplace_post,
    marketplacePost,
    marketplaceImage,
    isLoadingMarketplace,
  ]);

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

        {/* Hiện nút khiếu nại nếu trạng thái là shipped và CHƯA có khiếu nại; ẩn ở trạng thái completed */}
        {orderDetail.status === "shipped" && !hasComplaint && (
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
                {new Date(
                  orderDetail.placedDate || orderDetail.placeDate
                ).toLocaleDateString("vi-VN")}
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
                <span>{orderDetail.base_price?.toLocaleString("vi-VN")}đ</span>
              </div>
              <div>
                <span className="font-medium">Địa chỉ giao:</span>{" "}
                <span>{orderDetail.shippingAddress?.address || "-"}</span>
              </div>
              <div className="col-span-2">
                <span className="font-medium">Tổng tiền:</span>{" "}
                <div>
                  <span className="font-medium">Kích thước:</span>{" "}
                  <span>{orderDetail.size || "-"}</span>
                </div>
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
                        {typeof item.customization.size !== "undefined" && (
                          <p className="text-gray-800 text-sm md:text-base font-medium">
                            Kích thước: {item.customization.size}
                          </p>
                        )}
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

          {/* Marketplace reference (nếu có) */}
          {(marketplacePost || marketplaceImage) && (
            <div className="p-4 bg-pink-50 border border-pink-100 rounded-xl mb-6">
              <h3 className="text-lg font-semibold mb-3 flex items-center gap-2 text-pink-600">
                <Package className="h-5 w-5" />
                Bài đăng tham chiếu
              </h3>
              <div className="flex items-start gap-4">
                {marketplaceImage &&
                  (orderDetail?.marketplace_post_id ? (
                    <Link
                      to={`/marketplace/product/${orderDetail.marketplace_post_id}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="shrink-0"
                    >
                      <img
                        src={marketplaceImage}
                        alt="Marketplace"
                        className="w-24 h-24 rounded object-cover border border-pink-200 hover:opacity-90"
                      />
                    </Link>
                  ) : (
                    <img
                      src={marketplaceImage}
                      alt="Marketplace"
                      className="w-24 h-24 rounded object-cover border border-pink-200"
                    />
                  ))}
                <div className="text-gray-800 text-sm">
                  {(() => {
                    const title =
                      marketplacePost?.title ||
                      marketplacePost?.name ||
                      marketplacePost?.post?.title ||
                      marketplacePost?.data?.title ||
                      "Bài đăng";
                    return orderDetail?.marketplace_post_id ? (
                      <Link
                        to={`/marketplace/product/${orderDetail.marketplace_post_id}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="font-medium text-gray-800 hover:underline"
                      >
                        {title}
                      </Link>
                    ) : (
                      <p className="font-medium">{title}</p>
                    );
                  })()}
                  {marketplacePost?.description && (
                    <p className="text-gray-600 mt-1 line-clamp-3">
                      {marketplacePost.description}
                    </p>
                  )}
                </div>
              </div>
            </div>
          )}

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
          onSubmit={() => {
            setShowComplaintModal(false);
            setHasComplaint(true);
          }}
        />
      )}
    </div>
  );
}
