import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { fetchAllUsers, deleteUser } from "../api/axios";
import toast, { Toaster } from "react-hot-toast";

// Fake data for accounts and their associated shops
// const fakeAccounts = [
//   ... (toàn bộ mock data cũ được comment lại)
// ];z

/*
const fakeAccounts = [
  {
    id: 1,
    username: "user1",
    email: "user1@example.com",
    status: "active",
    isPremium: false,
    shop: null,
    details: {
      fullName: "Nguyen Van A",
      phone: "0123456789",
      address: "123 Đường ABC, Quận 1, TP.HCM",
      createdAt: "2023-01-01",
    },
  },
  {
    id: 2,
    username: "user2",
    email: "user2@example.com",
    status: "active",
    isPremium: true,
    shop: {
      id: 1,
      name: "Sweet Delights",
      description: "Tiệm bánh ngọt nổi tiếng với các loại bánh kem tươi.",
      address: "456 Đường DEF, Quận 3, TP.HCM",
      createdAt: "2023-02-15",
      owner: "user2",
    },
    details: {
      fullName: "Tran Thi B",
      phone: "0987654321",
      address: "456 Đường DEF, Quận 3, TP.HCM",
      createdAt: "2023-02-10",
    },
  },
  {
    id: 3,
    username: "user3",
    email: "user3@example.com",
    status: "restricted",
    isPremium: false,
    shop: null,
    details: {
      fullName: "Le Van C",
      phone: "0111222333",
      address: "789 Đường GHI, Quận 5, TP.HCM",
      createdAt: "2023-03-20",
    },
  },
  {
    id: 4,
    username: "shop1",
    email: "shop1@example.com",
    status: "active",
    isPremium: true,
    shop: {
      id: 2,
      name: "Cake Paradise",
      description: "Chuyên bánh sinh nhật và bánh cưới cao cấp.",
      address: "789 Đường GHI, Quận 5, TP.HCM",
      createdAt: "2023-04-01",
      owner: "shop1",
    },
    details: {
      fullName: "Pham Thi D",
      phone: "0222333444",
      address: "789 Đường GHI, Quận 5, TP.HCM",
      createdAt: "2023-03-30",
    },
  },
  {
    id: 5,
    username: "shop2",
    email: "shop2@example.com",
    status: "restricted",
    isPremium: false,
    shop: {
      id: 3,
      name: "Bakery Corner",
      description: "Tiệm bánh nhỏ với các loại bánh mì và bánh ngọt handmade.",
      address: "321 Đường XYZ, Quận 7, TP.HCM",
      createdAt: "2023-05-10",
      owner: "shop2",
    },
    details: {
      fullName: "Nguyen Thi E",
      phone: "0333444555",
      address: "321 Đường XYZ, Quận 7, TP.HCM",
      createdAt: "2023-05-05",
    },
  },
];

*/

