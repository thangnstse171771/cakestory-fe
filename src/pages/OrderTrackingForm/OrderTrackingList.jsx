"use client";
// Đã loại bỏ các import không tồn tại, dùng thẻ div và TailwindCSS thay thế
import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ListOrdered, CalendarDays, User, Package } from "lucide-react";
import OrderTrackingForm from "./OrderTrackingForm";
import {
  fetchShopOrders,
  updateOrderStatus,
  fetchAllShops,
  fetchOrderById,
} from "../../api/axios";

const statusMap = {
  pending: { label: "Đang chờ xử lý", color: "bg-yellow-100 text-yellow-700" },
  ordered: { label: "Đã tiếp nhận", color: "bg-cyan-100 text-cyan-700" },
  preparedForDelivery: {
    label: "Sẵn sàng giao hàng",
    color: "bg-blue-100 text-blue-700",
  },
  shipped: {
    label: "Đang vận chuyển",
    color: "bg-orange-100 text-orange-700",
  },
  completed: { label: "Hoàn tất", color: "bg-emerald-100 text-emerald-700" },
  complaining: { label: "Đang khiếu nại", color: "bg-red-100 text-red-700" },
  cancelled: { label: "Đã hủy", color: "bg-gray-100 text-gray-700" },
};

export default function OrderTrackingList({
  orders,
  onSelectOrder,
  showOrderDetails = false,
}) {
  const { orderId } = useParams();
  const navigate = useNavigate();

  const [realOrders, setRealOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [loadingOrderDetail, setLoadingOrderDetail] = useState(false);

  // Tự động mở order detail nếu có orderId trong URL
  useEffect(() => {
    if (orderId && showOrderDetails) {
      handleViewOrderDetail(orderId);
    }
  }, [orderId, showOrderDetails]);

  // Lấy shop ID từ localStorage hoặc user context
  const getShopId = async () => {
    try {
      const user = JSON.parse(localStorage.getItem("user") || "{}");
      if (!user.id) {
        throw new Error("User ID không tồn tại");
      }

      console.log("Current user:", user);

      // Fetch tất cả shops để tìm shop của user hiện tại
      const shopsData = await fetchAllShops();
      console.log("All shops data:", shopsData);

      const userShop = (shopsData.shops || []).find(
        (shop) => shop.user_id === user.id
      );

      if (!userShop) {
        throw new Error("User chưa có shop");
      }

      console.log("Found user shop:", userShop);
      console.log("Shop ID field check:", {
        id: userShop.id,
        shop_id: userShop.shop_id,
        _id: userShop._id,
      });

      // Thử các field khác nhau cho shop ID, ưu tiên shop_id
      const shopId = userShop.shop_id || userShop.id || userShop._id;

      if (!shopId) {
        throw new Error("Không tìm thấy shop ID trong dữ liệu shop");
      }

      return shopId;
    } catch (error) {
      console.error("Lỗi khi lấy shop ID:", error);
      throw error;
    }
  };

  // Fetch orders từ API
  const fetchOrders = async () => {
    try {
      setLoading(true);
      setError(null);

      const shopId = await getShopId();
      console.log("Using shop ID:", shopId);

      const response = await fetchShopOrders(shopId);
      console.log("Orders response:", response);
      console.log("Response orders array:", response.orders);
      console.log("Response type:", typeof response);
      console.log("Is response.orders array?", Array.isArray(response.orders));

      // Kiểm tra cấu trúc response và lấy orders
      let ordersArray = [];
      if (response && Array.isArray(response.orders)) {
        ordersArray = response.orders;
      } else if (response && Array.isArray(response)) {
        ordersArray = response;
      } else if (response && response.data && Array.isArray(response.data)) {
        ordersArray = response.data;
      }

      console.log("Orders array to transform:", ordersArray);

      // Transform data từ API response để match với UI
      const transformedOrders = ordersArray.map((order) => {
        console.log("Transforming order:", order);
        return {
          id: order.id,
          orderNumber: `ORD-${String(order.id).padStart(3, "0")}`, // Format: ORD-015, ORD-017
          placedDate: order.created_at,
          status: order.status,
          customerName:
            order.user?.full_name ||
            order.user?.username ||
            `Khách hàng #${order.customer_id || order.user?.id || "N/A"}`,
          customerEmail: order.user?.email || "",
          customerPhone: order.user?.phone_number || order.user?.phone || "",
          items:
            order.order_details?.map((item) => ({
              name:
                item.cake?.name ||
                item.marketplace_post?.title ||
                `Bánh tùy chỉnh #${item.id || "N/A"}`,
              quantity: parseInt(item.quantity) || 1,
              price: parseFloat(item.price) || parseFloat(item.base_price) || 0,
            })) || [],
          total: parseFloat(order.total_price) || 0,
          history: [
            {
              date: new Date(order.created_at).toLocaleDateString("vi-VN"),
              time: new Date(order.created_at).toLocaleTimeString("vi-VN"),
              status: order.status,
              note: "Đơn hàng được tạo",
            },
          ],
        };
      });

      console.log("Transformed orders:", transformedOrders);

      setRealOrders(transformedOrders);
    } catch (error) {
      console.error("Lỗi khi fetch orders:", error);
      if (error.message === "User chưa có shop") {
        setError("Bạn chưa có shop. Vui lòng tạo shop trước.");
      } else if (
        error.message === "Không tìm thấy shop ID trong dữ liệu shop"
      ) {
        setError("Dữ liệu shop không hợp lệ. Vui lòng liên hệ admin.");
      } else if (error.message.includes("Invalid input syntax")) {
        setError("Shop ID không hợp lệ. Vui lòng kiểm tra lại.");
      } else {
        setError("Không thể tải danh sách đơn hàng: " + error.message);
      }
    } finally {
      setLoading(false);
    }
  };

  // Load orders khi component mount
  useEffect(() => {
    fetchOrders();
  }, []);
  // Fake data nếu không có orders truyền vào
  const fakeOrders = [
    {
      id: 1,
      orderNumber: "ORD-2024-001",
      placedDate: "2024-01-20T10:00:00Z",
      status: "awaiting_shipment",
      customerName: "Nguyễn Văn A",
      customerEmail: "vana@example.com",
      customerPhone: "0901234567",
      items: [
        { name: "Bánh kem dâu", quantity: 1, price: 250000 },
        { name: "Bánh su kem", quantity: 1, price: 180000 },
      ],
      total: 430000,
      history: [
        {
          date: "2024-01-20",
          time: "10:00",
          status: "pending",
          note: "Đơn hàng được tạo",
        },
        {
          date: "2024-01-20",
          time: "12:00",
          status: "awaiting_shipment",
          note: "Đợi vận chuyển",
        },
      ],
    },
    {
      id: 2,
      orderNumber: "ORD-2024-002",
      placedDate: "2024-01-22T14:30:00Z",
      status: "processing",
      customerName: "Trần Thị B",
      customerEmail: "thib@example.com",
      customerPhone: "0912345678",
      items: [{ name: "Bánh cupcake", quantity: 2, price: 50000 }],
      total: 100000,
      history: [
        {
          date: "2024-01-22",
          time: "14:30",
          status: "pending",
          note: "Đơn hàng được tạo",
        },
        {
          date: "2024-01-22",
          time: "15:00",
          status: "processing",
          note: "Đang chuẩn bị",
        },
      ],
    },
  ];

  // Ưu tiên sử dụng real API data, chỉ dùng fake data khi không có data thật
  const displayOrders =
    realOrders?.length > 0
      ? realOrders
      : orders?.length > 0
      ? orders
      : fakeOrders;

  // Khi bấm vào xem chi tiết, fetch API để lấy thông tin chi tiết đơn hàng
  const handleSelectOrder = async (orderId) => {
    try {
      setLoadingOrderDetail(true);
      console.log("Fetching order detail for ID:", orderId);

      // Fetch chi tiết order từ API
      const orderDetail = await fetchOrderById(orderId);
      console.log("Order detail fetched:", orderDetail);

      // Transform data để match với UI format
      const transformedOrder = {
        id: orderDetail.id,
        orderNumber: `ORD-${String(orderDetail.id).padStart(3, "0")}`,
        placedDate: orderDetail.created_at,
        status: orderDetail.status,
        customerName:
          orderDetail.user?.full_name ||
          orderDetail.user?.username ||
          `Khách hàng #${
            orderDetail.customer_id || orderDetail.user?.id || "N/A"
          }`,
        customerEmail: orderDetail.user?.email || "",
        customerPhone:
          orderDetail.user?.phone_number || orderDetail.user?.phone || "",
        items:
          orderDetail.order_details?.map((item) => ({
            name:
              item.cake?.name ||
              item.marketplace_post?.title ||
              `Bánh tùy chỉnh #${item.id || "N/A"}`,
            quantity: parseInt(item.quantity) || 1,
            price: parseFloat(item.price) || parseFloat(item.base_price) || 0,
            // Thêm thông tin chi tiết bánh từ API
            cakeDetails: item.cake
              ? {
                  description: item.cake.description,
                  category: item.cake.category,
                  ingredients: item.cake.ingredients,
                  allergens: item.cake.allergens,
                  image_url: item.cake.image_url,
                }
              : null,
            // Thêm thông tin marketplace post nếu có
            marketplaceDetails: item.marketplace_post
              ? {
                  title: item.marketplace_post.title,
                  description: item.marketplace_post.description,
                  image_url: item.marketplace_post.image_url,
                  shop_id: item.marketplace_post.shop_id,
                }
              : null,
            // Thêm thông tin customization nếu có
            customization: {
              size: item.size || "N/A",
              special_instructions: item.special_instructions || "",
              toppings: [], // TODO: Nếu API có thông tin topping
            },
          })) || [],
        total: parseFloat(orderDetail.total_price) || 0,
        // Thêm thông tin address nếu có
        shippingAddress: {
          address: orderDetail.shipped_at || "",
          // TODO: Thêm các field address khác nếu API có
        },
        history: [
          {
            date: new Date(orderDetail.created_at).toLocaleDateString("vi-VN"),
            time: new Date(orderDetail.created_at).toLocaleTimeString("vi-VN"),
            status: orderDetail.status,
            note: "Đơn hàng được tạo",
          },
          // TODO: Thêm lịch sử từ API nếu có
        ],
      };

      setSelectedOrder(transformedOrder);
    } catch (error) {
      console.error("Lỗi khi fetch order detail:", error);
      alert("Không thể tải chi tiết đơn hàng");
    } finally {
      setLoadingOrderDetail(false);
    }
  };

  // Function để xử lý việc xem chi tiết với navigation
  const handleViewOrderDetail = (orderId) => {
    if (showOrderDetails) {
      // Nếu đã ở trang có ID, fetch order detail
      handleSelectOrder(orderId);
    } else {
      // Navigate đến URL với order ID
      navigate(`/order-tracking/${orderId}`);
    }
  };

  const handleBackToList = () => {
    if (showOrderDetails && orderId) {
      // Nếu đang xem order detail từ URL, navigate về list
      navigate("/order-tracking");
    } else {
      // Nếu đang xem từ modal, đóng modal
      setSelectedOrder(null);
    }
  };

  // Cập nhật trạng thái đơn hàng
  const handleUpdateStatus = async (orderId, newStatus) => {
    try {
      await updateOrderStatus(orderId, newStatus);

      // Thay vì quay về danh sách, refresh order detail hiện tại
      if (selectedOrder && selectedOrder.id === orderId) {
        // Fetch lại order detail để có trạng thái mới
        const updatedOrderDetail = await fetchOrderById(orderId);

        // Transform data giống như trong handleSelectOrder
        const transformedOrder = {
          id: updatedOrderDetail.id,
          orderNumber: `ORD-${String(updatedOrderDetail.id).padStart(3, "0")}`,
          placedDate: updatedOrderDetail.created_at,
          status: updatedOrderDetail.status,
          customerName:
            updatedOrderDetail.user?.full_name ||
            updatedOrderDetail.user?.username ||
            `Khách hàng #${
              updatedOrderDetail.customer_id ||
              updatedOrderDetail.user?.id ||
              "N/A"
            }`,
          customerEmail: updatedOrderDetail.user?.email || "",
          customerPhone:
            updatedOrderDetail.user?.phone_number ||
            updatedOrderDetail.user?.phone ||
            "",
          items:
            updatedOrderDetail.order_details?.map((item) => ({
              name:
                item.cake?.name ||
                item.marketplace_post?.title ||
                `Bánh tùy chỉnh #${item.id || "N/A"}`,
              quantity: parseInt(item.quantity) || 1,
              price: parseFloat(item.price) || parseFloat(item.base_price) || 0,
              customization: {
                size: item.size || "N/A",
                special_instructions: item.special_instructions || "",
                toppings: [],
              },
            })) || [],
          total: parseFloat(updatedOrderDetail.total_price) || 0,
          history: [
            {
              date: new Date(updatedOrderDetail.created_at).toLocaleDateString(
                "vi-VN"
              ),
              time: new Date(updatedOrderDetail.created_at).toLocaleTimeString(
                "vi-VN"
              ),
              status: updatedOrderDetail.status,
              note: "Đơn hàng được tạo",
            },
            // Thêm entry mới cho việc cập nhật trạng thái
            {
              date: new Date().toLocaleDateString("vi-VN"),
              time: new Date().toLocaleTimeString("vi-VN"),
              status: newStatus,
              note: `Trạng thái được cập nhật thành: ${newStatus}`,
            },
          ],
        };

        setSelectedOrder(transformedOrder);
      }

      // Refresh danh sách orders
      await fetchOrders();
    } catch (error) {
      console.error("Lỗi khi cập nhật trạng thái:", error);
      alert("Có lỗi khi cập nhật trạng thái đơn hàng");
    }
  };

  if (selectedOrder) {
    return (
      <OrderTrackingForm
        order={selectedOrder}
        onUpdateStatus={handleUpdateStatus}
        onBackToList={handleBackToList}
      />
    );
  }

  if (loadingOrderDetail) {
    return (
      <div className="p-8 bg-pink-50 min-h-screen">
        <div className="max-w-4xl mx-auto">
          <div className="text-center">
            <div className="text-pink-600 text-lg">
              Đang tải chi tiết đơn hàng...
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="p-8 bg-pink-50 min-h-screen">
        <div className="max-w-4xl mx-auto">
          <div className="text-center">
            <div className="text-pink-600 text-lg">
              Đang tải danh sách đơn hàng...
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8 bg-pink-50 min-h-screen">
        <div className="max-w-4xl mx-auto">
          <div className="text-center">
            <div className="text-red-600 text-lg mb-4">{error}</div>
            <button
              onClick={fetchOrders}
              className="bg-pink-500 hover:bg-pink-600 text-white font-semibold px-4 py-2 rounded-lg"
            >
              Thử lại
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8 bg-pink-50 min-h-screen">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-3xl font-bold text-pink-700 flex items-center gap-3">
            <ListOrdered className="h-7 w-7" />
            Quản lý đơn hàng
          </h2>
          <button
            onClick={fetchOrders}
            className="bg-pink-500 hover:bg-pink-600 text-white font-semibold px-4 py-2 rounded-lg flex items-center gap-2"
          >
            🔄 Làm mới
          </button>
        </div>

        {displayOrders.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-gray-500 text-lg">Chưa có đơn hàng nào</div>
          </div>
        ) : (
          <div className="space-y-6">
            {displayOrders.map((order) => (
              <div
                key={order.id}
                className="p-6 shadow-lg rounded-xl border border-pink-100 hover:shadow-xl transition-shadow bg-white"
              >
                <div className="pb-4 flex flex-row items-center justify-between">
                  <div>
                    <div className="text-xl font-bold text-pink-700">
                      Đơn hàng {order.orderNumber}
                    </div>
                    <p className="text-sm text-gray-500 flex items-center gap-1 mt-1">
                      <CalendarDays className="h-4 w-4" />
                      Đặt vào:{" "}
                      {new Date(order.placedDate).toLocaleDateString("vi-VN")}
                    </p>
                  </div>
                  <span
                    className={`${
                      statusMap[order.status]?.color ||
                      "bg-gray-200 text-gray-700"
                    } text-sm px-3 py-1 rounded-lg font-semibold`}
                  >
                    {statusMap[order.status]?.label || order.status}
                  </span>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center gap-2 text-gray-700">
                    <User className="h-4 w-4" />
                    <span className="font-medium">{order.customerName}</span>
                  </div>
                  <div className="flex items-center gap-2 text-gray-700">
                    <Package className="h-4 w-4" />
                    <span className="font-medium">
                      {order.items.length} sản phẩm
                    </span>
                  </div>
                  <div className="flex justify-between items-center pt-2 border-t border-pink-100">
                    <span className="text-lg font-bold text-pink-600">
                      Tổng cộng:
                    </span>
                    <span className="text-xl font-bold text-pink-600">
                      {order.total.toLocaleString("vi-VN")}đ
                    </span>
                  </div>
                  <button
                    className="w-full bg-pink-500 hover:bg-pink-600 text-white font-semibold px-4 py-2 rounded-lg mt-4"
                    onClick={() => handleViewOrderDetail(order.id)}
                  >
                    Xem chi tiết đơn hàng
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
