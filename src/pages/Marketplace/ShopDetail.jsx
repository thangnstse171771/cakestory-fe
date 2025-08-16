import { fetchIngredients as fetchIngredientsApi } from "../../api/ingredients";

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
    // eslint-disable-next-line
  }, []);

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

  if (loading || !shop) return <div>Đang tải...</div>;

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
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-xl text-pink-500">Phân tích Shop</h3>
            <button
              onClick={() => navigate("/marketplace/shop-analytics")}
              className="flex items-center gap-2 px-4 py-2 bg-pink-500 text-white rounded-lg hover:bg-pink-600 transition-colors shadow-md"
              style={{ boxShadow: "0 2px 8px 0 #f9a8d4" }}
            >
              <span role="img" aria-label="analytics">
                📊
              </span>
              Xem chi tiết phân tích
            </button>
          </div>
          <ShopAnalysticSummary />
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
