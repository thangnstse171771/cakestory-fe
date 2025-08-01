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
      <div className="flex items-center justify-between mb-4 gap-2 flex-wrap">
        <h3 className="font-bold text-xl text-pink-500">
          Danh sách Topping (Nguyên liệu)
        </h3>
        {isOwner && (
          <button
            className="bg-gradient-to-r from-pink-500 to-purple-400 hover:from-pink-600 hover:to-purple-500 text-white font-semibold px-6 py-2 rounded-lg shadow transition-all duration-200"
            onClick={() => setShowAddIngredient(true)}
          >
            + Thêm Topping
          </button>
        )}
      </div>
      {loadingIngredients ? (
        <div className="text-gray-400">Đang tải topping...</div>
      ) : ingredients.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {ingredients.map((ing) => (
            <div
              key={ing.id}
              className="bg-white rounded-xl shadow p-4 border border-pink-100 hover:shadow-lg transition-all duration-200"
            >
              <div className="flex items-center justify-between mb-3">
                <div className="flex-grow">
                  <div className="font-semibold text-gray-800 text-lg">
                    {ing.name}
                  </div>
                  <div className="text-gray-500 text-sm">
                    Giá:{" "}
                    <span className="text-pink-500 font-bold">
                      ${parseFloat(ing.price).toFixed(2)}
                    </span>
                  </div>
                </div>
                {ing.image && (
                  <div className="w-16 h-16 ml-3">
                    <img
                      src={ing.image}
                      alt={ing.name}
                      className="w-full h-full object-cover rounded-lg shadow-sm"
                    />
                  </div>
                )}
              </div>
              {ing.description && (
                <div className="text-gray-600 text-sm mb-3 line-clamp-2">
                  {ing.description}
                </div>
              )}
              {isOwner && (
                <div className="flex gap-2 justify-end mt-2">
                  <button
                    className="px-3 py-1 rounded bg-purple-100 hover:bg-purple-200 text-purple-700 font-semibold text-sm transition"
                    onClick={() => setEditIngredient(ing)}
                    title="Chỉnh sửa topping"
                  >
                    Sửa
                  </button>
                  <button
                    className="px-3 py-1 rounded bg-red-100 hover:bg-red-200 text-red-600 font-semibold text-sm transition"
                    onClick={() => setDeleteIngredient(ing)}
                    title="Xóa topping"
                  >
                    Xoá
                  </button>
                </div>
              )}
              {/* Modal xác nhận xoá topping */}
              {deleteIngredient && deleteIngredient.id === ing.id && (
                <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center">
                  <div className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-md relative">
                    <h2 className="text-xl font-bold mb-4 text-red-600">
                      Xác nhận xoá topping
                    </h2>
                    <p className="mb-6 text-gray-700">
                      Bạn có chắc chắn muốn xoá topping{" "}
                      <span className="font-semibold text-pink-500">
                        {deleteIngredient.name}
                      </span>
                      ?
                    </p>
                    <div className="flex gap-2 justify-end">
                      <button
                        className="px-4 py-2 rounded bg-gray-200 hover:bg-gray-300"
                        onClick={() => setDeleteIngredient(null)}
                        disabled={loadingDelete}
                      >
                        Huỷ
                      </button>
                      <button
                        className="px-4 py-2 rounded bg-red-500 text-white font-semibold hover:bg-red-600 disabled:opacity-60"
                        onClick={async () => {
                          setLoadingDelete(true);
                          try {
                            await deleteIngredientApi(deleteIngredient.id);
                            setDeleteIngredient(null);
                            if (shop?.id) fetchIngredients(shop.id);
                          } catch (err) {
                            alert("Xoá topping thất bại!");
                          } finally {
                            setLoadingDelete(false);
                          }
                        }}
                        disabled={loadingDelete}
                      >
                        {loadingDelete ? "Đang xoá..." : "Xoá"}
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      ) : (
        <div className="text-gray-400 italic">Chưa có topping nào.</div>
      )}
    </div>
  );
};

export default ToppingList;
