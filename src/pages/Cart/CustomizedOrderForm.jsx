import { useState } from "react";
import { Plus, Minus, Cake, X, Star } from "lucide-react";

// Size options will be passed from props based on API data

const toppingOptions = [
  { id: "strawberry", name: "Dâu tây tươi", price: 50000, emoji: "🍓" },
  { id: "chocolate_chips", name: "Chocolate chips", price: 30000, emoji: "🍫" },
  { id: "nuts", name: "Hạt điều rang", price: 40000, emoji: "🥜" },
  { id: "cream_cheese", name: "Kem phô mai", price: 60000, emoji: "🧀" },
  { id: "fruit_mix", name: "Trái cây tổng hợp", price: 70000, emoji: "🥝" },
  { id: "macarons", name: "Macaron trang trí", price: 80000, emoji: "🌈" },
  { id: "chips", name: "Chips khoai tây", price: 8000, emoji: "🌈" },
];

export default function CustomizeModal({
  isOpen,
  onClose,
  product,
  onConfirm,
  sizeOptions = [], // Add sizeOptions prop with default empty array
}) {
  const [selectedSize, setSelectedSize] = useState(sizeOptions[0]?.size || "");
  const [selectedToppings, setSelectedToppings] = useState({});
  const [quantity, setQuantity] = useState(1);

  const handleToppingChange = (toppingId, checked) => {
    setSelectedToppings((prev) => {
      if (checked) {
        return { ...prev, [toppingId]: 1 };
      } else {
        const newToppings = { ...prev };
        delete newToppings[toppingId];
        return newToppings;
      }
    });
  };

  const handleToppingQuantityChange = (toppingId, newQuantity) => {
    if (newQuantity === 0) {
      setSelectedToppings((prev) => {
        const newToppings = { ...prev };
        delete newToppings[toppingId];
        return newToppings;
      });
    } else {
      setSelectedToppings((prev) => ({
        ...prev,
        [toppingId]: newQuantity,
      }));
    }
  };

  const calculatePrice = () => {
    if (!product) return 0;

    // Get the selected size price from sizeOptions
    const selectedSizeInfo = sizeOptions.find((s) => s.size === selectedSize);
    const basePrice = selectedSizeInfo ? parseFloat(selectedSizeInfo.price) : 0;

    const toppingsPrice = Object.entries(selectedToppings).reduce(
      (sum, [toppingId, qty]) => {
        const topping = toppingOptions.find((t) => t.id === toppingId);
        return sum + (topping ? topping.price * qty : 0);
      },
      0
    );

    return (basePrice + toppingsPrice) * quantity;
  };

  const handleConfirm = () => {
    if (!product) return;

    const selectedSizeInfo = sizeOptions.find((s) => s.size === selectedSize);
    const selectedToppingsInfo = Object.entries(selectedToppings).map(
      ([id, qty]) => {
        const topping = toppingOptions.find((t) => t.id === id);
        return { ...topping, quantity: qty };
      }
    );

    const customizedProduct = {
      id: `${product.id}_${Date.now()}`,
      name: product.name,
      price: calculatePrice(),
      quantity: 1,
      image: product.image,
      seller: product.seller || "Sweet Bakery",
      customization: {
        size: selectedSizeInfo?.size || selectedSize,
        sizePrice: selectedSizeInfo ? parseFloat(selectedSizeInfo.price) : 0,
        toppings: selectedToppingsInfo,
        orderQuantity: quantity,
      },
    };

    onConfirm(customizedProduct);
    onClose();
  };

  if (!product) return null;

  const totalPrice = calculatePrice();

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="relative bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[95vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-8 py-6 bg-gradient-to-r from-pink-300 to-pink-400 text-white">
          <div className="flex items-center gap-3 text-2xl font-bold">
            <div className="p-2 bg-white/20 rounded-full">
              <Cake className="h-6 w-6" />
            </div>
            Tùy chỉnh bánh của bạn
          </div>
          <button
            onClick={onClose}
            className="text-white hover:bg-white/20 rounded-full p-2"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-8">
          <div className="grid lg:grid-cols-5 gap-8">
            {/* Product Preview - 2 columns */}
            <div className="lg:col-span-2">
              <div className="sticky top-0">
                <div className="p-6">
                  <div className="relative mb-6">
                    <img
                      src={product.image || "/placeholder.svg"}
                      alt={product.name}
                      className="w-full h-64 object-cover rounded-xl shadow-lg"
                    />
                    <div className="absolute top-4 right-4">
                      <span className="inline-flex items-center gap-1 px-3 py-1 bg-pink-400 text-white rounded-full text-xs font-semibold">
                        <Star className="h-3 w-3 mr-1" /> Bestseller
                      </span>
                    </div>
                  </div>
                  <div className="text-center">
                    <h3 className="text-2xl font-bold mb-2">{product.name}</h3>
                    <p className="text-gray-600 mb-4">
                      Bánh thơm ngon được làm thủ công với nguyên liệu tươi ngon
                    </p>
                    <div className="bg-pink-50 rounded-lg p-4">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm text-gray-600">
                          Giá theo size:
                        </span>
                        <span className="text-lg font-semibold">
                          {(() => {
                            const selectedSizeInfo = sizeOptions.find(
                              (s) => s.size === selectedSize
                            );
                            const sizePrice = selectedSizeInfo
                              ? parseFloat(selectedSizeInfo.price)
                              : 0;
                            return sizePrice.toLocaleString("vi-VN");
                          })()}
                          đ
                        </span>
                      </div>
                      <div className="my-3 border-t border-pink-200" />
                      <div className="flex items-center justify-between">
                        <span className="text-lg font-bold">Tổng tiền:</span>
                        <span className="text-2xl font-bold text-pink-600">
                          {totalPrice.toLocaleString("vi-VN")}đ
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Customization Options - 3 columns */}
            <div className="lg:col-span-3 space-y-8">
              {/* Size Selection */}
              <div className="bg-white rounded-xl border p-6 mb-2">
                <h4 className="text-xl font-bold flex items-center gap-2 mb-4">
                  📏 Chọn kích thước
                </h4>
                <div className="grid grid-cols-2 gap-4">
                  {sizeOptions.map((size) => (
                    <label
                      key={size.id || size.size}
                      className={`flex flex-col items-center justify-center p-4 border-2 rounded-xl cursor-pointer transition-all ${
                        selectedSize === size.size
                          ? "border-pink-500 bg-pink-50"
                          : "border-gray-200 hover:border-pink-300"
                      }`}
                    >
                      <input
                        type="radio"
                        name="size"
                        value={size.size}
                        checked={selectedSize === size.size}
                        onChange={() => setSelectedSize(size.size)}
                        className="sr-only"
                      />
                      <span className="text-lg font-bold">{size.size}</span>
                      <span className="text-sm text-pink-600 font-medium mt-1">
                        {parseFloat(size.price).toLocaleString("vi-VN")}đ
                      </span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Toppings */}
              <div className="bg-white rounded-xl border p-6 mb-2">
                <h4 className="text-xl font-bold flex items-center gap-2 mb-4">
                  ✨ Chọn topping
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {toppingOptions.map((topping) => (
                    <div
                      key={topping.id}
                      className={`p-4 border-2 rounded-xl transition-all flex flex-col ${
                        selectedToppings[topping.id]
                          ? "border-pink-500 bg-pink-50"
                          : "border-gray-200 hover:border-pink-100"
                      }`}
                    >
                      <div className="flex items-start justify-between mb-3 w-full">
                        <div className="flex items-center gap-2 min-w-0">
                          <input
                            type="checkbox"
                            id={topping.id}
                            checked={!!selectedToppings[topping.id]}
                            onChange={(e) =>
                              handleToppingChange(topping.id, e.target.checked)
                            }
                            className="accent-pink-500 h-5 w-5 rounded border-gray-300"
                          />
                          <label
                            htmlFor={topping.id}
                            className="cursor-pointer font-medium flex flex-col items-start gap-0 truncate"
                          >
                            <span className="flex items-center gap-2">
                              <span className="text-lg">{topping.emoji}</span>
                              <span className="truncate">{topping.name}</span>
                            </span>
                            <span className="text-sm text-pink-600 font-medium mt-1">
                              +{topping.price.toLocaleString("vi-VN")}đ
                            </span>
                          </label>
                        </div>
                      </div>
                      {selectedToppings[topping.id] && (
                        <div className="flex items-center justify-center gap-3 mt-3 pt-3 border-t border-pink-200">
                          <button
                            className="h-8 w-8 flex items-center justify-center border border-pink-300 rounded text-pink-600 hover:bg-pink-100 bg-transparent"
                            onClick={() =>
                              handleToppingQuantityChange(
                                topping.id,
                                selectedToppings[topping.id] - 1
                              )
                            }
                          >
                            <Minus className="h-4 w-4" />
                          </button>
                          <span className="w-12 text-center font-bold text-lg">
                            {selectedToppings[topping.id]}
                          </span>
                          <button
                            className="h-8 w-8 flex items-center justify-center border border-pink-300 rounded text-pink-600 hover:bg-pink-100 bg-transparent"
                            onClick={() =>
                              handleToppingQuantityChange(
                                topping.id,
                                selectedToppings[topping.id] + 1
                              )
                            }
                          >
                            <Plus className="h-4 w-4" />
                          </button>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Quantity */}
              <div className="bg-white rounded-xl border p-6 mb-2">
                <h4 className="text-xl font-bold flex items-center gap-2 mb-4">
                  🔢 Số lượng
                </h4>
                <div className="flex items-center justify-center gap-6 p-4 bg-gray-50 rounded-xl">
                  <button
                    className="h-12 w-12 flex items-center justify-center border border-pink-300 rounded text-pink-600 hover:bg-pink-100 bg-transparent"
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  >
                    <Minus className="h-5 w-5" />
                  </button>
                  <span className="text-3xl font-bold w-16 text-center">
                    {quantity}
                  </span>
                  <button
                    className="h-12 w-12 flex items-center justify-center border border-pink-300 rounded text-pink-600 hover:bg-pink-100 bg-transparent"
                    onClick={() => setQuantity(quantity + 1)}
                  >
                    <Plus className="h-5 w-5" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex-shrink-0 border-t bg-white p-6">
          <div className="flex gap-4">
            <button
              className="flex-1 h-12 text-base bg-transparent border border-pink-300 rounded-lg text-pink-600 hover:bg-pink-50"
              onClick={onClose}
            >
              Hủy bỏ
            </button>
            <button
              className="flex-1 h-12 text-base bg-pink-500 hover:bg-pink-600 rounded-lg text-white flex items-center justify-center gap-2 font-semibold"
              onClick={handleConfirm}
            >
              Xác nhận - {totalPrice.toLocaleString("vi-VN")}đ
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
