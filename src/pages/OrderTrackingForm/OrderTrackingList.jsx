"use client";
import { useState, useEffect, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ListOrdered } from "lucide-react";
import OrderTrackingForm from "./OrderTrackingForm";
import { statusMap, buildOrderSummary } from "./orderUtils";
import {
  fetchShopOrders,
  updateOrderStatus,
  fetchOrderById,
  fetchShopByUserId,
} from "../../api/axios";

export default function OrderTrackingList({ showOrderDetails = false }) {
  const { orderId } = useParams();
  const navigate = useNavigate();

  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [loadingOrderDetail, setLoadingOrderDetail] = useState(false);
  const [statusFilter, setStatusFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");

  // Tự động mở order detail nếu có orderId trong URL
  useEffect(() => {
    if (orderId && showOrderDetails) {
      handleSelectOrder(orderId);
    }
  }, [orderId, showOrderDetails]);

  // Resolve viewer shop id (simplified)
  const resolveShopId = async () => {
    const user = JSON.parse(localStorage.getItem("user") || "{}");
    if (!user.id) throw new Error("User chưa đăng nhập");
    const res = await fetchShopByUserId(user.id);
    const sid =
      res?.shop?.shop_id ||
      res?.shop_id ||
      res?.id ||
      res?.data?.shop?.shop_id ||
      res?.data?.shop_id ||
      res?.data?.id ||
      null;
    if (!sid) throw new Error("Không tìm thấy shop");
    return sid;
  };

  // Fetch orders từ API
  const fetchOrders = async () => {
    try {
      setLoading(true);
      setError(null);

      const shopId = await resolveShopId();
      const response = await fetchShopOrders(shopId);
      const raw = Array.isArray(response)
        ? response
        : response?.orders || response?.data || [];
      const mapped = raw
        .map(buildOrderSummary)
        .filter((o) => o && o.status !== "pending"); // hide pending like before
      setOrders(mapped);
    } catch (error) {
      console.error("Lỗi khi fetch orders:", error);
      if (error.message === "User chưa có shop") {
        setError("Bạn chưa có shop. Vui lòng tạo shop trước.");
      } else if (
        error.message === "Không tìm thấy shop ID trong dữ liệu shop"
      ) {
        setError("Dữ liệu shop không hợp lệ. Vui lòng liên hệ admin.");
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

  const filteredOrders = useMemo(() => {
    return orders.filter((order) => {
      const matchStatus =
        statusFilter === "all" || order.status === statusFilter;
      const searchTerm = search.toLowerCase();
      const matchSearch =
        !searchTerm ||
        order.orderNumber.toLowerCase().includes(searchTerm) ||
        (order.customerName || "").toLowerCase().includes(searchTerm);
      let matchDate = true;
      if (dateFrom) {
        matchDate =
          matchDate &&
          new Date(order.placedDate) >= new Date(dateFrom + "T00:00:00");
      }
      if (dateTo) {
        matchDate =
          matchDate &&
          new Date(order.placedDate) <= new Date(dateTo + "T23:59:59");
      }
      return matchStatus && matchSearch && matchDate;
    });
  }, [orders, statusFilter, search, dateFrom, dateTo]);

  // Xử lý select order để xem chi tiết
  const handleSelectOrder = async (orderId) => {
    try {
      setLoadingOrderDetail(true);

      const orderDetail = await fetchOrderById(orderId);
      const data = orderDetail?.order || orderDetail?.data || orderDetail;

      const transformedOrder = {
        id: data.id,
        orderNumber: `ORD-${String(data.id).padStart(3, "0")}`,
        placedDate: data.created_at || data.createdAt,
        placeDateFull: new Date(
          data.created_at || data.createdAt
        ).toLocaleString("vi-VN"),
        status: data.status,
        customerName:
          data.User?.full_name ||
          data.User?.username ||
          `Khách hàng #${data.customer_id}`,
        customerEmail: data.User?.email || "",
        customerPhone: data.User?.phone_number || "",
        base_price: parseFloat(data.base_price) || 0,
        total: parseFloat(data.total_price) || 0,
        size: data.size || "N/A",
        special_instructions: data.special_instructions || "",
        marketplace_post_id: data.marketplace_post_id,
        shipped_at: data.shipped_at,
        // Simplified items structure
        items: [
          {
            name: `Bánh tùy chỉnh (${data.size || "N/A"})`,
            quantity: 1,
            price: parseFloat(data.base_price) || 0,
            customization: {
              size: data.size || "N/A",
              special_instructions: data.special_instructions || "",
              toppings: [],
            },
          },
        ],
        history: [
          {
            date: new Date(
              data.created_at || data.createdAt
            ).toLocaleDateString("vi-VN"),
            time: new Date(
              data.created_at || data.createdAt
            ).toLocaleTimeString("vi-VN"),
            datetime: new Date(
              data.created_at || data.createdAt
            ).toLocaleString("vi-VN"),
            status: data.status,
            note: "Đơn hàng được tạo",
          },
          ...(data.shipped_at
            ? [
                {
                  date: new Date(data.shipped_at).toLocaleDateString("vi-VN"),
                  time: new Date(data.shipped_at).toLocaleTimeString("vi-VN"),
                  datetime: new Date(data.shipped_at).toLocaleString("vi-VN"),
                  status: "shipped",
                  note: "Đơn hàng đã được giao",
                },
              ]
            : []),
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

  // Navigation xử lý
  const handleViewOrderDetail = (orderId) => {
    if (showOrderDetails) {
      handleSelectOrder(orderId);
    } else {
      const orderSummary = orders.find((o) => String(o.id) === String(orderId));
      navigate(`/order-tracking/${orderId}`, {
        state: { orderSummary },
      });
    }
  };

  const handleBackToList = () => {
    if (showOrderDetails && orderId) {
      navigate("/order-tracking");
    } else {
      setSelectedOrder(null);
    }
  };

  // Cập nhật trạng thái đơn hàng
  const handleUpdateStatus = async (orderId, newStatus) => {
    try {
      await updateOrderStatus(orderId, newStatus);

      // Refresh order detail nếu đang xem
      if (selectedOrder && selectedOrder.id === orderId) {
        await handleSelectOrder(orderId);
      }

      // Refresh danh sách orders
      await fetchOrders();
    } catch (error) {
      console.error("Lỗi khi cập nhật trạng thái:", error);
      alert("Có lỗi khi cập nhật trạng thái đơn hàng");
    }
  };

  // Loading states
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
        <div className="max-w-4xl mx-auto text-center">
          <div className="text-pink-600 text-lg">
            Đang tải chi tiết đơn hàng...
          </div>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="p-8 bg-pink-50 min-h-screen">
        <div className="max-w-4xl mx-auto text-center">
          <div className="text-pink-600 text-lg">
            Đang tải danh sách đơn hàng...
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8 bg-pink-50 min-h-screen">
        <div className="max-w-4xl mx-auto text-center">
          <div className="text-red-600 text-lg mb-4">{error}</div>
          <button
            onClick={fetchOrders}
            className="bg-pink-500 hover:bg-pink-600 text-white font-semibold px-4 py-2 rounded-lg"
          >
            Thử lại
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8 bg-pink-50 min-h-screen">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col gap-4 mb-6">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <h2 className="text-3xl font-bold text-pink-700 flex items-center gap-3">
              <ListOrdered className="h-7 w-7" /> Shop Orders
            </h2>

            {/* Filters */}
            <div className="w-full lg:w-auto flex flex-col gap-3">
              <div className="text-xs font-semibold uppercase tracking-wide text-pink-600">
                Bộ lọc
              </div>
              <div className="bg-white/70 backdrop-blur-sm border border-pink-200 rounded-lg p-4 flex flex-col lg:flex-row lg:items-end gap-4">
                <div className="flex flex-col gap-1 min-w-[180px]">
                  <label className="text-xs font-medium text-gray-600">
                    Tìm kiếm (mã / khách hàng)
                  </label>
                  <input
                    placeholder="VD: ORD-001, Nguyễn"
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
                    {Object.keys(statusMap).map((status) => (
                      <option key={status} value={status}>
                        {statusMap[status].label}
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
            Hiển thị {filteredOrders.length} / {orders.length} đơn hàng
          </div>
        </div>

        {/* Orders Table */}
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
                    <th className="px-4 py-3 font-semibold">Khách hàng</th>
                    <th className="px-4 py-3 font-semibold">Kích thước</th>
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
                        {new Date(order.placedDate).toLocaleDateString("vi-VN")}
                      </td>
                      <td
                        className="px-4 py-3 max-w-[220px] truncate"
                        title={order.customerName}
                      >
                        {order.customerName}
                      </td>
                      <td className="px-4 py-3 text-center">
                        {order.size || "-"}
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
                        {order.base_price.toLocaleString("vi-VN")}đ
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
