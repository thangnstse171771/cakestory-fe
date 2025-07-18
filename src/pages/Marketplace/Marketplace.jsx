import { ShoppingCart, Star, Heart, Search, Plus } from "lucide-react";
import { useState, useEffect } from "react";
import ProductsList from "./ProductsList";
import ShopsList from "./ShopsList";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import { fetchAllShops, fetchMarketplacePosts } from "../../api/axios";
import CreateMarketplacePost from "./CreateMarketplacePost";
import ShopDetail from "./ShopDetail";

const Marketplace = () => {
  const [view, setView] = useState("products"); // "products" or "shops" or "myshop"
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
            Marketplace
          </h1>
          <p className="text-gray-600">
            Discover amazing cakes from local bakers
          </p>
        </div>
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2 bg-white rounded-xl border px-4 py-2">
            <Search className="w-5 h-5 text-gray-400" />
            <span className="text-gray-500">Search marketplace</span>
          </div>
        </div>
      </div>

      <div className="flex space-x-4 mb-6">
        <button
          onClick={() => setView("products")}
          className={`px-6 py-2 rounded-lg font-medium transition-colors ${
            view === "products"
              ? "bg-pink-500 text-white"
              : "bg-gray-100 text-gray-600 hover:bg-gray-200"
          }`}
        >
          Products
        </button>
        <button
          onClick={() => setView("shops")}
          className={`px-6 py-2 rounded-lg font-medium transition-colors ${
            view === "shops"
              ? "bg-pink-500 text-white"
              : "bg-gray-100 text-gray-600 hover:bg-gray-200"
          }`}
        >
          Shops
        </button>
        {user && hasShop && (
          <button
            onClick={() => setView("myshop")}
            className={`px-6 py-2 rounded-lg font-medium transition-colors ${
              view === "myshop"
                ? "bg-pink-500 text-white"
                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            }`}
          >
            My Shop
          </button>
        )}
        {view === "shops" && !hasShop && (
          <button
            onClick={() => navigate("/marketplace/create-shop")}
            className="flex items-center gap-2 px-4 py-2 bg-pink-500 text-white rounded-lg hover:bg-pink-600 transition-colors shadow-md ml-auto"
          >
            <Plus className="w-5 h-5" />
            Create Shop
          </button>
        )}
      </div>

      {view === "products" && (
        <div className="flex justify-end mb-4">
          <button
            onClick={() => setShowCreate(true)}
            className="flex items-center gap-2 px-4 py-2 bg-pink-500 text-white rounded-lg hover:bg-pink-600 transition-colors shadow-md"
          >
            <Plus className="w-5 h-5" />
            Create Marketplace Post
          </button>
        </div>
      )}

      {view === "products" ? (
        loadingProducts ? (
          <div className="text-center py-12">Loading...</div>
        ) : errorProducts ? (
          <div className="text-center text-red-500 py-12">{errorProducts}</div>
        ) : (
          <ProductsList products={products} />
        )
      ) : view === "shops" ? (
        <ShopsList />
      ) : view === "myshop" && user && hasShop ? (
        <ShopDetail id={user.id} />
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
