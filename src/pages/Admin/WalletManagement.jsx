import { useState, useEffect, useRef, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { getAdminWallet } from "../../api/wallet";
import {
  // fetchAdminWalletBalance, // (đã bỏ)
  fetchSystemWalletBalance,
  fetchTotalAmountAiGenerate,
  fetchAllWithdrawHistory,
  fetchAllUsers,
  fetchAllWalletTransactions,
} from "../../api/axios";

// Import utilities (would be in separate file)
import {
  WALLET_CONFIG,
  TRANSACTION_TYPES,
  TRANSACTION_STATUS,
  parseAmount,
  normalizeTransactionStatus,
  resolveUserDisplayName,
  calculateCommission,
  localizeTransactionDescription,
  formatCurrency,
  getWalletConfig,
  getTransactionStatusStyle,
  generatePageList,
} from "./WalletUtils";

// === Local helper functions (could be moved to WalletUtils if reused) ===
const buildUserMap = (usersResponse) => {
  if (!usersResponse || usersResponse.status !== "fulfilled") return {};
  const payload = usersResponse.value;
  const arr = Array.isArray(payload?.data)
    ? payload.data
    : Array.isArray(payload)
    ? payload
    : [];
  return arr.reduce((acc, user) => {
    const id = user.id || user.user_id;
    if (id != null) {
      acc[id] =
        user.full_name ||
        user.fullName ||
        user.username ||
        user.email ||
        `user${id}`;
    }
    return acc;
  }, {});
};

const processWithdrawData = (withdrawResponse, usersMap = {}) => {
  const stats = {
    totalCompletedWithdraw: 0,
    completedCount: 0,
    totalPendingWithdraw: 0,
    pendingCount: 0,
  };

  if (!withdrawResponse || withdrawResponse.status !== "fulfilled") {
    return { transactions: [], stats };
  }

  const payload = withdrawResponse.value;
  const rawList = Array.isArray(payload?.data)
    ? payload.data
    : Array.isArray(payload?.withdraws)
    ? payload.withdraws
    : Array.isArray(payload)
    ? payload
    : [];

  const tx = rawList.map((w) => {
    const amount = parseAmount(
      w.amount || w.request_amount || w.money_withdraw
    );
    const normalizedStatus = normalizeTransactionStatus(w.status || w.state);
    if (normalizedStatus === TRANSACTION_STATUS.COMPLETED) {
      stats.totalCompletedWithdraw += amount;
      stats.completedCount += 1;
    } else if (normalizedStatus === TRANSACTION_STATUS.PENDING) {
      stats.totalPendingWithdraw += amount;
      stats.pendingCount += 1;
    }
    const userId = w.user_id || w.userId || w.owner_id;
    return {
      id:
        w.id ||
        w.withdraw_id ||
        `wd-${userId}-${amount}-${w.created_at || Date.now()}`,
      type: TRANSACTION_TYPES.WITHDRAW,
      amount,
      status: normalizedStatus,
      userId,
      userDisplay: resolveUserDisplayName(userId, w.User, usersMap),
      timestamp: w.updated_at || w.created_at || w.createdAt || w.updatedAt,
      description: `Yêu cầu rút tiền ${amount.toLocaleString("vi-VN")}đ`,
    };
  });

  return { transactions: tx, stats };
};

const processUnifiedTransactions = (unifiedResponse, usersMap = {}) => {
  if (!unifiedResponse || unifiedResponse.status !== "fulfilled") {
    return {
      transactions: [],
      orderStats: {
        escrowHold: 0,
        shopPending: 0,
        systemPending: 0,
        shopReleased: 0,
        systemReleased: 0,
        refunded: 0,
        escrowCount: 0,
      },
    };
  }

  const payload = unifiedResponse.value;
  const rawTransactions = Array.isArray(payload?.transactions)
    ? payload.transactions
    : Array.isArray(payload?.data?.transactions)
    ? payload.data.transactions
    : Array.isArray(payload)
    ? payload
    : [];

  const orderStatsCollector = {
    escrowHold: 0,
    shopPending: 0,
    systemPending: 0,
    shopReleased: 0,
    systemReleased: 0,
    refunded: 0,
  };

  let escrowCount = 0;

  const processedTransactions = rawTransactions
    .map((transaction) => {
      const embeddedUser =
        transaction?.fromWallet?.User || transaction?.toWallet?.User || null;
      const rawId =
        transaction?.fromWallet?.user_id ??
        transaction?.toWallet?.user_id ??
        null;
      const amount = parseAmount(transaction.amount);
      const status = normalizeTransactionStatus(transaction.status);

      const baseTransaction = {
        id:
          transaction.id ||
          transaction.transaction_id ||
          transaction.code ||
          transaction.reference ||
          `${transaction.transaction_type || "tx"}-${amount}-${
            transaction.created_at || ""
          }`,
        userId: rawId,
        userDisplay: resolveUserDisplayName(rawId, embeddedUser, usersMap),
        amount,
        status,
        timestamp:
          transaction.created_at ||
          transaction.createdAt ||
          transaction.updated_at ||
          transaction.updatedAt,
      };

      if (transaction.transaction_type === TRANSACTION_TYPES.ORDER_PAYMENT) {
        const orderId = transaction.order_id || transaction.orderId || null;
        const { shopShare, systemShare } = calculateCommission(amount);
        if (status === TRANSACTION_STATUS.PENDING) {
          escrowCount += 1;
          orderStatsCollector.escrowHold += amount;
          orderStatsCollector.shopPending += shopShare;
          orderStatsCollector.systemPending += systemShare;
          return {
            ...baseTransaction,
            type: TRANSACTION_TYPES.ORDER_PAYMENT,
            orderId,
            description: `Thanh toán đơn #${orderId} (Escrow) – Shop: ${shopShare.toLocaleString(
              "vi-VN"
            )}đ • Hệ thống: ${systemShare.toLocaleString("vi-VN")}đ`,
          };
        }
        if (status === TRANSACTION_STATUS.COMPLETED) {
          orderStatsCollector.shopReleased += shopShare;
          orderStatsCollector.systemReleased += systemShare;
          return {
            ...baseTransaction,
            type: TRANSACTION_TYPES.ORDER_PAYMENT,
            orderId,
            description: `Giải ngân đơn #${orderId} – Shop: ${shopShare.toLocaleString(
              "vi-VN"
            )}đ • Hệ thống: ${systemShare.toLocaleString("vi-VN")}đ`,
          };
        }
        orderStatsCollector.refunded += amount;
        return {
          ...baseTransaction,
          type: TRANSACTION_TYPES.ORDER_PAYMENT,
          orderId,
          description: `Hoàn tiền đơn #${orderId} – ${amount.toLocaleString(
            "vi-VN"
          )}đ`,
        };
      }

      if (transaction.transaction_type === TRANSACTION_TYPES.AI_GENERATION) {
        return {
          ...baseTransaction,
          type: TRANSACTION_TYPES.AI_GENERATION,
          description: localizeTransactionDescription(transaction, status),
        };
      }

      return {
        ...baseTransaction,
        type: transaction.transaction_type || "other",
        description: localizeTransactionDescription(transaction, status),
      };
    })
    .filter(Boolean);

  return {
    transactions: processedTransactions,
    orderStats: { ...orderStatsCollector, escrowCount },
  };
};

const WalletManagement = () => {
  const navigate = useNavigate();

  // State management
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

  const [transactions, setTransactions] = useState([]); // filtered list
  const [allTransactions, setAllTransactions] = useState([]); // full unfiltered list
  const [selectedWallet, setSelectedWallet] = useState(null);
  const [showTransactionModal, setShowTransactionModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [pendingWithdraw, setPendingWithdraw] = useState({
    amount: 0,
    count: 0,
  });
  const [orderFlowStats, setOrderFlowStats] = useState({
    escrowHold: 0,
    shopPending: 0,
    systemPending: 0,
    shopReleased: 0,
    systemReleased: 0,
    refunded: 0,
  });
  // Missing UI/filters pagination states (restored)
  const [filters, setFilters] = useState({ status: "", user_id: "", type: "" });
  const [showFilters, setShowFilters] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const totalPages = useMemo(
    () => Math.ceil(transactions.length / WALLET_CONFIG.ITEMS_PER_PAGE) || 0,
    [transactions]
  );

  // ==== Helpers inserted correctly (previous patch misplaced inside state) ====
  const fetchIdRef = useRef(0);
  const sortTransactions = (list) =>
    list
      .slice()
      .sort(
        (a, b) =>
          new Date(b.timestamp || b.created_at) -
          new Date(a.timestamp || a.created_at)
      );
  const applyAndSetFilters = (appliedFilters) => {
    const filtered = applyFilters(allTransactions, appliedFilters);
    setTransactions(sortTransactions(filtered));
  };
  // (Removed duplicate/broken earlier version of fetchAdminWalletData & inline process code)

  // Main data fetching function - simplified
  const fetchAdminWalletData = async (appliedFilters = {}) => {
    try {
      setLoading(true);
      setError(null);

      const [
        systemBalanceResponse, // hiện chưa sử dụng
        aiRevenueResponse,
        withdrawResponse,
        unifiedTxResponse,
        usersResponse,
      ] = await Promise.allSettled([
        fetchSystemWalletBalance(),
        fetchTotalAmountAiGenerate(),
        fetchAllWithdrawHistory(),
        fetchAllWalletTransactions(),
        fetchAllUsers(),
      ]);

      // Build user mapping
      const usersMap = buildUserMap(usersResponse);

      // Process different data sources
      let unifiedTransactions = [];

      // Process AI revenue
      if (aiRevenueResponse.status === "fulfilled") {
        const aiRevenueData = aiRevenueResponse.value;
        setWalletData((prev) => ({
          ...prev,
          floating: {
            balance: parseAmount(aiRevenueData.totalAmount),
            currency: "VND",
            description: "Doanh thu từ AI Generation",
          },
        }));
      }

      // Process withdrawals
      const { transactions: withdrawTx, stats: withdrawStats } =
        processWithdrawData(withdrawResponse, usersMap);
      unifiedTransactions = [...unifiedTransactions, ...withdrawTx];

      // Update withdraw wallet data
      setWalletData((prev) => ({
        ...prev,
        withdraw: {
          balance: withdrawStats.totalCompletedWithdraw || 0,
          currency: "VND",
          description: `Tổng tiền đã rút (${
            withdrawStats.completedCount || 0
          } yêu cầu hoàn thành)`,
        },
      }));

      setPendingWithdraw({
        amount: withdrawStats.totalPendingWithdraw || 0,
        count: withdrawStats.pendingCount || 0,
      });

      // Process unified transactions (orders + AI)
      const { transactions: unifiedTx, orderStats } =
        processUnifiedTransactions(unifiedTxResponse, usersMap);
      unifiedTransactions = [...unifiedTransactions, ...unifiedTx];

      // Update holding wallet data
      setWalletData((prev) => ({
        ...prev,
        holding: {
          balance: orderStats.escrowHold || 0,
          currency: "VND",
          description: `Tiền đang giữ tạm từ ${
            orderStats.escrowCount || 0
          } giao dịch order đang chờ giải ngân`,
        },
      }));

      setOrderFlowStats(orderStats);

      // Apply client-side filters
      const filteredTransactions = applyFilters(
        unifiedTransactions,
        appliedFilters
      );

      // Sort and set transactions (also keep full list for modal quick filtering)
      const sortedAll = filteredTransactions.sort(
        (a, b) =>
          new Date(b.timestamp || b.created_at) -
          new Date(a.timestamp || a.created_at)
      );
      setTransactions(sortedAll);
      setAllTransactions(sortedAll); // keep reference

      // Fetch admin wallet (accounting)
      const adminWalletResponse = await getAdminWallet();
      if (adminWalletResponse.success && adminWalletResponse.adminWallet) {
        setWalletData((prev) => ({
          ...prev,
          accounting: {
            balance: parseAmount(adminWalletResponse.adminWallet),
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

  // Extract filter logic
  const applyFilters = (transactions, appliedFilters) => {
    if (
      !appliedFilters ||
      (!appliedFilters.status &&
        !appliedFilters.user_id &&
        !appliedFilters.type)
    ) {
      return transactions;
    }

    return transactions.filter((transaction) => {
      if (appliedFilters.status && transaction.status !== appliedFilters.status)
        return false;
      if (
        appliedFilters.user_id &&
        !String(transaction.userId).includes(String(appliedFilters.user_id))
      )
        return false;
      if (appliedFilters.type && transaction.type !== appliedFilters.type)
        return false;
      return true;
    });
  };

  // Event handlers
  const handleFilterChange = (field, value) => {
    setFilters((prev) => ({ ...prev, [field]: value }));
  };

  const handleApplyFilters = () => {
    applyAndSetFilters(filters);
    setShowFilters(false);
    setCurrentPage(1);
  };

  const handleResetFilters = () => {
    const resetFilters = { status: "", user_id: "", type: "" };
    setFilters(resetFilters);
    applyAndSetFilters(resetFilters);
    setCurrentPage(1);
  };

  const handleViewTransactions = (walletType) => {
    setSelectedWallet(walletType);
    setShowTransactionModal(true);
    setCurrentPage(1);
  };

  // Load data on component mount
  useEffect(() => {
    fetchAdminWalletData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Computed values
  const totalRevenue =
    (walletData.floating?.balance || 0) + (walletData.accounting?.balance || 0);
  const paginatedTransactions = useMemo(
    () =>
      transactions.slice(
        (currentPage - 1) * WALLET_CONFIG.ITEMS_PER_PAGE,
        currentPage * WALLET_CONFIG.ITEMS_PER_PAGE
      ),
    [transactions, currentPage]
  );

  // Transaction status display helper
  const getStatusDisplay = (transaction) => {
    if (
      transaction.status === TRANSACTION_STATUS.FAILED &&
      transaction.type === TRANSACTION_TYPES.ORDER_PAYMENT &&
      /Hoàn tiền đơn/i.test(transaction.description)
    ) {
      return "Đã hoàn tiền";
    }

    const statusMap = {
      [TRANSACTION_STATUS.COMPLETED]: "Hoàn thành",
      [TRANSACTION_STATUS.PENDING]: "Đang xử lý",
      [TRANSACTION_STATUS.FAILED]: "Thất bại",
    };

    return statusMap[transaction.status] || "Không xác định";
  };

  return (
    <div className="p-8 bg-pink-50 min-h-screen">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
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
              onClick={() => navigate("/admin/withdraw-requests")}
              className="bg-pink-600 text-white px-6 py-3 rounded-lg hover:bg-pink-700 transition-colors"
            >
              Xem Yêu Cầu Rút Tiền
            </button>
          </div>
        </div>

        {/* Wallet Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {Object.entries(walletData).map(([key, wallet]) => {
            const config = getWalletConfig(key);
            return (
              <div
                key={key}
                className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow"
              >
                <div className="flex items-center mb-4">
                  <div
                    className={`w-12 h-12 rounded-full ${config.color} flex items-center justify-center text-white text-2xl`}
                  >
                    {config.icon}
                  </div>
                </div>

                <h3 className="text-lg font-semibold text-gray-800 mb-2">
                  {config.title}
                </h3>

                <p className="text-3xl font-bold text-gray-900 mb-2">
                  {formatCurrency(wallet?.balance || 0)}
                </p>

                <p className="text-sm text-gray-600">
                  {wallet?.description || ""}
                </p>
              </div>
            );
          })}
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

        {/* Recent Transactions */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-800">
              Giao Dịch Gần Đây
            </h2>
            <button
              onClick={() => handleViewTransactions("all")}
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
                      {transaction.userDisplay}
                    </td>
                    <td className="py-3 px-4 text-gray-700">
                      {transaction.description}
                    </td>
                    <td className="py-3 px-4 font-semibold text-gray-900">
                      {formatCurrency(transaction.amount)}
                    </td>
                    <td className="py-3 px-4">
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-medium ${getTransactionStatusStyle(
                          transaction.status
                        )}`}
                      >
                        {getStatusDisplay(transaction)}
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
                {selectedWallet === "all"
                  ? "Tất cả"
                  : getWalletConfig(selectedWallet).title}
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
                  Bộ Lọc
                </button>
                <button
                  onClick={handleResetFilters}
                  className="px-4 py-2 bg-gray-100 text-gray-600 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  Reset
                </button>
                <button
                  onClick={() => setShowTransactionModal(false)}
                  className="text-gray-500 hover:text-gray-700 text-2xl"
                >
                  ×
                </button>
              </div>
            </div>

            {/* Filter Panel */}
            {showFilters && (
              <div className="bg-gray-50 border rounded-lg p-4 mb-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
                      <option value={TRANSACTION_STATUS.COMPLETED}>
                        Hoàn thành
                      </option>
                      <option value={TRANSACTION_STATUS.PENDING}>
                        Đang xử lý
                      </option>
                      <option value={TRANSACTION_STATUS.FAILED}>
                        Thất bại
                      </option>
                    </select>
                  </div>

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
                      <option value={TRANSACTION_TYPES.WITHDRAW}>
                        Rút tiền
                      </option>
                      <option value={TRANSACTION_TYPES.ORDER_PAYMENT}>
                        Thanh toán đơn hàng
                      </option>
                      <option value={TRANSACTION_TYPES.AI_GENERATION}>
                        AI Generation
                      </option>
                    </select>
                  </div>
                </div>

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

            {/* Error message */}
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
                <div className="flex items-center">
                  <span className="text-red-600 text-sm">{error}</span>
                  <button
                    onClick={() => setError(null)}
                    className="ml-auto text-red-400 hover:text-red-600"
                  >
                    ×
                  </button>
                </div>
              </div>
            )}

            {/* Transaction Table */}
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
                  {paginatedTransactions.map((transaction) => (
                    <tr
                      key={transaction.id}
                      className="border-b border-gray-100 hover:bg-gray-50"
                    >
                      <td className="py-3 px-4 font-medium text-gray-900">
                        {transaction.userDisplay}
                      </td>
                      <td className="py-3 px-4 text-gray-700">
                        {transaction.description}
                      </td>
                      <td className="py-3 px-4 font-semibold text-gray-900">
                        {formatCurrency(transaction.amount)}
                      </td>
                      <td className="py-3 px-4">
                        <span
                          className={`px-2 py-1 rounded-full text-xs font-medium whitespace-nowrap ${getTransactionStatusStyle(
                            transaction.status
                          )}`}
                        >
                          {getStatusDisplay(transaction)}
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

                {generatePageList(totalPages, currentPage, 1, 1).map((p, idx) =>
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
