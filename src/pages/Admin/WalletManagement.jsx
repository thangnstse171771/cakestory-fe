import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { getAdminWallet } from "../../api/wallet";
import {
  fetchAdminWalletBalance,
  fetchAllDepositsAdmin,
  fetchSystemWalletBalance,
  fetchTotalAmountAiGenerate,
  fetchAllWithdrawHistory,
  fetchAllUsers,
  fetchAllWalletTransactions,
} from "../../api/axios";

const WalletManagement = () => {
  const [walletData, setWalletData] = useState({
    holding: {
      balance: 0,
      currency: "VND",
      description:
        "Tiền đang giữ tạm (escrow) từ các thanh toán đơn hàng chưa giải ngân",
    },
    floating: {
      balance: 0,
      currency: "VND",
      description: "Doanh thu từ AI Generation",
    },
    accounting: {
      balance: 0,
      currency: "VND",
      description: "Doanh thu hoa hồng đơn hàng",
    },
    withdraw: { balance: 0, currency: "VND", description: "Tổng tiền đã rút" },
  });
  const [transactions, setTransactions] = useState([]);
  const [selectedWallet, setSelectedWallet] = useState(null);
  const [showTransactionModal, setShowTransactionModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  // Đã bỏ thống kê tổng tiền tất cả user wallets theo yêu cầu
  const [pendingWithdraw, setPendingWithdraw] = useState({
    amount: 0,
    count: 0,
  });
  // Thống kê luồng tiền đơn hàng (order_payment)
  const [orderFlowStats, setOrderFlowStats] = useState({
    escrowHold: 0, // tổng tiền đang escrow (pending)
    shopPending: 0, // 95% phần shop đang escrow
    systemPending: 0, // 5% phần hệ thống đang escrow
    shopReleased: 0, // 95% đã giải ngân
    systemReleased: 0, // 5% đã giải ngân về hệ thống
    refunded: 0, // hoàn trả khi hủy / failed
  });
  const navigate = useNavigate();

  // Filter states
  const [filters, setFilters] = useState({ status: "", user_id: "", type: "" });
  const [showFilters, setShowFilters] = useState(false);

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 20;
  const totalPages = Math.ceil(transactions.length / itemsPerPage);

  // Fetch admin wallet data từ API
  const fetchAdminWalletData = async (appliedFilters = {}) => {
    try {
      setLoading(true);
      setError(null);

      const [
        systemBalanceResponse,
        depositsResponse,
        aiRevenueResponse,
        withdrawResponse,
        unifiedTxResponse,
        usersResponse,
      ] = await Promise.allSettled([
        fetchSystemWalletBalance(),
        fetchAllDepositsAdmin(appliedFilters),
        fetchTotalAmountAiGenerate(),
        fetchAllWithdrawHistory(),
        fetchAllWalletTransactions(),
        fetchAllUsers(),
      ]);

      // Build user map
      const usersMap = (() => {
        if (usersResponse?.status !== "fulfilled") return {};
        const data = usersResponse.value;
        const arr = Array.isArray(data)
          ? data
          : Array.isArray(data?.data)
          ? data.data
          : Array.isArray(data?.users)
          ? data.users
          : [];
        const toName = (u) =>
          u?.full_name ||
          u?.fullName ||
          (u?.first_name && u?.last_name
            ? `${u.first_name} ${u.last_name}`
            : u?.name || u?.username || u?.email || "User");
        const map = {};
        arr.forEach((u) => {
          const id = u?.id ?? u?.user_id;
          if (id != null) map[id] = toName(u);
        });
        return map;
      })();

      const resolveUserDisplay = (rawId, embeddedUser) => {
        const embeddedName =
          embeddedUser?.full_name ||
          embeddedUser?.fullName ||
          (embeddedUser?.first_name && embeddedUser?.last_name
            ? `${embeddedUser.first_name} ${embeddedUser.last_name}`
            : embeddedUser?.name || embeddedUser?.username || null);
        if (embeddedName) return embeddedName;
        if (rawId != null && usersMap[rawId]) return usersMap[rawId];
        return rawId != null ? `user${rawId}` : "User";
      };

      // Không còn dùng tổng tiền nạp thành công để hiển thị holding.

      // Unified list starts here
      let unifiedTransactions = [];

      // Deposits -> transactions (giữ lại để hiển thị lịch sử nạp, không ảnh hưởng holding)
      if (depositsResponse.status === "fulfilled") {
        const depositsData = depositsResponse.value;
        let deposits = [];
        if (Array.isArray(depositsData)) deposits = depositsData;
        else if (Array.isArray(depositsData?.data?.deposits))
          deposits = depositsData.data.deposits;
        else if (Array.isArray(depositsData?.deposits))
          deposits = depositsData.deposits;
        else if (Array.isArray(depositsData?.data))
          deposits = depositsData.data;

        const depositTx = (deposits || [])
          .map((d) => ({
            id: d.id,
            userId: d.user_id ?? d.user?.id ?? d.user?.user_id ?? "",
            userDisplay: resolveUserDisplay(
              d.user_id ?? d.user?.id ?? d.user?.user_id,
              d.user
            ),
            type: "deposit",
            amount: parseFloat(d.amount) || 0,
            status:
              d.status === "completed"
                ? "completed"
                : d.status === "pending"
                ? "pending"
                : "failed",
            timestamp: d.created_at || d.createdAt,
            description: "Nạp tiền vào ví",
          }))
          // Exclude pending deposits from listing per request
          .filter((tx) => tx.status !== "pending");
        unifiedTransactions = [...unifiedTransactions, ...depositTx];
      }

      // AI revenue -> floating card
      if (aiRevenueResponse.status === "fulfilled") {
        const aiRevenueData = aiRevenueResponse.value;
        setWalletData((prev) => ({
          ...prev,
          floating: {
            balance: parseFloat(aiRevenueData.totalAmount) || 0,
            currency: "VND",
            description: "Doanh thu từ AI Generation",
          },
        }));
      }

      // Bỏ tính tổng tất cả user wallets

      // Withdraws -> card + list
      if (withdrawResponse.status === "fulfilled") {
        const wd = withdrawResponse.value;
        let withdraws = [];
        if (Array.isArray(wd?.data?.withdraws)) withdraws = wd.data.withdraws;
        else if (Array.isArray(wd?.withdraws)) withdraws = wd.withdraws;
        else if (Array.isArray(wd?.withdrawHistory))
          withdraws = wd.withdrawHistory;
        else if (Array.isArray(wd)) withdraws = wd;

        const normalizeStatus = (s) => {
          const v = String(s || "").toLowerCase();
          if (
            [
              "completed",
              "complete",
              "done",
              "success",
              "thanh cong",
              "hoàn thành",
              "thành công",
              "approved",
              "approve",
            ].includes(v)
          )
            return "completed";
          if (
            [
              "rejected",
              "reject",
              "failed",
              "fail",
              "error",
              "từ chối",
              "that bai",
              "cancelled",
              "canceled",
              "cancel",
            ].includes(v)
          )
            return "failed";
          return "pending";
        };

        const toNumber = (a) => {
          if (typeof a === "number") return a;
          if (a == null) return 0;
          let s = String(a)
            .trim()
            .replace(/[^0-9.,-]/g, "");
          if (s.includes(",") && s.includes(".")) {
            const lastComma = s.lastIndexOf(",");
            const lastDot = s.lastIndexOf(".");
            const dec = lastComma > lastDot ? "," : ".";
            if (dec === ",") {
              s = s.replace(/\./g, "").replace(",", ".");
            } else {
              s = s.replace(/,/g, "");
            }
          } else if (s.includes(",")) {
            s = s.replace(/,/g, "");
          }
          const n = parseFloat(s);
          return Number.isFinite(n) ? n : 0;
        };

        let pendingCount = 0;
        let completedCount = 0;
        let totalPendingWithdraw = 0;
        let totalCompletedWithdraw = 0;

        const withdrawTx = (withdraws || []).map((w) => ({
          id: w.id || w.withdraw_id || w.request_id || w.transaction_id,
          userId: w.user_id ?? w.user?.id ?? w.user?.user_id ?? "",
          userDisplay: resolveUserDisplay(
            w.user_id ?? w.user?.id ?? w.user?.user_id,
            w.user
          ),
          type: "withdraw",
          amount: toNumber(w?.amount),
          status: normalizeStatus(w?.status),
          timestamp: w.created_at || w.createdAt || w.updated_at || w.updatedAt,
          description: "Yêu cầu rút tiền",
        }));

        (withdraws || []).forEach((w) => {
          const st = normalizeStatus(w?.status);
          const amt = toNumber(w?.amount);
          if (st === "pending") {
            pendingCount += 1;
            totalPendingWithdraw += amt;
          } else if (st === "completed") {
            completedCount += 1;
            totalCompletedWithdraw += amt;
          }
        });

        setWalletData((prev) => ({
          ...prev,
          withdraw: {
            balance: totalCompletedWithdraw,
            currency: "VND",
            description: `Tổng tiền đã rút (${completedCount} yêu cầu hoàn thành)`,
          },
        }));
        setPendingWithdraw({
          amount: totalPendingWithdraw,
          count: pendingCount,
        });
        unifiedTransactions = [...unifiedTransactions, ...withdrawTx];
      }

      // Unified endpoint: add order_payment & ai_generation + tính escrow + breakdown %
      let escrowAmount = 0;
      let escrowCount = 0;
      const orderStatsCollector = {
        escrowHold: 0,
        shopPending: 0,
        systemPending: 0,
        shopReleased: 0,
        systemReleased: 0,
        refunded: 0,
      };
      if (unifiedTxResponse && unifiedTxResponse.status === "fulfilled") {
        const payload = unifiedTxResponse.value;
        const rawList = Array.isArray(payload?.transactions)
          ? payload.transactions
          : Array.isArray(payload?.data?.transactions)
          ? payload.data.transactions
          : Array.isArray(payload)
          ? payload
          : [];

        const mapStatus = (s) => {
          const v = String(s || "").toLowerCase();
          if (v.includes("pend")) return "pending";
          if (
            v.includes("fail") ||
            v.includes("reject") ||
            v.includes("cancel")
          )
            return "failed";
          return "completed";
        };
        const toNumber = (a) => {
          if (typeof a === "number") return a;
          if (a == null) return 0;
          let s = String(a)
            .trim()
            .replace(/[^0-9.,-]/g, "");
          if (s.includes(",") && s.includes(".")) {
            const lastComma = s.lastIndexOf(",");
            const lastDot = s.lastIndexOf(".");
            const dec = lastComma > lastDot ? "," : ".";
            if (dec === ",") {
              s = s.replace(/\./g, "").replace(",", ".");
            } else {
              s = s.replace(/,/g, "");
            }
          } else if (s.includes(",")) {
            s = s.replace(/,/g, "");
          }
          const n = parseFloat(s);
          return Number.isFinite(n) ? n : 0;
        };

        const localizeUnifiedDescription = (t, normStatus) => {
          const type = t?.transaction_type;
          const orderId = t?.order_id || t?.orderId;
          const raw = String(t?.description || "");
          const lower = raw.toLowerCase();
          if (type === "order_payment") {
            // Released payment -> Giải ngân
            if (lower.includes("released payment")) {
              let extra = "";
              const shop = raw.match(/Shop received\s*(\d+%)/i);
              const admin = raw.match(/Admin received\s*(\d+%)/i);
              const parts = [];
              if (shop && shop[1]) parts.push(`Cửa hàng nhận ${shop[1]}`);
              if (admin && admin[1]) parts.push(`Admin nhận ${admin[1]}`);
              if (parts.length) extra = ". " + parts.join(", ");
              return `Giải ngân thanh toán cho đơn #${
                orderId ?? ""
              }${extra}`.trim();
            }
            // Held in escrow or pending -> (đang giữ tạm)
            if (lower.includes("held in escrow") || normStatus === "pending") {
              return `Thanh toán đơn hàng #${
                orderId ?? ""
              } (đang giữ tạm)`.trim();
            }
            // Generic VN
            if (orderId) return `Thanh toán đơn hàng #${orderId}`;
            return "Thanh toán đơn hàng";
          }
          if (type === "ai_generation") {
            return "Doanh thu từ AI Generation";
          }
          // Fallback: return raw if present, else generic
          return raw || "Giao dịch";
        };

        const unifiedTx = rawList
          .map((t) => {
            const embeddedUser =
              t?.fromWallet?.User || t?.toWallet?.User || null;
            const rawId =
              t?.fromWallet?.user_id ?? t?.toWallet?.user_id ?? null;
            const base = {
              id:
                t.id ||
                t.transaction_id ||
                t.code ||
                t.reference ||
                `${t.transaction_type || "tx"}-${t.amount}-${
                  t.created_at || ""
                }`,
              userId: rawId,
              userDisplay: resolveUserDisplay(rawId, embeddedUser),
              amount: toNumber(t.amount),
              status: mapStatus(t.status),
              timestamp:
                t.created_at || t.createdAt || t.updated_at || t.updatedAt,
            };
            if (t.transaction_type === "order_payment") {
              const orderId = t.order_id || t.orderId || null;
              const amount = base.amount;
              // Tính share: shop 95%, system 5% (làm tròn để tổng khớp)
              const shopShare = Math.round(amount * 0.95);
              const systemShare = amount - shopShare;
              if (base.status === "pending") {
                escrowAmount += amount;
                escrowCount += 1;
                orderStatsCollector.escrowHold += amount;
                orderStatsCollector.shopPending += shopShare;
                orderStatsCollector.systemPending += systemShare;
                return {
                  ...base,
                  type: "order_payment",
                  orderId,
                  description: `Thanh toán đơn #${orderId} (Escrow) – Shop: ${shopShare.toLocaleString(
                    "vi-VN"
                  )}đ • Hệ thống: ${systemShare.toLocaleString("vi-VN")}đ`,
                };
              }
              if (base.status === "completed") {
                orderStatsCollector.shopReleased += shopShare;
                orderStatsCollector.systemReleased += systemShare;
                return {
                  ...base,
                  type: "order_payment",
                  orderId,
                  description: `Giải ngân đơn #${orderId} – Shop: ${shopShare.toLocaleString(
                    "vi-VN"
                  )}đ • Hệ thống: ${systemShare.toLocaleString("vi-VN")}đ`,
                };
              }
              // failed / cancelled => hoàn tiền 100%
              orderStatsCollector.refunded += amount;
              return {
                ...base,
                type: "order_payment",
                orderId,
                description: `Hoàn tiền đơn #${orderId} – ${amount.toLocaleString(
                  "vi-VN"
                )}đ`,
              };
            }
            if (t.transaction_type === "ai_generation") {
              return {
                ...base,
                type: "ai_generation",
                description: localizeUnifiedDescription(t, base.status),
              };
            }
            // Fallback generic mapping so chúng ta không mất giao dịch lạ
            return {
              ...base,
              type: t.transaction_type || "other",
              description: localizeUnifiedDescription(t, base.status),
            };
          })
          .filter(Boolean);

        console.log("[WalletManagement] Unified raw count:", rawList.length);
        console.log(
          "[WalletManagement] Unified mapped count:",
          unifiedTx.length
        );

        unifiedTransactions = [...unifiedTransactions, ...unifiedTx];
      }

      // Cập nhật holding = escrow
      setWalletData((prev) => ({
        ...prev,
        holding: {
          balance: orderStatsCollector.escrowHold,
          currency: "VND",
          description: `Tiền đang giữ tạm từ ${escrowCount} giao dịch order đang chờ giải ngân`,
        },
      }));
      // Lưu thống kê luồng tiền
      setOrderFlowStats(orderStatsCollector);

      // Apply client filters
      if (
        appliedFilters &&
        (appliedFilters.status || appliedFilters.user_id || appliedFilters.type)
      ) {
        unifiedTransactions = unifiedTransactions.filter((t) => {
          let ok = true;
          if (appliedFilters.status)
            ok = ok && t.status === appliedFilters.status;
          if (appliedFilters.user_id)
            ok =
              ok && String(t.userId).includes(String(appliedFilters.user_id));
          if (appliedFilters.type) ok = ok && t.type === appliedFilters.type;
          return ok;
        });
      }

      // Sort and set
      unifiedTransactions.sort(
        (a, b) =>
          new Date(b.timestamp || b.created_at) -
          new Date(a.timestamp || a.created_at)
      );
      console.log(
        "[WalletManagement] Final unifiedTransactions count:",
        unifiedTransactions.length
      );
      if (unifiedTransactions.length === 0) {
        console.warn(
          "[WalletManagement] WARNING: No transactions after refresh – check data sources"
        );
      }
      setTransactions(unifiedTransactions);

      // Accounting card (admin wallet)
      const response = await getAdminWallet();
      if (response.success && response.adminWallet) {
        setWalletData((prev) => ({
          ...prev,
          accounting: {
            balance: parseFloat(response.adminWallet) || 0,
            currency: "VND",
            description: "Doanh thu hệ thống 5% đơn hàng",
          },
        }));
      }
    } catch (error) {
      console.error("Lỗi khi fetch wallet data:", error);
      setError("Không thể tải thông tin ví admin");
    } finally {
      setLoading(false);
    }
  };

  // Load dữ liệu khi component mount
  useEffect(() => {
    fetchAdminWalletData();
  }, []);

  // Handle filter changes
  const handleFilterChange = (field, value) => {
    setFilters((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  // Apply filters
  const handleApplyFilters = async () => {
    console.log("Applying filters:", filters);
    try {
      setLoading(true);
      setError(null); // Reset error state

      // Luôn cập nhật toàn bộ từ các nguồn (deposit + withdraw + orders)
      await fetchAdminWalletData(filters);

      setShowFilters(false);
    } catch (error) {
      console.error("Error applying filters:", error);
      // Hiển thị thông báo lỗi cho user
      setError("Có lỗi khi áp dụng bộ lọc. Vui lòng thử lại.");
      // Đặt lại transactions về empty nếu có lỗi
      if (showTransactionModal) {
        setTransactions([]);
      }
    } finally {
      setLoading(false);
    }
  };

  // Reset filters
  const handleResetFilters = () => {
    const resetFilters = {
      status: "",
      user_id: "",
      type: "",
    };
    setFilters(resetFilters);
    fetchAdminWalletData(resetFilters);
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(amount);
  };

  const getWalletIcon = (walletType) => {
    switch (walletType) {
      case "holding":
        return "🏦";
      case "floating":
        return "🤖"; // AI icon cho doanh thu từ AI
      case "accounting":
        return "📊";
      case "withdraw":
        return "💸";
      default:
        return "💰";
    }
  };

  // Tổng doanh thu = AI + Hệ Thống
  const totalRevenue =
    (walletData.floating?.balance || 0) + (walletData.accounting?.balance || 0);

  const getWalletColor = (walletType) => {
    switch (walletType) {
      case "holding":
        return "bg-blue-500";
      case "floating":
        return "bg-purple-500"; // Màu tím cho AI
      case "accounting":
        return "bg-green-500";
      case "withdraw":
        return "bg-red-500";
      default:
        return "bg-gray-500";
    }
  };

  const getTransactionStatusColor = (status) => {
    switch (status) {
      case "completed":
        return "text-green-600 bg-green-100";
      case "pending":
        return "text-yellow-600 bg-yellow-100";
      case "failed":
        return "text-red-600 bg-red-100";
      default:
        return "text-gray-600 bg-gray-100";
    }
  };

  // Build a compact pagination range with ellipsis to avoid overflow
  const getPageList = (total, current, siblingCount = 1, boundaryCount = 1) => {
    const pages = [];
    const maxSimple = boundaryCount * 2 + siblingCount * 2 + 3; // e.g., 7 with defaults
    if (total <= maxSimple) {
      for (let i = 1; i <= total; i++) pages.push(i);
      return pages;
    }

    const first = 1;
    const last = total;
    const left = Math.max(first + boundaryCount, current - siblingCount);
    const right = Math.min(last - boundaryCount, current + siblingCount);

    // Start boundary
    for (let i = 1; i <= boundaryCount; i++) pages.push(i);

    // Left ellipsis or neighbor
    if (left > first + boundaryCount) {
      pages.push("dots");
    } else {
      for (let i = boundaryCount + 1; i < left; i++) pages.push(i);
    }

    // Sibling range
    for (let i = left; i <= right; i++) pages.push(i);

    // Right ellipsis or neighbor
    if (right < last - boundaryCount) {
      pages.push("dots");
    } else {
      for (let i = right + 1; i <= last - boundaryCount; i++) pages.push(i);
    }

    // End boundary
    for (let i = last - boundaryCount + 1; i <= last; i++) pages.push(i);

    // Dedup consecutive numbers/markers
    const compact = [];
    for (const p of pages) {
      if (compact.length === 0 || compact[compact.length - 1] !== p) {
        compact.push(p);
      }
    }
    return compact;
  };

  const handleViewTransactions = (walletType) => {
    setSelectedWallet(walletType);
    setShowTransactionModal(true);
    setCurrentPage(1);
  };

  const handleNavigateToWithdraw = () => {
    navigate("/admin/withdraw-requests");
  };

  return (
    <div className="p-8 bg-pink-50 min-h-screen">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-4xl font-bold text-pink-600">
            Quản Lý Ví Hệ Thống
          </h1>
          <div className="flex items-center gap-4">
            {loading && (
              <div className="text-pink-600 font-medium">Đang tải...</div>
            )}
            {error && <div className="text-red-600 text-sm">{error}</div>}
            <button
              onClick={handleNavigateToWithdraw}
              className="bg-pink-600 text-white px-6 py-3 rounded-lg hover:bg-pink-700 transition-colors"
            >
              Xem Yêu Cầu Rút Tiền
            </button>
          </div>
        </div>

        {/* Wallet Overview Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {Object.entries(walletData).map(([key, wallet]) => (
            <div
              key={key}
              className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow"
            >
              <div className="flex items-center mb-4">
                <div
                  className={`w-12 h-12 rounded-full ${getWalletColor(
                    key
                  )} flex items-center justify-center text-white text-2xl`}
                >
                  {getWalletIcon(key)}
                </div>
              </div>

              <h3 className="text-lg font-semibold text-gray-800 mb-2 capitalize">
                {key === "holding" && "Tiền giữ tạm"}
                {key === "floating" && "Doanh Thu từ AI"}
                {key === "accounting" && "Doanh Thu hoa hồng"}
                {key === "withdraw" && "Tổng tiền rút"}
              </h3>

              <p className="text-3xl font-bold text-gray-900 mb-2">
                {formatCurrency(wallet?.balance || 0)}
              </p>

              <p className="text-sm text-gray-600">
                {wallet?.description || ""}
              </p>
            </div>
          ))}
        </div>

        {/* Summary Statistics */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-6">
            Thống Kê Tổng Quan
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="text-center">
              <p className="text-2xl font-bold text-green-600">
                {formatCurrency(totalRevenue)}
              </p>
              <p className="text-sm text-gray-600">Tổng Doanh Thu</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-red-600">
                {formatCurrency(pendingWithdraw.amount || 0)}
              </p>
              <p className="text-sm text-gray-600">Tiền Chờ Rút</p>
            </div>
          </div>
        </div>

        {/* Luồng Tiền Đơn Hàng */}
        {/* <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-6">Luồng Tiền Đơn Hàng</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-sm">
            <div className="p-4 rounded-lg bg-blue-50 border border-blue-100">
              <p className="font-semibold text-blue-700 mb-1">Đang Giữ Tạm (Escrow)</p>
              <p className="text-lg font-bold text-blue-800">{formatCurrency(orderFlowStats.escrowHold)}</p>
              <p className="text-xs text-blue-600 mt-2">
                Shop (95%): {formatCurrency(orderFlowStats.shopPending)}<br />
                Hệ thống (5%): {formatCurrency(orderFlowStats.systemPending)}
              </p>
            </div>
            <div className="p-4 rounded-lg bg-green-50 border border-green-100">
              <p className="font-semibold text-green-700 mb-1">Đã Giải Ngân / Ghi Nhận</p>
              <p className="text-lg font-bold text-green-800">{formatCurrency(orderFlowStats.shopReleased + orderFlowStats.systemReleased)}</p>
              <p className="text-xs text-green-600 mt-2">
                Shop: {formatCurrency(orderFlowStats.shopReleased)}<br />
                Hệ thống: {formatCurrency(orderFlowStats.systemReleased)}
              </p>
            </div>
            <div className="p-4 rounded-lg bg-rose-50 border border-rose-100">
              <p className="font-semibold text-rose-700 mb-1">Đã Hoàn Tiền</p>
              <p className="text-lg font-bold text-rose-800">{formatCurrency(orderFlowStats.refunded)}</p>
              <p className="text-xs text-rose-600 mt-2">Hoàn toàn bộ về ví khách khi hủy / thất bại</p>
            </div>
          </div>
        </div> */}

        {/* Recent Transactions */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-800">
              Giao Dịch Gần Đây
            </h2>
            <button
              onClick={() => {
                setSelectedWallet("all");
                setShowTransactionModal(true);
                setCurrentPage(1);
              }}
              className="text-pink-600 hover:text-pink-700 font-medium"
            >
              Xem tất cả
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">
                    User
                  </th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">
                    Loại
                  </th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">
                    Số Tiền
                  </th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">
                    Trạng Thái
                  </th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">
                    Thời Gian
                  </th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">
                    Chi tiết
                  </th>
                </tr>
              </thead>
              <tbody>
                {transactions.slice(0, 5).map((transaction) => (
                  <tr
                    key={transaction.id}
                    className="border-b border-gray-100 hover:bg-gray-50"
                  >
                    <td className="py-3 px-4 font-medium text-gray-900">
                      {transaction.userDisplay || transaction.userId}
                    </td>
                    <td className="py-3 px-4 text-gray-700">
                      {transaction.description}
                    </td>
                    <td className="py-3 px-4 font-semibold text-gray-900">
                      {formatCurrency(transaction.amount)}
                    </td>
                    <td className="py-3 px-4">
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-medium ${getTransactionStatusColor(
                          transaction.status
                        )}`}
                      >
                        {transaction.status === "completed" && "Hoàn thành"}
                        {transaction.status === "pending" && "Đang xử lý"}
                        {transaction.status === "failed" && "Thất bại"}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-sm text-gray-600">
                      {new Date(transaction.timestamp).toLocaleString("vi-VN")}
                    </td>
                    <td className="py-3 px-4">
                      <button
                        className="text-pink-600 hover:text-pink-800 font-medium hover:underline text-sm"
                        onClick={() =>
                          navigate(`/admin/transactions/${transaction.id}`)
                        }
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
      </div>

      {/* Transaction Modal */}
      {showTransactionModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-[90vw] max-w-6xl max-h-[80vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-2xl font-bold text-gray-800">
                Chi Tiết Giao Dịch -{" "}
                {selectedWallet && selectedWallet !== "all"
                  ? selectedWallet === "holding"
                    ? "Tiền giữ tạm (Escrow)"
                    : selectedWallet === "floating"
                    ? "Doanh thu từ AI"
                    : selectedWallet === "accounting"
                    ? "Doanh Thu Hệ Thống"
                    : selectedWallet === "withdraw"
                    ? "Ví Withdraw"
                    : "Tất cả"
                  : "Tất cả"}
              </h3>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setShowFilters(!showFilters)}
                  className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                    showFilters
                      ? "bg-pink-600 text-white"
                      : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                  }`}
                >
                  🔍 Bộ Lọc
                </button>
                <button
                  onClick={handleResetFilters}
                  className="px-4 py-2 bg-gray-100 text-gray-600 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  🔄 Reset
                </button>
                <button
                  onClick={() => setShowTransactionModal(false)}
                  className="text-gray-500 hover:text-gray-700 text-2xl"
                >
                  ×
                </button>
              </div>
            </div>

            {/* Filter Panel trong Modal */}
            {showFilters && (
              <div className="bg-gray-50 border rounded-lg p-4 mb-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {/* Status Filter */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Trạng Thái
                    </label>
                    <select
                      value={filters.status}
                      onChange={(e) =>
                        handleFilterChange("status", e.target.value)
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-pink-500"
                    >
                      <option value="">Tất cả</option>
                      <option value="completed">Hoàn thành</option>
                      <option value="pending">Đang xử lý</option>
                      <option value="failed">Thất bại</option>
                    </select>
                  </div>

                  {/* User ID Filter */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      User ID
                    </label>
                    <input
                      type="number"
                      value={filters.user_id}
                      onChange={(e) =>
                        handleFilterChange("user_id", e.target.value)
                      }
                      placeholder="Nhập User ID"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-pink-500"
                    />
                  </div>

                  {/* Type Filter */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Loại Giao Dịch
                    </label>
                    <select
                      value={filters.type}
                      onChange={(e) =>
                        handleFilterChange("type", e.target.value)
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-pink-500"
                    >
                      <option value="">Tất cả</option>
                      <option value="deposit">Nạp tiền</option>
                      <option value="withdraw">Rút tiền</option>
                      <option value="order_payment">Thanh toán đơn hàng</option>
                      <option value="ai_generation">AI Generation</option>
                    </select>
                  </div>
                </div>

                {/* Filter Actions */}
                <div className="flex justify-end items-center gap-2 mt-4">
                  <button
                    onClick={() => setShowFilters(false)}
                    className="px-4 py-2 text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                  >
                    Hủy
                  </button>
                  <button
                    onClick={handleApplyFilters}
                    className="px-4 py-2 bg-pink-600 text-white rounded-lg hover:bg-pink-700 transition-colors"
                  >
                    Áp Dụng
                  </button>
                </div>
              </div>
            )}

            {/* Error message trong modal */}
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
                <div className="flex items-center">
                  <span className="text-red-600 text-sm">⚠️ {error}</span>
                  <button
                    onClick={() => setError(null)}
                    className="ml-auto text-red-400 hover:text-red-600"
                  >
                    ×
                  </button>
                </div>
              </div>
            )}

            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">
                      User
                    </th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-700 min-w-[260px]">
                      Loại
                    </th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">
                      Số Tiền
                    </th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-700 min-w-[120px]">
                      Trạng Thái
                    </th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-700 min-w-[160px]">
                      Thời Gian
                    </th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-700 min-w-[100px]">
                      Chi tiết
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {transactions
                    .slice(
                      (currentPage - 1) * itemsPerPage,
                      currentPage * itemsPerPage
                    )
                    .map((transaction) => (
                      <tr
                        key={transaction.id}
                        className="border-b border-gray-100 hover:bg-gray-50"
                      >
                        <td className="py-3 px-4 font-medium text-gray-900">
                          {transaction.userDisplay || transaction.userId}
                        </td>
                        <td className="py-3 px-4 text-gray-700">
                          {transaction.description}
                        </td>
                        <td className="py-3 px-4 font-semibold text-gray-900">
                          {formatCurrency(transaction.amount)}
                        </td>
                        <td className="py-3 px-4">
                          <span
                            className={`px-2 py-1 rounded-full text-xs font-medium whitespace-nowrap ${getTransactionStatusColor(
                              transaction.status
                            )}`}
                          >
                            {transaction.status === "completed" && "Hoàn thành"}
                            {transaction.status === "pending" && "Đang xử lý"}
                            {transaction.status === "failed" && "Thất bại"}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-sm text-gray-600 whitespace-nowrap">
                          {new Date(transaction.timestamp).toLocaleString(
                            "vi-VN"
                          )}
                        </td>
                        <td className="py-3 px-4">
                          <button
                            className="text-pink-600 hover:text-pink-800 font-medium hover:underline text-sm"
                            onClick={() => {
                              setShowTransactionModal(false);
                              navigate(`/admin/transactions/${transaction.id}`);
                            }}
                          >
                            Chi tiết
                          </button>
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
            {/* Pagination */}
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 mt-4">
              <div className="flex items-center gap-2 overflow-x-auto max-w-full">
                <button
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className={`px-3 py-1 rounded-lg border font-medium whitespace-nowrap ${
                    currentPage === 1
                      ? "bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed"
                      : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50"
                  }`}
                >
                  ← Trước
                </button>

                {getPageList(totalPages, currentPage, 1, 1).map((p, idx) =>
                  p === "dots" ? (
                    <span key={`dots-${idx}`} className="px-2 text-gray-400">
                      …
                    </span>
                  ) : (
                    <button
                      key={p}
                      onClick={() => setCurrentPage(p)}
                      className={`px-3 py-1 rounded-lg font-semibold border ${
                        currentPage === p
                          ? "bg-pink-500 text-white border-pink-500"
                          : "bg-white text-pink-600 border-pink-200 hover:bg-pink-50"
                      }`}
                    >
                      {p}
                    </button>
                  )
                )}

                <button
                  onClick={() =>
                    setCurrentPage((p) => Math.min(totalPages, p + 1))
                  }
                  disabled={currentPage === totalPages || totalPages === 0}
                  className={`px-3 py-1 rounded-lg border font-medium whitespace-nowrap ${
                    currentPage === totalPages || totalPages === 0
                      ? "bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed"
                      : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50"
                  }`}
                >
                  Sau →
                </button>
              </div>

              <div className="text-xs text-gray-500">
                Trang {Math.min(currentPage, Math.max(1, totalPages))} /{" "}
                {Math.max(1, totalPages)}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default WalletManagement;
