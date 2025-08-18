import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { getAdminWallet } from "../../api/wallet";
import {
  fetchAdminWalletBalance,
  fetchAllUserWallets,
  fetchAllDepositsAdmin,
  fetchSystemWalletBalance,
  fetchTotalAmountAiGenerate,
  fetchAllWithdrawHistory,
  fetchAllOrders,
  fetchAllUsers,
} from "../../api/axios";

const WalletManagement = () => {
  const [walletData, setWalletData] = useState({
    holding: {
      balance: 0,
      currency: "VND",
      description: "Tổng tiền nạp thành công",
    },
    floating: {
      balance: 0,
      currency: "VND",
      description: "Doanh thu từ AI Generation",
    },
    accounting: {
      balance: 0,
      currency: "VND",
      description: "Doanh thu hệ thống từ gói AI",
    },
    withdraw: {
      balance: 0,
      currency: "VND",
      description: "Tổng tiền đã rút",
    },
  });
  const [transactions, setTransactions] = useState([]);
  const [selectedWallet, setSelectedWallet] = useState(null);
  const [showTransactionModal, setShowTransactionModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [totalUserWalletsBalance, setTotalUserWalletsBalance] = useState(0); // Tổng số dư user wallets
  const [pendingWithdraw, setPendingWithdraw] = useState({
    amount: 0,
    count: 0,
  }); // Pending withdraw stats
  const navigate = useNavigate();

  // Filter states
  const [filters, setFilters] = useState({
    status: "",
  user_id: "",
  type: "",
  });
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

      // Fetch multiple data sources bao gồm AI revenue, all user wallets và withdraw data
      const [
        systemBalanceResponse,
        depositsResponse,
        aiRevenueResponse,
        allWalletsResponse,
        withdrawResponse,
        ordersResponse,
        usersResponse,
      ] = await Promise.allSettled([
        fetchSystemWalletBalance(),
        fetchAllDepositsAdmin(appliedFilters), // Pass filters to API call
        fetchTotalAmountAiGenerate(), // Fetch AI revenue
        fetchAllUserWallets(), // Fetch all user wallets for total balance
        fetchAllWithdrawHistory(), // Fetch withdraw data
        fetchAllOrders(), // Fetch all cake orders (purchases)
        fetchAllUsers(), // Fetch all users to map full names
      ]);

      // Build a user map for quick lookup of display names
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
        // Prefer embedded full name if available
        const embeddedName =
          embeddedUser?.full_name ||
          embeddedUser?.fullName ||
          (embeddedUser?.first_name && embeddedUser?.last_name
            ? `${embeddedUser.first_name} ${embeddedUser.last_name}`
            : embeddedUser?.name || embeddedUser?.username || null);
        if (embeddedName) return embeddedName;
        // Then lookup from usersMap
        if (rawId != null && usersMap[rawId]) return usersMap[rawId];
        // Fallback
        return rawId != null ? `user${rawId}` : "User";
      };

      // Update wallet data với system balance (holding wallet)
      if (systemBalanceResponse.status === "fulfilled") {
        const systemData = systemBalanceResponse.value;
        console.log("System data received:", systemData);

        setWalletData((prev) => ({
          ...prev,
          holding: {
            balance: systemData.totalSystemBalance || 0,
            currency: "VND",
            description: `Tổng tiền nạp thành công: ${
              systemData.totalDeposits || 0
            } giao dịch`,
          },
        }));
      }

      // Build unified recent transactions from deposits + withdraws + orders
      let unifiedTransactions = [];

      // Deposits
      if (depositsResponse.status === "fulfilled") {
        const depositsData = depositsResponse.value;
        console.log("Deposits data:", depositsData);
        console.log("Deposits data type:", typeof depositsData);
        console.log("Deposits data keys:", Object.keys(depositsData || {}));

        // Transform deposits thành transactions format - thêm safety check
        let deposits = [];

        // Thử nhiều cách extract deposits array theo đúng API structure
        if (Array.isArray(depositsData)) {
          deposits = depositsData;
        } else if (
          depositsData?.data?.deposits &&
          Array.isArray(depositsData.data.deposits)
        ) {
          // Correct path: depositsData.data.deposits (từ console log)
          deposits = depositsData.data.deposits;
        } else if (
          depositsData?.deposits &&
          Array.isArray(depositsData.deposits)
        ) {
          deposits = depositsData.deposits;
        } else if (depositsData?.data && Array.isArray(depositsData.data)) {
          deposits = depositsData.data;
        } else {
          console.warn("Deposits data is not an array:", depositsData);
          deposits = [];
        }

        console.log("Final deposits array:", deposits);
        console.log("Deposits count:", deposits.length);

        if (deposits.length > 0) {
          const depositTx = deposits.map((deposit) => ({
            id: deposit.id,
            // Keep numeric/string ID for filtering
            userId:
              deposit.user_id ?? deposit.user?.id ?? deposit.user?.user_id ?? "",
            // Prefer full name for display
            userDisplay: resolveUserDisplay(
              deposit.user_id ?? deposit.user?.id ?? deposit.user?.user_id,
              deposit.user
            ),
            type: "deposit",
            amount: parseFloat(deposit.amount) || 0,
            status:
              deposit.status === "completed"
                ? "completed"
                : deposit.status === "pending"
                ? "pending"
                : "failed",
            timestamp: deposit.created_at || deposit.createdAt,
            description: "Nạp tiền vào ví",
          }));

          unifiedTransactions = [...unifiedTransactions, ...depositTx];
          console.log("Deposit transactions prepared:", depositTx.length);
  }
  }
      // Update floating wallet với AI revenue data thật
      if (aiRevenueResponse.status === "fulfilled") {
        const aiRevenueData = aiRevenueResponse.value;
        console.log("AI Revenue data received:", aiRevenueData);

        setWalletData((prev) => ({
          ...prev,
          floating: {
            balance: parseFloat(aiRevenueData.totalAmount) || 0,
            currency: "VND",
            description: "Doanh thu từ AI Generation",
          },
        }));
      }

      // Update totalUserWalletsBalance với dữ liệu từ all user wallets
      if (allWalletsResponse.status === "fulfilled") {
        const allWalletsData = allWalletsResponse.value;
        console.log("All user wallets data received:", allWalletsData);
        console.log("Type of allWalletsData:", typeof allWalletsData);
        console.log(
          "Keys of allWalletsData:",
          Object.keys(allWalletsData || {})
        );
        console.log("allWalletsData.userWallets:", allWalletsData?.userWallets);
        console.log(
          "Is userWallets array?",
          Array.isArray(allWalletsData?.userWallets)
        );

        // Tính tổng số dư của tất cả user wallets
        let totalBalance = 0;
        let walletArray = [];

        // Extract wallet array from response
        console.log("=== DEBUGGING WALLET ARRAY EXTRACTION ===");
        console.log("allWalletsData exists?", !!allWalletsData);
        console.log(
          "allWalletsData.userWallets exists?",
          !!allWalletsData?.userWallets
        );
        console.log(
          "allWalletsData.userWallet exists?",
          !!allWalletsData?.userWallet
        );
        console.log(
          "allWalletsData.userWallets is array?",
          Array.isArray(allWalletsData?.userWallets)
        );
        console.log(
          "allWalletsData.userWallet is array?",
          Array.isArray(allWalletsData?.userWallet)
        );

        if (
          allWalletsData &&
          allWalletsData.userWallets &&
          Array.isArray(allWalletsData.userWallets)
        ) {
          console.log("✅ Using userWallets path");
          walletArray = allWalletsData.userWallets;
        } else if (
          allWalletsData &&
          allWalletsData.userWallet &&
          Array.isArray(allWalletsData.userWallet)
        ) {
          console.log("✅ Using userWallet path (singular)");
          walletArray = allWalletsData.userWallet;
        } else if (Array.isArray(allWalletsData)) {
          console.log("✅ Using direct array path");
          walletArray = allWalletsData;
        } else if (allWalletsData && Array.isArray(allWalletsData.data)) {
          console.log("✅ Using data array path");
          walletArray = allWalletsData.data;
        } else {
          console.log("❌ No valid array found in response");
          // Try to force extract from userWallets even if checks fail
          if (allWalletsData?.userWallets) {
            console.log("🔄 Force extracting from userWallets");
            walletArray = allWalletsData.userWallets;
          } else if (allWalletsData?.userWallet) {
            console.log("🔄 Force extracting from userWallet");
            walletArray = allWalletsData.userWallet;
          }
        }

        console.log("Wallet array extracted:", walletArray);
        console.log("Wallet array length:", walletArray.length);

        if (walletArray.length > 0) {
          // Chuẩn hóa parsing VND: hỗ trợ định dạng có dấu phẩy/chấm và ký tự tiền tệ
          const toVndNumber = (val) => {
            if (typeof val === "number") return Math.round(val);
            if (val == null) return 0;
            let s = String(val).trim();
            // loại bỏ ký tự không phải số, dấu chấm, dấu phẩy hoặc dấu trừ
            s = s.replace(/[^0-9.,-]/g, "");
            // nếu có cả dấu phẩy và chấm, xác định dấu thập phân theo ký tự xuất hiện sau cùng
            if (s.includes(",") && s.includes(".")) {
              const lastComma = s.lastIndexOf(",");
              const lastDot = s.lastIndexOf(".");
              const dec = lastComma > lastDot ? "," : ".";
              if (dec === ",") {
                s = s.replace(/\./g, "");
                s = s.replace(",", ".");
              } else {
                s = s.replace(/,/g, "");
              }
            } else if (s.includes(",")) {
              // chỉ có dấu phẩy: coi như phân cách nghìn → bỏ hết
              s = s.replace(/,/g, "");
            }
            const n = parseFloat(s);
            return Number.isFinite(n) ? Math.round(n) : 0;
          };

          totalBalance = walletArray.reduce((sum, wallet) => {
            const parsed = toVndNumber(wallet.balance);
            console.log(
              `Wallet ${wallet.user_id}: balance = ${wallet.balance} -> parsed = ${parsed}`
            );
            return sum + parsed;
          }, 0);
        }

        console.log("Total user wallets balance calculated:", totalBalance);
        setTotalUserWalletsBalance(totalBalance);
      }

      // Withdraws -> update wallet card + contribute to unified list
      if (withdrawResponse.status === "fulfilled") {
        const wd = withdrawResponse.value;
        console.log("Withdraw data received:", wd);

        // Hỗ trợ nhiều dạng response khác nhau
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
            ].includes(v)
          )
            return "completed";
          if (["approved", "approve"].includes(v)) return "approved";
          if (
            [
              "rejected",
              "reject",
              "failed",
              "fail",
              "error",
              "từ chối",
              "that bai",
            ].includes(v)
          )
            return "rejected";
          if (["cancelled", "canceled", "cancel"].includes(v))
            return "rejected";
          return "pending";
        };

        const toNumber = (a) => {
          if (typeof a === "number") return a;
          if (a == null) return 0;
          let s = String(a).trim();
          s = s.replace(/[^0-9.,-]/g, "");
          if (s.includes(",") && s.includes(".")) {
            const lastComma = s.lastIndexOf(",");
            const lastDot = s.lastIndexOf(".");
            const dec = lastComma > lastDot ? "," : ".";
            if (dec === ",") {
              s = s.replace(/\./g, "");
              s = s.replace(",", ".");
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
          // Keep raw id for filter
          userId: w.user_id ?? w.user?.id ?? w.user?.user_id ?? "",
          // Prefer full name for display
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

        console.log("Pending withdraw:", {
          pendingCount,
          totalPendingWithdraw,
        });
        console.log("Completed withdraw:", {
          completedCount,
          totalCompletedWithdraw,
        });

        // Card "Ví Withdraw" hiển thị: Số tiền đã rút (completed)
        setWalletData((prev) => ({
          ...prev,
          withdraw: {
            balance: totalCompletedWithdraw,
            currency: "VND",
            description: `Tổng tiền đã rút (${completedCount} yêu cầu hoàn thành)`,
          },
        }));

        // Summary giữ nguyên: Tiền Chờ Rút (pending)
        setPendingWithdraw({
          amount: totalPendingWithdraw,
          count: pendingCount,
        });

        unifiedTransactions = [...unifiedTransactions, ...withdrawTx];
      }

      // Orders (purchases)
      if (ordersResponse && ordersResponse.status === "fulfilled") {
        let orders = [];
        const ordersData = ordersResponse.value;
        if (Array.isArray(ordersData)) orders = ordersData;
        else if (Array.isArray(ordersData?.orders)) orders = ordersData.orders;
        else if (Array.isArray(ordersData?.data)) orders = ordersData.data;

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
          } else if (s.includes(",")) s = s.replace(/,/g, "");
          const n = parseFloat(s);
          return Number.isFinite(n) ? n : 0;
        };

        const normalizeOrderStatus = (raw) => {
          const s = String(raw || "").toLowerCase();
          if (
            [
              "paid",
              "completed",
              "complete",
              "delivered",
              "shipped",
              "success",
            ].includes(s)
          )
            return "completed";
          if (
            [
              "pending",
              "processing",
              "in_progress",
              "created",
              "ordered",
            ].includes(s)
          )
            return "pending";
          if (["failed", "rejected", "cancelled", "canceled"].includes(s))
            return "failed";
          return "pending";
        };

        const orderTx = orders.map((order) => ({
          id: order.id || order.order_id,
          // Keep raw id for filter
          userId:
            order.user_id ?? order.customer_id ?? order.customer?.id ?? "",
          // Prefer full name for display
          userDisplay: resolveUserDisplay(
            order.user_id ?? order.customer_id ?? order.customer?.id,
            order.customer
          ),
          type: "order",
          amount: toNumber(
            order.total ?? order.total_price ?? order.totalPrice ?? order.amount
          ),
          status: normalizeOrderStatus(order.status || order.payment_status),
          timestamp:
            order.created_at ||
            order.createdAt ||
            order.updated_at ||
            order.updatedAt,
          description: "Mua bánh",
        }));

        unifiedTransactions = [...unifiedTransactions, ...orderTx];
      }

      // Apply client-side filters if provided
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

      // Sort by time desc and set to state (always set, even if empty)
      unifiedTransactions.sort(
        (a, b) =>
          new Date(b.timestamp || b.created_at) -
          new Date(a.timestamp || a.created_at)
      );
      setTransactions(unifiedTransactions);

      // Keep original admin wallet fetch for accounting
      const response = await getAdminWallet();
      if (response.success && response.adminWallet) {
        setWalletData((prev) => ({
          ...prev,
          accounting: {
            balance: parseFloat(response.adminWallet) || 0,
            currency: "VND",
            description: "Doanh thu hệ thống từ gói AI",
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
            <button
              onClick={fetchAdminWalletData}
              className="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition-colors"
              disabled={loading}
            >
              Làm Mới
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
              <div className="flex items-center justify-between mb-4">
                <div
                  className={`w-12 h-12 rounded-full ${getWalletColor(
                    key
                  )} flex items-center justify-center text-white text-2xl`}
                >
                  {getWalletIcon(key)}
                </div>
                {(key === "holding" || key === "withdraw") && (
                  <button
                    onClick={() => handleViewTransactions(key)}
                    className="text-pink-600 hover:text-pink-700 text-sm font-medium"
                  >
                    Xem chi tiết
                  </button>
                )}
              </div>

              <h3 className="text-lg font-semibold text-gray-800 mb-2 capitalize">
                {key === "holding" && "Tổng tiền nạp vào"}
                {key === "floating" && "Doanh Thu từ AI"}
                {key === "accounting" && "Doanh Thu Hệ Thống"}
                {key === "withdraw" && "Ví Withdraw"}
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
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <p className="text-2xl font-bold text-green-600">
                {formatCurrency(totalRevenue)}
              </p>
              <p className="text-sm text-gray-600">Tổng Doanh Thu</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-blue-600">
                {formatCurrency(totalUserWalletsBalance)}
              </p>
              <p className="text-sm text-gray-600">
                Tổng Tiền Đang Giữ (Tất cả User Wallets)
              </p>
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
                      {transaction.type === "deposit" && (
                        <button
                          className="text-pink-600 hover:text-pink-800 font-medium hover:underline text-sm"
                          onClick={() =>
                            navigate(`/admin/deposits/${transaction.id}`)
                          }
                        >
                          Chi tiết
                        </button>
                      )}
                      {transaction.type === "withdraw" && (
                        <button
                          className="text-pink-600 hover:text-pink-800 font-medium hover:underline text-sm"
                          onClick={() =>
                            navigate(
                              `/admin/withdraw-requests/${transaction.id}`
                            )
                          }
                        >
                          Chi tiết
                        </button>
                      )}
            {transaction.type === "order" && (
                        <button
                          className="text-pink-600 hover:text-pink-800 font-medium hover:underline text-sm"
              onClick={() => navigate(`/admin/order-tracking/${transaction.id}`)}
                        >
                          Chi tiết
                        </button>
                      )}
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
          <div className="bg-white rounded-xl p-6 w-full max-w-4xl max-h-[80vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-2xl font-bold text-gray-800">
                Chi Tiết Giao Dịch -{" "}
                {selectedWallet && selectedWallet !== "all"
                  ? selectedWallet === "holding"
                    ? "Tổng tiền nạp vào"
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
                      onChange={(e) => handleFilterChange("type", e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-pink-500"
                    >
                      <option value="">Tất cả</option>
                      <option value="deposit">Nạp tiền</option>
                      <option value="withdraw">Rút tiền</option>
                      <option value="order">Mua bánh</option>
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
                          {new Date(transaction.timestamp).toLocaleString(
                            "vi-VN"
                          )}
                        </td>
                        <td className="py-3 px-4">
                          {transaction.type === "deposit" && (
                            <button
                              className="text-pink-600 hover:text-pink-800 font-medium hover:underline text-sm"
                              onClick={() => {
                                setShowTransactionModal(false);
                                navigate(`/admin/deposits/${transaction.id}`);
                              }}
                            >
                              Chi tiết
                            </button>
                          )}
                          {transaction.type === "withdraw" && (
                            <button
                              className="text-pink-600 hover:text-pink-800 font-medium hover:underline text-sm"
                              onClick={() => {
                                setShowTransactionModal(false);
                                navigate(`/admin/withdraw-requests/${transaction.id}`);
                              }}
                            >
                              Chi tiết
                            </button>
                          )}
                          {transaction.type === "order" && (
                            <button
                              className="text-pink-600 hover:text-pink-800 font-medium hover:underline text-sm"
                              onClick={() => {
                                setShowTransactionModal(false);
                                navigate(`/admin/order-tracking/${transaction.id}`);
                              }}
                            >
                              Chi tiết
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
            {/* Pagination */}
            <div className="flex justify-center items-center gap-2 mt-4">
              {Array.from({ length: totalPages }, (_, i) => (
                <button
                  key={i}
                  onClick={() => setCurrentPage(i + 1)}
                  className={`px-3 py-1 rounded-lg font-semibold border ${
                    currentPage === i + 1
                      ? "bg-pink-500 text-white border-pink-500"
                      : "bg-white text-pink-600 border-pink-200 hover:bg-pink-50"
                  }`}
                >
                  {i + 1}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default WalletManagement;
