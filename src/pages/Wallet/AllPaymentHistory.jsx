import React, { useState, useEffect } from "react";
import {
  ArrowLeft,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  Calendar,
  RefreshCw,
  FileText,
  TrendingUp,
  TrendingDown,
  Filter,
  ArrowUpRight,
  ArrowDownLeft,
  Building,
  ChevronLeft,
  ChevronRight,
  RotateCcw,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import {
  fetchWalletHistory,
  fetchWithdrawHistory,
  fetchCakeOrdersByUserId,
  fetchShopByUserId,
  fetchShopOrders,
  fetchWalletBalance, // unified balance endpoint
} from "../../api/axios";

// Helper: robust parse amount strings to number (keep decimals, drop thousand separators and currency symbols)
const toNumber = (v) => {
  if (v == null || v === "") return 0;
  if (typeof v === "number") return v;
  if (typeof v === "string") {
    let s = v.replace(/[\s₫đVND]/gi, "").trim();
    if (s.includes(",") && s.includes(".")) {
      const lastComma = s.lastIndexOf(",");
      const lastDot = s.lastIndexOf(".");
      const decimalSep = lastComma > lastDot ? "," : ".";
      if (decimalSep === ",") {
        s = s.replace(/\./g, "");
        s = s.replace(",", ".");
      } else {
        s = s.replace(/,/g, "");
      }
    } else if (s.includes(",")) {
      // Assume comma is thousands for vi-VN
      s = s.replace(/,/g, "");
    } else if (s.includes(".")) {
      const dotCount = (s.match(/\./g) || []).length;
      if (dotCount > 1) s = s.replace(/\./g, "");
    }
    const n = parseFloat(s);
    if (Number.isFinite(n)) return n;
    const fallback = s.replace(/[^0-9]/g, "");
    return fallback ? parseInt(fallback, 10) : 0;
  }
  const n = Number(v);
  return Number.isFinite(n) ? n : 0;
};

// Filter Form Component
const FilterForm = ({ filterForm, onFormChange, onReset, appliedFilters }) => {
  const hasChanges =
    JSON.stringify(filterForm) !== JSON.stringify(appliedFilters);

  return (
    <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
      <h3 className="text-lg font-semibold text-gray-800 mb-4">
        Bộ lọc giao dịch
      </h3>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        {/* Date Filter */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Thời gian
          </label>
          <select
            value={filterForm.dateFilter}
            onChange={(e) => onFormChange("dateFilter", e.target.value)}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-pink-500 focus:border-transparent"
          >
            <option value="all">Tất cả</option>
            <option value="today">Hôm nay</option>
            <option value="week">7 ngày qua</option>
            <option value="month">30 ngày qua</option>
            <option value="custom">Tùy chọn</option>
          </select>
        </div>

        {/* Status Filter */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Trạng thái
          </label>
          <select
            value={filterForm.statusFilter}
            onChange={(e) => onFormChange("statusFilter", e.target.value)}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-pink-500 focus:border-transparent"
          >
            <option value="all">Tất cả</option>
            <option value="completed">Thành công</option>
            <option value="pending">Đang xử lý</option>
            <option value="failed">Thất bại</option>
          </select>
        </div>

        {/* Type Filter */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Loại giao dịch
          </label>
          <select
            value={filterForm.typeFilter}
            onChange={(e) => onFormChange("typeFilter", e.target.value)}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-pink-500 focus:border-transparent"
          >
            <option value="all">Tất cả</option>
            <option value="deposit">Nạp tiền</option>
            <option value="withdraw">Rút tiền</option>
            <option value="purchase">Mua bánh</option>
          </select>
        </div>
      </div>

      {/* Custom Date Range */}
      {filterForm.dateFilter === "custom" && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Từ ngày
            </label>
            <input
              type="date"
              value={filterForm.customDateFrom}
              onChange={(e) => onFormChange("customDateFrom", e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-pink-500 focus:border-transparent"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Đến ngày
            </label>
            <input
              type="date"
              value={filterForm.customDateTo}
              onChange={(e) => onFormChange("customDateTo", e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-pink-500 focus:border-transparent"
            />
          </div>
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex items-center gap-3">
        <button
          onClick={onReset}
          className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
        >
          <RotateCcw className="w-4 h-4" />
          Đặt lại
        </button>

        {hasChanges && (
          <span className="text-sm text-orange-600 ml-2">
            Có thay đổi chưa áp dụng
          </span>
        )}
      </div>
    </div>
  );
};

const AllPaymentHistory = () => {
  const navigate = useNavigate();
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [refreshing, setRefreshing] = useState(false);

  // Filters - separate applied vs current values
  const [appliedFilters, setAppliedFilters] = useState({
    dateFilter: "all",
    statusFilter: "all",
    typeFilter: "all",
    customDateFrom: "",
    customDateTo: "",
  });

  // Current filter form values (not yet applied)
  const [filterForm, setFilterForm] = useState({
    dateFilter: "all",
    statusFilter: "all",
    typeFilter: "all",
    customDateFrom: "",
    customDateTo: "",
  });

  // Show filters open by default
  const [showFilters, setShowFilters] = useState(true);

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(20);

  // Statistics (extended with purchase/withdraw split)
  const [stats, setStats] = useState({
    // totalDeposits removed -> now using walletBalance card
    totalWithdrawals: 0,
    totalTransactions: 0,
    pendingCount: 0,
    completedCount: 0,
    failedCount: 0,
    totalPurchases: 0,
    purchaseCount: 0,
    purchasePending: 0,
    purchaseCompleted: 0,
    purchaseFailed: 0,
    totalWithdrawOnly: 0,
    withdrawCount: 0,
    withdrawPending: 0,
    withdrawCompleted: 0,
    withdrawFailed: 0,
    // payout stats
    payoutGross: 0,
    payoutNet: 0,
    systemFee: 0,
    payoutCount: 0,
  });

  // Wallet balance state (replaces totalDeposits card)
  const [walletBalance, setWalletBalance] = useState(0);

  useEffect(() => {
    loadAllTransactions();
  }, []);

  const getCurrentUserId = () => {
    try {
      const user = JSON.parse(localStorage.getItem("user"));
      return user?.id || user?.user_id || user?.userId || null;
    } catch {
      return null;
    }
  };

  const loadAllTransactions = async () => {
    setLoading(true);
    setError("");
    try {
      const userId = getCurrentUserId();
      // resolve shop id
      let shopId = null;
      if (userId) {
        try {
          const shopRes = await fetchShopByUserId(userId);
          shopId = shopRes?.shop?.shop_id;
          null;
        } catch {}
      }
      // fetch wallet balance (by user id)
      if (userId) {
        try {
          const wb = await fetchWalletBalance();
          const extracted = toNumber(wb?.wallet?.balance);
          setWalletBalance(extracted);
        } catch (e) {
          // silent fail; leave walletBalance at 0
        }
      }

      const promises = [fetchWalletHistory(), fetchWithdrawHistory()];
      if (userId) promises.push(fetchCakeOrdersByUserId(userId));
      if (shopId) promises.push(fetchShopOrders(shopId));
      const results = await Promise.allSettled(promises);
      // unpack results respecting order
      let depositResponse = results[0];
      let withdrawResponse = results[1];
      let ordersResponse = userId ? results[2] : null;
      let shopOrdersResponse = shopId ? results[results.length - 1] : null;
      let allTransactions = [];
      // deposits
      if (depositResponse?.status === "fulfilled") {
        let deposits = [];
        const depositData = depositResponse.value;
        if (Array.isArray(depositData)) deposits = depositData;
        else if (Array.isArray(depositData?.history))
          deposits = depositData.history; // support { history: [...] }
        else if (depositData && typeof depositData === "object") {
          const arrayProperty = Object.values(depositData).find((v) =>
            Array.isArray(v)
          );
          if (arrayProperty) deposits = arrayProperty;
        }
        const completedStatuses = [
          "completed",
          "success",
          "hoàn thành",
          "thành công",
        ];
        const processedDeposits = deposits
          .filter((d) =>
            completedStatuses.includes(
              String(d.status || "")
                .toLowerCase()
                .trim()
            )
          )
          .map((d) => ({
            ...d,
            id: d.id,
            type: "deposit",
            transactionType: "Nạp tiền",
            icon: <ArrowDownLeft className="w-4 h-4 text-green-500" />,
            amountPrefix: "+",
            amountColor: "text-green-600",
          }));
        allTransactions.push(...processedDeposits);
      }
      // withdrawals
      if (withdrawResponse?.status === "fulfilled") {
        let withdrawals = [];
        const withdrawData = withdrawResponse.value;
        if (Array.isArray(withdrawData?.withdrawHistory))
          withdrawals = withdrawData.withdrawHistory;
        else if (Array.isArray(withdrawData)) withdrawals = withdrawData;
        const processedWithdrawals = withdrawals.map((w) => ({
          ...w,
          id: w.id,
          type: "withdraw",
          transactionType: "Rút tiền",
          icon: <ArrowUpRight className="w-4 h-4 text-red-500" />,
          amountPrefix: "-",
          amountColor: "text-red-600",
        }));
        allTransactions.push(...processedWithdrawals);
      }
      // user purchase orders
      if (ordersResponse && ordersResponse.status === "fulfilled") {
        let orders = [];
        const ordersData = ordersResponse.value;
        if (Array.isArray(ordersData)) orders = ordersData;
        else if (Array.isArray(ordersData?.orders)) orders = ordersData.orders;
        else if (Array.isArray(ordersData?.data)) orders = ordersData.data;
        else if (ordersData && typeof ordersData === "object") {
          if (ordersData.id || ordersData.order_id) orders = [ordersData];
          else {
            const arrayProperty = Object.values(ordersData).find((v) =>
              Array.isArray(v)
            );
            if (arrayProperty) orders = arrayProperty;
          }
        }
        const processedOrders = orders.map((o) => {
          const amount = toNumber(
            o.total ?? o.total_price ?? o.totalPrice ?? o.amount
          );
          const rawStatus = (o.status || o.payment_status || "")
            .toString()
            .toLowerCase();
          let normalized = rawStatus;
          if (
            [
              "paid",
              "completed",
              "complete",
              "delivered",
              "shipped",
              "success",
            ].includes(rawStatus)
          )
            normalized = "completed";
          else if (
            [
              "pending",
              "processing",
              "in_progress",
              "created",
              "ordered",
            ].includes(rawStatus)
          )
            normalized = "pending";
          else if (
            ["failed", "rejected", "cancelled", "canceled"].includes(rawStatus)
          )
            normalized = "failed";
          let amountPrefix = "-",
            amountColor = "text-red-600",
            transactionType = "Mua bánh";
          if (normalized === "pending") transactionType = "Mua bánh (giữ tạm)";
          else if (normalized === "failed") {
            amountPrefix = "+";
            amountColor = "text-green-600";
            transactionType = "Hoàn tiền mua bánh";
          }
          const createdAtVal =
            o.created_at ||
            o.createdAt ||
            o.updated_at ||
            o.updatedAt ||
            o.payment_time ||
            new Date().toISOString();
          return {
            id: o.id || o.order_id || `order-${amount}-${createdAtVal}`,
            type: "purchase",
            transactionType,
            icon: <ArrowUpRight className="w-4 h-4 text-red-500" />,
            amountPrefix,
            amountColor,
            amount,
            status: normalized || "pending",
            created_at: createdAtVal,
            description: o.note || o.size || `Đơn hàng #${o.id ?? o.order_id}`,
            orderRaw: o,
          };
        });
        allTransactions.push(...processedOrders);
      }
      // synthetic payouts for shop completed orders
      if (shopOrdersResponse && shopOrdersResponse.status === "fulfilled") {
        let shopOrders = [];
        const raw = shopOrdersResponse.value;
        if (Array.isArray(raw)) shopOrders = raw;
        else if (Array.isArray(raw?.orders)) shopOrders = raw.orders;
        else if (Array.isArray(raw?.data)) shopOrders = raw.data;
        else if (raw && typeof raw === "object") {
          const arrProp = Object.values(raw).find((v) => Array.isArray(v));
          if (Array.isArray(arrProp)) shopOrders = arrProp;
        }
        const payoutStatuses = [
          "completed",
          "success",
          "paid",
          "delivered",
          "shipped",
          "hoàn thành",
          "thành công",
        ];
        const payoutTx = shopOrders
          .filter((o) =>
            payoutStatuses.includes(String(o.status || "").toLowerCase())
          )
          .map((o) => {
            const gross = toNumber(o.total_price) || 0;
            const net = Math.round(gross * 0.95);
            const fee = gross - net;
            const timeRef =
              o.updated_at ||
              o.updatedAt ||
              o.completed_at ||
              o.created_at ||
              o.createdAt;
            return {
              id: `payout-${o.id || o.order_id}`,
              type: "order_payout",
              transactionType: "Doanh thu thực nhận",
              icon: <ArrowDownLeft className="w-4 h-4 text-green-500" />,
              amountPrefix: "+",
              amountColor: "text-green-600",
              amount: net,
              status: "completed",
              created_at: timeRef,
              grossAmount: gross,
              feeAmount: fee,
              originalOrderId: o.id || o.order_id,
              note: `Thực nhận doanh thu 95% giá trị đơn #${
                o.id || o.order_id
              } (Hoa hồng hệ thống thu 5%: ${fee.toLocaleString("vi-VN")}đ)`,
              orderRaw: o,
              synthetic: true,
            };
          });
        allTransactions.push(...payoutTx);
      }
      // dedupe existing
      const dedupedMap = new Map();
      const buildKey = (t) => {
        const type = t.type || "unknown";
        const idCandidate =
          t.id ||
          t.deposit_code ||
          t.transaction_id ||
          t.payment_id ||
          t.request_id ||
          t.orderRaw?.id ||
          t.orderRaw?.order_id;
        if (idCandidate != null)
          return `${type}::${String(idCandidate).toLowerCase()}`;
        const amount = toNumber(t.amount);
        const d = new Date(t.created_at || t.createdAt || Date.now());
        const minuteBucket = `${d.getFullYear()}-${d.getMonth()}-${d.getDate()} ${d.getHours()}:${d.getMinutes()}`;
        const extra = String(t.bank_name || t.description || "").toLowerCase();
        return `${type}::${amount}::${minuteBucket}::${extra}`;
      };
      for (const t of allTransactions) {
        const key = buildKey(t);
        if (!dedupedMap.has(key)) dedupedMap.set(key, t);
      }
      const dedupedTransactions = Array.from(dedupedMap.values()).sort(
        (a, b) =>
          new Date(b.created_at || b.createdAt || 0) -
          new Date(a.created_at || a.createdAt || 0)
      );
      setTransactions(dedupedTransactions);
      calculateStats(dedupedTransactions);
    } catch (e) {
      setError("Không thể tải lịch sử giao dịch. Vui lòng thử lại.");
    } finally {
      setLoading(false);
    }
  };

  const calculateStats = (transactions) => {
    const next = {
      // totalDeposits removed
      totalWithdrawals: 0,
      totalTransactions: transactions.length,
      pendingCount: 0,
      completedCount: 0,
      failedCount: 0,
      totalPurchases: 0,
      netPurchases: 0,
      purchaseHeld: 0,
      purchaseRefunded: 0,
      purchaseCount: 0,
      purchasePending: 0,
      purchaseCompleted: 0,
      purchaseFailed: 0,
      totalWithdrawOnly: 0,
      withdrawCount: 0,
      withdrawPending: 0,
      withdrawCompleted: 0,
      withdrawFailed: 0,
      payoutGross: 0,
      payoutNet: 0,
      systemFee: 0,
      payoutCount: 0,
    };
    transactions.forEach((t) => {
      const amount = toNumber(t.amount);
      const status = t.status?.toLowerCase();
      if (t.type === "order_payout") {
        next.payoutCount++;
        next.payoutNet += amount;
        next.payoutGross += toNumber(t.grossAmount || amount / 0.95);
        next.systemFee += toNumber(t.feeAmount || 0);
        next.completedCount++;
        return;
      }
      if (t.type === "deposit") {
        if (
          ["completed", "success", "hoàn thành", "thành công"].includes(status)
        ) {
          next.completedCount++;
        } else if (["pending", "đang xử lý"].includes(status)) {
          next.pendingCount++;
        } else if (
          [
            "failed",
            "rejected",
            "cancelled",
            "canceled",
            "từ chối",
            "thất bại",
          ].includes(status)
        ) {
          next.failedCount++;
        }
      } else if (t.type === "withdraw") {
        next.totalWithdrawals += amount;
        next.totalWithdrawOnly += amount;
        next.withdrawCount++;
        if (
          ["completed", "success", "hoàn thành", "thành công"].includes(status)
        ) {
          next.completedCount++;
          next.withdrawCompleted++;
        } else if (["pending", "đang xử lý"].includes(status)) {
          next.pendingCount++;
          next.withdrawPending++;
        } else if (
          [
            "failed",
            "rejected",
            "cancelled",
            "canceled",
            "từ chối",
            "thất bại",
          ].includes(status)
        ) {
          next.failedCount++;
          next.withdrawFailed++;
        }
      } else if (t.type === "purchase") {
        next.totalPurchases += amount; // luôn cộng vào tổng gross
        next.purchaseCount++;
        if (
          [
            "completed",
            "success",
            "paid",
            "delivered",
            "shipped",
            "hoàn thành",
            "thành công",
          ].includes(status)
        ) {
          // Chỉ đơn hoàn thành mới thực sự trừ khỏi ví
          next.totalWithdrawals += amount;
          next.netPurchases += amount;
          next.completedCount++;
          next.purchaseCompleted++;
        } else if (
          [
            "pending",
            "processing",
            "in_progress",
            "ordered",
            "đang xử lý",
          ].includes(status)
        ) {
          // Tiền đang tạm giữ (escrow) chứ chưa trừ vĩnh viễn
          next.purchaseHeld += amount;
          next.pendingCount++;
          next.purchasePending++;
        } else if (
          [
            "failed",
            "rejected",
            "cancelled",
            "canceled",
            "từ chối",
            "thất bại",
          ].includes(status)
        ) {
          // Đơn thất bại: coi như hoàn, không tính vào totalWithdrawals
          next.purchaseRefunded += amount;
          next.failedCount++;
          next.purchaseFailed++;
        }
      }
    });
    setStats(next);
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadAllTransactions();
    setRefreshing(false);
  };

  const getStatusInfo = (status) => {
    switch (status?.toLowerCase()) {
      case "completed":
      case "success":
      case "hoàn thành":
      case "thành công":
      case "paid":
      case "delivered":
      case "shipped":
        return {
          icon: <CheckCircle className="w-4 h-4" />,
          text: "Thành công",
          color: "text-green-600",
          bgColor: "bg-green-50",
          borderColor: "border-green-200",
        };
      case "pending":
      case "đang xử lý":
      case "processing":
      case "in_progress":
        return {
          icon: <Clock className="w-4 h-4" />,
          text: "Đang xử lý",
          color: "text-yellow-600",
          bgColor: "bg-yellow-50",
          borderColor: "border-yellow-200",
        };
      case "failed":
      case "rejected":
      case "cancelled":
      case "canceled":
      case "từ chối":
      case "thất bại":
        return {
          icon: <XCircle className="w-4 h-4" />,
          text: "Thất bại",
          color: "text-red-600",
          bgColor: "bg-red-50",
          borderColor: "border-red-200",
        };
      default:
        return {
          icon: <AlertCircle className="w-4 h-4" />,
          text: status || "Không xác định",
          color: "text-gray-600",
          bgColor: "bg-gray-50",
          borderColor: "border-gray-200",
        };
    }
  };

  const formatAmount = (amount) =>
    new Intl.NumberFormat("vi-VN").format(toNumber(amount));

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    try {
      return new Date(dateString).toLocaleString("vi-VN", {
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch (error) {
      return "N/A";
    }
  };

  const isDateInRange = (date, filter, customFrom, customTo) => {
    const transactionDate = new Date(date);
    const today = new Date();
    const startOfToday = new Date(
      today.getFullYear(),
      today.getMonth(),
      today.getDate()
    );

    switch (filter) {
      case "today":
        return transactionDate >= startOfToday;
      case "week":
        const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
        return transactionDate >= weekAgo;
      case "month":
        const monthAgo = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000);
        return transactionDate >= monthAgo;
      case "custom":
        if (!customFrom || !customTo) return true;
        const fromDate = new Date(customFrom);
        const toDate = new Date(customTo);
        toDate.setHours(23, 59, 59, 999);
        return transactionDate >= fromDate && transactionDate <= toDate;
      default:
        return true;
    }
  };

  const filteredTransactions = transactions.filter((transaction) => {
    // Date filter
    if (
      !isDateInRange(
        transaction.created_at || transaction.createdAt,
        appliedFilters.dateFilter,
        appliedFilters.customDateFrom,
        appliedFilters.customDateTo
      )
    ) {
      return false;
    }

    // Status filter
    if (appliedFilters.statusFilter !== "all") {
      const status = transaction.status?.toLowerCase();
      if (
        appliedFilters.statusFilter === "completed" &&
        ![
          "completed",
          "success",
          "hoàn thành",
          "thành công",
          "paid",
          "delivered",
          "shipped",
        ].includes(status)
      ) {
        return false;
      }
      if (
        appliedFilters.statusFilter === "pending" &&
        !["pending", "đang xử lý", "processing", "in_progress"].includes(status)
      ) {
        return false;
      }
      if (
        appliedFilters.statusFilter === "failed" &&
        ![
          "failed",
          "rejected",
          "cancelled",
          "canceled",
          "từ chối",
          "thất bại",
        ].includes(status)
      ) {
        return false;
      }
    }

    // Type filter
    if (
      appliedFilters.typeFilter !== "all" &&
      transaction.type !== appliedFilters.typeFilter
    ) {
      return false;
    }

    return true;
  });

  // Pagination calculations
  const totalPages = Math.ceil(filteredTransactions.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentTransactions = filteredTransactions.slice(startIndex, endIndex);

  // Apply filters and reset to page 1
  const handleApplyFilters = () => {
    setAppliedFilters({ ...filterForm });
    setCurrentPage(1);
  };

  // Reset filters to default
  const handleResetFilters = () => {
    const defaultFilters = {
      dateFilter: "all",
      statusFilter: "all",
      typeFilter: "all",
      customDateFrom: "",
      customDateTo: "",
    };
    setFilterForm(defaultFilters);
    setAppliedFilters(defaultFilters);
    setCurrentPage(1);
  };

  // Update form values (not applied yet)
  const handleFilterFormChange = (field, value) => {
    // Update form state
    setFilterForm((prev) => {
      const next = { ...prev, [field]: value };
      return next;
    });

    // Auto-apply filters so the list updates immediately
    setAppliedFilters((prev) => {
      const next = { ...prev, [field]: value };
      return next;
    });

    // Reset to first page whenever a filter changes
    setCurrentPage(1);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin w-8 h-8 border-4 border-pink-500 border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-gray-600">Đang tải lịch sử giao dịch...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header and actions remain; filters start opened by default */}
      {/* Header */}
      <div className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <button
                onClick={() => navigate("/wallet")}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <ArrowLeft className="w-5 h-5 text-gray-600" />
              </button>
              <div>
                <h1 className="text-2xl font-bold text-gray-800">
                  Tất cả giao dịch
                </h1>
                <p className="text-sm text-gray-600">
                  Quản lý và theo dõi toàn bộ giao dịch
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
              >
                <Filter className="w-4 h-4" />
                Bộ lọc
              </button>
              <button
                onClick={handleRefresh}
                disabled={refreshing}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-50"
              >
                <RefreshCw
                  className={`w-5 h-5 text-gray-600 ${
                    refreshing ? "animate-spin" : ""
                  }`}
                />
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto p-4">
        {/* Top-level Statistics Dashboard */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
          {/* Số dư ví hiện tại (wallet balance) */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Số dư ví hiện tại</p>
                <p className="text-2xl font-bold text-green-600">
                  {formatAmount(walletBalance)} đ
                </p>
              </div>
              <div className="p-3 bg-green-50 rounded-lg">
                <TrendingUp className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </div>

          {/* Tổng tiền ra (rút + mua) */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">
                  Tổng tiền ra (gồm giữ tạm)
                </p>
                {(() => {
                  const totalOutDisplay =
                    stats.totalWithdrawals + stats.purchaseHeld; // net + held
                  return (
                    <p
                      className={`text-2xl font-bold ${
                        totalOutDisplay > 0 ? "text-red-600" : "text-gray-500"
                      }`}
                    >
                      {formatAmount(totalOutDisplay)} đ
                    </p>
                  );
                })()}
                <p className="mt-1 text-[11px] text-gray-500">
                  <li>Đã trừ: {formatAmount(stats.totalWithdrawals)} đ</li>
                  <li>Giữ tạm: {formatAmount(stats.purchaseHeld)} đ</li>
                </p>
              </div>
              <div className="p-3 bg-red-50 rounded-lg">
                <TrendingDown className="w-6 h-6 text-red-600" />
              </div>
            </div>
          </div>

          {/* Tổng giao dịch */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Tổng giao dịch</p>
                <p className="text-2xl font-bold text-blue-600">
                  {stats.totalTransactions}
                </p>
              </div>
              <div className="p-3 bg-blue-50 rounded-lg">
                <FileText className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </div>

          {/* Doanh thu đơn hàng (Payout Net) */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">
                  Doanh thu thực nhận
                </p>
                <p className="text-2xl font-bold text-green-600">
                  {formatAmount(stats.payoutNet)} đ
                </p>
                <p className="mt-1 text-[11px] text-gray-500">
                  <li>
                    Doanh thu thực nhận: {formatAmount(stats.payoutGross)} đ
                  </li>
                  <li> Hoa hồng hệ thống: {formatAmount(stats.systemFee)} đ</li>
                </p>
                <p className="mt-1 text-[11px] text-gray-400">
                  Số đơn: {stats.payoutCount}
                </p>
              </div>
              <div className="p-3 bg-green-50 rounded-lg">
                <ArrowDownLeft className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </div>

          {/* Thành công */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Thành công</p>
                <p className="text-2xl font-bold text-green-600">
                  {stats.completedCount}
                </p>
              </div>
              <div className="p-3 bg-green-50 rounded-lg">
                <CheckCircle className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Split dashboard: Purchases vs Withdrawals */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6">
          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Chi mua bánh</p>
                <p
                  className={`text-2xl font-bold ${
                    stats.netPurchases + stats.purchaseHeld > 0
                      ? "text-red-600"
                      : "text-gray-500"
                  }`}
                >
                  {formatAmount(stats.netPurchases + stats.purchaseHeld)} đ
                </p>
                <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-gray-500 mt-2">
                  <span>Số đơn: {stats.purchaseCount}</span>
                  <span>Thành công: {stats.purchaseCompleted}</span>
                  <span>Đang xử lý: {stats.purchasePending}</span>
                  <span>Thất bại: {stats.purchaseFailed}</span>
                </div>
                <div className="mt-3 flex flex-wrap gap-2 text-[11px]">
                  {stats.purchaseHeld > 0 && (
                    <span className="px-2 py-1 rounded-full bg-yellow-100 text-yellow-700">
                      Giữ tạm: {formatAmount(stats.purchaseHeld)} đ
                    </span>
                  )}
                  {stats.purchaseRefunded > 0 && (
                    <span className="px-2 py-1 rounded-full bg-green-100 text-green-700">
                      Hoàn: {formatAmount(stats.purchaseRefunded)} đ
                    </span>
                  )}
                </div>
              </div>
              <div className="p-3 bg-red-50 rounded-lg">
                <ArrowUpRight className="w-6 h-6 text-red-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Rút tiền</p>
                <p className="text-2xl font-bold text-red-600">
                  {formatAmount(stats.totalWithdrawOnly)} đ
                </p>
                <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-gray-500 mt-2">
                  <span>Số giao dịch: {stats.withdrawCount}</span>
                  <span>Thành công: {stats.withdrawCompleted}</span>
                  <span>Đang xử lý: {stats.withdrawPending}</span>
                  <span>Thất bại: {stats.withdrawFailed}</span>
                </div>
              </div>
              <div className="p-3 bg-red-50 rounded-lg">
                <ArrowUpRight className="w-6 h-6 text-red-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Filters */}
        {showFilters && (
          <FilterForm
            filterForm={filterForm}
            appliedFilters={appliedFilters}
            onFormChange={handleFilterFormChange}
            onApply={handleApplyFilters}
            onReset={handleResetFilters}
          />
        )}

        {/* Error Display */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <div className="flex items-center gap-2">
              <XCircle className="w-5 h-5 text-red-500" />
              <span className="text-red-700 font-medium">Lỗi</span>
            </div>
            <p className="text-red-600 text-sm mt-1">{error}</p>
          </div>
        )}

        {/* Transactions List */}
        <div className="bg-white rounded-xl shadow-sm">
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-800">
                Danh sách giao dịch
              </h2>
              <div className="flex items-center gap-4">
                <span className="text-sm text-gray-600">
                  {filteredTransactions.length} kết quả
                </span>
                {totalPages > 1 && (
                  <span className="text-sm text-gray-500">
                    Trang {currentPage} / {totalPages}
                  </span>
                )}
              </div>
            </div>
          </div>

          {currentTransactions.length === 0 ? (
            <div className="p-8 text-center">
              <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-800 mb-2">
                Không có giao dịch
              </h3>
              <p className="text-gray-600">
                Không tìm thấy giao dịch nào phù hợp với bộ lọc
              </p>
            </div>
          ) : (
            <>
              <div className="divide-y divide-gray-200">
                {currentTransactions.map((transaction, index) => {
                  const statusInfo = getStatusInfo(transaction.status);
                  const goToDetails = () => {
                    if (transaction.type === "deposit") {
                      const depId =
                        transaction.id ||
                        transaction.deposit_code ||
                        transaction.transaction_id;
                      if (depId) navigate(`/wallet`);
                      return;
                    }
                    if (transaction.type === "withdraw") {
                      const wdId =
                        transaction.id ||
                        transaction.withdraw_id ||
                        transaction.transaction_id ||
                        transaction.request_id;
                      navigate(
                        wdId ? `/withdraw-history#${wdId}` : `/withdraw-history`
                      );
                      return;
                    }
                    if (transaction.type === "purchase") {
                      const orderId =
                        transaction.orderRaw?.id ||
                        transaction.orderRaw?.order_id ||
                        transaction.id;
                      if (orderId) navigate(`/order-tracking-user/${orderId}`);
                      return;
                    }
                    if (transaction.type === "order_payout") {
                      const orderId =
                        transaction.originalOrderId ||
                        transaction.orderRaw?.id ||
                        transaction.orderRaw?.order_id;
                      if (orderId) navigate(`/order-tracking-user/${orderId}`);
                      return;
                    }
                  };

                  return (
                    <div
                      key={`${transaction.type}-${transaction.id || index}-${
                        transaction.created_at || transaction.createdAt || ""
                      }`}
                      className="p-6 hover:bg-gray-50 transition-colors cursor-pointer"
                      onClick={goToDetails}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <div className="p-2 bg-gray-50 rounded-lg">
                            {transaction.icon}
                          </div>
                          <div>
                            <div className="flex items-center gap-3 mb-1">
                              <span className="font-semibold text-gray-800">
                                {transaction.transactionType}
                              </span>
                              {/* <span className="px-2 py-0.5 rounded-full text-[10px] uppercase bg-gray-100 text-gray-500">
                                {transaction.type}
                              </span> */}
                              {/* {transaction.type === "order_payout" && (
                                <span className="px-2 py-0.5 rounded-full text-[10px] bg-green-100 text-green-600">
                                  Thực nhận
                                </span>
                              )} */}
                              <span
                                className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${statusInfo.bgColor} ${statusInfo.color}`}
                              >
                                {statusInfo.icon}
                                {statusInfo.text}
                              </span>
                            </div>
                            <div className="flex items-center gap-4 text-sm text-gray-500">
                              <span className="flex items-center gap-1">
                                <Calendar className="w-3 h-3" />
                                {formatDate(
                                  transaction.created_at ||
                                    transaction.createdAt
                                )}
                              </span>
                              {transaction.deposit_code && (
                                <span>Mã: {transaction.deposit_code}</span>
                              )}
                              {transaction.bank_name && (
                                <span className="flex items-center gap-1">
                                  <Building className="w-3 h-3" />
                                  {transaction.bank_name}
                                </span>
                              )}
                            </div>
                            {transaction.type === "order_payout" &&
                              transaction.note && (
                                <div className="mt-1 text-xs text-green-700">
                                  {transaction.note}
                                </div>
                              )}
                          </div>
                        </div>

                        <div className="text-right">
                          <div
                            className={`text-lg font-bold ${transaction.amountColor}`}
                          >
                            {transaction.amountPrefix}
                            {formatAmount(transaction.amount)} đ
                          </div>
                          {(transaction.type === "purchase" ||
                            transaction.type === "order_payout") && (
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                goToDetails();
                              }}
                              className="mt-2 inline-flex items-center gap-1 px-3 py-1 rounded-lg text-sm font-medium text-pink-600 hover:bg-pink-50"
                              aria-label="Xem chi tiết đơn hàng"
                            >
                              Xem chi tiết
                              <ChevronRight className="w-4 h-4" />
                            </button>
                          )}
                          {transaction.type === "withdraw" && (
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                goToDetails();
                              }}
                              className="mt-2 inline-flex items-center gap-1 px-3 py-1 rounded-lg text-sm font-medium text-pink-600 hover:bg-pink-50"
                              aria-label="Xem chi tiết rút tiền"
                            >
                              Chi tiết
                              <ChevronRight className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="p-6 border-t border-gray-200">
                  <div className="flex items-center justify-between">
                    <div className="text-sm text-gray-600">
                      Hiển thị {startIndex + 1} -{" "}
                      {Math.min(endIndex, filteredTransactions.length)} của{" "}
                      {filteredTransactions.length} giao dịch
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() =>
                          setCurrentPage((prev) => Math.max(1, prev - 1))
                        }
                        disabled={currentPage === 1}
                        className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <ChevronLeft className="w-4 h-4" />
                      </button>

                      <div className="flex items-center gap-1">
                        {[...Array(totalPages)].map((_, index) => {
                          const pageNumber = index + 1;
                          // Show first page, last page, current page, and 2 pages around current
                          const showPage =
                            pageNumber === 1 ||
                            pageNumber === totalPages ||
                            (pageNumber >= currentPage - 2 &&
                              pageNumber <= currentPage + 2);

                          if (!showPage) {
                            // Show ellipsis
                            if (
                              pageNumber === currentPage - 3 ||
                              pageNumber === currentPage + 3
                            ) {
                              return (
                                <span
                                  key={pageNumber}
                                  className="px-2 text-gray-400"
                                >
                                  ...
                                </span>
                              );
                            }
                            return null;
                          }

                          return (
                            <button
                              key={pageNumber}
                              onClick={() => setCurrentPage(pageNumber)}
                              className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors ${
                                currentPage === pageNumber
                                  ? "bg-pink-500 text-white"
                                  : "text-gray-600 hover:bg-gray-100"
                              }`}
                            >
                              {pageNumber}
                            </button>
                          );
                        })}
                      </div>

                      <button
                        onClick={() =>
                          setCurrentPage((prev) =>
                            Math.min(totalPages, prev + 1)
                          )
                        }
                        disabled={currentPage === totalPages}
                        className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <ChevronRight className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default AllPaymentHistory;
