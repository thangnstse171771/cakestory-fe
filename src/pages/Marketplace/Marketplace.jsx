import { Star, Heart, Search, Plus } from "lucide-react";
import { useState, useEffect } from "react";
import ProductsList from "./ProductsList";
import ShopsList from "./ShopsList";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import { fetchAllShops, fetchMarketplacePosts } from "../../api/axios";
import CreateMarketplacePost from "./CreateMarketplacePost";

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

const Marketplace = () => {
  const [view, setView] = useState("products"); // "products" or "shops"
  const navigate = useNavigate();
  const { user } = useAuth();
  const [hasShop, setHasShop] = useState(false);
  const [products, setProducts] = useState([]);
  const [loadingProducts, setLoadingProducts] = useState(false);
  const [errorProducts, setErrorProducts] = useState("");
  const [showCreate, setShowCreate] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true); // Loading toàn bộ trang

  useEffect(() => {
    const initializePage = async () => {
      setInitialLoading(true);
      try {
        // Load user shop status
        if (user) {
          const data = await fetchAllShops();
          setHasShop(
            (data.shops || []).some((shop) => shop.user_id === user.id)
          );
        }

        // Load initial products
        setLoadingProducts(true);
        setErrorProducts("");
        const productsData = await fetchMarketplacePosts();
        setProducts(productsData.posts || []);
      } catch (error) {
        setErrorProducts("Failed to load marketplace products.");
      } finally {
        setLoadingProducts(false);
        // Delay để loading animation hiển thị đủ lâu
        setTimeout(() => {
          setInitialLoading(false);
        }, 1500);
      }
    };

    initializePage();
  }, [user]);

  useEffect(() => {
    if (view !== "products" || initialLoading) return;
    setLoadingProducts(true);
    setErrorProducts("");
    fetchMarketplacePosts()
      .then((data) => setProducts(data.posts || []))
      .catch(() => setErrorProducts("Failed to load marketplace products."))
      .finally(() => setLoadingProducts(false));
  }, [view, initialLoading]);

  return (
    <div className="px-4 sm:px-6 lg:px-8">
      {initialLoading ? (
        // Full Page Loading
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
              Đang tải Khu Mua Sắm...
            </h2>
            <p className="text-gray-500 text-lg">
              Chúng tôi đang chuẩn bị những chiếc bánh tuyệt vời cho bạn
            </p>
          </div>

          {/* Header Skeleton */}
          <div className="space-y-6">
            <div className="flex items-start justify-between">
              <div className="space-y-3">
                <div className="w-48 h-8 bg-gray-200 rounded animate-pulse"></div>
                <div className="w-96 h-5 bg-gray-200 rounded animate-pulse"></div>
              </div>
              <div className="w-32 h-12 bg-gray-200 rounded-xl animate-pulse"></div>
            </div>

            {/* Tabs Skeleton */}
            <div className="flex items-center gap-4">
              <div className="w-24 h-10 bg-gray-200 rounded-lg animate-pulse"></div>
              <div className="w-24 h-10 bg-gray-200 rounded-lg animate-pulse"></div>
            </div>
          </div>

          {/* Skeleton Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {[...Array(8)].map((_, index) => (
              <div
                key={index}
                className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-gray-100 overflow-hidden"
              >
                <div className="relative h-56 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 animate-pulse">
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent opacity-30 transform -skew-x-12 animate-shimmer"></div>
                  <div className="absolute top-3 left-3 w-16 h-6 bg-gray-300 rounded-full animate-pulse"></div>
                  <div className="absolute top-3 right-3 w-20 h-6 bg-gray-300 rounded-full animate-pulse"></div>
                </div>
                <div className="p-6 space-y-4">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-gray-200 rounded-full animate-pulse"></div>
                    <div className="w-24 h-4 bg-gray-200 rounded animate-pulse"></div>
                  </div>
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
      ) : (
        // Main Content after loading
        <>
          <div className="flex items-start justify-between mb-6 gap-3">
            <div>
              <h1 className="text-2xl font-bold text-pink-600 mb-2 text-left">
                Khu Mua Sắm
              </h1>
              <p className="text-gray-600">
                Khám phá những chiếc bánh tuyệt vời từ các thợ làm bánh địa
                phương
              </p>
            </div>
            {user && user.role !== "admin" && !hasShop && (
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
              <div className="text-center py-12">
                <div className="inline-flex items-center justify-center w-16 h-16 mb-4">
                  <div className="relative">
                    <div className="w-16 h-16 border-4 border-pink-200 rounded-full animate-spin">
                      <div className="absolute top-0 left-0 w-16 h-16 border-4 border-transparent border-t-pink-500 rounded-full animate-spin"></div>
                    </div>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="w-2 h-2 bg-pink-500 rounded-full animate-pulse"></div>
                    </div>
                  </div>
                </div>
                <h3 className="text-lg font-semibold text-gray-700 mb-2">
                  Đang tải sản phẩm...
                </h3>
              </div>
            ) : errorProducts ? (
              <div className="text-center text-red-500 py-12">
                {errorProducts}
              </div>
            ) : (
              <ProductsList products={products} isOwnShop={false} />
            )
          ) : view === "shops" ? (
            <ShopsList />
          ) : null}
        </>
      )}

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
