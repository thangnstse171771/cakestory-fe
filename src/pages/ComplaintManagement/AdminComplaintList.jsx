"use client";
import {
  ListOrdered,
  MessageSquareWarning,
  CalendarDays,
  Filter,
  Search,
  RefreshCw,
} from "lucide-react";
import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { fetchAllComplaints } from "../../api/axios";
import { handleApiError } from "../../utils/handleApiError";

export default function ComplaintList({
  complaints: initialComplaints,
  shopId: _propShopId,
}) {
  // Local state
  const [complaints, setComplaints] = useState(initialComplaints || []);
  const [statusFilter, setStatusFilter] = useState("all");
  const [dateFilter, setDateFilter] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  // Unified view: admin and staff both see all complaints
  const navigate = useNavigate();

  // Status map (UI)
  const complaintStatusMap = {
    pending: { label: "Chờ xử lý", color: "bg-yellow-100 text-yellow-700" },
    complete: { label: "Đã hoàn tiền", color: "bg-green-100 text-green-700" },
    rejected: { label: "Đã từ chối", color: "bg-gray-100 text-gray-700" },
  };

  // Robust status normalization aligned with user complaint logic
  const normalizeStatus = (raw = "") => {
    const r = (raw || "").toString().trim().toLowerCase();
    if (["pending", "complaining"].includes(r)) return "pending";
    if (
      [
        "complete",
        "completed",
        "resolved",
        "refunded",
        "approved",
        "approve",
      ].includes(r)
    )
      return "complete";
    if (["rejected", "denied", "closed", "cancelled", "reject"].includes(r))
      return "rejected";
    return "pending";
  };

  // Load all complaints for both admin and staff
  useEffect(() => {
    const loadAll = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await fetchAllComplaints();

        // unify list
        let listRaw = [];
        if (Array.isArray(data)) listRaw = data;
        else if (Array.isArray(data?.data)) listRaw = data.data;
        else if (Array.isArray(data?.complaints)) listRaw = data.complaints;
        else if (Array.isArray(data?.data?.complaints))
          listRaw = data.data.complaints;
        else if (data && typeof data === "object") listRaw = [data];

        const mapped = listRaw.map((c, idx) => {
          // parse create date robustly
          const createdStr =
            c.created_at ||
            c.createdAt ||
            c.created_on ||
            c.created ||
            c.timestamp;
          let dt = createdStr ? new Date(createdStr) : null;
          if (!dt || isNaN(dt.getTime())) dt = new Date();
          // gather images like detail page
          const evidenceImages = [];
          if (c.evidence_images) {
            if (Array.isArray(c.evidence_images))
              evidenceImages.push(...c.evidence_images);
            else if (typeof c.evidence_images === "string")
              evidenceImages.push(...c.evidence_images.split(","));
          }
          if (c.image_url) evidenceImages.push(c.image_url);
          if (c.image) evidenceImages.push(c.image);
          const uniqueImages = [
            ...new Set(
              evidenceImages.map((i) => i && i.trim()).filter(Boolean)
            ),
          ];
          const status = normalizeStatus(
            c.status || c.complaint_status || c.state
          );
          return {
            id: c.id || c.complaint_id || idx,
            orderId:
              c.order_id || c.orderId || c.order?.id || c.order?.order_id || "",
            orderNumber:
              c.order_code ||
              c.order?.order_code ||
              c.order?.id ||
              c.order_id ||
              c.orderId ||
              "N/A",
            customerName:
              c.customer_name ||
              c.customerName ||
              c.customer?.full_name ||
              "Khách hàng",
            subject:
              c.subject ||
              c.title ||
              `Khiếu nại đơn hàng ${c.order_code || c.order_id || ""}`,
            description: c.description || c.content || c.reason || "",
            status,
            date: dt.toLocaleDateString("vi-VN"),
            time: dt.toLocaleTimeString("vi-VN", {
              hour: "2-digit",
              minute: "2-digit",
            }),
            imageUrl: uniqueImages[0] || null,
            images: uniqueImages,
            raw: c,
          };
        });
        setComplaints(mapped);
      } catch (e) {
        const { redirected } = handleApiError(e, navigate);
        if (!redirected) {
          setError(e.message || "Không tải được khiếu nại");
          setComplaints([]);
        }
      } finally {
        setLoading(false);
      }
    };
    loadAll();
  }, []);

  const loadComplaints = async () => {
    // kept for refresh; simply re-run loadAll via fetchAllComplaints
    setLoading(true);
    setError(null);
    try {
      const data = await fetchAllComplaints();
      let listRaw = [];
      if (Array.isArray(data)) listRaw = data;
      else if (Array.isArray(data?.data)) listRaw = data.data;
      else if (Array.isArray(data?.complaints)) listRaw = data.complaints;
      else if (Array.isArray(data?.data?.complaints))
        listRaw = data.data.complaints;
      else if (data && typeof data === "object") listRaw = [data];
      const mapped = listRaw.map((c, idx) => ({
        id: c.id || c.complaint_id || idx,
        orderId:
          c.order_id || c.orderId || c.order?.id || c.order?.order_id || "",
        orderNumber:
          c.order_code ||
          c.order?.order_code ||
          c.order?.id ||
          c.order_id ||
          c.orderId ||
          "N/A",
        customerName:
          c.customer_name ||
          c.customerName ||
          c.customer?.full_name ||
          "Khách hàng",
        subject:
          c.subject ||
          c.title ||
          `Khiếu nại đơn hàng ${c.order_code || c.order_id || ""}`,
        description: c.description || c.content || c.reason || "",
        status: normalizeStatus(c.status || c.complaint_status || c.state),
        date: new Date(
          (c.created_at ||
            c.createdAt ||
            c.created_on ||
            c.created ||
            c.timestamp) ??
            new Date()
        ).toLocaleDateString("vi-VN"),
        time: new Date(
          (c.created_at ||
            c.createdAt ||
            c.created_on ||
            c.created ||
            c.timestamp) ??
            new Date()
        ).toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" }),
        imageUrl: c.image_url || c.image || null,
        images: [],
        raw: c,
      }));
      setComplaints(mapped);
    } catch (e) {
      const { redirected } = handleApiError(e, navigate);
      if (!redirected) {
        setError(e.message || "Không tải được khiếu nại");
        setComplaints([]);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = () => {
    if (isAdmin) loadComplaints();
    else if (shopId) loadComplaints(shopId);
  };

  // Only real complaints (no fake fallback)
  const displayComplaints = complaints;

  // Filters
  const filteredComplaints = displayComplaints.filter((complaint) => {
    const matchesStatus =
      statusFilter === "all" || complaint.status === statusFilter;
    const matchesSearch =
      complaint.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
      complaint.orderNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      complaint.customerName.toLowerCase().includes(searchTerm.toLowerCase());
    let matchesDate = true;
    if (dateFilter !== "all") {
      const complaintDate = new Date(
        complaint.date.split("/").reverse().join("-")
      );
      const today = new Date();
      const yesterday = new Date(today.getTime() - 24 * 60 * 60 * 1000);
      const lastWeek = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
      switch (dateFilter) {
        case "today":
          matchesDate = complaintDate.toDateString() === today.toDateString();
          break;
        case "yesterday":
          matchesDate =
            complaintDate.toDateString() === yesterday.toDateString();
          break;
        case "week":
          matchesDate = complaintDate >= lastWeek;
          break;
      }
    }
    return matchesStatus && matchesSearch && matchesDate;
  });

  // Helper to derive numeric sort key from order id/number
  const getOrderKey = (c) => {
    let n = Number(c.orderId);
    if (!Number.isFinite(n) || n <= 0) {
      const s = String(c.orderNumber || "");
      const digits = s.match(/\d+/g);
      if (digits && digits.length) n = Number(digits.join(""));
    }
    if (!Number.isFinite(n)) n = Number(c.id) || 0;
    return n;
  };

  // Sort: pending first, then by order key ascending
  const sortedComplaints = useMemo(() => {
    const arr = [...filteredComplaints];
    arr.sort((a, b) => {
      const pa = a.status === "pending" ? 0 : 1;
      const pb = b.status === "pending" ? 0 : 1;
      if (pa !== pb) return pa - pb;
      const ka = getOrderKey(a);
      const kb = getOrderKey(b);
      if (ka !== kb) return ka - kb;
      return (Number(a.id) || 0) - (Number(b.id) || 0);
    });
    return arr;
  }, [filteredComplaints]);

  const handleViewDetails = (complaint) =>
    navigate(`/admin/complaints/${complaint.id}`);

  return (
    <div className="p-8 bg-pink-50 min-h-screen">
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
          <h2 className="text-3xl font-bold text-red-700 flex items-center gap-3">
            <MessageSquareWarning className="h-7 w-7" />
            {"Tất cả Khiếu nại"} ({filteredComplaints.length})
          </h2>
          <div className="flex items-center gap-3">
            {error && <span className="text-sm text-red-600">{error}</span>}
            <button
              onClick={handleRefresh}
              disabled={loading}
              className="flex items-center gap-2 px-4 py-2 bg-white border border-red-200 rounded-lg text-red-600 font-medium hover:bg-red-50 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
            >
              <RefreshCw
                className={`h-4 w-4 ${loading ? "animate-spin" : ""}`}
              />
              {loading ? "Đang tải..." : "Tải lại"}
            </button>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white p-6 rounded-xl shadow-lg mb-6 border border-red-100">
          <div className="flex items-center gap-2 mb-4">
            <Filter className="h-5 w-5 text-red-600" />
            <span className="font-semibold text-red-700">Lọc khiếu nại</span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="relative">
              <Search className="h-4 w-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Tìm kiếm tiêu đề, mã đơn, khách hàng..."
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <select
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="all">Tất cả trạng thái</option>
              <option value="pending">Chờ xử lý</option>
              <option value="complete">Đã hoàn tiền</option>
              <option value="rejected">Đã từ chối</option>
            </select>
            <select
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
            >
              <option value="all">Tất cả thời gian</option>
              <option value="today">Hôm nay</option>
              <option value="yesterday">Hôm qua</option>
              <option value="week">7 ngày qua</option>
            </select>
            <div className="flex items-center text-sm text-gray-500">
              {loading
                ? "Đang tải dữ liệu..."
                : `${displayComplaints.length} bản ghi`}
            </div>
          </div>
        </div>

        {/* Complaints List */}
        {filteredComplaints.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center text-gray-600 bg-white rounded-xl shadow-lg">
            <MessageSquareWarning className="h-16 w-16 mb-4 text-gray-400" />
            <p className="text-lg font-medium">
              {loading
                ? "Đang tải khiếu nại..."
                : "Không tìm thấy khiếu nại nào."}
            </p>
            {!loading && <p className="text-sm">Thử thay đổi bộ lọc.</p>}
          </div>
        ) : (
          <div className="space-y-4">
            {sortedComplaints.map((complaint) => (
              <div
                key={complaint.id}
                className="p-6 shadow-lg rounded-xl border border-red-100 hover:shadow-xl transition-all duration-200 bg-white cursor-pointer hover:border-red-200"
                onClick={() => handleViewDetails(complaint)}
              >
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <h3 className="text-xl font-bold text-red-700 mb-1">
                          {complaint.subject}
                        </h3>
                        <p className="text-sm text-gray-600 mb-2">
                          Khách hàng:{" "}
                          <span className="font-medium">
                            {complaint.customerName}
                          </span>
                        </p>
                        <p className="text-sm text-gray-500 flex items-center gap-1">
                          <ListOrdered className="h-4 w-4" />
                          Mã đơn hàng:{" "}
                          <span className="font-medium">
                            {complaint.orderNumber}
                          </span>
                        </p>
                      </div>
                      <span
                        className={`${
                          complaintStatusMap[complaint.status]?.color ||
                          "bg-gray-200 text-gray-700"
                        } text-sm px-3 py-1 rounded-full font-semibold whitespace-nowrap`}
                      >
                        {complaintStatusMap[complaint.status]?.label ||
                          complaint.status}
                      </span>
                    </div>
                    <p className="text-gray-600 text-sm line-clamp-2 mb-3">
                      {complaint.description}
                    </p>
                  </div>
                </div>
                <div className="flex items-center justify-between pt-3 border-t border-red-100 text-sm text-gray-500">
                  <div className="flex items-center gap-2">
                    <CalendarDays className="h-4 w-4" /> Ngày gửi:{" "}
                    {complaint.date} lúc {complaint.time}
                  </div>
                  <button
                    className="text-red-600 hover:text-red-800 font-medium hover:underline"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleViewDetails(complaint);
                    }}
                  >
                    Xem chi tiết →
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
