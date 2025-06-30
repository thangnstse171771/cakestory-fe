import React from "react";

const AccountsTable = ({
  paginatedAccounts,
  view,
  getStatusValue,
  getIsPremium,
  getIsBaker,
  handleViewDetails,
  handleToggleRestriction,
  handleRemoveAccount,
  removeLoading,
}) => {
  const getStatusColor = (status) => {
    switch (status) {
      case "active":
        return "bg-green-100 text-green-800";
      case "restricted":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getPremiumBadge = (account) => {
    const isPremium = getIsPremium(account);
    return isPremium ? (
      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
        Premium
      </span>
    ) : (
      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-600">
        Thường
      </span>
    );
  };

  const getBakerBadge = (account) => {
    const isBaker = getIsBaker(account);
    return isBaker ? (
      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
        Baker
      </span>
    ) : null;
  };

  const getAdminBadge = (account) => {
    const isAdmin = account.is_admin ?? account.isAdmin;
    return isAdmin ? (
      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
        Admin
      </span>
    ) : null;
  };

  if (paginatedAccounts.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-md p-8 text-center">
        <div className="text-gray-500 text-lg">
          {view === "all"
            ? "Không có tài khoản nào"
            : view === "premium"
            ? "Không có tài khoản premium nào"
            : view === "shops"
            ? "Không có cửa hàng nào"
            : "Không có admin nào"}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Tài khoản
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Email
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Trạng thái
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Loại tài khoản
              </th>
              {view === "shops" && (
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Cửa hàng
                </th>
              )}
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Ngày tạo
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Hành động
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {paginatedAccounts.map((account) => {
              const status = getStatusValue(account);
              return (
                <tr key={account.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-10 w-10">
                        <img
                          className="h-10 w-10 rounded-full"
                          src={
                            account.avatar ||
                            account.profile_picture ||
                            "https://via.placeholder.com/40"
                          }
                          alt=""
                        />
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">
                          {account.full_name || account.username || "N/A"}
                        </div>
                        <div className="text-sm text-gray-500">
                          ID: {account.id}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      {account.email || "N/A"}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(
                        status
                      )}`}
                    >
                      {status === "active" ? "Hoạt động" : "Bị hạn chế"}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex flex-wrap gap-1">
                      {getPremiumBadge(account)}
                      {getBakerBadge(account)}
                      {getAdminBadge(account)}
                    </div>
                  </td>
                  {view === "shops" && (
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {account.shopInfo?.business_name || "N/A"}
                      </div>
                      <div className="text-sm text-gray-500">
                        {account.shopInfo?.address || ""}
                      </div>
                    </td>
                  )}
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {account.created_at
                      ? new Date(account.created_at).toLocaleDateString("vi-VN")
                      : "N/A"}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex justify-end space-x-2">
                      <button
                        onClick={() => handleViewDetails(account)}
                        className="text-indigo-600 hover:text-indigo-900 bg-indigo-50 hover:bg-indigo-100 px-3 py-1 rounded-md text-xs font-medium transition-colors"
                      >
                        Chi tiết
                      </button>
                      <button
                        onClick={() => handleToggleRestriction(account.id)}
                        className={`${
                          status === "active"
                            ? "text-red-600 hover:text-red-900 bg-red-50 hover:bg-red-100"
                            : "text-green-600 hover:text-green-900 bg-green-50 hover:bg-green-100"
                        } px-3 py-1 rounded-md text-xs font-medium transition-colors`}
                      >
                        {status === "active" ? "Hạn chế" : "Kích hoạt"}
                      </button>
                      <button
                        onClick={() => handleRemoveAccount(account.id)}
                        disabled={removeLoading[account.id]}
                        className="text-red-600 hover:text-red-900 bg-red-50 hover:bg-red-100 px-3 py-1 rounded-md text-xs font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {removeLoading[account.id] ? "Đang xóa..." : "Xóa"}
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AccountsTable;
