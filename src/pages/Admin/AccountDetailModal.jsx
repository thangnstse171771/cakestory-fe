import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { fetchShopByUserId, deactivateShop } from "../../api/axios";

const AccountDetailModal = ({
  showModal,
  selectedAccount,
  modalLoading,
  onClose,
  getStatusValue,
  getIsPremium,
  getIsBaker,
}) => {
  const [shopInfo, setShopInfo] = useState(null);
  const [shopLoading, setShopLoading] = useState(false);
  const [deactivating, setDeactivating] = useState(false);
  const [actionError, setActionError] = useState("");
  const [actionSuccess, setActionSuccess] = useState("");

  useEffect(() => {
    if (showModal && selectedAccount && getIsBaker(selectedAccount)) {
      setShopLoading(true);
      fetchShopByUserId(selectedAccount.id)
        .then((data) => setShopInfo(data.shop))
        .catch(() => setShopInfo(null))
        .finally(() => setShopLoading(false));
    } else {
      setShopInfo(null);
    }
  }, [showModal, selectedAccount, getIsBaker]);

  if (!showModal || !selectedAccount) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-30">
      <div className="bg-white rounded-2xl shadow-2xl p-0 w-full max-w-xl relative animate-fadeIn">
        <button
          className="absolute top-4 right-6 text-gray-400 hover:text-pink-500 text-2xl font-bold"
          onClick={onClose}
          aria-label="Đóng"
        >
          ×
        </button>
        {modalLoading ? (
          <div className="flex flex-col items-center justify-center py-16">
            <div className="w-8 h-8 border-4 border-pink-200 border-t-pink-500 rounded-full animate-spin mb-4"></div>
            <span className="text-pink-500 font-semibold">
              Đang tải thông tin...
            </span>
          </div>
        ) : (
          <div className="p-8">
            <h2 className="text-3xl font-extrabold text-pink-600 text-center mb-8 tracking-tight">
              Chi tiết tài khoản
            </h2>
            {/* Account Info Card */}
            <div className="bg-pink-50 rounded-xl shadow p-6 mb-6">
              <div className="flex items-center justify-between mb-4">
                <span className="font-semibold text-gray-700">ID:</span>
                <span className="text-gray-900">{selectedAccount.id}</span>
              </div>
              <div className="flex items-center justify-between mb-4">
                <span className="font-semibold text-gray-700">
                  Tên người dùng:
                </span>
                <span className="text-gray-900">
                  {selectedAccount.username}
                </span>
              </div>
              <div className="flex items-center justify-between mb-4">
                <span className="font-semibold text-gray-700">Email:</span>
                <span className="text-gray-900">{selectedAccount.email}</span>
              </div>
              <div className="flex items-center justify-between mb-4">
                <span className="font-semibold text-gray-700">Họ và tên:</span>
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
                <span className="font-semibold text-gray-700">Ngày tạo:</span>
                <span className="text-gray-900">
                  {selectedAccount.createdAt}
                </span>
              </div>
              <div className="flex items-center justify-between mb-4">
                <span className="font-semibold text-gray-700">
                  Cập nhật lúc:
                </span>
                <span className="text-gray-900">
                  {selectedAccount.updatedAt}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="font-semibold text-gray-700">Trạng thái:</span>
                <span>
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-semibold mr-2 ${
                      getStatusValue(selectedAccount) === "active"
                        ? "bg-green-100 text-green-800"
                        : "bg-red-100 text-red-800"
                    }`}
                  >
                    {getStatusValue(selectedAccount) === "active"
                      ? "Hoạt động"
                      : "Bị hạn chế"}
                  </span>
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-semibold ${
                      getIsPremium(selectedAccount)
                        ? "bg-yellow-100 text-yellow-800"
                        : "bg-gray-100 text-gray-800"
                    }`}
                  >
                    {getIsPremium(selectedAccount) ? "Premium" : "Thường"}
                  </span>
                </span>
              </div>
            </div>
            {/* Shop Info Card */}
            {getIsBaker(selectedAccount) && (
              <div className="bg-white border border-pink-200 rounded-xl shadow p-6">
                <h3 className="text-xl font-bold text-pink-500 mb-4 text-center">
                  Thông tin cửa hàng
                </h3>
                {shopLoading ? (
                  <div className="text-center text-pink-400">
                    Đang tải thông tin cửa hàng...
                  </div>
                ) : shopInfo ? (
                  <>
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-semibold text-gray-700">
                        Tên cửa hàng:
                      </span>
                      <span className="text-gray-900">
                        {shopInfo.business_name || (
                          <span className="italic text-gray-400">
                            Chưa có tên cửa hàng
                          </span>
                        )}
                      </span>
                    </div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-semibold text-gray-700">
                        Địa chỉ:
                      </span>
                      <span className="text-gray-900">
                        {shopInfo.business_address || (
                          <span className="italic text-gray-400">
                            Chưa có địa chỉ
                          </span>
                        )}
                      </span>
                    </div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-semibold text-gray-700">
                        Số điện thoại:
                      </span>
                      <span className="text-gray-900">
                        {shopInfo.phone_number || (
                          <span className="italic text-gray-400">
                            Chưa có SĐT
                          </span>
                        )}
                      </span>
                    </div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-semibold text-gray-700">
                        Chuyên môn:
                      </span>
                      <span className="text-gray-900">
                        {shopInfo.specialty || (
                          <span className="italic text-gray-400">
                            Chưa có chuyên môn
                          </span>
                        )}
                      </span>
                    </div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-semibold text-gray-700">Bio:</span>
                      <span className="text-gray-900">
                        {shopInfo.bio || (
                          <span className="italic text-gray-400">
                            Chưa có bio
                          </span>
                        )}
                      </span>
                    </div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-semibold text-gray-700">
                        Hoạt động:
                      </span>
                      <span className="text-gray-900">
                        {shopInfo.is_active ? "Có" : "Không"}
                      </span>
                    </div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-semibold text-gray-700">
                        Kinh độ:
                      </span>
                      <span className="text-gray-900">
                        {shopInfo.longitude ?? "N/A"}
                      </span>
                    </div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-semibold text-gray-700">
                        Vĩ độ:
                      </span>
                      <span className="text-gray-900">
                        {shopInfo.latitude ?? "N/A"}
                      </span>
                    </div>

                    {/* Actions: view shop and deactivate */}
                    <div className="mt-4 flex items-center justify-end gap-3">
                      {selectedAccount?.id && (
                        <Link
                          to={`/marketplace/shop/${selectedAccount.id}`}
                          className="inline-flex items-center px-4 py-2 rounded-lg bg-indigo-50 text-indigo-700 hover:bg-indigo-100 text-sm font-medium"
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          Xem shop
                        </Link>
                      )}
                      <button
                        type="button"
                        disabled={deactivating || shopInfo?.is_active === false}
                        onClick={async () => {
                          try {
                            setActionError("");
                            setActionSuccess("");
                            setDeactivating(true);
                            await deactivateShop(selectedAccount.id);
                            setActionSuccess("Đã vô hiệu hóa cửa hàng");
                            // Optimistic update
                            setShopInfo((prev) =>
                              prev ? { ...prev, is_active: false } : prev
                            );
                          } catch (e) {
                            setActionError(
                              e?.response?.data?.message ||
                                e?.message ||
                                "Không thể vô hiệu hóa cửa hàng"
                            );
                          } finally {
                            setDeactivating(false);
                          }
                        }}
                        className={`inline-flex items-center px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                          shopInfo?.is_active === false
                            ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                            : "bg-red-50 text-red-700 hover:bg-red-100"
                        }`}
                      >
                        {deactivating
                          ? "Đang vô hiệu hóa..."
                          : "Vô hiệu hóa shop"}
                      </button>
                    </div>

                    {(actionError || actionSuccess) && (
                      <div className="mt-3 text-sm">
                        {actionError && (
                          <div className="text-red-600">{actionError}</div>
                        )}
                        {actionSuccess && (
                          <div className="text-green-600">{actionSuccess}</div>
                        )}
                      </div>
                    )}
                  </>
                ) : (
                  <div className="text-center text-gray-400 italic">
                    Không có thông tin cửa hàng
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default AccountDetailModal;
