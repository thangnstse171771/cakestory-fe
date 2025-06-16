import { useState } from "react";
import { useNavigate } from "react-router-dom";

// Fake data for accounts and their associated shops
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

const AdminDashboard = () => {
  const [accounts, setAccounts] = useState(fakeAccounts);
  const [view, setView] = useState("all"); // all, premium, shops
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

  const handleRemoveAccount = (id) => {
    setAccounts(accounts.filter((account) => account.id !== id));
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
    // Giả lập fetch dữ liệu chi tiết (delay 600ms)
    setTimeout(() => {
      setSelectedAccount(account);
      setModalLoading(false);
    }, 600);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setSelectedAccount(null);
  };

  // Lọc theo search
  const filteredAccounts = accounts.filter((account) => {
    if (view === "premium" && !account.isPremium) return false;
    if (view === "shops" && !account.shop) return false;
    if (
      search.username &&
      !account.username.toLowerCase().includes(search.username.toLowerCase())
    )
      return false;
    if (
      search.email &&
      !account.email.toLowerCase().includes(search.email.toLowerCase())
    )
      return false;
    if (search.status && account.status !== search.status) return false;
    if (
      search.premium &&
      ((search.premium === "premium" && !account.isPremium) ||
        (search.premium === "regular" && account.isPremium))
    )
      return false;
    if (
      search.shop &&
      (!account.shop ||
        !account.shop.name.toLowerCase().includes(search.shop.toLowerCase()))
    )
      return false;
    return true;
  });

  return (
    <div className="p-8 bg-pink-50 min-h-screen">
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
        </div>
        {/* Accounts Table */}
        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          <table className="min-w-full text-sm">
            <thead className="bg-pink-100">
              <tr>
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
              {filteredAccounts.map((account) => (
                <tr key={account.id} className="even:bg-pink-50">
                  <td className="px-6 py-4 align-middle font-medium text-gray-900 whitespace-nowrap text-center">
                    {account.username}
                  </td>
                  <td className="px-6 py-4 align-middle text-gray-600 whitespace-nowrap text-center">
                    {account.email}
                  </td>
                  <td className="px-6 py-4 align-middle whitespace-nowrap text-center">
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-semibold ${
                        account.status === "active"
                          ? "bg-green-100 text-green-800"
                          : "bg-red-100 text-red-800"
                      }`}
                    >
                      {account.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 align-middle whitespace-nowrap text-center">
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-semibold ${
                        account.isPremium
                          ? "bg-yellow-100 text-yellow-800"
                          : "bg-gray-100 text-gray-800"
                      }`}
                    >
                      {account.isPremium ? "Premium" : "Regular"}
                    </span>
                  </td>
                  <td className="px-6 py-4 align-middle whitespace-nowrap text-center">
                    {account.shop ? (
                      <span className="font-medium text-gray-900">
                        {account.shop.name}
                      </span>
                    ) : (
                      <span className="italic text-gray-400">No shop page</span>
                    )}
                  </td>
                  <td className="px-6 py-4 align-middle whitespace-nowrap space-x-2 text-center">
                    <button
                      onClick={() => navigate(`/admin/account/${account.id}`)}
                      className="px-4 py-2 rounded-lg text-xs font-semibold bg-blue-100 text-blue-600 hover:bg-blue-200 transition-colors"
                    >
                      View Details
                    </button>
                    <button
                      onClick={() => handleToggleRestriction(account.id)}
                      className={`px-4 py-2 rounded-lg text-xs font-semibold transition-colors ${
                        account.status === "active"
                          ? "bg-red-100 text-red-600 hover:bg-red-200"
                          : "bg-green-100 text-green-600 hover:bg-green-200"
                      }`}
                    >
                      {account.status === "active" ? "Restrict" : "Activate"}
                    </button>
                    <button
                      onClick={() => handleRemoveAccount(account.id)}
                      className="px-4 py-2 rounded-lg text-xs font-semibold bg-red-100 text-red-600 hover:bg-red-200 transition-colors"
                    >
                      Remove
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Modal View Details */}
        {showModal && (
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
                        {selectedAccount.details.fullName}
                      </span>
                    </div>
                    <div className="flex items-center justify-between mb-4">
                      <span className="font-semibold text-gray-700">
                        Phone:
                      </span>
                      <span className="text-gray-900">
                        {selectedAccount.details.phone}
                      </span>
                    </div>
                    <div className="flex items-center justify-between mb-4">
                      <span className="font-semibold text-gray-700">
                        Address:
                      </span>
                      <span className="text-gray-900 text-right max-w-[60%]">
                        {selectedAccount.details.address}
                      </span>
                    </div>
                    <div className="flex items-center justify-between mb-4">
                      <span className="font-semibold text-gray-700">
                        Account Created:
                      </span>
                      <span className="text-gray-900">
                        {selectedAccount.details.createdAt}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-gray-700">
                        Status:
                      </span>
                      <span>
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-semibold mr-2 ${
                            selectedAccount.status === "active"
                              ? "bg-green-100 text-green-800"
                              : "bg-red-100 text-red-800"
                          }`}
                        >
                          {selectedAccount.status}
                        </span>
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-semibold ${
                            selectedAccount.isPremium
                              ? "bg-yellow-100 text-yellow-800"
                              : "bg-gray-100 text-gray-800"
                          }`}
                        >
                          {selectedAccount.isPremium ? "Premium" : "Regular"}
                        </span>
                      </span>
                    </div>
                  </div>
                  {/* Shop Info Card */}
                  {selectedAccount.shop && (
                    <div className="bg-white border border-pink-200 rounded-xl shadow p-6">
                      <h3 className="text-xl font-bold text-pink-500 mb-4 text-center">
                        Shop Information
                      </h3>
                      <div className="flex items-center justify-between mb-4">
                        <span className="font-semibold text-gray-700">
                          Shop Name:
                        </span>
                        <span className="text-gray-900">
                          {selectedAccount.shop.name}
                        </span>
                      </div>
                      <div className="flex items-center justify-between mb-4">
                        <span className="font-semibold text-gray-700">
                          Description:
                        </span>
                        <span className="text-gray-900 text-right max-w-[60%]">
                          {selectedAccount.shop.description}
                        </span>
                      </div>
                      <div className="flex items-center justify-between mb-4">
                        <span className="font-semibold text-gray-700">
                          Address:
                        </span>
                        <span className="text-gray-900 text-right max-w-[60%]">
                          {selectedAccount.shop.address}
                        </span>
                      </div>
                      <div className="flex items-center justify-between mb-4">
                        <span className="font-semibold text-gray-700">
                          Shop Created:
                        </span>
                        <span className="text-gray-900">
                          {selectedAccount.shop.createdAt}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="font-semibold text-gray-700">
                          Owner:
                        </span>
                        <span className="text-gray-900">
                          {selectedAccount.shop.owner}
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;
