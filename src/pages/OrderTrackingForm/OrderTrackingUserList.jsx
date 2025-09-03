"use client";
// Đã loại bỏ các import không tồn tại, dùng thẻ div và TailwindCSS thay thế
import { useState, useEffect, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ListOrdered, CalendarDays, User, Package } from "lucide-react";
import OrderTrackingForm from "./OrderTrackingForm";
import {
  fetchUserOrders,
  updateOrderStatus,
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
    label: "Đã được vận chuyển",
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
      handleSelectOrder(orderId);
    }
  }, [orderId, showOrderDetails]);

  // Lấy user ID từ localStorage
  const getUserId = () => {
    const user = JSON.parse(localStorage.getItem("user") || "{}");
    return user?.id ?? user?.user_id;
  };

  // Fetch orders từ API
  const fetchOrders = async () => {
    try {
      setLoading(true);
      setError(null);

      const userId = getUserId();
      if (!userId) throw new Error("User chưa đăng nhập");
      const response = await fetchUserOrders(userId);

      // Kiểm tra cấu trúc response và lấy orders
      let ordersArray = [];
      if (Array.isArray(response)) ordersArray = response;
      else if (Array.isArray(response?.orders)) ordersArray = response.orders;
      else if (Array.isArray(response?.data)) ordersArray = response.data;

      // Transform data từ API response để match với UI
      const transformedOrders = ordersArray.map((order) => {
        const userObj = order.User || order.user || {};
        const customerName =
          userObj.full_name ||
          userObj.username ||
          `Khách hàng #${order.customer_id || userObj.id || "N/A"}`;
        const customerEmail = userObj.email || userObj.username || "";
        const customerPhone = userObj.phone_number || userObj.phone || "";
        const customerAddress =
          order.address ||
          order.shipping_address ||
          userObj.address ||
          userObj.business_address ||
          "";
        const basePrice =
          parseFloat(order.base_price) || parseFloat(order.total_price) || 0;

        let items = [];
        if (Array.isArray(order.order_details)) {
          items = order.order_details.map((item) => ({
            name:
              item.cake?.name ||
              item.marketplace_post?.title ||
              `Bánh tùy chỉnh #${item.id || "N/A"}`,
            quantity: parseInt(item.quantity) || 1,
            price: parseFloat(item.price) || parseFloat(item.base_price) || 0,
          }));
        } else if (Array.isArray(order.orderDetails)) {
          items = order.orderDetails.map((od) => {
            const q = Number(od.quantity) || 1;
            const total = parseFloat(od.total_price) || 0;
            const unit = q > 0 ? total / q : total;
            return {
              name: `Nguyên liệu #${od.ingredient_id}`,
              quantity: q,
              price: unit,
            };
          });
        }

        return {
          id: order.id,
          orderNumber: `ORD-${String(order.id).padStart(3, "0")}`,
          placedDate: order.created_at || order.createdAt,
          status: order.status,
          customerName,
          customerEmail,
          customerPhone,
          customerAddress,
          shippingAddress: {
            address:
              order.shipping_address ||
              order.address ||
              userObj.address ||
              userObj.business_address ||
              "",
          },
          items,
          total: parseFloat(order.total_price) || 0,
          base_price: basePrice,
          history: [
            {
              date: new Date(
                order.created_at || order.createdAt
              ).toLocaleDateString("vi-VN"),
              time: new Date(
                order.created_at || order.createdAt
              ).toLocaleTimeString("vi-VN"),
              status: order.status,
              note: "Đơn hàng được tạo",
            },
          ],
        };
      });

      setRealOrders(transformedOrders);
    } catch (error) {
      console.error("Lỗi khi fetch orders:", error);
      setError("Không thể tải danh sách đơn hàng: " + error.message);
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
    Array.isArray(orders) && orders.length > 0 ? orders : realOrders;

  // Always show newest orders first
  const sortedDisplayOrders = useMemo(() => {
    const arr = Array.isArray(displayOrders) ? [...displayOrders] : [];
    arr.sort((a, b) => {
      const tb =
        Date.parse(b.placedDate || b.created_at || b.createdAt || 0) || 0;
      const ta =
        Date.parse(a.placedDate || a.created_at || a.createdAt || 0) || 0;
      if (tb !== ta) return tb - ta; // newer first
      const idb = Number(b.id) || 0;
      const ida = Number(a.id) || 0;
      return idb - ida;
    });
    return arr;
  }, [displayOrders]);

  const [statusFilter, setStatusFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");

  const filteredOrders = sortedDisplayOrders.filter((o) => {
    const matchStatus = statusFilter === "all" || o.status === statusFilter;
    const s = search.toLowerCase();
    const matchSearch = !s || o.orderNumber.toLowerCase().includes(s);
    let matchDate = true;
    if (dateFrom) {
      matchDate =
        matchDate && new Date(o.placedDate) >= new Date(dateFrom + "T00:00:00");
    }
    if (dateTo) {
      matchDate =
        matchDate && new Date(o.placedDate) <= new Date(dateTo + "T23:59:59");
    }
    return matchStatus && matchSearch && matchDate;
  });

  // Khi bấm vào xem chi tiết, fetch API để lấy thông tin chi tiết đơn hàng
  const handleSelectOrder = async (orderId) => {
    try {
      setLoadingOrderDetail(true);

      // Fetch chi tiết order từ API
      const response = await fetchOrderById(orderId);

      const data = response?.order || response?.data || response;
      const userObj = data.User || data.user || {};
      const customerName =
        userObj.full_name ||
        userObj.username ||
        `Khách hàng #${data.customer_id || userObj.id || "N/A"}`;
      const customerEmail = userObj.email || userObj.username || "";
      const customerPhone = userObj.phone_number || userObj.phone || "";

      let items = [];
      if (Array.isArray(data.order_details)) {
        items = data.order_details?.map((item) => ({
          name:
            item.cake?.name ||
            item.marketplace_post?.title ||
            `Bánh tùy chỉnh #${item.id || "N/A"}`,
          quantity: parseInt(item.quantity) || 1,
          price: parseFloat(item.price) || parseFloat(item.base_price) || 0,
          cakeDetails: item.cake
            ? {
                description: item.cake.description,
                category: item.cake.category,
                ingredients: item.cake.ingredients,
                allergens: item.cake.allergens,
                image_url: item.cake.image_url,
              }
            : null,
          marketplaceDetails: item.marketplace_post
            ? {
                title: item.marketplace_post.title,
                description: item.marketplace_post.description,
                image_url: item.marketplace_post.image_url,
                shop_id: item.marketplace_post.shop_id,
              }
            : null,
          customization: {
            size: item.size || data.size || "N/A",
            special_instructions:
              item.special_instructions || data.special_instructions || "",
            toppings: [],
          },
        }));
      } else if (Array.isArray(data.orderDetails)) {
        items = data.orderDetails.map((od) => {
          const q = Number(od.quantity) || 1;
          const total = parseFloat(od.total_price) || 0;
          const unit = q > 0 ? total / q : total;
          return {
            name: `Nguyên liệu #${od.ingredient_id}`,
            quantity: q,
            price: unit,
            customization: {
              size: data.size || "N/A",
              special_instructions: data.special_instructions || "",
              toppings: [],
            },
          };
        });
      }

      // Lấy thông tin bài đăng marketplace (nếu có)
      const marketplace_post_id =
        data.marketplace_post_id ||
        data.order_details?.[0]?.marketplace_post?.id ||
        data.orderDetails?.[0]?.marketplace_post_id ||
        null;
      const marketplace_post =
        data.marketplace_post ||
        data.order_details?.[0]?.marketplace_post ||
        null;

      const transformedOrder = {
        id: data.id,
        orderNumber: `ORD-${String(data.id).padStart(3, "0")}`,
        placedDate: data.created_at || data.createdAt,
        status: data.status,
        customer_user_id:
          userObj.id || userObj.user_id || data.customer_id || null,
        customerName,
        customerEmail,
        customerPhone,
        customerAddress:
          data.address ||
          data.shipping_address ||
          userObj.address ||
          userObj.business_address ||
          "",
        items,
        total: parseFloat(data.total_price) || 0,
        base_price:
          parseFloat(data.base_price) || parseFloat(data.total_price) || 0,
        shippingAddress: {
          address:
            data.shipping_address ||
            data.address ||
            userObj.address ||
            userObj.business_address ||
            data.shipped_at ||
            "",
        },
        marketplace_post_id,
        marketplace_post,
        history: [
          {
            date: new Date(
              data.created_at || data.createdAt
            ).toLocaleDateString("vi-VN"),
            time: new Date(
              data.created_at || data.createdAt
            ).toLocaleTimeString("vi-VN"),
            status: data.status,
            note: "Đơn hàng được tạo",
          },
        ],
      };

      setSelectedOrder(transformedOrder);
    } catch (error) {
      console.error("Lỗi khi fetch order detail:", error);
      // Fallback: nếu không lấy được chi tiết, quay về danh sách
      setSelectedOrder(null);
      setLoadingOrderDetail(false);
      // Điều hướng về danh sách thay vì alert
      if (window.location.pathname.includes("/order-tracking-user/")) {
        navigate("/order-tracking-user", { replace: true });
      }
      return;
    } finally {
      setLoadingOrderDetail(false);
    }
  };

  // Function để xử lý việc xem chi tiết với navigation
  const handleViewOrderDetail = (orderId) => {
    if (showOrderDetails) {
      handleSelectOrder(orderId);
    } else {
      const sourceList = Array.isArray(displayOrders)
        ? displayOrders
        : Array.isArray(realOrders)
        ? realOrders
        : [];
      const summary =
        sourceList.find((o) => String(o.id) === String(orderId)) ||
        selectedOrder;
      navigate(`/order-tracking-user/${orderId}`, {
        state: { orderSummary: summary },
      });
    }
  };

  const handleBackToList = () => {
    if (showOrderDetails && orderId) {
      navigate("/order-tracking-user");
    } else {
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
          base_price:
            parseFloat(updatedOrderDetail.base_price) ||
            parseFloat(updatedOrderDetail.total_price) ||
            0,
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
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col gap-4 mb-6">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <h2 className="text-3xl font-bold text-pink-700 flex items-center gap-3">
              <ListOrdered className="h-7 w-7" /> Đơn hàng của tôi
            </h2>
            <div className="w-full lg:w-auto flex flex-col gap-3">
              <div className="text-xs font-semibold uppercase tracking-wide text-pink-600">
                Bộ lọc
              </div>
              <div className="bg-white/70 backdrop-blur-sm border border-pink-200 rounded-lg p-4 flex flex-col lg:flex-row lg:items-end gap-4">
                <div className="flex flex-col gap-1 min-w-[180px]">
                  <label className="text-xs font-medium text-gray-600">
                    Tìm kiếm (mã đơn)
                  </label>
                  <input
                    placeholder="VD: ORD-001"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="h-10 px-3 rounded-lg border border-pink-200 focus:outline-none focus:border-pink-400 bg-white text-sm"
                  />
                </div>
                <div className="flex flex-col gap-1 min-w-[150px]">
                  <label className="text-xs font-medium text-gray-600">
                    Từ ngày
                  </label>
                  <input
                    type="date"
                    value={dateFrom}
                    onChange={(e) => setDateFrom(e.target.value)}
                    className="h-10 px-3 rounded-lg border border-pink-200 bg-white text-sm focus:outline-none focus:border-pink-400"
                  />
                </div>
                <div className="flex flex-col gap-1 min-w-[150px]">
                  <label className="text-xs font-medium text-gray-600">
                    Đến ngày
                  </label>
                  <input
                    type="date"
                    value={dateTo}
                    onChange={(e) => setDateTo(e.target.value)}
                    className="h-10 px-3 rounded-lg border border-pink-200 bg-white text-sm focus:outline-none focus:border-pink-400"
                  />
                </div>
                <div className="flex flex-col gap-1 min-w-[180px]">
                  <label className="text-xs font-medium text-gray-600">
                    Trạng thái
                  </label>
                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="h-10 px-3 rounded-lg border border-pink-200 bg-white text-sm focus:outline-none focus:border-pink-400"
                  >
                    <option value="all">Tất cả</option>
                    {Object.keys(statusMap).map((k) => (
                      <option key={k} value={k}>
                        {statusMap[k].label}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="flex gap-2 pt-2 lg:pt-0">
                  <button
                    onClick={() => {
                      setStatusFilter("all");
                      setSearch("");
                      setDateFrom("");
                      setDateTo("");
                      fetchOrders();
                    }}
                    className="h-10 bg-white border border-pink-200 hover:bg-pink-100 text-pink-600 px-4 rounded-lg text-sm font-medium"
                  >
                    Reset
                  </button>
                  <button
                    onClick={fetchOrders}
                    className="h-10 bg-pink-500 hover:bg-pink-600 text-white px-4 rounded-lg font-medium text-sm"
                  >
                    🔄
                  </button>
                </div>
              </div>
            </div>
          </div>
          <div className="text-sm text-gray-500">
            Hiển thị {filteredOrders.length} / {sortedDisplayOrders.length} đơn
            hàng
          </div>
        </div>

        {filteredOrders.length === 0 ? (
          <div className="bg-white rounded-xl border border-pink-100 p-12 text-center text-gray-500">
            Không tìm thấy đơn hàng
          </div>
        ) : (
          <div className="bg-white rounded-xl border border-pink-100 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-pink-100 text-pink-700">
                  <tr className="text-left">
                    <th className="px-4 py-3 font-semibold">#</th>
                    <th className="px-4 py-3 font-semibold">Ngày tạo</th>

                    <th className="px-4 py-3 font-semibold">Trạng thái</th>
                    <th className="px-4 py-3 font-semibold">Tổng giá</th>
                    <th className="px-4 py-3 font-semibold">Thao tác</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredOrders.map((order, idx) => (
                    <tr
                      key={order.id}
                      className={`border-b last:border-b-0 hover:bg-pink-50 transition ${
                        idx % 2 === 1 ? "bg-pink-50/30" : "bg-white"
                      }`}
                    >
                      <td className="px-4 py-3 font-medium text-pink-700 whitespace-nowrap">
                        {order.orderNumber}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        {(() => {
                          const d = new Date(order.placedDate);
                          return isNaN(d.getTime())
                            ? "-"
                            : d.toLocaleDateString("vi-VN");
                        })()}
                      </td>

                      <td className="px-4 py-3">
                        <span
                          className={`${
                            statusMap[order.status]?.color ||
                            "bg-gray-200 text-gray-700"
                          } text-xs px-2 py-1 rounded-full font-semibold inline-block`}
                        >
                          {statusMap[order.status]?.label || order.status}
                        </span>
                      </td>
                      <td className="px-4 py-3 font-semibold text-pink-600 whitespace-nowrap">
                        {(() => {
                          const raw =
                            order?.total_price ??
                            order?.total ??
                            order?.base_price ??
                            0;
                          const num =
                            typeof raw === "number"
                              ? raw
                              : parseFloat(String(raw)) || 0;
                          return num.toLocaleString("vi-VN") + "đ";
                        })()}
                      </td>
                      <td className="px-4 py-3">
                        <button
                          className="text-xs bg-pink-500 hover:bg-pink-600 text-white px-3 py-1.5 rounded-md font-medium"
                          onClick={() => handleViewOrderDetail(order.id)}
                        >
                          Chi tiết
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
