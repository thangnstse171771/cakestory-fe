import React from "react";
import { deleteIngredient as deleteIngredientApi } from "../../api/ingredients";

const ToppingList = ({
  ingredients,
  loadingIngredients,
  isOwner,
  setShowAddIngredient,
  setEditIngredient,
  setDeleteIngredient,
  deleteIngredient,
  setLoadingDelete,
  loadingDelete,
  fetchIngredients,
  shop,
}) => {
  return (
    <div className="mt-12 mb-8">
      <div className="flex items-center justify-between mb-6 gap-2 flex-wrap">
        <div>
          <h3 className="font-bold text-2xl bg-gradient-to-r from-pink-600 to-rose-600 bg-clip-text text-transparent">
            Danh sách Topping
          </h3>
          <p className="text-gray-600 mt-1">
            Quản lý các loại topping cho cửa hàng của bạn
          </p>
        </div>
        {isOwner && (
          <button
            className="bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600 text-white font-semibold px-6 py-3 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 flex items-center gap-2"
            onClick={() => setShowAddIngredient(true)}
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M12 6v6m0 0v6m0-6h6m-6 0H6"
              />
            </svg>
            Thêm Topping
          </button>
        )}
      </div>

      {loadingIngredients ? (
        <div className="flex justify-center items-center py-12">
          <div className="relative">
            <div className="w-12 h-12 border-4 border-pink-200 border-t-pink-500 rounded-full animate-spin"></div>
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-6 h-6 bg-gradient-to-r from-pink-500 to-rose-500 rounded-full animate-pulse"></div>
            </div>
          </div>
        </div>
      ) : ingredients.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {ingredients.map((ing) => (
            <div
              key={ing.id}
              className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden group border border-gray-100 hover:border-pink-200"
            >
              {ing.image && (
                <div className="relative overflow-hidden">
                  <img
                    src={ing.image}
                    alt={ing.name}
                    className="w-full h-48 object-cover group-hover:scale-110 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                </div>
              )}

              <div className="p-6">
                <div className="mb-4">
                  <h4 className="font-bold text-xl text-gray-800 mb-2 line-clamp-1">
                    {ing.name}
                  </h4>
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-2xl font-bold bg-gradient-to-r from-pink-600 to-rose-600 bg-clip-text text-transparent">
                      {parseInt(ing.price).toLocaleString("vi-VN")} ₫
                    </span>
                  </div>
                  {ing.description && (
                    <p className="text-gray-600 text-sm line-clamp-2">
                      {ing.description}
                    </p>
                  )}
                </div>

                {isOwner && (
                  <div className="flex gap-2">
                    <button
                      className="flex-1 px-4 py-2 bg-blue-50 text-blue-600 font-semibold rounded-lg hover:bg-blue-100 transition-colors duration-300 flex items-center justify-center gap-2"
                      onClick={() => setEditIngredient(ing)}
                      title="Chỉnh sửa topping"
                    >
                      <svg
                        className="w-4 h-4"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                        />
                      </svg>
                      Sửa
                    </button>
                    <button
                      className="flex-1 px-4 py-2 bg-red-50 text-red-600 font-semibold rounded-lg hover:bg-red-100 transition-colors duration-300 flex items-center justify-center gap-2"
                      onClick={() => setDeleteIngredient(ing)}
                      title="Xóa topping"
                    >
                      <svg
                        className="w-4 h-4"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                        />
                      </svg>
                      Xóa
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <div className="mb-6">
            <svg
              className="w-20 h-20 text-gray-300 mx-auto"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="1"
                d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
              />
            </svg>
          </div>
          <h4 className="text-xl font-semibold text-gray-600 mb-2">
            Chưa có topping nào
          </h4>
          <p className="text-gray-500 mb-6">
            Hãy thêm topping đầu tiên để khách hàng có thể tùy chọn
          </p>
          {isOwner && (
            <button
              onClick={() => setShowAddIngredient(true)}
              className="px-6 py-3 bg-gradient-to-r from-pink-500 to-rose-500 text-white font-semibold rounded-xl hover:from-pink-600 hover:to-rose-600 transition-all duration-300 shadow-lg hover:shadow-xl"
            >
              ✨ Thêm Topping Đầu Tiên
            </button>
          )}
        </div>
      )}

      {/* Modal xác nhận xóa topping */}
      {deleteIngredient && (
        <div className="fixed inset-0 bg-gradient-to-br from-black/60 to-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md relative overflow-hidden">
            {/* Header */}
            <div className="bg-gradient-to-r from-red-500 to-rose-500 px-8 py-6">
              <div className="flex items-center">
                <svg
                  className="w-8 h-8 text-white mr-3"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.958-.833-2.728 0L4.086 16.5c-.77.833.192 2.5 1.732 2.5z"
                  />
                </svg>
                <div>
                  <h2 className="text-2xl font-bold text-white">
                    Xác nhận xóa
                  </h2>
                  <p className="text-red-100 text-sm mt-1">
                    Hành động này không thể hoàn tác
                  </p>
                </div>
              </div>
            </div>

            {/* Content */}
            <div className="p-8">
              <p className="text-gray-700 text-lg mb-6 leading-relaxed">
                Bạn có chắc chắn muốn xóa topping{" "}
                <span className="font-bold text-pink-600">
                  "{deleteIngredient.name}"
                </span>{" "}
                không?
              </p>

              <div className="flex gap-3">
                <button
                  className="flex-1 px-6 py-3 rounded-xl border-2 border-gray-300 text-gray-700 font-semibold hover:bg-gray-50 hover:border-gray-400 transition-all duration-300"
                  onClick={() => setDeleteIngredient(null)}
                  disabled={loadingDelete}
                >
                  Hủy bỏ
                </button>
                <button
                  className="flex-1 px-6 py-3 rounded-xl bg-gradient-to-r from-red-500 to-rose-500 text-white font-semibold hover:from-red-600 hover:to-rose-600 disabled:opacity-60 disabled:cursor-not-allowed transition-all duration-300 shadow-lg hover:shadow-xl"
                  onClick={async () => {
                    setLoadingDelete(true);
                    try {
                      await deleteIngredientApi(deleteIngredient.id);
                      setDeleteIngredient(null);
                      if (shop?.id) fetchIngredients(shop.id);
                    } catch (err) {
                      alert("Xóa topping thất bại!");
                    } finally {
                      setLoadingDelete(false);
                    }
                  }}
                  disabled={loadingDelete}
                >
                  {loadingDelete ? (
                    <div className="flex items-center justify-center">
                      <svg
                        className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                        fill="none"
                        viewBox="0 0 24 24"
                      >
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                        ></circle>
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        ></path>
                      </svg>
                      Đang xóa...
                    </div>
                  ) : (
                    "🗑️ Xóa topping"
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ToppingList;
