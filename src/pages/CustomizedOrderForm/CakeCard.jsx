import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ShoppingCart, X, Plus, Minus, ChevronRight } from "lucide-react";

export default function CakeCard({ cake, onClose }) {
  const navigate = useNavigate();
  const [showCart, setShowCart] = useState(false);
  const [quantity, setQuantity] = useState(1);
  const [selectedToppings, setSelectedToppings] = useState([]);
  // Lấy giỏ hàng từ localStorage khi component được mount
  const [cart, setCart] = useState(() => {
    const savedCart = localStorage.getItem("cart");
    return savedCart ? JSON.parse(savedCart) : [];
  });

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
        const updatedToppings = [...selectedToppings];
        updatedToppings[existingIndex] = { ...topping, quantity: numQuantity };
        setSelectedToppings(updatedToppings);
      } else {
        setSelectedToppings([
          ...selectedToppings,
          { ...topping, quantity: numQuantity },
        ]);
      }
    }
  };

  const getTotalPrice = () => {
    const basePrice = cake.basePrice * quantity;
    const toppingsPrice =
      selectedToppings.reduce(
        (sum, topping) => sum + topping.price * topping.quantity,
        0
      ) * quantity;
    return basePrice + toppingsPrice;
  };

  const handleAddToCart = () => {
    const orderItem = {
      orderId: Date.now(),
      cake: {
        id: cake.id,
        name: cake.name,
        basePrice: cake.basePrice,
      },
      quantity,
      selectedToppings,
      totalPrice: getTotalPrice(),
    };

    const newCart = [...cart, orderItem];
    setCart(newCart);
    // Lưu giỏ hàng vào localStorage
    localStorage.setItem("cart", JSON.stringify(newCart));
    setShowCart(true);
    alert("Đã thêm vào giỏ hàng!");
  };

  const removeFromCart = (orderId) => {
    const newCart = cart.filter((item) => item.orderId !== orderId);
    setCart(newCart);
    localStorage.setItem("cart", JSON.stringify(newCart));
  };

  const getCartTotal = () => {
    return cart.reduce((sum, item) => sum + item.totalPrice, 0);
  };

  const handleCheckout = () => {
    navigate("/order/payment", {
      state: {
        orders: cart,
        shopData: {
          id: cake.shopId,
          name: cake.shopName,
          location: cake.shopLocation,
        },
      },
    });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-4xl max-h-[90vh] overflow-hidden relative">
        {/* Header with back and cart buttons */}
        <div className="flex justify-between items-center p-4 border-b">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center text-gray-600 hover:text-gray-800"
          >
            <ArrowLeft className="h-5 w-5 mr-2" />
            Quay lại
          </button>

          <button
            onClick={() => setShowCart(true)}
            className="relative flex items-center text-pink-600 hover:text-pink-700"
          >
            <ShoppingCart className="h-5 w-5 mr-1" />
            <span>Giỏ hàng ({cart.length})</span>
          </button>

          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        <div className="flex flex-col h-full">
          {/* Main content */}
          <div className="flex-1 overflow-y-auto p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Cake Image and Details */}
              <div>
                <div className="aspect-square bg-pink-100 rounded-xl flex items-center justify-center mb-4">
                  <img
                    src={cake.image}
                    alt={cake.name}
                    className="w-full h-full object-cover rounded-xl"
                  />
                </div>
                <h2 className="text-2xl font-bold text-gray-800">
                  {cake.name}
                </h2>
                <p className="text-gray-600 mt-2">{cake.description}</p>
                <div className="mt-4">
                  <span className="text-3xl font-bold text-pink-600">
                    {formatCurrency(cake.basePrice)}
                  </span>
                </div>
              </div>

              {/* Customization Options */}
              <div className="space-y-6">
                {/* Toppings */}
                <div className="bg-white rounded-lg shadow-sm border p-4">
                  <h3 className="text-lg font-semibold mb-4">Tùy chọn thêm</h3>
                  <div className="space-y-4">
                    {cake.toppings.map((topping) => (
                      <div
                        key={topping.id}
                        className="flex items-center justify-between"
                      >
                        <div>
                          <p className="font-medium">{topping.name}</p>
                          <p className="text-sm text-gray-600">
                            {formatCurrency(topping.price)}
                          </p>
                        </div>
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() =>
                              handleToppingChange(
                                topping,
                                (selectedToppings.find(
                                  (t) => t.id === topping.id
                                )?.quantity || 0) - 1
                              )
                            }
                            className="w-8 h-8 flex items-center justify-center border rounded hover:bg-gray-100"
                          >
                            <Minus className="h-4 w-4" />
                          </button>
                          <span className="w-8 text-center">
                            {selectedToppings.find((t) => t.id === topping.id)
                              ?.quantity || 0}
                          </span>
                          <button
                            onClick={() =>
                              handleToppingChange(
                                topping,
                                (selectedToppings.find(
                                  (t) => t.id === topping.id
                                )?.quantity || 0) + 1
                              )
                            }
                            className="w-8 h-8 flex items-center justify-center border rounded hover:bg-gray-100"
                          >
                            <Plus className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Quantity */}
                <div className="bg-white rounded-lg shadow-sm border p-4">
                  <h3 className="text-lg font-semibold mb-4">Số lượng</h3>
                  <div className="flex items-center space-x-4">
                    <button
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      className="w-10 h-10 flex items-center justify-center border rounded hover:bg-gray-100"
                    >
                      <Minus className="h-4 w-4" />
                    </button>
                    <span className="text-xl font-medium w-12 text-center">
                      {quantity}
                    </span>
                    <button
                      onClick={() => setQuantity(quantity + 1)}
                      className="w-10 h-10 flex items-center justify-center border rounded hover:bg-gray-100"
                    >
                      <Plus className="h-4 w-4" />
                    </button>
                  </div>
                </div>

                {/* Total and Add to Cart */}
                <div className="bg-white rounded-lg shadow-sm border p-4">
                  <div className="flex justify-between items-center mb-4">
                    <span className="text-lg font-semibold">Tổng cộng:</span>
                    <span className="text-2xl font-bold text-pink-600">
                      {formatCurrency(getTotalPrice())}
                    </span>
                  </div>
                  <button
                    onClick={handleAddToCart}
                    className="w-full bg-pink-600 text-white py-3 rounded-lg font-semibold hover:bg-pink-700 transition-colors flex items-center justify-center"
                  >
                    <ShoppingCart className="h-5 w-5 mr-2" />
                    Thêm vào giỏ hàng
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Cart Summary (slides up from bottom when items are added) */}
          {showCart && cart.length > 0 && (
            <div className="border-t bg-white p-4 shadow-lg">
              <div className="max-w-4xl mx-auto">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold flex items-center">
                    <ShoppingCart className="h-5 w-5 mr-2" />
                    Giỏ hàng ({cart.length} sản phẩm)
                  </h3>
                  <button
                    onClick={() => setShowCart(false)}
                    className="text-gray-500 hover:text-gray-700"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>

                <div className="space-y-4 max-h-48 overflow-y-auto mb-4">
                  {cart.map((item) => (
                    <div
                      key={item.orderId}
                      className="flex items-center justify-between bg-gray-50 p-3 rounded-lg"
                    >
                      <div className="flex-1">
                        <h4 className="font-medium">{item.cake.name}</h4>
                        <p className="text-sm text-gray-600">
                          Số lượng: {item.quantity}
                        </p>
                        {item.selectedToppings.length > 0 && (
                          <div className="text-sm text-gray-600">
                            <span className="font-medium">Topping:</span>{" "}
                            {item.selectedToppings
                              .map((t) => `${t.name} (x${t.quantity})`)
                              .join(", ")}
                          </div>
                        )}
                      </div>
                      <div className="flex items-center space-x-4">
                        <span className="font-medium text-pink-600">
                          {formatCurrency(item.totalPrice)}
                        </span>
                        <button
                          onClick={() => removeFromCart(item.orderId)}
                          className="text-gray-400 hover:text-red-500"
                        >
                          <X className="h-5 w-5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="flex items-center justify-between border-t pt-4">
                  <div>
                    <p className="text-gray-600">Tổng cộng:</p>
                    <p className="text-2xl font-bold text-pink-600">
                      {formatCurrency(getCartTotal())}
                    </p>
                  </div>
                  <button
                    onClick={handleCheckout}
                    className="bg-pink-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-pink-700 transition-colors flex items-center"
                  >
                    Tiến hành thanh toán
                    <ChevronRight className="h-5 w-5 ml-2" />
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
