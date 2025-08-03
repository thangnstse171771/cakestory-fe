import { useState } from "react";
import {
  ShoppingCart,
  ShoppingBag,
  Trash2,
  Minus,
  Plus,
  Truck,
  CreditCard,
} from "lucide-react";
export default function CartModal() {
  const initialCartItems = [
    {
      id: "banhkem1",
      name: "Bánh Kem Dâu Tây",
      price: 320000,
      originalPrice: 350000,
      quantity: 1,
      image: "/public/Cake Design/Base Cake Layer/Tier 1 Round.png",
      seller: "Tiệm Bánh Kem Lan Anh",
      variant: "Size 18cm, Kem tươi, Dâu tây tươi",
      toppings: ["Dâu tây tươi", "Chocolate chip", "Ngôi sao đường"],
      custom: "Chữ: Chúc mừng sinh nhật Bé Na, màu kem hồng nhạt, thêm nơ vàng",
    },
    {
      id: "banhkem2",
      name: "Bánh Kem Socola Trái Cây",
      price: 370000,
      originalPrice: 400000,
      quantity: 1,
      image: "/public/Cake Design/Base Cake Layer/Tier 2 Heart.png",
      seller: "Bánh Kem Sweet Home",
      variant: "Size 20cm, Kem socola, Nhiều loại trái cây",
      toppings: ["Dâu tây", "Việt quất", "Nho xanh", "Socola viên"],
      custom: "Trang trí hình trái tim, thêm tag Happy Birthday, ít ngọt",
    },
    {
      id: "banhkem3",
      name: "Bánh Kem Matcha Nhật Bản",
      price: 290000,
      originalPrice: 320000,
      quantity: 2,
      image: "/public/Cake Design/Base Cake Layer/Tier 1 Square.png",
      seller: "Tiệm Bánh Kem Hana",
      variant: "Size 16cm, Kem matcha, Đậu đỏ",
      toppings: ["Đậu đỏ", "Bánh quy giòn", "Trà xanh rắc"],
      custom: "Chữ: Happy Graduation, trang trí đơn giản, thêm nến",
    },
    {
      id: "banhkem4",
      name: "Bánh Kem Bắp Sữa Tươi",
      price: 270000,
      originalPrice: 300000,
      quantity: 1,
      image: "/public/Cake Design/Base Cake Layer/Tier 2 Square.png",
      seller: "Bánh Kem Bắp Cô Ba",
      variant: "Size 18cm, Kem bắp, Sữa tươi",
      toppings: ["Bắp mỹ ngọt", "Sữa đặc", "Phô mai bào"],
      custom: "Trang trí hoa hướng dương, thêm tag Chúc mừng khai trương",
    },
    {
      id: "banhkem5",
      name: "Bánh Kem Mini Cute",
      price: 120000,
      originalPrice: 150000,
      quantity: 3,
      image: "/public/Cake Design/Base Cake Layer/Tier 1 Heart.png",
      seller: "Mini Cake House",
      variant: "Size 8cm, Kem vani, Màu pastel",
      toppings: ["Kẹo dẻo", "Ngọc trai đường", "Hoa kem nhỏ"],
      custom: "Trang trí dễ thương, màu pastel xanh - hồng - vàng",
    },
  ];

  const [cartItems, setCartItems] = useState(initialCartItems);
  const [isOpen, setIsOpen] = useState(false);

  const updateQuantity = (id, newQuantity) => {
    if (newQuantity === 0) {
      removeItem(id);
      return;
    }
    setCartItems((items) =>
      items.map((item) =>
        item.id === id ? { ...item, quantity: newQuantity } : item
      )
    );
  };

  const removeItem = (id) => {
    setCartItems((items) => items.filter((item) => item.id !== id));
  };

  const subtotal = cartItems.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );
  const shipping = subtotal > 500 ? 0 : 29;
  const tax = subtotal * 0.08;
  const total = subtotal + shipping + tax;

  const totalItems = cartItems.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <>
      <div className="flex flex-col gap-4 max-h-[80vh]">
        <div className="flex items-center gap-2 text-xl font-bold mb-2">
          <ShoppingBag className="h-5 w-5" />
          Giỏ hàng của bạn ({totalItems} sản phẩm)
        </div>
        <div className="flex-1 overflow-y-auto max-h-[60vh] px-2 scrollbar-thin scrollbar-thumb-pink-200 scrollbar-track-gray-100">
          {cartItems.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <ShoppingCart className="h-16 w-16 text-gray-400 mb-4" />
              <h3 className="text-lg font-medium mb-2">Giỏ hàng trống</h3>
              <p className="text-gray-500 mb-4">
                Thêm sản phẩm để bắt đầu mua sắm
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {cartItems.map((item) => (
                <div
                  key={item.id}
                  className="flex gap-4 p-4 border rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <div className="relative">
                    <img
                      src={item.image || "/placeholder.svg"}
                      alt={item.name}
                      className="w-20 h-20 object-cover rounded-md"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-start mb-1">
                      <h4 className="font-medium text-sm leading-tight">
                        {item.name}
                      </h4>
                      <button
                        className="h-8 w-8 flex items-center justify-center text-gray-400 hover:text-red-500"
                        onClick={() => removeItem(item.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                    <p className="text-xs text-gray-500 mb-1">
                      Bán bởi:{" "}
                      <span className="font-medium">{item.seller}</span>
                    </p>
                    {item.variant && (
                      <p className="text-xs text-gray-500 mb-2">
                        {item.variant}
                      </p>
                    )}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-lg">
                          ${item.price.toLocaleString()}
                        </span>
                        {item.originalPrice && (
                          <span className="text-sm text-gray-400 line-through">
                            ${item.originalPrice.toLocaleString()}
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          className="h-8 w-8 flex items-center justify-center border rounded bg-white hover:bg-gray-100"
                          onClick={() =>
                            updateQuantity(item.id, item.quantity - 1)
                          }
                        >
                          <Minus className="h-3 w-3" />
                        </button>
                        <span className="w-8 text-center font-medium">
                          {item.quantity}
                        </span>
                        <button
                          className="h-8 w-8 flex items-center justify-center border rounded bg-white hover:bg-gray-100"
                          onClick={() =>
                            updateQuantity(item.id, item.quantity + 1)
                          }
                        >
                          <Plus className="h-3 w-3" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
        {cartItems.length > 0 && (
          <>
            <div className="border-t my-2" />
            <div className="p-2 pt-4 space-y-4">
              {/* Order Summary */}
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>Tạm tính:</span>
                  <span>${subtotal.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span>Thuế:</span>
                  <span>${tax.toFixed(2)}</span>
                </div>
                <div className="border-t my-2" />
                <div className="flex justify-between font-semibold text-lg">
                  <span>Tổng cộng:</span>
                  <span>${total.toFixed(2)}</span>
                </div>
              </div>
              {/* Action Buttons */}
              <div className="space-y-3">
                <button className="w-full h-12 text-base bg-pink-500 text-white rounded-lg hover:bg-pink-600 flex items-center justify-center gap-2">
                  <CreditCard className="h-4 w-4" />
                  Thanh toán ngay
                </button>
                <button
                  className="w-full bg-white border border-pink-300 rounded-lg py-3 text-pink-600 hover:bg-pink-50"
                  onClick={() => setIsOpen(false)}
                >
                  Tiếp tục mua sắm
                </button>
              </div>
              {/* Security Badge */}
              <div className="text-center text-xs text-gray-400">
                🔒 Thanh toán an toàn và bảo mật
              </div>
            </div>
          </>
        )}
      </div>
    </>
  );
}
