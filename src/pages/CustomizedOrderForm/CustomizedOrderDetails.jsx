import { useState, useEffect } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { ArrowLeft, Plus, Minus, Wallet } from "lucide-react";
import { fetchIngredients } from "../../api/ingredients";
import { createCakeOrder } from "../../api/cakeOrder";
import { useAuth } from "../../contexts/AuthContext";
import { toast, ToastContainer } from "react-toastify";
import { fetchWalletBalance } from "../../api/axios";
import "react-toastify/dist/ReactToastify.css";

export default function CakeShop() {
  const { shopId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();

  // State for ingredients/toppings from API
  const [ingredients, setIngredients] = useState([]);
  const [loadingIngredients, setLoadingIngredients] = useState(true);
  const [errorIngredients, setErrorIngredients] = useState("");

  // State for product data from marketplace
  const [productData, setProductData] = useState(null);
  const [selectedSize, setSelectedSize] = useState("");
  const [availableSizes, setAvailableSizes] = useState([]);

  // State for checkout process
  const [isCheckingOut, setIsCheckingOut] = useState(false);

  // State for wallet balance
  const [walletBalance, setWalletBalance] = useState(0);
  const [loadingBalance, setLoadingBalance] = useState(true);

  // Mock data cho bánh kem dâu - sẽ được thay thế bằng data từ shop
  const mockCake = {
    id: 1,
    name: "Bánh Kem Dâu",
    description:
      "Bánh kem tươi với lớp phủ socola trắng, trang trí cherry và socola chips thơm ngon",
    basePrice: 200000,
    category: "Bánh sinh nhật",
    image: "/cake-strawberry.jpg",
    toppings: ingredients, // Sử dụng ingredients từ API
  };

  const [cake, setCake] = useState(mockCake);
  const [quantity, setQuantity] = useState(1);
  const [selectedToppings, setSelectedToppings] = useState([]);

  // Get product data from navigation state
  useEffect(() => {
    const navProductData = location.state?.productData;
    if (navProductData) {
      setProductData(navProductData);

      // Set up cake sizes - sort by price from low to high
      const sizes = navProductData.cakeSizes || [];
      const sortedSizes = [...sizes].sort(
        (a, b) => parseFloat(a.price) - parseFloat(b.price)
      );
      setAvailableSizes(sortedSizes);

      // Set default selected size to lowest price size
      if (sortedSizes.length > 0) {
        setSelectedSize(sortedSizes[0].size);
      }

      // Update cake data with product info
      setCake({
        id: navProductData.post_id || navProductData.id,
        name: navProductData.post?.title || navProductData.title || "Bánh Kem",
        description:
          navProductData.post?.description ||
          navProductData.description ||
          "Bánh thơm ngon được làm thủ công",
        basePrice:
          sortedSizes.length > 0 ? parseFloat(sortedSizes[0].price) : 200000,
        category: "Bánh đặc biệt",
        image:
          navProductData.post?.media?.[0]?.image_url || "/cake-strawberry.jpg",
        toppings: ingredients,
      });
    }
  }, [location.state, ingredients]);

  // Fetch ingredients when component mounts or shopId changes
  useEffect(() => {
    const loadIngredients = async () => {
      if (!shopId) return;

      setLoadingIngredients(true);
      setErrorIngredients("");

      try {
        console.log("Fetching ingredients for shop:", shopId);
        const data = await fetchIngredients(shopId);
        console.log("Ingredients data:", data);
        console.log("Raw ingredients array:", data.ingredients || data);

        // Transform ingredients data to match toppings structure
        const transformedIngredients = (data.ingredients || data || []).map(
          (ingredient) => {
            console.log("Processing ingredient:", ingredient);
            return {
              id: ingredient.id,
              name: ingredient.name,
              price: ingredient.price,
              description: ingredient.description,
              image: ingredient.image,
            };
          }
        );

        console.log("Transformed ingredients:", transformedIngredients);
        setIngredients(transformedIngredients);

        // Update cake data with new ingredients
        setCake((prev) => ({
          ...prev,
          toppings: transformedIngredients,
        }));
      } catch (error) {
        console.error("Error fetching ingredients:", error);
        setErrorIngredients("Không thể tải ingredients cho shop này");
      } finally {
        setLoadingIngredients(false);
      }
    };

    loadIngredients();
  }, [shopId]);

  // Fetch wallet balance when component mounts
  useEffect(() => {
    const loadWalletBalance = async () => {
      if (!user) {
        setLoadingBalance(false);
        return;
      }

      try {
        setLoadingBalance(true);
        const response = await fetchWalletBalance();
        setWalletBalance(response.balance || 0);
      } catch (error) {
        console.error("Error fetching wallet balance:", error);
        setWalletBalance(0);
      } finally {
        setLoadingBalance(false);
      }
    };

    loadWalletBalance();
  }, [user]);

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(amount);
  };

  const handleToppingChange = (topping, newQuantity) => {
    const numQuantity = Number.parseInt(newQuantity) || 0;

    if (numQuantity <= 0) {
      setSelectedToppings(selectedToppings.filter((t) => t.id !== topping.id));
    } else {
      const existingIndex = selectedToppings.findIndex(
        (t) => t.id === topping.id
      );
      if (existingIndex >= 0) {
        const updated = [...selectedToppings];
        updated[existingIndex] = { ...topping, quantity: numQuantity };
        setSelectedToppings(updated);
      } else {
        setSelectedToppings([
          ...selectedToppings,
          { ...topping, quantity: numQuantity },
        ]);
      }
    }
  };

  const getTotalPrice = () => {
    // Get price for selected size
    const selectedSizeData = availableSizes.find(
      (s) => s.size === selectedSize
    );
    const sizePrice = selectedSizeData
      ? parseFloat(selectedSizeData.price)
      : cake.basePrice;

    const basePrice = sizePrice * quantity;
    const toppingsPrice =
      selectedToppings.reduce(
        (sum, topping) => sum + topping.price * topping.quantity,
        0
      ) * quantity;
    return basePrice + toppingsPrice;
  };

  const handleDirectCheckout = async () => {
    if (!user) {
      alert("Vui lòng đăng nhập để đặt hàng!");
      return;
    }

    if (!selectedSize) {
      alert("Vui lòng chọn kích thước bánh!");
      return;
    }

    setIsCheckingOut(true);

    try {
      // Prepare order data according to API schema
      const orderData = {
        customer_id: user.id,
        shop_id: parseInt(shopId),
        marketplace_post_id: productData?.post_id || productData?.id || 0,
        base_price: getTotalPrice(), // Total price including cake and toppings
        size: selectedSize,
        status: "pending",
        special_instructions: "string",
        order_details: selectedToppings.map((topping) => ({
          ingredient_id: topping.id,
          quantity: topping.quantity,
        })),
      };

      console.log("Sending order data:", orderData);

      const response = await createCakeOrder(orderData);

      toast.success("Đặt hàng thành công!", {
        position: "top-right",
        autoClose: 3000,
      });

      // Navigate to success page or order tracking
      navigate("/orders", {
        state: {
          orderId: response.id,
          orderData: response,
        },
      });
    } catch (error) {
      console.error("Error creating order:", error);

      // Handle different types of errors with Vietnamese messages
      let errorMessage = "Có lỗi xảy ra khi đặt hàng. Vui lòng thử lại!";

      if (error.response?.data?.message) {
        const serverMessage = error.response.data.message;

        // Check for insufficient balance error
        if (serverMessage.includes("Insufficient balance")) {
          const balanceMatch = serverMessage.match(/Current balance: ([\d,]+)/);
          const requiredMatch = serverMessage.match(/Required: ([\d,]+)/);

          if (balanceMatch && requiredMatch) {
            const currentBalance = balanceMatch[1];
            const requiredAmount = requiredMatch[1];
            errorMessage = `Số dư ví không đủ! Số dư hiện tại: ${currentBalance} VND, cần: ${requiredAmount} VND. Vui lòng nạp thêm tiền vào ví.`;
          } else {
            errorMessage =
              "Số dư ví không đủ để thực hiện đơn hàng này. Vui lòng nạp thêm tiền vào ví.";
          }
        }
        // Check for other specific errors
        else if (
          serverMessage.includes("Bad Request") ||
          serverMessage.includes("validation")
        ) {
          errorMessage =
            "Thông tin đơn hàng không hợp lệ. Vui lòng kiểm tra lại và thử lại.";
        } else if (serverMessage.includes("Not Found")) {
          errorMessage = "Không tìm thấy sản phẩm hoặc shop. Vui lòng thử lại.";
        } else if (serverMessage.includes("Unauthorized")) {
          errorMessage = "Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.";
        }
      }
      // Handle network errors
      else if (error.code === "NETWORK_ERROR" || !error.response) {
        errorMessage =
          "Lỗi kết nối mạng. Vui lòng kiểm tra kết nối internet và thử lại.";
      }

      toast.error(errorMessage, {
        position: "top-right",
        autoClose: 5000,
      });
    } finally {
      setIsCheckingOut(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-white to-rose-50">
      {/* Header */}
      <div className="bg-white border-b border-pink-200 shadow-sm">
        <div className="max-w-6xl mx-auto px-6 py-4">
          <div className="flex items-center space-x-4">
            <button
              onClick={() => navigate(-1)}
              className="flex items-center space-x-2 px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <ArrowLeft className="h-4 w-4" />
              <span>Quay lại</span>
            </button>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                Customized Order - Shop #{shopId}
              </h1>
              <p className="text-sm text-gray-600">
                Tùy chỉnh bánh với ingredients từ shop này
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left Panel - Product Image & Info */}
          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="aspect-square bg-gradient-to-br from-pink-100 to-rose-200 rounded-lg flex items-center justify-center mb-6">
                {cake.image && cake.image !== "/cake-strawberry.jpg" ? (
                  <img
                    src={cake.image}
                    alt={cake.name}
                    className="w-full h-full object-cover rounded-lg"
                    onError={(e) => {
                      e.target.style.display = "none";
                      e.target.nextSibling.style.display = "flex";
                    }}
                  />
                ) : null}
                <div
                  className="text-center"
                  style={{
                    display:
                      cake.image && cake.image !== "/cake-strawberry.jpg"
                        ? "none"
                        : "flex",
                  }}
                >
                  <div className="text-6xl mb-4">🍰</div>
                  <p className="text-gray-600">{cake.name}</p>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <h2 className="text-3xl font-bold text-gray-900 mb-2">
                    {cake.name}
                  </h2>
                  <p className="text-gray-600">{cake.description}</p>
                </div>

                <div className="flex items-center space-x-4">
                  <span className="text-3xl font-bold text-pink-600">
                    {(() => {
                      const selectedSizeData = availableSizes.find(
                        (s) => s.size === selectedSize
                      );
                      const price = selectedSizeData
                        ? parseFloat(selectedSizeData.price)
                        : cake.basePrice;
                      return formatCurrency(price);
                    })()}
                  </span>
                  <span className="bg-pink-100 text-pink-800 px-3 py-1 rounded-full text-sm">
                    {cake.category}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Right Panel - Options & Order */}
          <div className="space-y-6">
            {/* Size Selection */}
            {availableSizes.length > 0 && (
              <div className="bg-white rounded-lg shadow-sm">
                <div className="p-6 border-b">
                  <h3 className="text-lg font-semibold">Chọn Kích Thước</h3>
                  <p className="text-gray-600 text-sm">
                    Chọn size bánh phù hợp với nhu cầu của bạn
                  </p>
                </div>
                <div className="p-6">
                  <div className="grid grid-cols-2 gap-4">
                    {availableSizes.map((size) => (
                      <button
                        key={size.id}
                        onClick={() => setSelectedSize(size.size)}
                        className={`p-4 rounded-xl border-2 transition-all duration-200 ${
                          selectedSize === size.size
                            ? "border-pink-500 bg-pink-50 text-pink-700"
                            : "border-gray-200 hover:border-pink-300 hover:bg-gray-50"
                        }`}
                      >
                        <div className="font-bold text-lg">{size.size}</div>
                        <div className="text-sm font-medium text-pink-600">
                          {formatCurrency(parseFloat(size.price))}
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Toppings */}
            <div className="bg-white rounded-lg shadow-sm">
              <div className="p-6 border-b">
                <h3 className="text-lg font-semibold">Tùy Chọn Thêm</h3>
                <p className="text-gray-600 text-sm">
                  Chọn các ingredients/topping từ shop này
                </p>
              </div>
              <div className="p-6 space-y-4 max-h-96 overflow-y-auto">
                {loadingIngredients ? (
                  <div className="text-center py-8">
                    <div className="animate-spin w-8 h-8 border-2 border-pink-500 border-t-transparent rounded-full mx-auto mb-4"></div>
                    <div className="text-gray-500">Đang tải ingredients...</div>
                  </div>
                ) : errorIngredients ? (
                  <div className="text-center py-8">
                    <div className="text-red-500 mb-2">
                      ❌ {errorIngredients}
                    </div>
                    <button
                      onClick={() => window.location.reload()}
                      className="text-sm text-blue-500 hover:underline"
                    >
                      Thử lại
                    </button>
                  </div>
                ) : cake.toppings.length === 0 ? (
                  <div className="text-center py-8">
                    <div className="text-6xl mb-4">🍰</div>
                    <div className="text-gray-500">
                      Shop này chưa có ingredients nào
                    </div>
                    <p className="text-sm text-gray-400 mt-2">
                      Vui lòng liên hệ shop để biết thêm chi tiết
                    </p>
                  </div>
                ) : (
                  cake.toppings.map((topping) => {
                    const selectedTopping = selectedToppings.find(
                      (t) => t.id === topping.id
                    );
                    const currentQuantity = selectedTopping
                      ? selectedTopping.quantity
                      : 0;

                    return (
                      <div
                        key={topping.id}
                        className="flex items-center space-x-4 p-4 border rounded-xl hover:bg-gray-50 hover:border-pink-200 transition-all duration-200 shadow-sm"
                      >
                        {/* Ingredient Image */}
                        <div className="w-16 h-16 rounded-xl overflow-hidden bg-gray-100 flex-shrink-0 shadow-inner">
                          {topping.image ? (
                            <img
                              src={topping.image}
                              alt={topping.name}
                              className="w-full h-full object-cover"
                              onError={(e) => {
                                e.target.style.display = "none";
                                e.target.nextSibling.style.display = "flex";
                              }}
                            />
                          ) : null}
                          <div
                            className="w-full h-full bg-gradient-to-br from-pink-100 to-rose-200 flex items-center justify-center text-2xl"
                            style={{ display: topping.image ? "none" : "flex" }}
                          >
                            🧁
                          </div>
                        </div>

                        {/* Ingredient Info */}
                        <div className="flex-1 min-w-0">
                          <div className="font-semibold text-gray-800">
                            {topping.name}
                          </div>
                          <p className="text-sm text-pink-600 font-medium">
                            +{formatCurrency(topping.price)} / cái
                          </p>
                          {topping.description && (
                            <p className="text-xs text-gray-500 mt-1 line-clamp-2">
                              {topping.description}
                            </p>
                          )}
                        </div>

                        {/* Quantity Controls */}
                        <div className="flex items-center space-x-2 flex-shrink-0">
                          <button
                            onClick={() =>
                              handleToppingChange(
                                topping,
                                Math.max(0, currentQuantity - 1)
                              )
                            }
                            disabled={currentQuantity <= 0}
                            className="w-8 h-8 flex items-center justify-center border-2 border-gray-300 rounded-lg hover:bg-red-50 hover:border-red-300 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
                          >
                            <Minus className="h-3 w-3 text-red-500" />
                          </button>
                          <div className="w-16 h-8 flex items-center justify-center bg-gray-50 border rounded-lg font-semibold text-sm">
                            {currentQuantity}
                          </div>
                          <button
                            onClick={() =>
                              handleToppingChange(topping, currentQuantity + 1)
                            }
                            className="w-8 h-8 flex items-center justify-center border-2 border-gray-300 rounded-lg hover:bg-green-50 hover:border-green-300 transition-all duration-200"
                          >
                            <Plus className="h-3 w-3 text-green-500" />
                          </button>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>

            {/* Quantity & Order */}
            <div className="bg-white rounded-lg shadow-sm">
              <div className="p-6 border-b">
                <h3 className="text-lg font-semibold">Đặt Hàng</h3>
                {user && (
                  <div className="mt-3 flex items-center space-x-2 text-sm">
                    <Wallet className="h-4 w-4 text-green-600" />
                    <span className="text-gray-600">Số dư ví:</span>
                    {loadingBalance ? (
                      <div className="flex items-center space-x-1">
                        <div className="w-3 h-3 border border-pink-500 border-t-transparent rounded-full animate-spin"></div>
                        <span className="text-gray-500">Đang tải...</span>
                      </div>
                    ) : (
                      <span
                        className={`font-bold ${
                          walletBalance >= getTotalPrice()
                            ? "text-green-600"
                            : "text-red-500"
                        }`}
                      >
                        {formatCurrency(walletBalance)}
                      </span>
                    )}
                  </div>
                )}
              </div>
              <div className="p-6 space-y-6">
                {/* Quantity */}
                <div>
                  <label className="text-base font-medium mb-3 block">
                    Số lượng
                  </label>
                  <div className="flex items-center space-x-3">
                    <button
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      disabled={quantity <= 1}
                      className="w-10 h-10 flex items-center justify-center border rounded hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      <Minus className="h-4 w-4" />
                    </button>
                    <input
                      type="number"
                      value={quantity}
                      onChange={(e) =>
                        setQuantity(
                          Math.max(1, Number.parseInt(e.target.value) || 1)
                        )
                      }
                      className="w-20 text-center border rounded px-3 py-2"
                      min="1"
                    />
                    <button
                      onClick={() => setQuantity(quantity + 1)}
                      className="w-10 h-10 flex items-center justify-center border rounded hover:bg-gray-100 transition-colors"
                    >
                      <Plus className="h-4 w-4" />
                    </button>
                  </div>
                </div>

                <div className="border-t pt-4"></div>

                {/* Price Summary */}
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span>
                      Giá bánh ({quantity} cái - {selectedSize}):
                    </span>
                    <span>
                      {(() => {
                        const selectedSizeData = availableSizes.find(
                          (s) => s.size === selectedSize
                        );
                        const price = selectedSizeData
                          ? parseFloat(selectedSizeData.price)
                          : cake.basePrice;
                        return formatCurrency(price * quantity);
                      })()}
                    </span>
                  </div>

                  {selectedToppings.length > 0 && (
                    <div>
                      <div className="flex justify-between font-medium mb-2">
                        <span>Topping đã chọn:</span>
                      </div>
                      {selectedToppings.map((topping) => (
                        <div
                          key={topping.id}
                          className="flex justify-between text-sm text-gray-600 ml-4"
                        >
                          <span>
                            • {topping.name} (x{topping.quantity} x {quantity}{" "}
                            bánh)
                          </span>
                          <span>
                            {formatCurrency(
                              topping.price * topping.quantity * quantity
                            )}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}

                  <div className="border-t pt-3"></div>

                  <div className="flex justify-between text-lg font-bold">
                    <span>Tổng cộng:</span>
                    <span className="text-pink-600">
                      {formatCurrency(getTotalPrice())}
                    </span>
                  </div>

                  {user &&
                    !loadingBalance &&
                    walletBalance < getTotalPrice() && (
                      <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-lg">
                        <div className="flex items-center space-x-2 text-red-700">
                          <span className="text-sm">⚠️</span>
                          <div className="text-sm">
                            <p className="font-medium">Số dư ví không đủ!</p>
                            <p>
                              Thiếu:{" "}
                              {formatCurrency(getTotalPrice() - walletBalance)}
                            </p>
                            <p className="text-xs mt-1">
                              Vui lòng nạp thêm tiền vào ví để thực hiện đơn
                              hàng.
                            </p>
                          </div>
                        </div>
                      </div>
                    )}
                </div>

                <button
                  onClick={handleDirectCheckout}
                  disabled={
                    isCheckingOut ||
                    !selectedSize ||
                    (!loadingBalance && user && walletBalance < getTotalPrice())
                  }
                  className="w-full bg-pink-600 hover:bg-pink-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white py-3 px-6 rounded-lg text-lg font-semibold flex items-center justify-center space-x-2 transition-colors"
                >
                  {isCheckingOut ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      <span>Đang xử lý...</span>
                    </>
                  ) : !selectedSize ? (
                    <span>Chọn kích thước bánh</span>
                  ) : !loadingBalance &&
                    user &&
                    walletBalance < getTotalPrice() ? (
                    <span>Số dư không đủ</span>
                  ) : (
                    <span>Thanh Toán</span>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Toast Container for notifications */}
      <ToastContainer />
    </div>
  );
}
