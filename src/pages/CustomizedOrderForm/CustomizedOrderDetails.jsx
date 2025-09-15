import { useState, useEffect, useCallback, useMemo } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { ArrowLeft, Plus, Minus, Wallet } from "lucide-react";
import { fetchIngredients } from "../../api/ingredients";
import { createCakeOrder } from "../../api/cakeOrder";
import { useAuth } from "../../contexts/AuthContext";
import { toast, ToastContainer } from "react-toastify";
import { fetchWalletBalance } from "../../api/axios";
import "react-toastify/dist/ReactToastify.css";

// Constants
const INITIAL_QUANTITY = 1;
const MIN_QUANTITY = 1;

// Helper functions
const formatCurrency = (amount) => {
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
  }).format(amount);
};

const normalizePrice = (price) => {
  const num = Number(price);
  return Number.isFinite(num) ? Math.round(num) : 0;
};

const transformIngredients = (ingredientsData) => {
  return (ingredientsData || []).map((ingredient) => ({
    id: ingredient.id,
    name: ingredient.name,
    price: normalizePrice(ingredient.price),
    description: ingredient.description,
    image: ingredient.image,
  }));
};

const getErrorMessage = (error) => {
  if (error.response?.data?.message) {
    const serverMessage = error.response.data.message;

    if (serverMessage.includes("Insufficient balance")) {
      return "Số dư ví không đủ để thực hiện đơn hàng này. Vui lòng nạp thêm tiền vào ví.";
    }
    if (
      serverMessage.includes("Bad Request") ||
      serverMessage.includes("validation")
    ) {
      return "Thông tin đơn hàng không hợp lệ. Vui lòng kiểm tra lại và thử lại.";
    }
    if (serverMessage.includes("Not Found")) {
      return "Không tìm thấy sản phẩm hoặc shop. Vui lòng thử lại.";
    }
    if (serverMessage.includes("Unauthorized")) {
      return "Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.";
    }
  }

  if (error.code === "NETWORK_ERROR" || !error.response) {
    return "Lỗi kết nối mạng. Vui lòng kiểm tra kết nối internet và thử lại.";
  }

  return "Có lỗi xảy ra khi đặt hàng. Vui lòng thử lại!";
};

