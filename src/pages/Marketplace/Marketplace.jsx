import { Star, Heart, Search, Plus } from "lucide-react";
import { useState, useEffect } from "react";
import ProductsList from "./ProductsList";
import ShopsList from "./ShopsList";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import { fetchAllShops, fetchMarketplacePosts } from "../../api/axios";
import CreateMarketplacePost from "./CreateMarketplacePost";

const Marketplace = () => {
  const [view, setView] = useState("products"); // "products" or "shops"
  const navigate = useNavigate();
  const { user } = useAuth();
  const [hasShop, setHasShop] = useState(false);
  const [products, setProducts] = useState([]);
  const [loadingProducts, setLoadingProducts] = useState(false);
  const [errorProducts, setErrorProducts] = useState("");
  const [showCreate, setShowCreate] = useState(false);

  useEffect(() => {
    const checkUserShop = async () => {
      if (!user) return;
      const data = await fetchAllShops();
      setHasShop((data.shops || []).some((shop) => shop.user_id === user.id));
    };
    checkUserShop();
  }, [user]);

  useEffect(() => {
    if (view !== "products") return;
    setLoadingProducts(true);
    setErrorProducts("");
    fetchMarketplacePosts()
      .then((data) => setProducts(data.posts || []))
      .catch(() => setErrorProducts("Failed to load marketplace products."))
      .finally(() => setLoadingProducts(false));
  }, [view]);

  return (
    <div className="px-4 sm:px-6 lg:px-8">
      <div className="flex items-start justify-between mb-6 gap-3">
        <div>
          <h1 className="text-2xl font-bold text-pink-600 mb-2 text-left">
            Khu Mua Sắm
          </h1>
          <p className="text-gray-600">
            Khám phá những chiếc bánh tuyệt vời từ các thợ làm bánh địa phương
          </p>
        </div>
        {/* Nút Tạo Cửa Hàng - đặt ở góc phải */}
        {user && !hasShop && (
          <button
            onClick={() => navigate("/marketplace/create-shop")}
            className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-pink-500 to-pink-600 text-white rounded-xl hover:from-pink-600 hover:to-pink-700 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 font-medium"
          >
            <Plus className="w-5 h-5" />
            Tạo Cửa Hàng
          </button>
        )}
      </div>

      <div className="flex items-center mb-6">
        <div className="flex items-center gap-4">
          <button
            onClick={() => setView("products")}
            className={`px-6 py-2 rounded-lg font-medium transition-colors ${
              view === "products"
                ? "bg-pink-500 text-white"
                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            }`}
          >
            Sản phẩm
          </button>
          <button
            onClick={() => setView("shops")}
            className={`px-6 py-2 rounded-lg font-medium transition-colors ${
              view === "shops"
                ? "bg-pink-500 text-white"
                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            }`}
          >
            Cửa hàng
          </button>
        </div>
        <div className="flex-1" />
      </div>

      {view === "products" ? (
        loadingProducts ? (
          <div className="text-center py-12">Đang tải...</div>
        ) : errorProducts ? (
          <div className="text-center text-red-500 py-12">{errorProducts}</div>
        ) : (
          <ProductsList products={products} isOwnShop={false} />
        )
      ) : view === "shops" ? (
        <ShopsList />
      ) : null}

      <CreateMarketplacePost
        isOpen={showCreate}
        onClose={() => setShowCreate(false)}
        onCreate={() => {
          setShowCreate(false);
          setLoadingProducts(true);
          setErrorProducts("");
          fetchMarketplacePosts()
            .then((data) => setProducts(data.posts || []))
            .catch(() =>
              setErrorProducts("Failed to load marketplace products.")
            )
            .finally(() => setLoadingProducts(false));
        }}
      />
    </div>
  );
};

export default Marketplace;
