"use client";
import { useState, useEffect, useMemo } from "react";
import { CalendarDays, ListOrdered, User, Package } from "lucide-react";
import { useParams, useNavigate } from "react-router-dom";
import {
  fetchAllOrders,
  fetchOrderById,
  updateOrderStatus,
} from "../../api/axios";
import OrderTrackingForm from "./OrderTrackingForm";
import { statusMap, buildOrderSummary } from "./orderUtils";

export default function OrderTrackingAdminAllList({
  showOrderDetails = false,
}) {
  const { orderId } = useParams();
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [loadingDetail, setLoadingDetail] = useState(false);
  const [statusFilter, setStatusFilter] = useState("all");
  const [search, setSearch] = useState("");
  // New date range filters
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");

  const load = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await fetchAllOrders();
      let arr = [];
      if (Array.isArray(res)) arr = res;
      else if (Array.isArray(res?.orders)) arr = res.orders;
      else if (Array.isArray(res?.data)) arr = res.data;
      const mapped = arr.map(buildOrderSummary);
      setOrders(mapped);
    } catch (e) {
      setError(e.message || "Lỗi tải orders");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const handleView = async (id) => {
    if (!showOrderDetails) {
      const summary = orders.find((o) => String(o.id) === String(id));
      navigate(`/admin/order-tracking/${id}`, {
        state: { orderSummary: summary },
      });
      return; // navigation will remount component with showOrderDetails true
    }
    try {
      setLoadingDetail(true);
      const data = await fetchOrderById(id);
      setSelectedOrder(buildOrderSummary(data));
    } finally {
      setLoadingDetail(false);
    }
  };

  const handleBack = () => {
    if (showOrderDetails && orderId) {
      navigate("/admin/order-tracking");
      return;
    }
    setSelectedOrder(null);
  };

  const handleUpdateStatus = async (orderId, newStatus) => {
    await updateOrderStatus(orderId, newStatus);
    load();
  };

  // Derived filtered list
  const filteredOrders = orders.filter((o) => {
    const matchStatus = statusFilter === "all" || o.status === statusFilter;
    const s = search.toLowerCase();
    const matchSearch =
      !s ||
      o.orderNumber.toLowerCase().includes(s) ||
      (o.customerName || "").toLowerCase().includes(s);
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

  // Helper to derive numeric sort key (prefer id, then parse from orderNumber, then date)
  const getOrderKey = (o) => {
    let n = Number(o.id);
    if (!Number.isFinite(n) || n <= 0) {
      const s = String(o.orderNumber || "");
      const digits = s.match(/\d+/g);
      if (digits && digits.length) n = Number(digits.join(""));
    }
    if (!Number.isFinite(n)) {
      n = Date.parse(o.placedDate || 0) || 0;
    }
    return n;
  };

  // Sort orders: largest -> smallest by order key
  const sortedFilteredOrders = useMemo(() => {
    const arr = [...filteredOrders];
    arr.sort((a, b) => {
      const kb = getOrderKey(b);
      const ka = getOrderKey(a);
      if (kb !== ka) return kb - ka; // desc
      const tb = Date.parse(b.placedDate || 0) || 0;
      const ta = Date.parse(a.placedDate || 0) || 0;
      if (tb !== ta) return tb - ta; // newest first tie-breaker
      return (Number(b.id) || 0) - (Number(a.id) || 0);
    });
    return arr;
  }, [filteredOrders]);

  useEffect(() => {
    if (showOrderDetails && orderId) {
      handleView(orderId);
    }
  }, [showOrderDetails, orderId]);

  if (loading) return <div className="p-8">Đang tải...</div>;
  if (error) return <div className="p-8 text-red-600">{error}</div>;
  if (loadingDetail) return <div className="p-8">Đang tải chi tiết...</div>;
  if (selectedOrder)
    return (
      <OrderTrackingForm
        order={selectedOrder}
        onBackToList={handleBack}
        onUpdateStatus={handleUpdateStatus}
      />
    );

  return (
    <div className="p-8 bg-pink-50 min-h-screen">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col gap-4 mb-6">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <h2 className="text-3xl font-bold text-pink-700 flex items-center gap-3">
              <ListOrdered className="h-7 w-7" /> Tất cả đơn hàng
            </h2>
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
                      load();
                    }}
                    className="h-10 bg-white border border-pink-200 hover:bg-pink-100 text-pink-600 px-4 rounded-lg text-sm font-medium"
                  >
                    Reset
                  </button>
                  <button
                    onClick={load}
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
                    {/* <th className="px-4 py-3 font-semibold">
                      Số lượng topping
                    </th> */}
                    <th className="px-4 py-3 font-semibold">Trạng thái</th>
                    <th className="px-4 py-3 font-semibold">Tổng (Base)</th>
                    <th className="px-4 py-3 font-semibold">Thao tác</th>
                  </tr>
                </thead>
                <tbody>
                  {sortedFilteredOrders.map((o, idx) => (
                    <tr
                      key={o.id}
                      className={`border-b last:border-b-0 hover:bg-pink-50 transition ${
                        idx % 2 === 1 ? "bg-pink-50/30" : "bg-white"
                      }`}
                    >
                      <td className="px-4 py-3 font-medium text-pink-700 whitespace-nowrap">
                        {o.orderNumber}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        {new Date(o.placedDate).toLocaleDateString("vi-VN")}
                      </td>
                      <td
                        className="px-4 py-3 max-w-[220px] truncate"
                        title={o.customerName}
                      >
                        {o.customerName}
                      </td>
                      {/* <td className="px-4 py-3 text-center">
                        {o.items.length}
                      </td> */}
                      <td className="px-4 py-3">
                        <span
                          className={`${
                            statusMap[o.status]?.color ||
                            "bg-gray-200 text-gray-700"
                          } text-xs px-2 py-1 rounded-full font-semibold inline-block`}
                        >
                          {statusMap[o.status]?.label || o.status}
                        </span>
                      </td>
                      <td className="px-4 py-3 font-semibold text-pink-600 whitespace-nowrap">
                        {o.base_price.toLocaleString("vi-VN")}đ
                      </td>
                      <td className="px-4 py-3">
                        <button
                          onClick={() => handleView(o.id)}
                          className="text-xs bg-pink-500 hover:bg-pink-600 text-white px-3 py-1.5 rounded-md font-medium"
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
