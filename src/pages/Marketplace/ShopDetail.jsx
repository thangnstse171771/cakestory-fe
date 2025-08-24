import { fetchIngredients as fetchIngredientsApi } from "../../api/ingredients";

// Add shimmer animation styles
const shimmerStyles = `
  @keyframes shimmer {
    0% {
      transform: translateX(-100%) skewX(-12deg);
    }
    100% {
      transform: translateX(200%) skewX(-12deg);
    }
  }
  .animate-shimmer {
    animation: shimmer 2s infinite;
  }
`;

// Insert styles into document head
if (typeof document !== "undefined") {
  const styleSheet = document.createElement("style");
  styleSheet.type = "text/css";
  styleSheet.innerText = shimmerStyles;
  document.head.appendChild(styleSheet);
}

// Import the components we've extracted into separate files
import {
  ShopHeader,
  ShopGallery,
  ShopServices,
  ToppingList,
  IngredientModal,
  UpdateShopModal,
  DeletePostPopup,
} from "../../components/ShopDetail";

// Components have been moved to separate files
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import ShopAnalysticSummary from "./ShopAnalysticSummary";
import { Star } from "lucide-react";
import { useParams } from "react-router-dom";
import {
  fetchShopByUserId,
  fetchMarketplacePosts,
  deleteMarketplacePost,
} from "../../api/axios";
import { useAuth } from "../../contexts/AuthContext";
import { storage } from "../../firebase";
import CreateMarketplacePost from "./CreateMarketplacePost";

// All modals have been moved to separate components

