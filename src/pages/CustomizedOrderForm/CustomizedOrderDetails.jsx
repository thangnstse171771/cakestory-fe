import { useState, useEffect } from "react";
import { ArrowLeft, ShoppingCart, Plus, Minus, Check } from "lucide-react";

export default function CakeShop() {
  // Mock data cho bánh kem dâu
  const mockCake = {
    id: 1,
    name: "Bánh Kem Dâu",
    description:
      "Bánh kem tươi với lớp phủ socola trắng, trang trí cherry và socola chips thơm ngon",
    basePrice: 200000,
    category: "Bánh sinh nhật",
    image: "/cake-strawberry.jpg",
    toppings: [
      { id: 1, name: "Viên socola", price: 20000 },
      { id: 2, name: "Dâu thêm", price: 30000 },
      { id: 3, name: "Lớp phủ socola dâu", price: 75000 },
      { id: 4, name: "Donut", price: 15000 },
      { id: 5, name: "Thêm chữ (tên)", price: 15000 },
    ],
  };

  const [cake] = useState(mockCake);
  const [quantity, setQuantity] = useState(1);
  const [selectedToppings, setSelectedToppings] = useState([]);
  const [showCheckout, setShowCheckout] = useState(false);
  const [cart, setCart] = useState([]);

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

    setCart([...cart, orderItem]);
    alert("Đã thêm vào giỏ hàng!");
  };

  const handleCheckout = () => {
    if (cart.length === 0) {
      alert("Please add items to cart first!");
      return;
    }
    navigate("/order/payment", {
      state: {
        orders: cart,
        shopData: location.state.shopData,
      },
    });
  };

  const removeFromCart = (orderId) => {
    setCart(cart.filter((item) => item.orderId !== orderId));
  };

  const getCartTotal = () => {
    return cart.reduce((sum, item) => sum + item.totalPrice, 0);
  };

  if (showCheckout) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-50 via-white to-rose-50">
        {/* Header */}
        <div className="bg-white border-b border-pink-200 shadow-sm">
          <div className="max-w-6xl mx-auto px-6 py-4">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => setShowCheckout(false)}
                className="flex items-center space-x-2 px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <ArrowLeft className="h-4 w-4" />
                <span>Quay lại</span>
              </button>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  Giỏ Hàng & Thanh Toán
                </h1>
                <p className="text-sm text-gray-600">
                  Xem lại đơn hàng và thanh toán
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-4xl mx-auto px-6 py-6">
          {cart.length === 0 ? (
            <div className="bg-white rounded-lg shadow-sm p-8 text-center">
              <ShoppingCart className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h2 className="text-xl font-bold mb-2">Giỏ hàng trống</h2>
              <p className="text-gray-600">
                Chưa có sản phẩm nào trong giỏ hàng
              </p>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Cart Items */}
              <div className="bg-white rounded-lg shadow-sm p-6">
                <h2 className="text-xl font-bold mb-4">Đơn hàng của bạn</h2>
                <div className="space-y-4">
                  {cart.map((item) => (
                    <div key={item.orderId} className="border rounded-lg p-4">
                      <div className="flex justify-between items-start mb-3">
                        <div>
                          <h3 className="font-semibold text-lg">
                            {item.cake.name}
                          </h3>
                          <p className="text-gray-600">
                            Số lượng: {item.quantity}
                          </p>
                        </div>
                        <button
                          onClick={() => removeFromCart(item.orderId)}
                          className="text-red-500 hover:text-red-700 text-sm"
                        >
                          Xóa
                        </button>
                      </div>

                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span>Giá bánh ({item.quantity} cái):</span>
                          <span>
                            {formatCurrency(
                              item.cake.basePrice * item.quantity
                            )}
                          </span>
                        </div>

                        {item.selectedToppings.length > 0 && (
                          <div>
                            <div className="font-medium mb-1">
                              Topping đã chọn:
                            </div>
                            {item.selectedToppings.map((topping) => (
                              <div
                                key={topping.id}
                                className="flex justify-between text-gray-600 ml-4"
                              >
                                <span>
                                  • {topping.name} (x{topping.quantity} x{" "}
                                  {item.quantity} bánh)
                                </span>
                                <span>
                                  {formatCurrency(
                                    topping.price *
                                      topping.quantity *
                                      item.quantity
                                  )}
                                </span>
                              </div>
                            ))}
                          </div>
                        )}

                        <div className="border-t pt-2 flex justify-between font-semibold">
                          <span>Tổng:</span>
                          <span className="text-pink-600">
                            {formatCurrency(item.totalPrice)}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Order Summary */}
              <div className="bg-white rounded-lg shadow-sm p-6">
                <h2 className="text-xl font-bold mb-4">Tổng kết đơn hàng</h2>
                <div className="space-y-2 text-lg">
                  <div className="flex justify-between">
                    <span>Số món trong giỏ:</span>
                    <span>{cart.length}</span>
                  </div>
                  <div className="border-t pt-2 flex justify-between font-bold text-xl">
                    <span>Tổng thanh toán:</span>
                    <span className="text-pink-600">
                      {formatCurrency(getCartTotal())}
                    </span>
                  </div>
                </div>

                <button className="w-full mt-6 bg-pink-600 hover:bg-pink-700 text-white py-3 px-6 rounded-lg text-lg font-semibold transition-colors">
                  Thanh Toán Ngay
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-white to-rose-50">
      {/* Header */}
      <div className="bg-white border-b border-pink-200 shadow-sm">
        <div className="max-w-6xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button className="flex items-center space-x-2 px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">
                <ArrowLeft className="h-4 w-4" />
                <span>Quay lại</span>
              </button>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  {cake.name}
                </h1>
                <p className="text-sm text-gray-600">
                  Chi tiết sản phẩm và tùy chọn
                </p>
              </div>
            </div>

            {cart.length > 0 && (
              <button
                onClick={handleCheckout}
                className="flex items-center space-x-2 bg-pink-600 text-white px-4 py-2 rounded-lg hover:bg-pink-700 transition-colors"
              >
                <ShoppingCart className="h-4 w-4" />
                <span>Giỏ hàng ({cart.length})</span>
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left Panel - Product Image & Info */}
          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="aspect-square bg-gradient-to-br from-pink-100 to-rose-200 rounded-lg flex items-center justify-center mb-6">
                <div className="text-center">
                  <div className="text-6xl mb-4">🍰</div>
                  <p className="text-gray-600">Bánh Kem Dâu</p>
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
                    {formatCurrency(cake.basePrice)}
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
            {/* Toppings */}
            <div className="bg-white rounded-lg shadow-sm">
              <div className="p-6 border-b">
                <h3 className="text-lg font-semibold">Tùy Chọn Thêm</h3>
                <p className="text-gray-600 text-sm">
                  Chọn các topping bạn muốn thêm vào bánh
                </p>
              </div>
              <div className="p-6 space-y-4">
                {cake.toppings.map((topping) => {
                  const selectedTopping = selectedToppings.find(
                    (t) => t.id === topping.id
                  );
                  const currentQuantity = selectedTopping
                    ? selectedTopping.quantity
                    : 0;

                  return (
                    <div
                      key={topping.id}
                      className="flex items-center space-x-3 p-3 border rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      <div className="flex-1">
                        <div className="font-medium">{topping.name}</div>
                        <p className="text-sm text-gray-600">
                          +{formatCurrency(topping.price)} / cái
                        </p>
                      </div>
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() =>
                            handleToppingChange(
                              topping,
                              Math.max(0, currentQuantity - 1)
                            )
                          }
                          disabled={currentQuantity <= 0}
                          className="w-8 h-8 flex items-center justify-center border rounded hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        >
                          <Minus className="h-3 w-3" />
                        </button>
                        <input
                          type="number"
                          value={currentQuantity}
                          onChange={(e) =>
                            handleToppingChange(topping, e.target.value)
                          }
                          className="w-16 text-center border rounded px-2 py-1"
                          min="0"
                        />
                        <button
                          onClick={() =>
                            handleToppingChange(topping, currentQuantity + 1)
                          }
                          className="w-8 h-8 flex items-center justify-center border rounded hover:bg-gray-100 transition-colors"
                        >
                          <Plus className="h-3 w-3" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Quantity & Order */}
            <div className="bg-white rounded-lg shadow-sm">
              <div className="p-6 border-b">
                <h3 className="text-lg font-semibold">Đặt Hàng</h3>
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
                    <span>Giá bánh ({quantity} cái):</span>
                    <span>{formatCurrency(cake.basePrice * quantity)}</span>
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
                </div>

                <button
                  onClick={handleAddToCart}
                  className="w-full bg-pink-600 hover:bg-pink-700 text-white py-3 px-6 rounded-lg text-lg font-semibold flex items-center justify-center space-x-2 transition-colors"
                >
                  <ShoppingCart className="h-5 w-5" />
                  <span>Thêm Vào Giỏ Hàng</span>
                </button>

                <button
                  onClick={handleCheckout}
                  className="w-full border-2 border-pink-600 text-pink-600 hover:bg-pink-50 py-3 px-6 rounded-lg text-lg font-semibold flex items-center justify-center space-x-2 transition-colors"
                >
                  <Check className="h-5 w-5" />
                  <span>Xem Giỏ Hàng & Thanh Toán</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