const AdminDashboard = () => {
  const [accounts, setAccounts] = useState([]);
  const [view, setView] = useState("all"); // all, premium, shops, admin
  const [showModal, setShowModal] = useState(false);
  const [modalLoading, setModalLoading] = useState(false);
  const [selectedAccount, setSelectedAccount] = useState(null);
  const navigate = useNavigate();
  // Search state
  const [search, setSearch] = useState({
    username: "",
    email: "",
    status: "",
    premium: "",
    shop: "",
  });
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 20;
  const [removeLoading, setRemoveLoading] = useState({});
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [accountToDelete, setAccountToDelete] = useState(null);

  // Fetch real data from API
  useEffect(() => {
    fetchAllUsers()
      .then((data) => {
        setAccounts(data.users || []);
        console.log("All accounts data:", data.users || []);
      })
      .catch((err) => {
        console.error("Failed to fetch users:", err);
      });
  }, []);

  const handleRemoveAccount = async (id) => {
    const account = accounts.find((acc) => acc.id === id);
    setAccountToDelete(account);
    setShowConfirmModal(true);
  };

  const confirmDelete = async () => {
    if (!accountToDelete) return;

    const toastId = toast.loading("Đang xóa tài khoản...");
    try {
      await deleteUser(accountToDelete.id);
      setAccounts(
        accounts.filter((account) => account.id !== accountToDelete.id)
      );
      toast.success("Xóa tài khoản thành công!", { id: toastId });
    } catch (error) {
      console.error("Failed to delete user:", error);
      toast.error("Xóa tài khoản thất bại!", { id: toastId });
    } finally {
      setRemoveLoading((prev) => ({ ...prev, [accountToDelete.id]: false }));
      setShowConfirmModal(false);
      setAccountToDelete(null);
    }
  };

  const cancelDelete = () => {
    setShowConfirmModal(false);
    setAccountToDelete(null);
  };

  const handleToggleRestriction = (id) => {
    setAccounts(
      accounts.map((account) => {
        if (account.id === id) {
          const newStatus =
            account.status === "active" ? "restricted" : "active";
          return {
            ...account,
            status: newStatus,
          };
        }
        return account;
      })
    );
  };

  const handleViewDetails = (account) => {
    setShowModal(true);
    setModalLoading(true);
    setTimeout(() => {
      setSelectedAccount(account);
      setModalLoading(false);
    }, 600);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setSelectedAccount(null);
  };

  const getIsPremium = (account) =>
    account.isPremium ?? account.is_premium ?? account.ispremium ?? false;
  const getIsBaker = (account) =>
    account.is_baker ?? account.isBaker ?? account.is_Baker ?? false;
  const getStatusValue = (account) => {
    if (account.status) return account.status;
    if (typeof account.is_active === "boolean")
      return account.is_active ? "active" : "restricted";
    if (typeof account.isActive === "boolean")
      return account.isActive ? "active" : "restricted";
    return "restricted";
  };

  // Lọc theo search và view
  const filteredAccounts = accounts.filter((account) => {
    const isPremium = getIsPremium(account);
    const isBaker = getIsBaker(account);
    const isAdmin = account.is_admin ?? account.isAdmin;
    if (view === "premium" && !isPremium) return false;
    if (view === "shops" && !isBaker) return false;
    if (view === "admin" && !isAdmin) return false;
    if (
      search.username &&
      !account.full_name?.toLowerCase().includes(search.username.toLowerCase())
    )
      return false;
    if (
      search.email &&
      !account.email?.toLowerCase().includes(search.email.toLowerCase())
    )
      return false;
    const statusValue = getStatusValue(account);
    if (search.status && statusValue !== search.status) return false;
    if (
      search.premium &&
      ((search.premium === "premium" && !isPremium) ||
        (search.premium === "regular" && isPremium))
    )
      return false;
    if (
      search.shop &&
      !(account.shop_name || "")
        .toLowerCase()
        .includes(search.shop.toLowerCase())
    )
      return false;
    return true;
  });

  // Pagination logic
  const totalPages = Math.ceil(filteredAccounts.length / itemsPerPage);
  const paginatedAccounts = filteredAccounts.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  return (
    <div className="p-8 bg-pink-50 min-h-screen">
      <Toaster position="top-right" />
      <div className="max-w-7xl mx-auto">
        <h1 className="text-4xl font-bold text-pink-600 mb-8">
          Admin Dashboard
        </h1>
        {/* Search Form */}
        <div className="bg-white rounded-xl shadow p-4 mb-6 flex flex-wrap gap-4 items-end">
          <div>
            <label className="block text-xs font-semibold text-pink-600 mb-1">
              Username
            </label>
            <input
              type="text"
              className="border border-pink-200 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-pink-200"
              value={search.username}
              onChange={(e) =>
                setSearch((s) => ({ ...s, username: e.target.value }))
              }
              placeholder="Search username..."
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-pink-600 mb-1">
              Email
            </label>
            <input
              type="text"
              className="border border-pink-200 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-pink-200"
              value={search.email}
              onChange={(e) =>
                setSearch((s) => ({ ...s, email: e.target.value }))
              }
              placeholder="Search email..."
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-pink-600 mb-1">
              Status
            </label>
            <select
              className="border border-pink-200 rounded px-3 py-2"
              value={search.status}
              onChange={(e) =>
                setSearch((s) => ({ ...s, status: e.target.value }))
              }
            >
              <option value="">All</option>
              <option value="active">Active</option>
              <option value="restricted">Restricted</option>
            </select>
          </div>
          <div>
            <label className="block text-xs font-semibold text-pink-600 mb-1">
              Premium
            </label>
            <select
              className="border border-pink-200 rounded px-3 py-2"
              value={search.premium}
              onChange={(e) =>
                setSearch((s) => ({ ...s, premium: e.target.value }))
              }
            >
              <option value="">All</option>
              <option value="premium">Premium</option>
              <option value="regular">Regular</option>
            </select>
          </div>
          <div>
            <label className="block text-xs font-semibold text-pink-600 mb-1">
              Shop Name
            </label>
            <input
              type="text"
              className="border border-pink-200 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-pink-200"
              value={search.shop}
              onChange={(e) =>
                setSearch((s) => ({ ...s, shop: e.target.value }))
              }
              placeholder="Search shop..."
            />
          </div>
        </div>
        {/* View Controls */}
        <div className="mb-8 flex gap-4">
          <button
            onClick={() => setView("all")}
            className={`px-6 py-3 rounded-lg font-semibold transition-all ${
              view === "all"
                ? "bg-pink-500 text-white shadow-md"
                : "bg-white text-pink-500 hover:bg-pink-50"
            }`}
          >
            All Accounts
          </button>
          <button
            onClick={() => setView("premium")}
            className={`px-6 py-3 rounded-lg font-semibold transition-all ${
              view === "premium"
                ? "bg-pink-500 text-white shadow-md"
                : "bg-white text-pink-500 hover:bg-pink-50"
            }`}
          >
            Premium Accounts
          </button>
          <button
            onClick={() => setView("shops")}
            className={`px-6 py-3 rounded-lg font-semibold transition-all ${
              view === "shops"
                ? "bg-pink-500 text-white shadow-md"
                : "bg-white text-pink-500 hover:bg-pink-50"
            }`}
          >
            Shop Accounts
          </button>
          <button
            onClick={() => setView("admin")}
            className={`px-6 py-3 rounded-lg font-semibold transition-all ${
              view === "admin"
                ? "bg-pink-500 text-white shadow-md"
                : "bg-white text-pink-500 hover:bg-pink-50"
            }`}
          >
            Admin Accounts
          </button>
        </div>
        {/* Accounts Table */}
        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          <table className="min-w-full text-sm">
            <thead className="bg-pink-100">
              <tr>
                <th className="px-6 py-4 text-center font-bold text-pink-600 uppercase tracking-wider">
                  ID
                </th>
                <th className="px-6 py-4 text-center font-bold text-pink-600 uppercase tracking-wider">
                  User Account
                </th>
                <th className="px-6 py-4 text-center font-bold text-pink-600 uppercase tracking-wider">
                  Email
                </th>
                <th className="px-6 py-4 text-center font-bold text-pink-600 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-4 text-center font-bold text-pink-600 uppercase tracking-wider">
                  Premium
                </th>
                <th className="px-6 py-4 text-center font-bold text-pink-600 uppercase tracking-wider">
                  Shop Page
                </th>
                <th className="px-6 py-4 text-center font-bold text-pink-600 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {paginatedAccounts.map((account) => (
                <tr key={account.id}>
                  <td className="px-6 py-4 align-middle font-medium text-gray-900 whitespace-nowrap text-center">
                    {account.id}
                  </td>
                  <td className="px-6 py-4 align-middle font-medium text-gray-900 whitespace-nowrap text-center">
                    {account.username}
                  </td>
                  <td className="px-6 py-4 align-middle text-gray-600 whitespace-nowrap text-center">
                    {account.email}
                  </td>
                  <td className="px-6 py-4 align-middle whitespace-nowrap text-center">
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-semibold ${
                        getStatusValue(account) === "active"
                          ? "bg-green-100 text-green-800"
                          : "bg-red-100 text-red-800"
                      }`}
                    >
                      {getStatusValue(account)}
                    </span>
                  </td>
                  <td className="px-6 py-4 align-middle whitespace-nowrap text-center">
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-semibold ${
                        getIsPremium(account)
                          ? "bg-yellow-100 text-yellow-800"
                          : "bg-gray-100 text-gray-800"
                      }`}
                    >
                      {getIsPremium(account) ? "Premium" : "Regular"}
                    </span>
                  </td>
                  <td className="px-6 py-4 align-middle whitespace-nowrap text-center">
                    {getIsBaker(account) ? (
                      <span className="font-medium text-gray-900">
                        {account.shop_name || (
                          <span className="italic text-gray-400">
                            No shop name
                          </span>
                        )}
                      </span>
                    ) : (
                      <span className="italic text-gray-400">No shop page</span>
                    )}
                  </td>
                  <td className="px-6 py-4 align-middle whitespace-nowrap space-x-2 text-center">
                    <button
                      onClick={() => handleViewDetails(account)}
                      className="px-4 py-2 rounded-lg text-xs font-semibold bg-blue-100 text-blue-600 hover:bg-blue-200 transition-colors"
                    >
                      View Details
                    </button>
                    <button
                      onClick={() => handleToggleRestriction(account.id)}
                      className={`px-4 py-2 rounded-lg text-xs font-semibold transition-colors ${
                        getStatusValue(account) === "active"
                          ? "bg-red-100 text-red-600 hover:bg-red-200"
                          : "bg-green-100 text-green-600 hover:bg-green-200"
                      }`}
                    >
                      {getStatusValue(account) === "active"
                        ? "Restrict"
                        : "Activate"}
                    </button>
                    <button
                      onClick={() => handleRemoveAccount(account.id)}
                      disabled={removeLoading[account.id]}
                      className="px-4 py-2 rounded-lg text-xs font-semibold bg-red-100 text-red-600 hover:bg-red-200 transition-colors disabled:opacity-50"
                    >
                      {removeLoading[account.id] ? "Removing..." : "Remove"}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {/* Pagination controls */}
        {totalPages > 1 && (
          <div className="flex justify-center items-center mt-6 gap-2">
            <button
              className="px-3 py-1 rounded border border-gray-300 bg-white text-gray-700 disabled:opacity-50"
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
            >
              Previous
            </button>
            {Array.from({ length: totalPages }, (_, i) => (
              <button
                key={i + 1}
                className={`px-3 py-1 rounded border border-gray-300 mx-1 ${
                  currentPage === i + 1
                    ? "bg-pink-500 text-white"
                    : "bg-white text-gray-700"
                }`}
                onClick={() => setCurrentPage(i + 1)}
              >
                {i + 1}
              </button>
            ))}
            <button
              className="px-3 py-1 rounded border border-gray-300 bg-white text-gray-700 disabled:opacity-50"
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
            >
              Next
            </button>
          </div>
        )}

        {/* Modal View Details */}
        {showModal && selectedAccount && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-30">
            <div className="bg-white rounded-2xl shadow-2xl p-0 w-full max-w-xl relative animate-fadeIn">
              <button
                className="absolute top-4 right-6 text-gray-400 hover:text-pink-500 text-2xl font-bold"
                onClick={handleCloseModal}
                aria-label="Close"
              >
                ×
              </button>
              {modalLoading ? (
                <div className="flex flex-col items-center justify-center py-16">
                  <div className="w-8 h-8 border-4 border-pink-200 border-t-pink-500 rounded-full animate-spin mb-4"></div>
                  <span className="text-pink-500 font-semibold">
                    Loading details...
                  </span>
                </div>
              ) : (
                <div className="p-8">
                  <h2 className="text-3xl font-extrabold text-pink-600 text-center mb-8 tracking-tight">
                    Account Details
                  </h2>
                  {/* Account Info Card */}
                  <div className="bg-pink-50 rounded-xl shadow p-6 mb-6">
                    <div className="flex items-center justify-between mb-4">
                      <span className="font-semibold text-gray-700">ID:</span>
                      <span className="text-gray-900">
                        {selectedAccount.id}
                      </span>
                    </div>
                    <div className="flex items-center justify-between mb-4">
                      <span className="font-semibold text-gray-700">
                        Username:
                      </span>
                      <span className="text-gray-900">
                        {selectedAccount.username}
                      </span>
                    </div>
                    <div className="flex items-center justify-between mb-4">
                      <span className="font-semibold text-gray-700">
                        Email:
                      </span>
                      <span className="text-gray-900">
                        {selectedAccount.email}
                      </span>
                    </div>
                    <div className="flex items-center justify-between mb-4">
                      <span className="font-semibold text-gray-700">
                        Full Name:
                      </span>
                      <span className="text-gray-900">
                        {selectedAccount.full_name}
                      </span>
                    </div>
                    <div className="flex items-center justify-between mb-4">
                      <span className="font-semibold text-gray-700">
                        Firebase UID:
                      </span>
                      <span className="text-gray-900">
                        {selectedAccount.firebase_uid}
                      </span>
                    </div>
                    <div className="flex items-center justify-between mb-4">
                      <span className="font-semibold text-gray-700">
                        Created At:
                      </span>
                      <span className="text-gray-900">
                        {selectedAccount.createdAt}
                      </span>
                    </div>
                    <div className="flex items-center justify-between mb-4">
                      <span className="font-semibold text-gray-700">
                        Updated At:
                      </span>
                      <span className="text-gray-900">
                        {selectedAccount.updatedAt}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-gray-700">
                        Status:
                      </span>
                      <span>
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-semibold mr-2 ${
                            getStatusValue(selectedAccount) === "active"
                              ? "bg-green-100 text-green-800"
                              : "bg-red-100 text-red-800"
                          }`}
                        >
                          {getStatusValue(selectedAccount)}
                        </span>
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-semibold ${
                            getIsPremium(selectedAccount)
                              ? "bg-yellow-100 text-yellow-800"
                              : "bg-gray-100 text-gray-800"
                          }`}
                        >
                          {getIsPremium(selectedAccount)
                            ? "Premium"
                            : "Regular"}
                        </span>
                      </span>
                    </div>
                  </div>
                  {/* Shop Info Card */}
                  {getIsBaker(selectedAccount) && (
                    <div className="bg-white border border-pink-200 rounded-xl shadow p-6">
                      <h3 className="text-xl font-bold text-pink-500 mb-4 text-center">
                        Shop Information
                      </h3>
                      <div className="flex items-center justify-between mb-4">
                        <span className="font-semibold text-gray-700">
                          Shop Name:
                        </span>
                        <span className="text-gray-900">
                          {selectedAccount.shop_name || (
                            <span className="italic text-gray-400">
                              No shop name
                            </span>
                          )}
                        </span>
                      </div>
                      {/* Nếu có thêm thông tin shop khác, bổ sung ở đây */}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Confirm Delete Modal */}
        {showConfirmModal && accountToDelete && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
            <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-md mx-4">
              <div className="text-center">
                <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg
                    className="w-8 h-8 text-red-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"
                    />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">
                  Xác nhận xóa tài khoản
                </h3>
                <p className="text-gray-600 mb-6">
                  Bạn có chắc chắn muốn xóa tài khoản{" "}
                  <span className="font-semibold text-gray-900">
                    {accountToDelete.username}
                  </span>
                  ?
                  <br />
                  <span className="text-sm text-red-600">
                    Hành động này không thể hoàn tác.
                  </span>
                </p>
                <div className="flex gap-3">
                  <button
                    onClick={cancelDelete}
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                  >
                    Hủy
                  </button>
                  <button
                    onClick={confirmDelete}
                    className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                  >
                    Xóa
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;
