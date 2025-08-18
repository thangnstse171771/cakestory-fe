import React, { useState } from "react";
import { Link } from "react-router-dom";
import { deactivateShop } from "../../api/axios";

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
  onShopRemoved,
}) => {
  // Thêm state cho filter role
  const [roleFilter, setRoleFilter] = useState("");

  // Hàm lấy role từ account
  const getRole = (account) => {
    return (
      account.role ||
      (account.is_admin || account.isAdmin
        ? "admin"
        : account.is_account_staff
        ? "account_staff"
        : account.is_complaint_handler
        ? "complaint_handler"
        : "user")
    );
  };

  // Lọc accounts theo role nếu filter được chọn
  const filteredAccounts = roleFilter
    ? paginatedAccounts.filter((account) => getRole(account) === roleFilter)
    : paginatedAccounts;

  // Local loading state for shop deactivation per account
  const [shopRemoving, setShopRemoving] = useState({});

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

  if (filteredAccounts.length === 0) {
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
    <div className="bg-white rounded-lg shadow-md w-full">
      <div className="w-full">
        <table className="min-w-full w-full divide-y divide-gray-200 table-fixed text-sm">
          <thead className="bg-gray-50">
            <tr>
              <th className="w-[18%] px-2 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-wrap">
                Tài khoản
              </th>
              <th className="w-[18%] px-2 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">
                Email
              </th>
              <th className="w-[10%] px-2 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">
                Trạng thái
              </th>
              <th className="w-[10%] px-2 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">
                Loại tài khoản
              </th>
              <th className="w-[10%] px-2 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">
                Vai trò
              </th>
              {view === "shops" && (
                <th className="w-[10%] px-2 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">
                  Cửa hàng
                </th>
              )}
              <th className="w-[10%] px-2 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">
                Ngày tạo
              </th>
              <th className="w-[15%] px-2 py-2 text-right text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">
                Hành động
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredAccounts.map((account) => {
              const status = getStatusValue(account);
              const role = getRole(account); // Lấy role để kiểm tra
              return (
                <tr key={account.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap truncate w-full overflow-hidden overflow-ellipsis">
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
                        <div className="text-sm font-medium text-gray-900 w-full block truncate overflow-ellipsis overflow-hidden">
                          {account.full_name || account.username || "N/A"}
                        </div>
                        <div className="text-sm text-gray-500 w-full block truncate overflow-ellipsis overflow-hidden">
                          ID: {account.id}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900 truncate overflow-ellipsis overflow-hidden max-w-full">
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
                  {/* Hiển thị role */}
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                    {(() => {
                      const role = getRole(account);
                      switch (role) {
                        case "admin":
                          return "Admin";
                        case "account_staff":
                          return "Account Staff";
                        case "complaint_handler":
                          return "Complaint Handler";
                        default:
                          return "User";
                      }
                    })()}
                  </td>
                  {view === "shops" && (
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm truncate overflow-ellipsis overflow-hidden max-w-full">
                        {account.shopInfo?.business_name ? (
                          <Link
                            to={`/marketplace/shop/${account.id}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-indigo-600 hover:text-indigo-800 hover:underline"
                            title="Xem shop"
                            onClick={(e) => e.stopPropagation()}
                          >
                            {account.shopInfo.business_name}
                          </Link>
                        ) : (
                          <span className="text-gray-900">N/A</span>
                        )}
                      </div>
                      <div className="text-sm text-gray-500 truncate overflow-ellipsis overflow-hidden max-w-full">
                        {account.shopInfo?.address || ""}
                      </div>
                    </td>
                  )}
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {account.createdAt
                      ? new Date(account.createdAt).toLocaleDateString("vi-VN")
                      : "N/A"}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex justify-end space-x-2">
                      {view === "shops" && account?.shopInfo?.business_name && (
                        <Link
                          to={`/marketplace/shop/${account.id}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          onClick={(e) => e.stopPropagation()}
                          className="text-blue-600 hover:text-blue-900 bg-blue-50 hover:bg-blue-100 px-3 py-1 rounded-md text-xs font-medium transition-colors"
                          title="Mở trang shop công khai"
                        >
                          Xem shop
                        </Link>
                      )}
                      <button
                        type="button"
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          handleViewDetails(account);
                        }}
                        className="text-indigo-600 hover:text-indigo-900 bg-indigo-50 hover:bg-indigo-100 px-3 py-1 rounded-md text-xs font-medium transition-colors"
                      >
                        Chi tiết
                      </button>
                      {/* Ẩn các nút thao tác nếu là admin hoặc account_staff */}
                      {!(role === "admin" || role === "account_staff") && (
                        <>
                          {/* <button
                            onClick={() => handleToggleRestriction(account.id)}
                            className={`${
                              status === "active"
                                ? "text-red-600 hover:text-red-900 bg-red-50 hover:bg-red-100"
                                : "text-green-600 hover:text-green-900 bg-green-50 hover:bg-green-100"
                            } px-3 py-1 rounded-md text-xs font-medium transition-colors`}
                          >
                            {status === "active" ? "Hạn chế" : "Kích hoạt"}
                          </button> */}
                          {view === "shops" &&
                            account?.shopInfo?.business_name && (
                              <button
                                onClick={async (e) => {
                                  e.preventDefault();
                                  e.stopPropagation();
                                  if (shopRemoving[account.id]) return;
                                  const ok = window.confirm(
                                    `Bạn có chắc muốn xóa shop (vô hiệu hóa) của user #${account.id}?`
                                  );
                                  if (!ok) return;
                                  try {
                                    setShopRemoving((prev) => ({
                                      ...prev,
                                      [account.id]: true,
                                    }));
                                    await deactivateShop(account.id);
                                    if (typeof onShopRemoved === "function") {
                                      onShopRemoved(account.id);
                                    }
                                  } catch (e) {
                                    console.error("Deactivate shop failed", e);
                                  } finally {
                                    setShopRemoving((prev) => ({
                                      ...prev,
                                      [account.id]: false,
                                    }));
                                  }
                                }}
                                disabled={!!shopRemoving[account.id]}
                                className="text-red-600 hover:text-red-900 bg-red-50 hover:bg-red-100 px-3 py-1 rounded-md text-xs font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                              >
                                {shopRemoving[account.id]
                                  ? "Đang xóa..."
                                  : "Xóa shop"}
                              </button>
                            )}
                        </>
                      )}
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