const ShopDetail = ({ id: propId }) => {
  const navigate = useNavigate();
  const params = useParams();
  const id = propId || params.id;
  const { user } = useAuth();
  const [shop, setShop] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showUpdate, setShowUpdate] = useState(false);
  const [showCreate, setShowCreate] = useState(false);
  const [products, setProducts] = useState([]);
  const [editProduct, setEditProduct] = useState(null);
  const [deleteProduct, setDeleteProduct] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [showMenu, setShowMenu] = useState(null);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [showAddIngredient, setShowAddIngredient] = useState(false);
  const [editIngredient, setEditIngredient] = useState(null);
  const [ingredients, setIngredients] = useState([]);
  const [loadingIngredients, setLoadingIngredients] = useState(false);
  const [deleteIngredient, setDeleteIngredient] = useState(null);
  const [loadingDelete, setLoadingDelete] = useState(false);

  // Reset state when id changes to avoid showing stale data
  useEffect(() => {
    setShop(null);
    setProducts([]);
    setIngredients([]);
    setShowUpdate(false);
    setShowCreate(false);
    setEditProduct(null);
    setDeleteProduct(null);
    setShowMenu(null);
    setSelectedProduct(null);
    setShowAddIngredient(false);
    setEditIngredient(null);
    setDeleteIngredient(null);
  }, [id]);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const data = await fetchShopByUserId(id);
        // Lấy sản phẩm của shop này
        const postsData = await fetchMarketplacePosts();
        const shopProducts = (postsData.posts || []).filter(
          (p) => p.shop_id === data.shop.shop_id
        );
        setShop({
          id: data.shop.shop_id,
          avatar: data.shop.avatar_image || data.shop.image_url || "",
          name: data.shop.business_name,
          bio: data.shop.bio,
          phone_number: data.shop.phone_number,
          specialty: data.shop.specialty,
          business_address:
            data.shop.business_address || data.shop.location || "",
          business_hours: data.shop.business_hours,
          delivery_area: data.shop.delivery_area,
          latitude: data.shop.latitude,
          longitude: data.shop.longitude,
          is_active: data.shop.is_active,
          background_image: data.shop.background_image,
          user: data.shop.user,
          services: shopProducts,
        });
        setProducts(shopProducts);
        // Lấy topping
        fetchIngredients(data.shop.shop_id);
      } catch (err) {
        setShop(null);
        setProducts([]);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id]);

  // Hàm lấy topping
  const fetchIngredients = async (shopId) => {
    setLoadingIngredients(true);
    try {
      const data = await fetchIngredientsApi(shopId);
      setIngredients(data.ingredients || []);
    } catch (err) {
      setIngredients([]);
    } finally {
      setLoadingIngredients(false);
    }
  };

  if (loading || !shop) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-pink-50 to-white px-4 py-6">
        <div className="space-y-8">
          {/* Loading Header */}
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-20 h-20 mb-6">
              <div className="relative">
                <div className="w-20 h-20 border-4 border-pink-200 rounded-full animate-spin">
                  <div className="absolute top-0 left-0 w-20 h-20 border-4 border-transparent border-t-pink-500 rounded-full animate-spin"></div>
                </div>
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-3 h-3 bg-pink-500 rounded-full animate-pulse"></div>
                </div>
              </div>
            </div>
            <h2 className="text-2xl font-bold text-gray-700 mb-3">
              Đang tải cửa hàng...
            </h2>
            <p className="text-gray-500 text-lg">
              Chúng tôi đang chuẩn bị thông tin cửa hàng cho bạn
            </p>
          </div>

          {/* Shop Header Skeleton */}
          <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
            {/* Background skeleton */}
            <div className="relative h-48 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 animate-pulse">
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent opacity-30 transform -skew-x-12 animate-shimmer"></div>
              {/* Avatar skeleton */}
              <div className="absolute -bottom-16 left-8">
                <div className="w-32 h-32 rounded-full border-4 border-white shadow-lg bg-gray-200 animate-pulse"></div>
              </div>
            </div>

            {/* Shop info skeleton */}
            <div className="pt-20 pb-6 px-8 space-y-4">
              <div className="space-y-2">
                <div className="w-48 h-6 bg-gray-200 rounded animate-pulse"></div>
                <div className="w-64 h-4 bg-gray-200 rounded animate-pulse"></div>
              </div>
              <div className="flex items-center gap-4">
                <div className="w-20 h-4 bg-gray-200 rounded animate-pulse"></div>
                <div className="w-24 h-4 bg-gray-200 rounded animate-pulse"></div>
              </div>
              <div className="flex gap-2">
                <div className="w-24 h-10 bg-gray-200 rounded-lg animate-pulse"></div>
                <div className="w-32 h-10 bg-gray-200 rounded-lg animate-pulse"></div>
              </div>
            </div>
          </div>

          {/* Products Grid Skeleton */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {[...Array(8)].map((_, index) => (
              <div
                key={index}
                className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden"
              >
                <div className="relative h-56 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 animate-pulse">
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent opacity-30 transform -skew-x-12 animate-shimmer"></div>
                  <div className="absolute top-3 left-3 w-16 h-6 bg-gray-300 rounded-full animate-pulse"></div>
                  <div className="absolute top-3 right-3 w-20 h-6 bg-gray-300 rounded-full animate-pulse"></div>
                </div>
                <div className="p-6 space-y-4">
                  <div className="space-y-2">
                    <div className="w-full h-5 bg-gray-200 rounded animate-pulse"></div>
                    <div className="w-3/4 h-5 bg-gray-200 rounded animate-pulse"></div>
                  </div>
                  <div className="flex justify-between items-end">
                    <div className="space-y-1">
                      <div className="w-20 h-6 bg-gray-200 rounded animate-pulse"></div>
                      <div className="w-16 h-3 bg-gray-200 rounded animate-pulse"></div>
                    </div>
                    <div className="w-16 h-3 bg-gray-200 rounded animate-pulse"></div>
                  </div>
                  <div className="flex justify-between pt-2">
                    <div className="w-20 h-8 bg-gray-200 rounded-lg animate-pulse"></div>
                    <div className="w-16 h-8 bg-gray-200 rounded-lg animate-pulse"></div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Loading Animation Bars */}
          <div className="flex justify-center space-x-2">
            {[...Array(5)].map((_, i) => (
              <div
                key={i}
                className="w-3 h-10 bg-pink-300 rounded-full animate-pulse"
                style={{
                  animationDelay: `${i * 0.15}s`,
                  animationDuration: "1.2s",
                }}
              ></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  const isOwner = user && String(user.id) === String(shop.user?.id);

  return (
    <div className="min-h-screen bg-gradient-to-b from-pink-50 to-white px-4 py-6">
      {/* Shop Header Component */}
      <ShopHeader
        shop={shop}
        isOwner={isOwner}
        onUpdateClick={() => setShowUpdate(true)}
        onCreateClick={() => setShowCreate(true)}
      />

      {/* Gallery Component */}
      <ShopGallery shopId={shop.id} shopUserId={id} isOwner={isOwner} />

      {/* Shop Analytics Summary Component */}
      {isOwner && (
        <div className="mb-8">
          <div className="bg-white rounded-2xl shadow-lg border border-pink-100 overflow-hidden">
            <div className="bg-gradient-to-r from-pink-500 to-rose-500 px-6 py-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-bold text-xl text-white flex items-center gap-2">
                    <span>📊</span>
                    Phân tích Shop
                  </h3>
                  <p className="text-pink-100 text-sm mt-1">
                    Tổng quan hiệu suất cửa hàng của bạn
                  </p>
                </div>
                <button
                  onClick={() => navigate("/marketplace/shop-analytics")}
                  className="flex items-center gap-2 px-4 py-2 bg-white/20 text-white rounded-lg hover:bg-white/30 transition-colors shadow-md backdrop-blur-sm border border-white/30"
                >
                  <span role="img" aria-label="analytics">
                    �
                  </span>
                  Xem chi tiết
                </button>
              </div>
            </div>
            <div className="p-6">
              <ShopAnalysticSummary />
            </div>
          </div>
        </div>
      )}

      {/* Our Services Component */}
      <ShopServices
        services={shop.services}
        isOwner={isOwner}
        onEdit={setEditProduct}
        onDelete={setDeleteProduct}
        showMenu={showMenu}
        setShowMenu={setShowMenu}
        shopUserId={id}
      />
      <UpdateShopModal
        open={showUpdate}
        onClose={() => setShowUpdate(false)}
        shop={shop}
        userId={id}
        onUpdated={() => setShowUpdate(false)}
      />
      {/* Removed CakeCard modal */}
      {/* Modal thêm topping */}
      <IngredientModal
        open={showAddIngredient}
        onClose={() => setShowAddIngredient(false)}
        onAdded={() => {
          if (shop?.id) fetchIngredients(shop.id);
        }}
        isEdit={false}
      />
      <IngredientModal
        open={!!editIngredient}
        onClose={() => setEditIngredient(null)}
        onAdded={() => {
          if (shop?.id) fetchIngredients(shop.id);
        }}
        initialData={editIngredient}
        isEdit={true}
      />
      <CreateMarketplacePost
        isOpen={showCreate}
        onClose={() => setShowCreate(false)}
        onCreate={async (newPost) => {
          setShowCreate(false);
          if (newPost) {
            setProducts((prev) => [...prev, newPost]);
            setShop((prev) => ({
              ...prev,
              services: [...prev.services, newPost],
            }));
          }
        }}
      />
      {/* Popup sửa sản phẩm */}
      {editProduct && (
        <CreateMarketplacePost
          isOpen={!!editProduct}
          onClose={() => setEditProduct(null)}
          onCreate={async (updatedPost) => {
            setEditProduct(null);
            if (updatedPost) {
              setProducts((prev) =>
                prev.map((p) =>
                  p.post_id === updatedPost.post_id ? updatedPost : p
                )
              );
              setShop((prev) => ({
                ...prev,
                services: prev.services.map((p) =>
                  p.post_id === updatedPost.post_id ? updatedPost : p
                ),
              }));
            }
          }}
          initialData={editProduct}
          isEdit={true}
        />
      )}
      {/* Popup xác nhận xóa */}
      <DeletePostPopup
        isOpen={!!deleteProduct}
        onClose={() => setDeleteProduct(null)}
        onDelete={async () => {
          setDeleteLoading(true);
          try {
            await deleteMarketplacePost(deleteProduct.post_id);
            setProducts((prev) =>
              prev.filter((p) => p.post_id !== deleteProduct.post_id)
            );
            setShop((prev) => ({
              ...prev,
              services: prev.services.filter(
                (p) => p.post_id !== deleteProduct.post_id
              ),
            }));
            setDeleteProduct(null);
          } catch (err) {
            alert("Xóa sản phẩm thất bại!");
          } finally {
            setDeleteLoading(false);
          }
        }}
        loading={deleteLoading}
      />

      {/* Topping List Component */}
      <ToppingList
        ingredients={ingredients}
        isOwner={isOwner}
        loadingIngredients={loadingIngredients}
        setShowAddIngredient={setShowAddIngredient}
        setEditIngredient={setEditIngredient}
        setDeleteIngredient={setDeleteIngredient}
        deleteIngredient={deleteIngredient}
        setLoadingDelete={setLoadingDelete}
        loadingDelete={loadingDelete}
        fetchIngredients={fetchIngredients}
        shop={shop}
      />
    </div>
  );
};

export default ShopDetail;
