import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import {
  ArrowLeft,
  User,
  Truck,
  CreditCard,
  Package,
  Clock,
  CheckCircle,
  AlertCircle,
} from "lucide-react";

export default function CheckoutPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { orders: initialOrders = [], shopData } = location.state || {};

  const [orders, setOrders] = useState([]);
  const [customerInfo, setCustomerInfo] = useState({
    name: "",
    phone: "",
    email: "",
    address: "",
    note: "",
  });

  const [deliveryMethod, setDeliveryMethod] = useState("delivery");
  const [deliveryDate, setDeliveryDate] = useState("");
  const [deliveryTime, setDeliveryTime] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Initialize orders
  useEffect(() => {
    if (initialOrders.length > 0) {
      setOrders(initialOrders);
    } else {
      // Sample orders for demonstration
      const sampleOrders = [
        {
          orderId: 1,
          cake: { name: "Bánh Kem Sinh Nhật" },
          quantity: 2,
          totalPrice: 450000,
          selectedToppings: [
            { id: 1, name: "Chocolate", quantity: 1, price: 15000 },
            { id: 2, name: "Dâu tây", quantity: 2, price: 20000 },
          ],
        },
        {
          orderId: 2,
          cake: { name: "Bánh Cupcake" },
          quantity: 6,
          totalPrice: 180000,
          selectedToppings: [],
        },
      ];
      setOrders(sampleOrders);
    }
  }, [initialOrders]);

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(amount);
  };

  const getTotalAmount = () => {
    return orders.reduce((sum, order) => sum + order.totalPrice, 0);
  };

  const getDeliveryFee = () => {
    return deliveryMethod === "delivery" ? 30000 : 0;
  };

  const getFinalTotal = () => {
    return getTotalAmount() + getDeliveryFee();
  };

  const validateForm = () => {
    if (!customerInfo.name.trim()) {
      setError("Vui lòng nhập họ và tên!");
      return false;
    }

    if (!customerInfo.phone.trim()) {
      setError("Vui lòng nhập số điện thoại!");
      return false;
    }

    // Validate phone number format
    const phoneRegex = /(03|05|07|08|09|01[2|6|8|9])+([0-9]{8})\b/;
    if (!phoneRegex.test(customerInfo.phone)) {
      setError("Số điện thoại không hợp lệ!");
      return false;
    }

    if (deliveryMethod === "delivery" && !customerInfo.address.trim()) {
      setError("Vui lòng nhập địa chỉ giao hàng!");
      return false;
    }

    return true;
  };

  const handlePlaceOrder = async () => {
    setError("");

    if (!validateForm()) {
      return;
    }

    setLoading(true);

    try {
      const orderData = {
        id: Date.now(),
        orders,
        customerInfo,
        deliveryMethod,
        deliveryDate,
        deliveryTime,
        totalAmount: getFinalTotal(),
        status: "pending",
        paymentMethod: "platform_wallet",
        createdAt: new Date().toISOString(),
      };

      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 2000));

      console.log("Order placed:", orderData);

      // Success notification
      alert("Thanh toán thành công! Đơn hàng đã được xử lý qua ví nền tảng.");

      // Reset form
      setCustomerInfo({
        name: "",
        phone: "",
        email: "",
        address: "",
        note: "",
      });
      setDeliveryDate("");
      setDeliveryTime("");

      // Navigate to success page or reset orders
      // navigate('/order-success', { state: { orderData } });
    } catch (error) {
      console.error("Order error:", error);
      setError("Có lỗi xảy ra khi đặt hàng. Vui lòng thử lại!");
    } finally {
      setLoading(false);
    }
  };

  const handleBackToShopping = () => {
    if (initialOrders.length > 0) {
      navigate(-1); // Go back to previous page
    } else {
      // Reset to sample orders for demo
      const sampleOrders = [
        {
          orderId: 1,
          cake: { name: "Bánh Kem Sinh Nhật" },
          quantity: 2,
          totalPrice: 450000,
          selectedToppings: [
            { id: 1, name: "Chocolate", quantity: 1, price: 15000 },
            { id: 2, name: "Dâu tây", quantity: 2, price: 20000 },
          ],
        },
        {
          orderId: 2,
          cake: { name: "Bánh Cupcake" },
          quantity: 6,
          totalPrice: 180000,
          selectedToppings: [],
        },
      ];
      setOrders(sampleOrders);
    }
  };

  if (orders.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-50 via-white to-rose-50 flex items-center justify-center">
        <div className="w-full max-w-md bg-white rounded-lg shadow-lg border border-gray-200">
          <div className="p-8 text-center">
            <Package className="h-16 w-16 mx-auto text-gray-400 mb-4" />
            <h2 className="text-xl font-bold mb-2">Giỏ hàng trống</h2>
            <p className="text-gray-600 mb-4">
              Bạn chưa có sản phẩm nào trong giỏ hàng
            </p>
            <button
              onClick={handleBackToShopping}
              className="bg-pink-600 hover:bg-pink-700 text-white px-4 py-2 rounded-md transition-colors duration-200"
            >
              Tiếp tục mua sắm
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-white to-rose-50">
      {/* Header */}
      <div className="bg-white border-b border-pink-200 shadow-sm">
        <div className="max-w-6xl mx-auto px-6 py-4">
          <div className="flex items-center space-x-4">
            <button
              onClick={handleBackToShopping}
              className="flex items-center text-gray-600 hover:text-gray-800 transition-colors duration-200"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Quay lại
            </button>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Thanh Toán</h1>
              <p className="text-sm text-gray-600">Hoàn tất đơn hàng của bạn</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 py-6">
        {/* Error Message */}
        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4 flex items-center">
            <AlertCircle className="h-5 w-5 text-red-500 mr-2" />
            <p className="text-red-700">{error}</p>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Panel - Forms */}
          <div className="lg:col-span-2 space-y-6">
            {/* Customer Info */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200">
              <div className="px-6 py-4 border-b border-gray-200">
                <h3 className="text-lg font-semibold flex items-center">
                  <User className="h-5 w-5 mr-2 text-pink-600" />
                  Thông Tin Khách Hàng
                </h3>
              </div>
              <div className="p-6 space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label
                      htmlFor="customer-name"
                      className="block text-sm font-medium text-gray-700 mb-1"
                    >
                      Họ và tên *
                    </label>
                    <input
                      id="customer-name"
                      type="text"
                      placeholder="Nhập họ và tên"
                      value={customerInfo.name}
                      onChange={(e) =>
                        setCustomerInfo({
                          ...customerInfo,
                          name: e.target.value,
                        })
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-pink-500"
                      required
                    />
                  </div>
                  <div>
                    <label
                      htmlFor="customer-phone"
                      className="block text-sm font-medium text-gray-700 mb-1"
                    >
                      Số điện thoại *
                    </label>
                    <input
                      id="customer-phone"
                      type="tel"
                      placeholder="Nhập số điện thoại"
                      value={customerInfo.phone}
                      onChange={(e) =>
                        setCustomerInfo({
                          ...customerInfo,
                          phone: e.target.value,
                        })
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-pink-500"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label
                    htmlFor="customer-email"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Email
                  </label>
                  <input
                    id="customer-email"
                    type="email"
                    placeholder="Nhập email (tùy chọn)"
                    value={customerInfo.email}
                    onChange={(e) =>
                      setCustomerInfo({
                        ...customerInfo,
                        email: e.target.value,
                      })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-pink-500"
                  />
                </div>
              </div>
            </div>

            {/* Delivery Method */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200">
              <div className="px-6 py-4 border-b border-gray-200">
                <h3 className="text-lg font-semibold flex items-center">
                  <Truck className="h-5 w-5 mr-2 text-pink-600" />
                  Phương Thức Nhận Hàng
                </h3>
              </div>
              <div className="p-6">
                <div className="space-y-3">
                  <div className="flex items-center space-x-3 p-3 border rounded-lg">
                    <input
                      type="radio"
                      id="delivery"
                      name="deliveryMethod"
                      value="delivery"
                      checked={deliveryMethod === "delivery"}
                      onChange={(e) => setDeliveryMethod(e.target.value)}
                      className="text-pink-600 focus:ring-pink-500"
                    />
                    <div className="flex-1">
                      <label
                        htmlFor="delivery"
                        className="font-medium cursor-pointer"
                      >
                        Giao hàng tận nơi
                      </label>
                      <p className="text-sm text-gray-600">
                        Phí giao hàng: 30,000 VND
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3 p-3 border rounded-lg">
                    <input
                      type="radio"
                      id="pickup"
                      name="deliveryMethod"
                      value="pickup"
                      checked={deliveryMethod === "pickup"}
                      onChange={(e) => setDeliveryMethod(e.target.value)}
                      className="text-pink-600 focus:ring-pink-500"
                    />
                    <div className="flex-1">
                      <label
                        htmlFor="pickup"
                        className="font-medium cursor-pointer"
                      >
                        Nhận tại cửa hàng
                      </label>
                      <p className="text-sm text-gray-600">
                        Miễn phí - 123 Đường ABC, Quận 1, TP.HCM
                      </p>
                    </div>
                  </div>
                </div>

                {deliveryMethod === "delivery" && (
                  <div className="mt-4">
                    <label
                      htmlFor="address"
                      className="block text-sm font-medium text-gray-700 mb-1"
                    >
                      Địa chỉ giao hàng *
                    </label>
                    <textarea
                      id="address"
                      placeholder="Nhập địa chỉ chi tiết"
                      value={customerInfo.address}
                      onChange={(e) =>
                        setCustomerInfo({
                          ...customerInfo,
                          address: e.target.value,
                        })
                      }
                      rows={2}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-pink-500"
                      required={deliveryMethod === "delivery"}
                    />
                  </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                  <div>
                    <label
                      htmlFor="delivery-date"
                      className="block text-sm font-medium text-gray-700 mb-1"
                    >
                      Ngày nhận hàng
                    </label>
                    <input
                      id="delivery-date"
                      type="date"
                      value={deliveryDate}
                      onChange={(e) => setDeliveryDate(e.target.value)}
                      min={new Date().toISOString().split("T")[0]}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-pink-500"
                    />
                  </div>
                  <div>
                    <label
                      htmlFor="delivery-time"
                      className="block text-sm font-medium text-gray-700 mb-1"
                    >
                      Giờ nhận hàng
                    </label>
                    <input
                      id="delivery-time"
                      type="time"
                      value={deliveryTime}
                      onChange={(e) => setDeliveryTime(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-pink-500"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Note */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200">
              <div className="px-6 py-4 border-b border-gray-200">
                <h3 className="text-lg font-semibold">Ghi Chú</h3>
              </div>
              <div className="p-6">
                <textarea
                  placeholder="Ghi chú thêm cho đơn hàng (tùy chọn)"
                  value={customerInfo.note}
                  onChange={(e) =>
                    setCustomerInfo({ ...customerInfo, note: e.target.value })
                  }
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-pink-500"
                />
              </div>
            </div>
          </div>

          {/* Right Panel - Order Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 sticky top-6">
              <div className="px-6 py-4 border-b border-gray-200">
                <h3 className="text-lg font-semibold">Đơn Hàng Của Bạn</h3>
              </div>
              <div className="p-6 space-y-4">
                {orders.map((order) => (
                  <div
                    key={order.orderId}
                    className="border-b pb-4 last:border-b-0"
                  >
                    <div className="flex justify-between items-start mb-2">
                      <div className="flex-1">
                        <h4 className="font-semibold">{order.cake.name}</h4>
                        <p className="text-sm text-gray-600">
                          Số lượng: {order.quantity}
                        </p>
                      </div>
                      <span className="font-semibold">
                        {formatCurrency(order.totalPrice)}
                      </span>
                    </div>

                    {order.selectedToppings &&
                      order.selectedToppings.length > 0 && (
                        <div className="text-sm text-gray-600">
                          <p className="font-medium">Topping:</p>
                          <ul className="list-disc list-inside ml-2">
                            {order.selectedToppings.map((topping) => (
                              <li key={topping.id}>
                                {topping.name} x{topping.quantity} (+
                                {formatCurrency(
                                  topping.price * topping.quantity
                                )}
                                )
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                  </div>
                ))}

                <div className="space-y-2 pt-4">
                  <div className="flex justify-between">
                    <span>Tạm tính:</span>
                    <span>{formatCurrency(getTotalAmount())}</span>
                  </div>

                  <div className="flex justify-between">
                    <span>Phí giao hàng:</span>
                    <span>{formatCurrency(getDeliveryFee())}</span>
                  </div>

                  <div className="border-t pt-2">
                    <div className="flex justify-between font-bold text-lg">
                      <span>Tổng cộng:</span>
                      <span className="text-pink-600">
                        {formatCurrency(getFinalTotal())}
                      </span>
                    </div>
                  </div>
                </div>

                <button
                  onClick={handlePlaceOrder}
                  disabled={loading}
                  className="w-full bg-pink-600 hover:bg-pink-700 disabled:bg-pink-400 disabled:cursor-not-allowed text-white h-12 text-lg rounded-md transition-colors duration-200 flex items-center justify-center"
                >
                  {loading ? (
                    <>
                      <Clock className="h-5 w-5 mr-2 animate-spin" />
                      Đang xử lý...
                    </>
                  ) : (
                    <>
                      <CreditCard className="h-5 w-5 mr-2" />
                      Thanh Toán Bằng Ví Nền Tảng
                    </>
                  )}
                </button>

                <p className="text-xs text-gray-500 text-center">
                  Thanh toán sẽ được thực hiện qua ví ảo nền tảng. Bằng cách
                  thanh toán, bạn đồng ý với điều khoản và chính sách của chúng
                  tôi.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