export default function CakeShop() {
  const { shopId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();

  // State management
  const [ingredients, setIngredients] = useState([]);
  const [loadingIngredients, setLoadingIngredients] = useState(true);
  const [errorIngredients, setErrorIngredients] = useState("");

  const [productData, setProductData] = useState(null);
  const [specialInstructions, setSpecialInstructions] = useState("");
  const [deliveryTime, setDeliveryTime] = useState("");
  const [selectedSize, setSelectedSize] = useState("");
  const [quantity, setQuantity] = useState(INITIAL_QUANTITY);
  const [selectedToppings, setSelectedToppings] = useState([]);

  const [isCheckingOut, setIsCheckingOut] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);

  const [walletBalance, setWalletBalance] = useState(0);
  const [loadingBalance, setLoadingBalance] = useState(true);
  const [orderSuccess, setOrderSuccess] = useState(false);
  const [createdOrder, setCreatedOrder] = useState(null);

  const requiredTime = productData?.required_time || 0;

  // Computed values
  const availableSizes = useMemo(() => {
    if (!productData?.cakeSizes) return [];
    return [...productData.cakeSizes].sort(
      (a, b) => parseFloat(a.price) - parseFloat(b.price)
    );
  }, [productData]);

  // Real product info only (no fake fallback)
  const cakeName = useMemo(
    () =>
      productData?.post?.title ||
      productData?.title ||
      (productData ? "Bánh" : "Đang tải sản phẩm"),
    [productData]
  );
  const cakeDescription = useMemo(
    () =>
      productData?.post?.description ||
      productData?.description ||
      (productData ? "" : ""),
    [productData]
  );
  const cakeImage = useMemo(
    () =>
      productData?.post?.media?.[0]?.image_url || productData?.image || null,
    [productData]
  );

  const selectedSizePrice = useMemo(() => {
    const selectedSizeData = availableSizes.find(
      (s) => s.size === selectedSize
    );
    if (selectedSizeData) return normalizePrice(selectedSizeData.price);
    // fallback: product base price field if provided
    return normalizePrice(
      productData?.base_price || productData?.price || productData?.post?.price
    );
  }, [availableSizes, selectedSize, productData]);

  // Pricing (toppings counted once for whole order, NOT per cake)
  const { baseCakeSubtotal, toppingsSubtotal, totalPrice } = useMemo(() => {
    const baseCakeSubtotal = selectedSizePrice * quantity; // size price * number of cakes
    const toppingsSubtotal = selectedToppings.reduce(
      (sum, topping) => sum + normalizePrice(topping.price) * topping.quantity,
      0
    ); // total toppings for entire order (independent of quantity)
    return {
      baseCakeSubtotal,
      toppingsSubtotal,
      totalPrice: baseCakeSubtotal + toppingsSubtotal,
    };
  }, [selectedSizePrice, quantity, selectedToppings]);

  const userContactInfo = useMemo(() => {
    if (!user) return { phone: null, address: null };
    return {
      phone: user.phone_number || user.phone,
      address: user.address || user.location,
    };
  }, [user]);

  const isCheckoutDisabled = useMemo(() => {
    if (isCheckingOut || !selectedSize) return true;
    if (!loadingBalance && user && walletBalance < totalPrice) return true;
    if (user && (!userContactInfo.phone || !userContactInfo.address))
      return true;
    return false;
  }, [
    isCheckingOut,
    selectedSize,
    loadingBalance,
    user,
    walletBalance,
    totalPrice,
    userContactInfo,
  ]);

  // Event handlers
  const handleQuantityChange = useCallback((newQuantity) => {
    setQuantity(Math.max(MIN_QUANTITY, newQuantity));
  }, []);

  const handleToppingChange = useCallback((topping, newQuantity) => {
    const numQuantity = Math.max(0, parseInt(newQuantity) || 0);

    setSelectedToppings((prev) => {
      if (numQuantity <= 0) {
        return prev.filter((t) => t.id !== topping.id);
      }

      const existingIndex = prev.findIndex((t) => t.id === topping.id);
      if (existingIndex >= 0) {
        const updated = [...prev];
        updated[existingIndex] = { ...topping, quantity: numQuantity };
        return updated;
      }

      return [...prev, { ...topping, quantity: numQuantity }];
    });
  }, []);

  const convertLocalTimeToUTC = (localTimeString) => {
    if (!localTimeString) return null;

    // Parse local datetime-local string correctly
    const localDate = new Date(localTimeString);

    if (isNaN(localDate.getTime())) {
      console.error("Invalid date:", localTimeString);
      return null;
    }

    return localDate.toISOString(); // UTC string
  };

  const handleCheckout = useCallback(async () => {
    if (!user || !selectedSize) {
      toast.error("Thông tin không hợp lệ!");
      return;
    }

    if (!userContactInfo.phone || !userContactInfo.address) {
      toast.warn(
        `Vui lòng cập nhật ${
          !userContactInfo.phone && !userContactInfo.address
            ? "số điện thoại và địa chỉ"
            : !userContactInfo.phone
            ? "số điện thoại"
            : "địa chỉ"
        } trước khi thanh toán!`,
        { position: "top-right", autoClose: 4000 }
      );
      return;
    }

    setIsCheckingOut(true);

    try {
      const baseCakePrice = baseCakeSubtotal; // already size * quantity

      const isoDeliveryTime = deliveryTime
        ? convertLocalTimeToUTC(deliveryTime)
        : null;

      const orderData = {
        customer_id: user.id,
        shop_id: parseInt(shopId),
        marketplace_post_id: productData?.post_id || productData?.id || 0,
        size: selectedSize,
        quantity,
        status: "pending",
        base_price: baseCakePrice,
        total_price: totalPrice, // includes toppingsSubtotal (not multiplied by quantity)
        special_instructions: specialInstructions || "",
        delivery_time: isoDeliveryTime,
        order_details: selectedToppings.map((topping) => ({
          ingredient_id: topping.id,
          // quantity represents total units of this topping for the whole order
          quantity: topping.quantity,
        })),
      };

      const response = await createCakeOrder(orderData);

      setCreatedOrder(response);
      setOrderSuccess(true);

      toast.success("Đặt hàng thành công!", {
        position: "top-right",
        autoClose: 2500,
      });
    } catch (error) {
      console.error("Error creating order:", error);
      toast.error(getErrorMessage(error), {
        position: "top-right",
        autoClose: 5000,
      });
    } finally {
      setIsCheckingOut(false);
    }
  }, [
    user,
    selectedSize,
    userContactInfo,
    shopId,
    productData,
    totalPrice,
    selectedToppings,
    navigate,
  ]);

  // Effects
  useEffect(() => {
    const navProductData = location.state?.productData;
    if (navProductData) {
      setProductData(navProductData);

      const sizes = navProductData.cakeSizes || [];
      const sortedSizes = [...sizes].sort(
        (a, b) => parseFloat(a.price) - parseFloat(b.price)
      );

      if (sortedSizes.length > 0) {
        setSelectedSize(sortedSizes[0].size);
      }
    }
  }, [location.state]);

  useEffect(() => {
    if (!shopId) return;

    const loadIngredients = async () => {
      setLoadingIngredients(true);
      setErrorIngredients("");

      try {
        const data = await fetchIngredients(shopId);
        const transformedIngredients = transformIngredients(
          data.ingredients || data
        );
        setIngredients(transformedIngredients);
      } catch (error) {
        console.error("Error fetching ingredients:", error);
        setErrorIngredients("Không thể tải ingredients cho shop này");
      } finally {
        setLoadingIngredients(false);
      }
    };

    loadIngredients();
  }, [shopId]);

  useEffect(() => {
    if (!user) {
      setLoadingBalance(false);
      return;
    }

    const loadWalletBalance = async () => {
      setLoadingBalance(true);
      try {
        const response = await fetchWalletBalance();
        const balance = response.wallet?.balance || response.balance || 0;
        setWalletBalance(parseFloat(balance));
      } catch (error) {
        console.error("Error fetching wallet balance:", error);
        setWalletBalance(0);
      } finally {
        setLoadingBalance(false);
      }
    };

    loadWalletBalance();
  }, [user]);

  // Render functions
  const renderCakeImage = () => (
    <div className="aspect-square bg-gradient-to-br from-pink-100 to-rose-200 rounded-lg flex items-center justify-center mb-6 overflow-hidden">
      {cakeImage ? (
        <img
          src={cakeImage}
          alt={cakeName}
          className="w-full h-full object-cover"
          onError={(e) => {
            e.target.style.display = "none";
            e.target.nextSibling.style.display = "flex";
          }}
        />
      ) : null}
      <div
        className="flex flex-col items-center justify-center text-center"
        style={{ display: cakeImage ? "none" : "flex" }}
      >
        <div className="text-6xl mb-4">🍰</div>
        <p className="text-gray-600">{cakeName}</p>
      </div>
    </div>
  );

  const renderWalletBalance = () => {
    if (!user) return null;

    return (
      <div className="bg-white rounded-lg shadow-sm p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-pink-100 rounded-full w-12 h-12 flex items-center justify-center">
              <Wallet className="w-6 h-6 text-pink-600" />
            </div>
            <div>
              <div className="text-sm text-gray-600">Số dư ví</div>
              <div className="font-semibold text-gray-800">
                {user.full_name || user.username || "User"}
              </div>
            </div>
          </div>
          <div className="text-right">
            {loadingBalance ? (
              <div className="flex items-center space-x-2">
                <div className="w-4 h-4 border-2 border-pink-500 border-t-transparent rounded-full animate-spin"></div>
                <span className="text-gray-500">Đang tải...</span>
              </div>
            ) : (
              <>
                <div
                  className={`text-xl font-bold ${
                    walletBalance >= totalPrice
                      ? "text-green-600"
                      : "text-red-500"
                  }`}
                >
                  {formatCurrency(walletBalance)}
                </div>
                <div className="text-xs text-gray-500">
                  {walletBalance >= totalPrice
                    ? "✅ Đủ số dư"
                    : "⚠️ Không đủ số dư"}
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    );
  };

  const renderSizeSelection = () => {
    if (availableSizes.length === 0) return null;

    return (
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
                  {formatCurrency(normalizePrice(size.price))}
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>
    );
  };

  const renderToppingItem = (topping) => {
    const selectedTopping = selectedToppings.find((t) => t.id === topping.id);
    const currentQuantity = selectedTopping ? selectedTopping.quantity : 0;

    return (
      <div
        key={topping.id}
        className="flex items-center space-x-4 p-4 border rounded-xl hover:bg-gray-50 hover:border-pink-200 transition-all duration-200 shadow-sm"
      >
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

        <div className="flex-1 min-w-0">
          <div className="font-semibold text-gray-800">{topping.name}</div>
          <p className="text-sm text-pink-600 font-medium">
            +{formatCurrency(normalizePrice(topping.price))} / cái
          </p>
          {topping.description && (
            <p className="text-xs text-gray-500 mt-1 line-clamp-2">
              {topping.description}
            </p>
          )}
        </div>

        <div className="flex items-center space-x-2 flex-shrink-0">
          <button
            onClick={() =>
              handleToppingChange(topping, Math.max(0, currentQuantity - 1))
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
            onClick={() => handleToppingChange(topping, currentQuantity + 1)}
            className="w-8 h-8 flex items-center justify-center border-2 border-gray-300 rounded-lg hover:bg-green-50 hover:border-green-300 transition-all duration-200"
          >
            <Plus className="h-3 w-3 text-green-500" />
          </button>
        </div>
      </div>
    );
  };

  const renderToppings = () => (
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
            <div className="text-red-500 mb-2">❌ {errorIngredients}</div>
            <button
              onClick={() => window.location.reload()}
              className="text-sm text-blue-500 hover:underline"
            >
              Thử lại
            </button>
          </div>
        ) : ingredients.length === 0 ? (
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
          ingredients.map(renderToppingItem)
        )}
      </div>
    </div>
  );

  const renderQuantityControl = () => (
    <div>
      <label className="text-base font-medium mb-3 block">Số lượng</label>
      <div className="flex items-center space-x-3">
        <button
          onClick={() => handleQuantityChange(quantity - 1)}
          disabled={quantity <= MIN_QUANTITY}
          className="w-10 h-10 flex items-center justify-center border rounded hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          <Minus className="h-4 w-4" />
        </button>
        <input
          type="number"
          value={quantity}
          disabled
          onChange={(e) =>
            handleQuantityChange(parseInt(e.target.value) || MIN_QUANTITY)
          }
          className="w-20 text-center border rounded px-3 py-2"
          min={MIN_QUANTITY}
        />
        <button
          onClick={() => handleQuantityChange(quantity + 1)}
          className="w-10 h-10 flex items-center justify-center border rounded hover:bg-gray-100 transition-colors"
        >
          <Plus className="h-4 w-4" />
        </button>
      </div>
    </div>
  );

  const renderSpecialInstructions = () => (
    <div>
      <label className="text-base font-medium mb-3 block">Ghi chú</label>
      <input
        type="text"
        value={specialInstructions}
        onChange={(e) => setSpecialInstructions(e.target.value)}
        placeholder="Nhập ghi chú (ví dụ: Chúc mừng sinh nhật Huy, ...)"
        className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 
                 focus:outline-none focus:border-pink-500 focus:ring-4 
                 focus:ring-pink-100 transition-all duration-300"
      />
    </div>
  );

  const renderDeliveryTime = () => {
    // Compute the earliest valid time
    const minDeliveryTime = new Date();
    minDeliveryTime.setHours(minDeliveryTime.getHours() + requiredTime);

    // Convert to datetime-local string (YYYY-MM-DDTHH:mm)
    const minValue = minDeliveryTime.toISOString().slice(0, 16);

    // Validation check
    const isInvalid = deliveryTime && new Date(deliveryTime) < minDeliveryTime;

    return (
      <div>
        <label className="text-base font-medium mb-3 block">
          Thời gian nhận hàng
        </label>
        <input
          type="datetime-local"
          value={deliveryTime || ""}
          onChange={(e) => {
            console.log("User picked datetime:", e.target.value);
            setDeliveryTime(e.target.value);
          }}
          min={minValue} // ✅ browser prevents earlier times
          required
          className={`w-full border-2 rounded-xl px-4 py-3 transition-all duration-300
          focus:outline-none focus:ring-4
          ${
            isInvalid
              ? "border-red-500 focus:border-red-500 focus:ring-red-100"
              : "border-gray-200 focus:border-pink-500 focus:ring-pink-100"
          }`}
        />
        {isInvalid && (
          <p className="text-red-500 text-sm mt-2">
            Thời gian nhận hàng phải sau ít nhất {requiredTime} giờ từ bây giờ.
          </p>
        )}
      </div>
    );
  };

  const renderPriceSummary = () => (
    <div className="space-y-3">
      <div className="flex justify-between">
        <span>
          Giá bánh ({quantity} cái - {selectedSize}):
        </span>
        <span>{formatCurrency(baseCakeSubtotal)}</span>
      </div>

      {selectedToppings.length > 0 && (
        <div>
          <div className="flex justify-between font-medium mb-2">
            <span>Topping đã chọn (tổng):</span>
            <span>{formatCurrency(toppingsSubtotal)}</span>
          </div>
          {selectedToppings.map((topping) => (
            <div
              key={topping.id}
              className="flex justify-between text-sm text-gray-600 ml-4"
            >
              <span>
                • {topping.name} (x{topping.quantity})
              </span>
              <span>
                {formatCurrency(
                  normalizePrice(topping.price) * topping.quantity
                )}
              </span>
            </div>
          ))}
        </div>
      )}

      <div className="border-t pt-3"></div>

      <div className="flex justify-between text-lg font-bold">
        <span>Tổng cộng:</span>
        <span className="text-pink-600">{formatCurrency(totalPrice)}</span>
      </div>

      {user && !loadingBalance && walletBalance < totalPrice && (
        <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-lg">
          <div className="flex items-center space-x-2 text-red-700">
            <span className="text-sm">⚠️</span>
            <div className="text-sm">
              <p className="font-medium">Số dư ví không đủ!</p>
              <p>Thiếu: {formatCurrency(totalPrice - walletBalance)}</p>
              <p className="text-xs mt-1">
                Vui lòng nạp thêm tiền vào ví để thực hiện đơn hàng.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );

  const getCheckoutButtonText = () => {
    if (orderSuccess) return "Đã thanh toán";
    if (isCheckingOut) return "Đang xử lý...";
    if (!selectedSize) return "Chọn kích thước bánh";
    if (!loadingBalance && user && walletBalance < totalPrice)
      return "Số dư không đủ";
    if (user && !userContactInfo.phone) return "Thiếu SĐT";
    if (user && !userContactInfo.address) return "Thiếu địa chỉ";
    return "Thanh Toán";
  };

  const renderUserContactWarning = () => {
    if (!user || (userContactInfo.phone && userContactInfo.address))
      return null;

    return (
      <div className="mt-4 p-4 rounded-lg border border-amber-300 bg-amber-50 text-amber-800 text-sm space-y-3">
        <div className="font-semibold flex items-center gap-2">
          <span>⚠️</span>
          <span>
            Bạn chưa cập nhật{" "}
            {!userContactInfo.phone && !userContactInfo.address
              ? "số điện thoại và địa chỉ"
              : !userContactInfo.phone
              ? "số điện thoại"
              : "địa chỉ"}
            .
          </span>
        </div>
        <p>
          Vui lòng cập nhật thông tin liên hệ để shop có thể xác nhận đơn hàng,
          hoặc trao đổi với shop qua chat trước khi thanh toán.
        </p>
        <div className="flex flex-wrap gap-3">
          <button
            type="button"
            onClick={() => navigate("/edit-profile")}
            className="px-4 py-2 rounded-md bg-pink-500 hover:bg-pink-600 text-white text-sm font-medium transition-colors"
          >
            Cập nhật hồ sơ
          </button>
          <button
            type="button"
            onClick={() => navigate("/chat")}
            className="px-4 py-2 rounded-md border border-pink-300 text-pink-600 hover:bg-pink-50 text-sm font-medium transition-colors"
          >
            Trao đổi qua chat
          </button>
        </div>
      </div>
    );
  };

  const renderConfirmModal = () => {
    if (!showConfirmModal) return null;

    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
        <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-8 flex flex-col items-center">
          <div className="text-3xl font-bold text-pink-600 mb-4 flex items-center gap-2">
            <span role="img" aria-label="bell">
              🔔
            </span>{" "}
            Xác nhận thanh toán
          </div>
          <div className="text-gray-700 text-base mb-4 text-center">
            Sau khi thanh toán, bạn có{" "}
            <span className="font-bold text-pink-600">5 phút</span> để hủy đơn
            hàng.
            <br />
            Quá thời gian trên, đơn hàng sẽ không thể hủy.
          </div>
          <div className="w-full mb-4 bg-pink-50 rounded-lg p-4">
            <div className="font-semibold text-pink-700 mb-2">
              Thông tin đơn hàng
            </div>
            <div className="text-sm text-gray-800 mb-1">
              Tên bánh: <span className="font-bold">{cakeName}</span>
            </div>
            <div className="text-sm text-gray-800 mb-1">
              Kích thước: <span className="font-bold">{selectedSize}</span>
            </div>
            <div className="text-sm text-gray-800 mb-1">
              Số lượng: <span className="font-bold">{quantity}</span>
            </div>
            {selectedToppings.length > 0 && (
              <div className="text-sm text-gray-800 mb-1">
                Topping đã chọn:
                <ul className="ml-4 list-disc">
                  {selectedToppings.map((t) => (
                    <li key={t.id}>
                      {t.name} (x{t.quantity})
                    </li>
                  ))}
                </ul>
              </div>
            )}
            <div className="text-lg font-bold text-pink-600 mt-2">
              Tổng tiền: {formatCurrency(totalPrice)}
            </div>
          </div>
          <div className="flex gap-4 w-full mt-2">
            <button
              className="flex-1 h-12 text-base bg-transparent border border-pink-300 rounded-lg text-pink-600 hover:bg-pink-50"
              onClick={() => setShowConfirmModal(false)}
            >
              Hủy
            </button>
            <button
              className="flex-1 h-12 text-base bg-pink-500 hover:bg-pink-600 rounded-lg text-white font-semibold"
              onClick={() => {
                setShowConfirmModal(false);
                handleCheckout();
              }}
              disabled={isCheckingOut}
            >
              Xác nhận thanh toán
            </button>
          </div>
        </div>
      </div>
    );
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
              {renderCakeImage()}

              <div className="space-y-4">
                <div>
                  <h2 className="text-3xl font-bold text-gray-900 mb-2">
                    {cakeName}
                  </h2>
                  <p className="text-gray-600">{cakeDescription}</p>
                </div>

                <div className="flex items-center space-x-4">
                  <span className="text-3xl font-bold text-pink-600">
                    {formatCurrency(selectedSizePrice)}
                  </span>
                  {/* Category removed as per requirements */}
                </div>
              </div>
            </div>
          </div>

          {/* Right Panel - Options & Order */}
          <div className="space-y-6">
            {!orderSuccess && (
              <>
                {renderWalletBalance()}
                {renderSizeSelection()}
                {renderToppings()}
                <div className="bg-white rounded-lg shadow-sm">
                  <div className="p-6 border-b">
                    <h3 className="text-lg font-semibold">Đặt Hàng</h3>
                  </div>
                  <div className="p-6 space-y-6">
                    {renderQuantityControl()}
                    <div className="border-t"></div>
                    {renderSpecialInstructions()}
                    <div className="border-t"></div>
                    {renderDeliveryTime()}
                    <div className="border-t pt-4"></div>
                    {renderPriceSummary()}
                    <button
                      onClick={() => {
                        if (!userContactInfo.phone || !userContactInfo.address)
                          return;
                        setShowConfirmModal(true);
                      }}
                      disabled={isCheckoutDisabled}
                      className="w-full bg-pink-600 hover:bg-pink-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white py-3 px-6 rounded-lg text-lg font-semibold flex items-center justify-center space-x-2 transition-colors"
                    >
                      {isCheckingOut ? (
                        <>
                          <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                          <span>Đang xử lý...</span>
                        </>
                      ) : (
                        <span>{getCheckoutButtonText()}</span>
                      )}
                    </button>
                    {renderUserContactWarning()}
                  </div>
                </div>
              </>
            )}
            {orderSuccess && (
              <div className="bg-white rounded-lg shadow-md p-8 text-center space-y-6 animate-fade-in">
                <div className="text-5xl">🎉</div>
                <h2 className="text-2xl font-bold text-pink-600">
                  Đặt hàng thành công!
                </h2>
                <p className="text-gray-600">
                  Mã đơn hàng:{" "}
                  <span className="font-semibold">
                    #{createdOrder?.order.id}
                  </span>
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center pt-2">
                  <button
                    onClick={() => navigate("/home")}
                    className="flex-1 px-6 py-3 rounded-lg border border-pink-300 text-pink-600 hover:bg-pink-50 font-medium transition-colors"
                  >
                    Về trang chủ
                  </button>
                  <button
                    onClick={() => navigate("/marketplace")}
                    className="flex-1 px-6 py-3 rounded-lg bg-pink-600 hover:bg-pink-700 text-white font-semibold transition-colors"
                  >
                    Tiếp tục mua hàng
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {renderConfirmModal()}
      <ToastContainer />
    </div>
  );
}
