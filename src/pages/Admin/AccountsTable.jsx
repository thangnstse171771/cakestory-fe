import React, { useState } from "react";
import { Link } from "react-router-dom";
import { deactivateShop } from "../../api/axios";
import toast from "react-hot-toast";

const AccountsTable = ({
  paginatedAccounts,
  view,
  getStatusValue,
  handleViewDetails,
  onShopRemoved,
}) => {
  const filteredAccounts = paginatedAccounts; // role filtering removed (no longer used)

  // Local loading state for shop deactivation per account
  const [shopRemoving, setShopRemoving] = useState({});

  const getStatusColor = (status) =>
    status === "active"
      ? "bg-green-100 text-green-800"
      : "bg-red-100 text-red-800"; // inactive

  if (filteredAccounts.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-md p-8 text-center">
        <div className="text-gray-500 text-lg">
          {view === "all"
            ? "Không có tài khoản nào"
            : view === "shops"
            ? "Không có cửa hàng nào"
            : "Không có dữ liệu"}
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
                Loại
              </th>
              {view === "shops" && (
                <th className="w-[10%] px-2 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">
                  Cửa hàng
                </th>
              )}
              <th className="w-[20%] px-2 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">
                Ngày tạo
              </th>
              <th className="w-[15%] px-2 py-2 text-right text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">
                Hành động
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredAccounts.map((account) => {
              const status =
                view === "shops" && account.shopInfo
                  ? getStatusValue({ shopInfo: account.shopInfo })
                  : getStatusValue(account);
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
                            "https://upload.wikimedia.org/wikipedia/commons/7/7c/Profile_avatar_placeholder_large.png?20150327203541"
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
                      {status === "active" ? "Hoạt động" : "Ngừng"}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                    {view === "shops" && account.shopInfo ? "Shop" : "User"}
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
                      {view === "shops" &&
                        account?.shopInfo?.business_name &&
                        (account.shopInfo.is_active === true ||
                          account.shopInfo.isActive === true) && (
                          <button
                            onClick={async (e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              if (shopRemoving[account.id]) return;
                              const ok = window.confirm(
                                `Bạn có chắc muốn vô hiệu hóa shop của user #${account.id}?`
                              );
                              if (!ok) return;
                              try {
                                setShopRemoving((prev) => ({
                                  ...prev,
                                  [account.id]: true,
                                }));
                                const toastId = toast.loading(
                                  "Đang vô hiệu hóa shop..."
                                );
                                await deactivateShop(account.id);
                                toast.success("Đã vô hiệu hóa shop", {
                                  id: toastId,
                                });
                                if (typeof onShopRemoved === "function") {
                                  onShopRemoved(account.id);
                                }
                              } catch (e) {
                                toast.error(
                                  e?.response?.data?.message ||
                                    "Vô hiệu hóa shop thất bại"
                                );
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
                              ? "Đang xử lý..."
                              : "Vô hiệu hóa"}
                          </button>
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
