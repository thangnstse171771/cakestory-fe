import { useState, useEffect } from "react";
import { Download, RotateCcw, Sparkles, Save } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-hot-toast";

// Import cake design assets
const CakeDesign = () => {
  // Design state
  const [design, setDesign] = useState({
    shape: "Round",
    tiers: 3,
    frosting: "none",
    topping: "none",
    decorations: {},
  });

  // Drag & drop positions state
  const [toppingPosition, setToppingPosition] = useState({ x: 0, y: -40 });
  const [toppingScale, setToppingScale] = useState(1); // Scale cho topping
  const [decorationsPositions, setDecorationsPositions] = useState({});
  const [decorationsScales, setDecorationsScales] = useState({}); // Scale cho từng decoration
  const [isDragging, setIsDragging] = useState(false);
  const [currentDraggingItem, setCurrentDraggingItem] = useState(null);

  // UI state
  const [selectedTab, setSelectedTab] = useState("Base");
  const [isAnimating, setIsAnimating] = useState(false);
  const [diameter, setDiameter] = useState(25);
  const [height, setHeight] = useState(15);
  const [width, setWidth] = useState(20);
  const [selectedFlavors, setSelectedFlavors] = useState(["Vanilla"]);
  const navigate = useNavigate();

  // Available design options
  const shapes = ["Round", "Square", "Heart"]; // Removed Rect as it's not in the image assets
  const tiers = [1, 2, 3];
  const flavors = ["Vanilla", "Chocolate", "Lemon", "Red Velvet"];
  const frostings = ["none", "Buttercream", "Ganache", "Matcha"];
  const toppings = [
    "none",
    "Strawberries",
    "Chocolate Chips",
    "Sprinkles",
    "Nuts",
  ];
  const designOptions = ["Base", "Frosting", "Toppings", "Decor"];

  // Decoration options
  const decorations = [
    {
      value: "CakeCandle",
      label: "Candles 🕯️",
      filename: "CakeCandle.png",
    },
    {
      value: "Flower",
      label: "Flowers 🌸",
      filename: "Flower.png",
    },
    {
      value: "happy birthday",
      label: "Happy Birthday 🎂",
      filename: "happy birthday.png",
    },
    {
      value: "figurine 1",
      label: "Figurine 1 🎭",
      filename: "figurine 1.png",
    },
    {
      value: "figurine 2",
      label: "Figurine 2 🎭",
      filename: "figurine 2.png",
    },
    {
      value: "ribbon 1",
      label: "Ribbon 1 🎀",
      filename: "ribbon 1.png",
    },
    {
      value: "ribbon 2",
      label: "Ribbon 2 🎀",
      filename: "ribbon 2.png",
    },
    {
      value: "pearl 1",
      label: "Pearl 1 ⚪",
      filename: "pearl 1.png",
    },
    {
      value: "pearl 2",
      label: "Pearl 2 ⚪",
      filename: "pearl 2.png",
    },
  ];

  // Update design with animation
  const updateDesign = (updates) => {
    setIsAnimating(true);
    setDesign((prev) => ({ ...prev, ...updates }));

    // Đặt lại vị trí topping khi thay đổi loại topping
    if ("topping" in updates) {
      setToppingPosition({ x: 0, y: -40 });
    }

    setTimeout(() => setIsAnimating(false), 300);
  };

  // Reset design
  const resetDesign = () => {
    setDesign({
      shape: "Round",
      tiers: 3,
      frosting: "none",
      topping: "none",
      decorations: {},
    });
    setToppingPosition({ x: 0, y: -40 }); // Đặt lại vị trí topping
    setToppingScale(1); // Đặt lại kích thước topping
    setDecorationsPositions({}); // Đặt lại vị trí các decorations
    setDecorationsScales({}); // Đặt lại kích thước các decorations
  };

  // Toggle flavor selection
  const toggleFlavor = (flavor) => {
    setSelectedFlavors((prev) =>
      prev.includes(flavor)
        ? prev.filter((f) => f !== flavor)
        : [...prev, flavor]
    );
  };

  // Helper function to get image paths based on design selections
  const getImagePath = () => {
    // Base cake or frosting image - một ảnh duy nhất
    let baseOrFrostingImage;
    if (design.frosting !== "none") {
      baseOrFrostingImage = `${process.env.PUBLIC_URL}/Cake Design/Base Frosting/Tier ${design.tiers} ${design.shape} ${design.frosting}.png`;
    } else {
      baseOrFrostingImage = `${process.env.PUBLIC_URL}/Cake Design/Base Cake Layer/Tier ${design.tiers} ${design.shape}.png`;
    }

    // Topping layer
    let toppingImage = null;
    if (design.topping !== "none") {
      toppingImage = `${process.env.PUBLIC_URL}/Cake Design/Base Topping/${design.topping}.png`;
    }

    return {
      baseOrFrosting: baseOrFrostingImage,
      topping: toppingImage,
    };
  };

  // Handle decoration toggle with position tracking and quantities
  const toggleDecoration = (decoration) => {
    setDesign((prev) => {
      const decorationsObj = { ...prev.decorations };

      if (!decorationsObj[decoration]) {
        // Thêm decoration mới với số lượng mặc định là 1
        decorationsObj[decoration] = 1;

        // Thêm vị trí ban đầu ngẫu nhiên cho decoration mới
        setDecorationsPositions((prevPositions) => ({
          ...prevPositions,
          [`${decoration}_0`]: {
            x: Math.random() * 50 - 25, // Random từ -25 đến 25
            y: Math.random() * 40 - 60, // Random từ -60 đến -20
          },
        }));

        // Thêm kích thước mặc định cho decoration mới
        setDecorationsScales((prevScales) => ({
          ...prevScales,
          [`${decoration}_0`]: 1, // Kích thước mặc định là 1
        }));
      } else {
        // Xóa decoration
        delete decorationsObj[decoration];

        // Xóa tất cả vị trí và kích thước cho decoration này
        setDecorationsPositions((prevPositions) => {
          const updatedPositions = { ...prevPositions };
          Object.keys(updatedPositions).forEach((key) => {
            if (key.startsWith(`${decoration}_`)) {
              delete updatedPositions[key];
            }
          });
          return updatedPositions;
        });

        setDecorationsScales((prevScales) => {
          const updatedScales = { ...prevScales };
          Object.keys(updatedScales).forEach((key) => {
            if (key.startsWith(`${decoration}_`)) {
              delete updatedScales[key];
            }
          });
          return updatedScales;
        });
      }

      return { ...prev, decorations: decorationsObj };
    });
  };

  // Update decoration quantity
  const updateDecorationQuantity = (decoration, quantity) => {
    const newQuantity = Math.max(1, Math.min(10, quantity)); // Giới hạn số lượng từ 1-10

    setDesign((prev) => {
      const decorationsObj = { ...prev.decorations };
      const oldQuantity = decorationsObj[decoration] || 0;
      decorationsObj[decoration] = newQuantity;

      // Cập nhật vị trí cho các decoration
      setDecorationsPositions((prevPositions) => {
        const updatedPositions = { ...prevPositions };

        // Nếu tăng số lượng, thêm vị trí cho các decoration mới
        if (newQuantity > oldQuantity) {
          for (let i = oldQuantity; i < newQuantity; i++) {
            updatedPositions[`${decoration}_${i}`] = {
              x: Math.random() * 50 - 25,
              y: Math.random() * 40 - 60,
            };
          }
        }
        // Nếu giảm số lượng, xóa vị trí của các decoration thừa
        else if (newQuantity < oldQuantity) {
          for (let i = newQuantity; i < oldQuantity; i++) {
            delete updatedPositions[`${decoration}_${i}`];
          }
        }

        return updatedPositions;
      });

      // Cập nhật kích thước cho các decoration
      setDecorationsScales((prevScales) => {
        const updatedScales = { ...prevScales };

        // Nếu tăng số lượng, thêm kích thước cho các decoration mới
        if (newQuantity > oldQuantity) {
          for (let i = oldQuantity; i < newQuantity; i++) {
            updatedScales[`${decoration}_${i}`] = 1; // Kích thước mặc định
          }
        }
        // Nếu giảm số lượng, xóa kích thước của các decoration thừa
        else if (newQuantity < oldQuantity) {
          for (let i = newQuantity; i < oldQuantity; i++) {
            delete updatedScales[`${decoration}_${i}`];
          }
        }

        return updatedScales;
      });

      return { ...prev, decorations: decorationsObj };
    });
  };

  // Save cake design
  const saveDesign = () => {
    toast.success("Design saved successfully!");
  };

  // Export cake design
  const exportDesign = () => {
    toast.success("Design exported!");
  };

  // Cập nhật kích thước cho topping
  const updateToppingScale = (scale) => {
    setToppingScale(Math.max(0.2, Math.min(2.0, scale))); // Giới hạn kích thước từ 0.2 đến 2.0
  };

  // Cập nhật kích thước cho decoration
  const updateDecorationScale = (decorationKey, scale) => {
    setDecorationsScales((prev) => ({
      ...prev,
      [decorationKey]: Math.max(0.2, Math.min(2.0, scale)), // Giới hạn kích thước từ 0.2 đến 2.0
    }));
  };

  // Generic drag and drop handlers for toppings and decorations
  const handleDragStart =
    (itemType, itemValue = null) =>
    (e) => {
      setIsDragging(true);
      setCurrentDraggingItem({ type: itemType, value: itemValue });

      // Nếu sử dụng e.dataTransfer, thêm dòng sau để đặt dữ liệu cần thiết cho kéo thả
      if (e.dataTransfer) {
        e.dataTransfer.setData("text/plain", itemType);
      }

      // Ngăn chặn hành vi mặc định của trình duyệt
      if (e.preventDefault) e.preventDefault();
    };

  const handleDrag = (e) => {
    if (!isDragging || !currentDraggingItem) return;

    // Tính toán vị trí mới dựa trên sự di chuyển của chuột/ngón tay
    const containerRect = e.target.parentElement.getBoundingClientRect();

    // Mở rộng phạm vi kéo thả - nhân với hệ số 3 để có vùng kéo thả rộng hơn
    const x =
      ((e.clientX - containerRect.left) / containerRect.width) * 300 - 150;
    const y =
      ((e.clientY - containerRect.top) / containerRect.height) * 300 - 150;

    // Cho phép kéo thả tự do trong phạm vi mở rộng
    if (currentDraggingItem.type === "topping") {
      setToppingPosition({ x: x, y: y });
    } else if (currentDraggingItem.type === "decoration") {
      setDecorationsPositions((prev) => ({
        ...prev,
        [currentDraggingItem.value]: { x: x, y: y },
      }));
    }
  };

  const handleDragEnd = () => {
    setIsDragging(false);
    setCurrentDraggingItem(null);
  };

  const handleTouchMove = (e) => {
    if (!isDragging || !currentDraggingItem) return;

    // Xử lý sự kiện touch cho thiết bị di động
    const touch = e.touches[0];
    const containerRect = e.target.parentElement.getBoundingClientRect();

    // Mở rộng phạm vi kéo thả - nhân với hệ số 3 để có vùng kéo thả rộng hơn
    const x =
      ((touch.clientX - containerRect.left) / containerRect.width) * 300 - 150;
    const y =
      ((touch.clientY - containerRect.top) / containerRect.height) * 300 - 150;

    // Cho phép kéo thả tự do trong phạm vi mở rộng
    if (currentDraggingItem.type === "topping") {
      setToppingPosition({ x: x, y: y });
    } else if (currentDraggingItem.type === "decoration") {
      setDecorationsPositions((prev) => ({
        ...prev,
        [currentDraggingItem.value]: { x: x, y: y },
      }));
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-white to-yellow-50">
      {/* Top Navigation */}
      <header className="bg-white/90 backdrop-blur-sm border-b border-pink-100 px-6 py-4 sticky top-0 z-50">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-pink-400 to-yellow-400 rounded-xl flex items-center justify-center">
              <span className="text-white text-xl">🎂</span>
            </div>
            <h1 className="text-2xl font-bold bg-gradient-to-r from-pink-600 to-yellow-500 bg-clip-text text-transparent">
              Cake Design Studio
            </h1>
          </div>

          <div className="flex items-center gap-3">
            <button
              className="px-4 py-2 border border-gray-300 rounded-lg text-sm hover:bg-gray-50"
              onClick={resetDesign}
            >
              <RotateCcw className="w-4 h-4 mr-2 inline" />
              Reset
            </button>
            <button
              className="px-4 py-2 border border-pink-200 text-pink-600 rounded-lg text-sm hover:bg-pink-50"
              onClick={saveDesign}
            >
              <Save className="w-4 h-4 mr-2 inline" />
              Save
            </button>
            <button
              className="px-4 py-2 border border-pink-200 text-pink-600 rounded-lg text-sm hover:bg-pink-50"
              onClick={exportDesign}
            >
              <Download className="w-4 h-4 mr-2 inline" />
              Export
            </button>
            <button
              className="px-4 py-2 bg-gradient-to-r from-pink-400 to-purple-400 text-white rounded-lg font-semibold shadow hover:from-pink-500 hover:to-purple-500 transition-all duration-200"
              onClick={() => navigate("/ai-generated-images")}
            >
              <Sparkles className="w-4 h-4 mr-2 inline" />
              AI Generation
            </button>
          </div>
        </div>
      </header>

      <div className="p-3 max-w-[1400px] mx-auto">
        <div className="flex flex-col lg:flex-row gap-4">
          {/* Cake Preview Area */}
          <div className="flex-1">
            <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-3 h-[750px]">
              {/* Cake Preview */}
              <div
                className={`h-full transition-all duration-300 flex justify-center items-center ${
                  isAnimating ? "scale-95 opacity-80" : "scale-100 opacity-100"
                }`}
              >
                <div className="relative w-full h-full flex items-center justify-center bg-gradient-to-br from-pink-50 via-white to-yellow-50 rounded-2xl overflow-hidden">
                  {/* Background pattern */}
                  <div className="absolute inset-0 opacity-10">
                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(255,182,193,0.3),transparent_50%)]"></div>
                  </div>

                  {/* Cake visualization */}
                  <div className="relative w-[550px] h-[550px] transition-all duration-500 ease-in-out transform hover:scale-105">
                    {/* Base cake or Frosting cake - hiển thị một ảnh duy nhất */}
                    <div className="absolute inset-0 flex items-center justify-center">
                      <img
                        src={
                          design.frosting !== "none"
                            ? `/Cake Design/Base Frosting/Tier ${design.tiers} ${design.shape} ${design.frosting}.png`
                            : `/Cake Design/Base Cake Layer/Tier ${design.tiers} ${design.shape}.png`
                        }
                        alt={
                          design.frosting !== "none"
                            ? `${design.shape} ${design.tiers}-tier cake with ${design.frosting} frosting`
                            : `${design.shape} ${design.tiers}-tier cake`
                        }
                        className="w-full h-full object-contain"
                        onError={(e) => {
                          e.target.onerror = null;
                          e.target.style.display = "none";
                        }}
                      />
                    </div>

                    {/* Topping overlay if selected - with drag & drop */}
                    {design.topping !== "none" && (
                      <div
                        className="absolute inset-0 flex items-center justify-center pointer-events-none"
                        style={{
                          zIndex: 15,
                        }}
                      >
                        <img
                          src={`/Cake Design/Base Topping/${design.topping}.png`}
                          alt={`${design.topping} topping`}
                          className={`w-full h-full object-contain transition-transform pointer-events-auto ${
                            isDragging &&
                            currentDraggingItem?.type === "topping"
                              ? "z-20"
                              : "z-10"
                          }`}
                          onMouseDown={handleDragStart("topping")}
                          onMouseMove={handleDrag}
                          onMouseUp={handleDragEnd}
                          onMouseLeave={handleDragEnd}
                          onTouchStart={handleDragStart("topping")}
                          onTouchMove={handleTouchMove}
                          onTouchEnd={handleDragEnd}
                          style={{
                            transform: `
                              scale(${
                                (design.topping === "Strawberries"
                                  ? design.tiers === 1
                                    ? 0.55
                                    : design.tiers === 2
                                    ? 0.45
                                    : 0.35
                                  : design.topping === "Nuts"
                                  ? design.tiers === 1
                                    ? 0.6
                                    : design.tiers === 2
                                    ? 0.5
                                    : 0.4
                                  : design.tiers === 1
                                  ? 0.75
                                  : design.tiers === 2
                                  ? 0.65
                                  : 0.55) * toppingScale
                              })
                              translate(${toppingPosition.x}%, ${
                              toppingPosition.y
                            }%)
                            `,
                            position: "relative",
                            cursor:
                              isDragging &&
                              currentDraggingItem?.type === "topping"
                                ? "grabbing"
                                : "grab",
                            filter:
                              isDragging &&
                              currentDraggingItem?.type === "topping"
                                ? "brightness(1.1)"
                                : "none",
                          }}
                          onError={(e) => {
                            e.target.onerror = null;
                            e.target.style.display = "none";
                          }}
                          draggable="false" // Tắt hành vi kéo thả mặc định của trình duyệt
                        />
                      </div>
                    )}

                    {/* Decorations Overlay - with drag & drop */}
                    {Object.entries(design.decorations).flatMap(
                      ([decoration, quantity]) => {
                        // Tìm thông tin decoration từ mảng decorations
                        const decorInfo = decorations.find(
                          (d) => d.value === decoration
                        );
                        if (!decorInfo) return null;

                        // Tạo mảng các decoration instances dựa theo số lượng
                        return Array.from({ length: quantity }, (_, index) => {
                          const decorKey = `${decoration}_${index}`;

                          return (
                            <div
                              key={decorKey}
                              className="absolute inset-0 flex items-center justify-center pointer-events-none"
                              style={{
                                zIndex:
                                  isDragging &&
                                  currentDraggingItem?.value === decorKey
                                    ? 20
                                    : 15, // Ưu tiên phần tử đang kéo
                              }}
                            >
                              <img
                                src={`/Cake Design/Base Decoration/${decorInfo.filename}`}
                                alt={`${decorInfo.label} decoration`}
                                className={`w-full h-full object-contain transition-transform pointer-events-auto ${
                                  isDragging &&
                                  currentDraggingItem?.type === "decoration" &&
                                  currentDraggingItem?.value === decorKey
                                    ? "z-20"
                                    : "z-10"
                                }`}
                                onMouseDown={(e) =>
                                  handleDragStart("decoration", decorKey)(e)
                                }
                                onMouseMove={handleDrag}
                                onMouseUp={handleDragEnd}
                                onMouseLeave={handleDragEnd}
                                onTouchStart={(e) =>
                                  handleDragStart("decoration", decorKey)(e)
                                }
                                onTouchMove={handleTouchMove}
                                onTouchEnd={handleDragEnd}
                                style={{
                                  transform: `
                                  scale(${
                                    (design.tiers === 1
                                      ? 0.75
                                      : design.tiers === 2
                                      ? 0.65
                                      : 0.55) *
                                    (decorationsScales[decorKey] || 1)
                                  })
                                  translate(${
                                    decorationsPositions[decorKey]?.x || 0
                                  }%, ${
                                    decorationsPositions[decorKey]?.y || 0
                                  }%)
                                `,
                                  position: "relative",
                                  cursor:
                                    isDragging &&
                                    currentDraggingItem?.type ===
                                      "decoration" &&
                                    currentDraggingItem?.value === decorKey
                                      ? "grabbing"
                                      : "grab",
                                  filter:
                                    isDragging &&
                                    currentDraggingItem?.type ===
                                      "decoration" &&
                                    currentDraggingItem?.value === decorKey
                                      ? "brightness(1.1)"
                                      : "none",
                                }}
                                onError={(e) => {
                                  e.target.onerror = null;
                                  e.target.style.display = "none";
                                }}
                                draggable="false" // Tắt hành vi kéo thả mặc định của trình duyệt
                              />
                            </div>
                          );
                        });
                      }
                    )}

                    {/* Sparkle effect */}
                    <div className="absolute inset-0 pointer-events-none">
                      {[...Array(8)].map((_, i) => (
                        <div
                          key={i}
                          className="absolute w-2 h-2 bg-yellow-300 rounded-full animate-pulse"
                          style={{
                            top: `${10 + Math.random() * 80}%`,
                            left: `${10 + Math.random() * 80}%`,
                            animationDelay: `${i * 0.3}s`,
                            animationDuration: "2s",
                            opacity: 0.7,
                          }}
                        />
                      ))}
                    </div>

                    {/* Subtle shadow for depth */}
                    <div
                      className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-3/4 h-4 bg-black rounded-full"
                      style={{
                        filter: "blur(10px)",
                        opacity: 0.1,
                      }}
                    />
                  </div>

                  {/* Design info overlay */}
                  <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 w-5/6 max-w-lg">
                    <div className="bg-white/90 backdrop-blur-sm rounded-xl p-4 shadow-lg border border-pink-100">
                      <div className="flex flex-col gap-2">
                        <div className="flex items-center justify-between text-sm">
                          <div className="flex items-center gap-3">
                            <span className="px-4 py-1.5 bg-gradient-to-r from-pink-100 to-pink-200 text-pink-700 rounded-full capitalize font-medium">
                              {design.shape}
                            </span>
                            <span className="px-4 py-1.5 bg-gradient-to-r from-yellow-100 to-yellow-200 text-yellow-700 rounded-full font-medium">
                              {design.tiers} Tier{design.tiers > 1 ? "s" : ""}
                            </span>
                          </div>
                          <div className="text-gray-700 font-medium text-base">
                            {design.frosting !== "none" &&
                              `${design.frosting} • `}
                            {design.topping !== "none" && `${design.topping}`}
                          </div>
                        </div>
                        <div className="bg-blue-50 text-blue-600 text-xs rounded p-2 flex items-center">
                          <svg
                            className="w-4 h-4 mr-2"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                            xmlns="http://www.w3.org/2000/svg"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth="2"
                              d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                            ></path>
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth="2"
                              d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                            ></path>
                          </svg>
                          <span>
                            Topping và Decoration có thể được kéo thả chính xác
                            theo vùng hình ảnh! Nhiều thành phần có thể được kéo
                            thả độc lập và có thể di chuyển tự do trong vùng mở
                            rộng.
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Design Controls */}
          <div className="w-full lg:w-96 space-y-4">
            {/* Design Options Tabs */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
              <div className="flex gap-2 mb-2">
                {designOptions.map((option) => (
                  <button
                    key={option}
                    onClick={() => setSelectedTab(option)}
                    className={`px-4 py-2 rounded-lg text-sm font-medium flex-1 ${
                      selectedTab === option
                        ? "bg-gradient-to-r from-pink-500 to-yellow-400 text-white"
                        : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                    }`}
                  >
                    {option}
                  </button>
                ))}
              </div>
            </div>

            {/* Content based on selected tab */}
            {selectedTab === "Base" && (
              <>
                {/* Cake Shape */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
                  <h3 className="font-semibold text-gray-800 mb-4">
                    Cake Shape
                  </h3>
                  <div className="mb-3 p-2 bg-blue-50 border border-blue-100 rounded-md text-xs text-blue-600">
                    <span className="flex items-center">
                      <svg
                        className="w-4 h-4 mr-1"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M13 16h-1v-4h-1m1-4h.01M12 8a4 4 0 110 8 4 4 0 010-8z"
                        ></path>
                      </svg>
                      Chọn hình dáng cơ bản cho bánh của bạn
                    </span>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    {shapes.map((shape) => (
                      <button
                        key={shape}
                        onClick={() => updateDesign({ shape })}
                        className={`p-3 rounded-lg border text-sm font-medium ${
                          design.shape === shape
                            ? "bg-gradient-to-r from-pink-500 to-yellow-400 text-white border-pink-500"
                            : "bg-gray-50 text-gray-600 border-gray-200 hover:bg-gray-100"
                        }`}
                      >
                        {shape}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Number of Tiers */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
                  <h3 className="font-semibold text-gray-800 mb-4">
                    Number of Tiers
                  </h3>
                  <div className="mb-3 p-2 bg-blue-50 border border-blue-100 rounded-md text-xs text-blue-600">
                    <span className="flex items-center">
                      <svg
                        className="w-4 h-4 mr-1"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M13 16h-1v-4h-1m1-4h.01M12 8a4 4 0 110 8 4 4 0 010-8z"
                        ></path>
                      </svg>
                      Chọn số tầng cho bánh của bạn
                    </span>
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    {tiers.map((tier) => (
                      <button
                        key={tier}
                        onClick={() => updateDesign({ tiers: tier })}
                        className={`p-3 rounded-lg border text-sm font-medium ${
                          design.tiers === tier
                            ? "bg-gradient-to-r from-pink-500 to-yellow-400 text-white border-pink-500"
                            : "bg-gray-50 text-gray-600 border-gray-200 hover:bg-gray-100"
                        }`}
                      >
                        {tier} Tier{tier > 1 ? "s" : ""}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Size Controls */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
                  <h3 className="font-semibold text-gray-800 mb-4">Size</h3>
                  <div className="space-y-4">
                    <div>
                      <div className="flex justify-between items-center mb-2">
                        <label className="text-sm font-medium text-gray-600">
                          Diameter
                        </label>
                        <span className="text-sm text-gray-500">
                          {diameter} Cm
                        </span>
                      </div>
                      <input
                        type="range"
                        min="10"
                        max="50"
                        value={diameter}
                        onChange={(e) =>
                          setDiameter(Number.parseInt(e.target.value))
                        }
                        className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                      />
                    </div>

                    <div>
                      <div className="flex justify-between items-center mb-2">
                        <label className="text-sm font-medium text-gray-600">
                          Height
                        </label>
                        <span className="text-sm text-gray-500">
                          {height} Cm
                        </span>
                      </div>
                      <input
                        type="range"
                        min="5"
                        max="30"
                        value={height}
                        onChange={(e) =>
                          setHeight(Number.parseInt(e.target.value))
                        }
                        className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                      />
                    </div>

                    <div>
                      <div className="flex justify-between items-center mb-2">
                        <label className="text-sm font-medium text-gray-600">
                          Width
                        </label>
                        <span className="text-sm text-gray-500">
                          {width} Cm
                        </span>
                      </div>
                      <input
                        type="range"
                        min="10"
                        max="40"
                        value={width}
                        onChange={(e) =>
                          setWidth(Number.parseInt(e.target.value))
                        }
                        className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                      />
                    </div>
                  </div>
                </div>
              </>
            )}

            {selectedTab === "Frosting" && (
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
                <h3 className="font-semibold text-gray-800 mb-4">
                  Frosting Options
                </h3>
                <div className="mb-3 p-2 bg-blue-50 border border-blue-100 rounded-md text-xs text-blue-600">
                  <span className="flex items-center">
                    <svg
                      className="w-4 h-4 mr-1"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M13 16h-1v-4h-1m1-4h.01M12 8a4 4 0 110 8 4 4 0 010-8z"
                      ></path>
                    </svg>
                    Chọn loại frosting cho bánh của bạn
                  </span>
                </div>
                <div className="grid grid-cols-1 gap-2">
                  {frostings.map((frosting) => (
                    <button
                      key={frosting}
                      onClick={() => updateDesign({ frosting })}
                      className={`p-3 rounded-lg border text-sm font-medium ${
                        design.frosting === frosting
                          ? "bg-gradient-to-r from-pink-500 to-yellow-400 text-white border-pink-500"
                          : "bg-gray-50 text-gray-600 border-gray-200 hover:bg-gray-100"
                      }`}
                    >
                      {frosting === "none" ? "No Frosting" : frosting}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {selectedTab === "Toppings" && (
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
                <h3 className="font-semibold text-gray-800 mb-4">Toppings</h3>
                <div className="mb-3 p-2 bg-blue-50 border border-blue-100 rounded-md text-xs text-blue-600">
                  <span className="flex items-center">
                    <svg
                      className="w-4 h-4 mr-1"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M13 16h-1v-4h-1m1-4h.01M12 8a4 4 0 110 8 4 4 0 010-8z"
                      ></path>
                    </svg>
                    {design.topping !== "none"
                      ? "Chạm vào hình ảnh để kéo thả và điều chỉnh kích thước topping!"
                      : "Chọn topping để trang trí bánh của bạn"}
                  </span>
                </div>

                {design.topping !== "none" && (
                  <div className="mt-4 border-t border-pink-100 pt-4">
                    <div className="flex justify-between items-center mb-2">
                      <label className="text-sm font-medium text-pink-600">
                        Kích thước topping
                      </label>
                      <span className="text-sm font-semibold bg-pink-100 px-2 py-1 rounded-md text-pink-700">
                        {Math.round(toppingScale * 100)}%
                      </span>
                    </div>
                    <input
                      type="range"
                      min="20"
                      max="200"
                      value={toppingScale * 100}
                      onChange={(e) =>
                        updateToppingScale(Number(e.target.value) / 100)
                      }
                      className="w-full h-3 bg-pink-100 rounded-lg appearance-none cursor-pointer accent-pink-500"
                      style={{
                        background: `linear-gradient(to right, #ec4899 0%, #ec4899 ${
                          ((toppingScale * 100 - 20) / 180) * 100
                        }%, #fce7f3 ${
                          ((toppingScale * 100 - 20) / 180) * 100
                        }%, #fce7f3 100%)`,
                      }}
                    />
                  </div>
                )}
                <div className="grid grid-cols-1 gap-2">
                  {toppings.map((topping) => (
                    <button
                      key={topping}
                      onClick={() => updateDesign({ topping })}
                      className={`p-3 rounded-lg border text-sm font-medium ${
                        design.topping === topping
                          ? "bg-gradient-to-r from-pink-500 to-yellow-400 text-white border-pink-500"
                          : "bg-gray-50 text-gray-600 border-gray-200 hover:bg-gray-100"
                      }`}
                    >
                      {topping === "none" ? "No Topping" : topping}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {selectedTab === "Decor" && (
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
                <h3 className="font-semibold text-gray-800 mb-4">
                  Decorations
                </h3>
                <div className="mb-3 p-2 bg-blue-50 border border-blue-100 rounded-md text-xs text-blue-600">
                  <span className="flex items-center">
                    <svg
                      className="w-4 h-4 mr-1"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M13 16h-1v-4h-1m1-4h.01M12 8a4 4 0 110 8 4 4 0 010-8z"
                      ></path>
                    </svg>
                    {Object.keys(design.decorations).length > 0
                      ? "Chạm vào từng decoration để kéo thả và điều chỉnh kích thước!"
                      : "Chọn decoration để trang trí bánh của bạn"}
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  {decorations.map((decoration) => {
                    const isSelected = decoration.value in design.decorations;
                    return (
                      <button
                        key={decoration.value}
                        onClick={() => toggleDecoration(decoration.value)}
                        className={`p-3 rounded-lg border text-sm font-medium ${
                          isSelected
                            ? "bg-gradient-to-r from-pink-500 to-yellow-400 text-white"
                            : "bg-gray-50 text-gray-600 border-gray-200 hover:bg-gray-100"
                        }`}
                      >
                        {decoration.label}
                      </button>
                    );
                  })}
                </div>

                {Object.keys(design.decorations).length > 0 && (
                  <div className="mt-4 pt-4 border-t border-pink-100">
                    <p className="text-xs text-gray-600 mb-2">
                      Selected decorations:
                    </p>
                    <div className="space-y-3">
                      {Object.entries(design.decorations).map(
                        ([decorValue, quantity]) => {
                          const decor = decorations.find(
                            (d) => d.value === decorValue
                          );
                          return (
                            <div
                              key={decorValue}
                              className="bg-pink-50 rounded-lg p-2 space-y-2"
                            >
                              <div className="flex items-center justify-between">
                                <div className="flex items-center">
                                  <span className="text-sm text-pink-700">
                                    {decor?.label || decorValue}
                                  </span>
                                  <button
                                    className="ml-2 px-2 py-0.5 text-xs bg-pink-100 text-pink-700 rounded hover:bg-pink-200"
                                    onClick={() => toggleDecoration(decorValue)}
                                  >
                                    ×
                                  </button>
                                </div>
                                <div className="flex items-center">
                                  <button
                                    onClick={() =>
                                      updateDecorationQuantity(
                                        decorValue,
                                        quantity - 1
                                      )
                                    }
                                    className="w-6 h-6 flex items-center justify-center bg-pink-100 text-pink-700 rounded hover:bg-pink-200"
                                  >
                                    -
                                  </button>
                                  <span className="mx-2 text-sm text-gray-700 w-6 text-center">
                                    {quantity}
                                  </span>
                                  <button
                                    onClick={() =>
                                      updateDecorationQuantity(
                                        decorValue,
                                        quantity + 1
                                      )
                                    }
                                    className="w-6 h-6 flex items-center justify-center bg-pink-100 text-pink-700 rounded hover:bg-pink-200"
                                  >
                                    +
                                  </button>
                                </div>
                              </div>

                              {/* Scale sliders for each instance */}
                              {Array.from({ length: quantity }, (_, i) => {
                                const decorKey = `${decorValue}_${i}`;
                                const scale = decorationsScales[decorKey] || 1;

                                return (
                                  <div
                                    key={decorKey}
                                    className="pt-1 border-t border-pink-100"
                                  >
                                    <div className="flex justify-between items-center mb-1">
                                      <label className="text-xs text-pink-600">
                                        {decor?.label.split(" ")[0]} #{i + 1} -
                                        Kích thước
                                      </label>
                                      <span className="text-xs font-semibold bg-pink-100 px-2 py-0.5 rounded-md text-pink-700">
                                        {Math.round(scale * 100)}%
                                      </span>
                                    </div>
                                    <input
                                      type="range"
                                      min="20"
                                      max="200"
                                      value={scale * 100}
                                      onChange={(e) =>
                                        updateDecorationScale(
                                          decorKey,
                                          Number(e.target.value) / 100
                                        )
                                      }
                                      className="w-full h-2.5 bg-pink-100 rounded-lg appearance-none cursor-pointer accent-pink-500"
                                      style={{
                                        background: `linear-gradient(to right, #ec4899 0%, #ec4899 ${
                                          ((scale * 100 - 20) / 180) * 100
                                        }%, #fce7f3 ${
                                          ((scale * 100 - 20) / 180) * 100
                                        }%, #fce7f3 100%)`,
                                      }}
                                    />
                                  </div>
                                );
                              })}
                            </div>
                          );
                        }
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Cake Flavors */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
              <h3 className="font-semibold text-gray-800 mb-4">Cake Flavors</h3>
              <div className="flex flex-wrap gap-2">
                {flavors.map((flavor) => (
                  <button
                    key={flavor}
                    onClick={() => toggleFlavor(flavor)}
                    className={`px-3 py-2 rounded-full text-sm font-medium ${
                      selectedFlavors.includes(flavor)
                        ? flavor === "Vanilla"
                          ? "bg-yellow-100 text-yellow-800"
                          : flavor === "Chocolate"
                          ? "bg-amber-100 text-amber-800"
                          : flavor === "Lemon"
                          ? "bg-yellow-100 text-yellow-800"
                          : "bg-red-100 text-red-800"
                        : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                    }`}
                  >
                    {flavor}
                  </button>
                ))}
              </div>
            </div>

            {/* Design Summary */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 bg-gradient-to-br from-pink-100 to-yellow-100">
              <h3 className="font-semibold text-gray-800 mb-4">
                Design Summary
              </h3>
              <div className="space-y-2">
                <div className="text-sm">
                  <span className="font-medium">Base:</span> {design.shape} -{" "}
                  {design.tiers} {design.tiers > 1 ? "tiers" : "tier"}
                </div>
                <div className="text-sm">
                  <span className="font-medium">Size:</span> {diameter}cm x{" "}
                  {height}cm {design.shape !== "Round" && `x ${width}cm`}
                </div>
                <div className="text-sm">
                  <span className="font-medium">Flavor:</span>{" "}
                  {selectedFlavors.join(", ")}
                </div>
                <div className="text-sm">
                  <span className="font-medium">Frosting:</span>{" "}
                  {design.frosting !== "none" ? design.frosting : "None"}
                </div>
                <div className="text-sm">
                  <span className="font-medium">Topping:</span>{" "}
                  {design.topping !== "none" ? design.topping : "None"}
                </div>
                <div className="text-sm">
                  <span className="font-medium">Decorations:</span>{" "}
                  {Object.entries(design.decorations).length > 0
                    ? Object.entries(design.decorations)
                        .map(([decorValue, quantity]) => {
                          const decoration = decorations.find(
                            (d) => d.value === decorValue
                          );
                          const label = decoration
                            ? decoration.label.split(" ")[0]
                            : decorValue;
                          return `${label} (${quantity})`;
                        })
                        .join(", ")
                    : "None"}
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-6 text-center text-xs text-gray-500">
          © 2025 CakeStory. All rights reserved.
        </div>
      </div>
    </div>
  );
};

export default CakeDesign;
