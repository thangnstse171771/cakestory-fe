import { useState } from "react";

// Fake data for accounts and their associated shops
const fakeAccounts = [
  {
    id: 1,
    username: "user1",
    email: "user1@example.com",
    status: "active",
    isPremium: false,
    shop: null,
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
    },
  },
  {
    id: 3,
    username: "user3",
    email: "user3@example.com",
    status: "restricted",
    isPremium: false,
    shop: null,
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
    },
  },
];

const AdminDashboard = () => {
  const [accounts, setAccounts] = useState(fakeAccounts);
  const [view, setView] = useState("all"); // all, premium, shops

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

  const filteredAccounts = accounts.filter((account) => {
    if (view === "premium") return account.isPremium;
    if (view === "shops") return account.shop !== null;
    return true;
  });

  return (
    <div className="p-8 bg-pink-50 min-h-screen">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-4xl font-bold text-pink-600 mb-8">
          Admin Dashboard
        </h1>
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
                  <td className="px-6 py-4 align-middle font-medium text-gray-900 whitespace-nowrap">
                    {account.username}
                  </td>
                  <td className="px-6 py-4 align-middle text-gray-600 whitespace-nowrap">
                    {account.email}
                  </td>
                  <td className="px-6 py-4 align-middle whitespace-nowrap">
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
                  <td className="px-6 py-4 align-middle whitespace-nowrap">
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
                  <td className="px-6 py-4 align-middle whitespace-nowrap">
                    {account.shop ? (
                      <span className="font-medium text-gray-900">
                        {account.shop.name}
                      </span>
                    ) : (
                      <span className="italic text-gray-400">No shop page</span>
                    )}
                  </td>
                  <td className="px-6 py-4 align-middle whitespace-nowrap space-x-2">
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
      </div>
    </div>
  );
};

export default AdminDashboard;
