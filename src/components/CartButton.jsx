import React, { useState, useEffect } from "react";
import { ShoppingCart } from "lucide-react";

export default function CartButton() {
  const [cartCount, setCartCount] = useState(0);

  useEffect(() => {
    // Cập nhật số lượng sản phẩm trong giỏ hàng khi component mount
    const updateCartCount = () => {
      const cart = JSON.parse(localStorage.getItem("cart") || "[]");
      setCartCount(cart.length);
    };

    // Gọi lần đầu khi component mount
    updateCartCount();

    // Lắng nghe sự thay đổi của localStorage
    window.addEventListener("storage", updateCartCount);

    // Cleanup listener
    return () => window.removeEventListener("storage", updateCartCount);
  }, []);

  return (
    <button
      className="relative flex items-center bg-pink-100 hover:bg-pink-200 text-pink-600 px-4 py-2 rounded-lg transition-colors"
      onClick={() => setShowCart(true)}
    >
      <ShoppingCart className="h-5 w-5 mr-1" />
      <span>Giỏ hàng</span>
      {cartCount > 0 && (
        <span className="absolute -top-1 -right-1 bg-pink-500 text-white text-xs w-5 h-5 flex items-center justify-center rounded-full">
          {cartCount}
        </span>
      )}
    </button>
  );
}
