import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { getAdminWallet } from "../../api/wallet";

// Mock data cho các ví (sẽ được thay thế bằng dữ liệu từ API)
const mockWalletData = {
  holding: {
    balance: 15000000, // 15 triệu
    currency: "VND",
    description: "Ví tạm giữ tiền của user và admin",
  },
  floating: {
    balance: 8500000, // 8.5 triệu
    currency: "VND",
    description: "Ví tạm giữ cho giao dịch mua bánh",
  },
  accounting: {
    balance: 25000000, // 25 triệu
    currency: "VND",
    description: "Doanh thu hệ thống từ gói AI",
  },
  withdraw: {
    balance: 5000000, // 5 triệu
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
  const navigate = useNavigate();

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 20;
  const totalPages = Math.ceil(transactions.length / itemsPerPage);

  // Fetch admin wallet data từ API
  const fetchAdminWalletData = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await getAdminWallet();

      if (response.success && response.adminWallet) {
        // Update wallet data với thông tin thực từ API
        setWalletData((prevData) => ({
          ...prevData,
          accounting: {
            balance: parseFloat(response.adminWallet) || 0,
            currency: "VND",
            description: "Doanh thu hệ thống từ gói AI",
          },
        }));
      }
    } catch (error) {
      console.error("Lỗi khi fetch admin wallet:", error);
      setError("Không thể tải thông tin ví admin");
    } finally {
      setLoading(false);
    }
  };

  // Load dữ liệu khi component mount
  useEffect(() => {
    fetchAdminWalletData();
  }, []);

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
        return "💼";
      case "accounting":
        return "📊";
      case "withdraw":
        return "💸";
      default:
        return "💰";
    }
  };

  const getWalletColor = (walletType) => {
    switch (walletType) {
      case "holding":
        return "bg-blue-500";
      case "floating":
        return "bg-yellow-500";
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
                {key === "holding" && "Ví Holding"}
                {key === "floating" && "Ví Floating"}
                {key === "accounting" && "Doanh Thu Hệ Thống"}
                {key === "withdraw" && "Ví Withdraw"}
              </h3>

              <p className="text-3xl font-bold text-gray-900 mb-2">
                {formatCurrency(wallet.balance)}
              </p>

              <p className="text-sm text-gray-600">{wallet.description}</p>
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
                {formatCurrency(walletData.accounting.balance)}
              </p>
              <p className="text-sm text-gray-600">Tổng Doanh Thu</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-blue-600">
                {formatCurrency(
                  walletData.holding.balance + walletData.floating.balance
                )}
              </p>
              <p className="text-sm text-gray-600">Tổng Tiền Đang Giữ</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-red-600">
                {formatCurrency(walletData.withdraw.balance)}
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
                    ? "Ví Holding"
                    : selectedWallet === "floating"
                    ? "Ví Floating"
                    : selectedWallet === "accounting"
                    ? "Doanh Thu Hệ Thống"
                    : selectedWallet === "withdraw"
                    ? "Ví Withdraw"
                    : "Tất cả"
                  : "Tất cả"}
              </h3>
              <button
                onClick={() => setShowTransactionModal(false)}
                className="text-gray-500 hover:text-gray-700 text-2xl"
              >
                ×
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
