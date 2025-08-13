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
} from "../../api/axios";

// Mock data cho các ví (sẽ được thay thế bằng dữ liệu từ API)
const mockWalletData = {
  holding: {
    balance: 0, // Sẽ được cập nhật từ API
    currency: "VND",
    description: "Tổng tiền nạp thành công",
  },
  floating: {
    balance: 0, // Sẽ được cập nhật từ AI API
    currency: "VND",
    description: "Doanh thu từ AI Generation",
  },
  accounting: {
    balance: 0, // Sẽ được cập nhật từ admin wallet API
    currency: "VND",
    description: "Doanh thu hệ thống từ gói AI",
  },
  withdraw: {
    balance: 0, // Sẽ được cập nhật từ withdraw API
    currency: "VND",
    description: "Tổng tiền đang chờ rút",
  },
};

// Fake thêm 40 giao dịch
const mockTransactions = Array.from({ length: 40 }, (_, i) => {
  const statusArr = ["completed", "pending", "failed"];
  const descArr = [
    "Nạp tiền vào ví",
    "Mua gói AI Premium",
    "Đặt bánh sinh nhật",
    "Yêu cầu rút tiền",
    "Thanh toán đơn hàng",
    "Nhận tiền bán bánh",
    "Hoàn tiền khiếu nại",
  ];
  return {
    id: i + 1,
    userId: `user${(i % 7) + 1}`,
    type: descArr[i % descArr.length].toLowerCase().replace(/ /g, "_"),
    amount: 1000000 + (i % 7) * 50000,
    status: statusArr[i % statusArr.length],
    timestamp: `2024-01-15T${String(10 + (i % 10)).padStart(2, "0")}:${String(
      10 + (i % 50)
    ).padStart(2, "0")}:00Z`,
    description: descArr[i % descArr.length],
  };
});

const WalletManagement = () => {
  const [walletData, setWalletData] = useState(mockWalletData);
  const [transactions, setTransactions] = useState(mockTransactions);
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
      ] = await Promise.allSettled([
        fetchSystemWalletBalance(),
        fetchAllDepositsAdmin(appliedFilters), // Pass filters to API call
        fetchTotalAmountAiGenerate(), // Fetch AI revenue
        fetchAllUserWallets(), // Fetch all user wallets for total balance
        fetchAllWithdrawHistory(), // Fetch withdraw data
      ]);

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

      // Update transactions với deposit data thật
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
          const transformedTransactions = deposits.map((deposit) => ({
            id: deposit.id,
            userId:
              deposit.user?.username ||
              deposit.user?.full_name ||
              `user${deposit.user_id}`,
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

          setTransactions(transformedTransactions);
          console.log("Transformed transactions:", transformedTransactions);
        } else {
          console.log("No deposits found, keeping mock transactions");
          // Keep mock transactions if no real data
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

      // Update withdraw wallet với withdraw data thật
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
      }

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

      // Nếu modal đang mở, chỉ cập nhật dữ liệu trong modal
      if (showTransactionModal) {
        const response = await fetchAllDepositsAdmin(filters);
        console.log("Filtered data response:", response);

        // Kiểm tra response có hợp lệ không
        if (
          response &&
          response.data &&
          Array.isArray(response.data.deposits)
        ) {
          // Transform deposits thành transactions format
          const transformedTransactions = response.data.deposits.map(
            (deposit) => ({
              id: deposit.id,
              userId:
                deposit.user?.username ||
                deposit.user?.full_name ||
                `user${deposit.user_id}`,
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
            })
          );

          setTransactions(transformedTransactions);
          console.log(
            "Filtered and transformed transactions:",
            transformedTransactions
          );
        } else {
          console.warn("Invalid response structure:", response);
          // Nếu không có dữ liệu hợp lệ, set empty array
          setTransactions([]);
        }
      } else {
        // Nếu không có modal, cập nhật toàn bộ
        await fetchAdminWalletData(filters);
      }

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
                <button
                  onClick={() => handleViewTransactions(key)}
                  className="text-pink-600 hover:text-pink-700 text-sm font-medium"
                >
                  Xem chi tiết
                </button>
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
                </tr>
              </thead>
              <tbody>
                {transactions.slice(0, 5).map((transaction) => (
                  <tr
                    key={transaction.id}
                    className="border-b border-gray-100 hover:bg-gray-50"
                  >
                    <td className="py-3 px-4 font-medium text-gray-900">
                      {transaction.userId}
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
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
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
                          {transaction.userId}
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
