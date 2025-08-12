import { useState, useEffect, useRef } from "react";
import { Download, RotateCcw, Sparkles } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-hot-toast";
import html2canvas from "html2canvas";
import {
  createMagicDesign,
  generateAIImage,
  getCakeDesigns,
} from "../api/cakeDesigns";

// Import cake design assets
const CakeDesign = () => {
  // Ref for cake design area
  const cakeDesignRef = useRef(null);

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
  const [isExporting, setIsExporting] = useState(false);
  const [diameter, setDiameter] = useState(25);
  const [height, setHeight] = useState(15);
  const [width, setWidth] = useState(20);
  const [selectedFlavors, setSelectedFlavors] = useState(["Vanilla"]);
  const [description, setDescription] = useState("");
  const [showAIModal, setShowAIModal] = useState(false);
  const [isGeneratingAI, setIsGeneratingAI] = useState(false);
  const [lastSavedDesignId, setLastSavedDesignId] = useState(null);
  const [aiGeneratedImages, setAiGeneratedImages] = useState([]);
  const [pendingAIGeneration, setPendingAIGeneration] = useState(null); // New state for loading AI
  const [selectedAIImage, setSelectedAIImage] = useState(null); // New state for viewing AI image
  const [showImageModal, setShowImageModal] = useState(false); // New state for image modal
  const [currentPage, setCurrentPage] = useState(1); // Pagination state
  const [imagesPerPage] = useState(6); // Number of images per page
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
  const designOptions = ["Cơ bản", "Phủ kem", "Topping", "Trang trí"];

  // Vietnamese translations for UI
  const shapeLabels = {
    Round: "Tròn",
    Square: "Vuông",
    Heart: "Trái tim",
  };

  const flavorLabels = {
    Vanilla: "Vani",
    Chocolate: "Sô-cô-la",
    Lemon: "Chanh",
    "Red Velvet": "Nhung đỏ",
  };

  const frostingLabels = {
    none: "Không có",
    Buttercream: "Kem bơ",
    Ganache: "Ganache",
    Matcha: "Trà xanh",
  };

  const toppingLabels = {
    none: "Không có",
    Strawberries: "Trái cây",
    "Chocolate Chips": "Chocolate chip",
    Sprinkles: "Kẹo rắc",
    Nuts: "Hạt",
  };

  // Decoration options
  const decorations = [
    {
      value: "CakeCandle",
      label: "Nến 🕯️",
      filename: "CakeCandle.png",
    },
    {
      value: "Flower",
      label: "Hoa 🌸",
      filename: "Flower.png",
    },
    {
      value: "happy birthday",
      label: "Chúc mừng sinh nhật 🎂",
      filename: "happy birthday.png",
    },
    {
      value: "figurine 1",
      label: "Tượng nhỏ 1 🎭",
      filename: "figurine 1.png",
    },
    {
      value: "figurine 2",
      label: "Tượng nhỏ 2 🎭",
      filename: "figurine 2.png",
    },
    {
      value: "ribbon 1",
      label: "Ruy băng 1 🎀",
      filename: "ribbon 1.png",
    },
    {
      value: "ribbon 2",
      label: "Ruy băng 2 🎀",
      filename: "ribbon 2.png",
    },
    {
      value: "pearl 1",
      label: "Ngọc trai 1 ⚪",
      filename: "pearl 1.png",
    },
    {
      value: "pearl 2",
      label: "Ngọc trai 2 ⚪",
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
    setDescription(""); // Đặt lại description
  };

  // Toggle flavor selection
  const toggleFlavor = (flavor) => {
    setSelectedFlavors((prev) =>
      prev.includes(flavor)
        ? prev.filter((f) => f !== flavor)
        : [...prev, flavor]
    );
  };

  // Load AI generated images
  const loadAIImages = async () => {
    try {
      const response = await getCakeDesigns(1, 10);
      if (response.success) {
        const imagesWithAI = response.data.cakeDesigns.filter(
          (design) => design.ai_generated
        );
        setAiGeneratedImages(imagesWithAI);
      }
    } catch (error) {
      console.error("Error loading AI images:", error);
    }
  };

  // Load AI images on component mount
  useEffect(() => {
    loadAIImages();
  }, []);

  // Handle pagination when images change
  useEffect(() => {
    const totalPages = getTotalPages();
    if (currentPage > totalPages && totalPages > 0) {
      setCurrentPage(totalPages);
    }
  }, [aiGeneratedImages.length, pendingAIGeneration, currentPage]);

  // Handle ESC key to close image modal
  useEffect(() => {
    const handleEscKey = (event) => {
      if (event.key === "Escape" && showImageModal) {
        closeImageModal();
      }
    };

    if (showImageModal) {
      document.addEventListener("keydown", handleEscKey);
    }

    return () => {
      document.removeEventListener("keydown", handleEscKey);
    };
  }, [showImageModal]);

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
            if (String(key).startsWith(`${decoration}_`)) {
              delete updatedPositions[key];
            }
          });
          return updatedPositions;
        });

        setDecorationsScales((prevScales) => {
          const updatedScales = { ...prevScales };
          Object.keys(updatedScales).forEach((key) => {
            if (String(key).startsWith(`${decoration}_`)) {
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

  // Export cake design as image and auto-upload to server
  const exportDesign = async () => {
    if (isExporting) return;
    setIsExporting(true);

    try {
      if (cakeDesignRef.current) {
        // Get the current dimensions of the cake design element
        const rect = cakeDesignRef.current.getBoundingClientRect();

        // Capture the cake design as image with exact dimensions
        const canvas = await html2canvas(cakeDesignRef.current, {
          backgroundColor: null,
          scale: 1, // Use 1:1 scale to match display exactly
          width: rect.width,
          height: rect.height,
          useCORS: true,
          allowTaint: false,
          logging: false,
          scrollX: 0,
          scrollY: 0,
        });

        // Convert to blob
        canvas.toBlob(async (blob) => {
          if (blob) {
            const fileName = `cake-design-${design.shape}-${Date.now()}.png`;

            // Create download link for local save
            const url = URL.createObjectURL(blob);
            const link = document.createElement("a");
            link.href = url;
            link.download = fileName;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            URL.revokeObjectURL(url);

            // Show success message for local save
            toast.success("Thiết kế bánh đã được lưu vào máy tính của bạn!");

            // Auto-upload to server
            try {
              // Create design summary for description
              const designSummary = `Cơ bản: ${
                shapeLabels[design.shape]
              } - ${String(design.tiers)} ${design.tiers > 1 ? "tầng" : "tầng"}
Kích cỡ: ${String(diameter)}cm x ${String(height)}cm${
                design.shape !== "Round" ? ` x ${String(width)}cm` : ""
              }
Hương vị: ${selectedFlavors.map((f) => flavorLabels[f]).join(", ")}
Phủ kem: ${frostingLabels[design.frosting]}
Topping: ${toppingLabels[design.topping]}
Trang trí: ${
                Object.entries(design.decorations).length > 0
                  ? Object.entries(design.decorations)
                      .map(([decorValue, quantity]) => {
                        const decoration = decorations.find(
                          (d) => d.value === decorValue
                        );
                        const label = decoration
                          ? String(decoration.label).split(" ")[0]
                          : String(decorValue);
                        return `${label} (${String(quantity)})`;
                      })
                      .join(", ")
                  : "Không có"
              }`;

              const fullDescription =
                description && String(description).trim()
                  ? `${String(
                      description
                    )}\n\nChi tiết thiết kế:\n${designSummary}`
                  : `Chi tiết thiết kế:\n${designSummary}`;

              // Generate AI prompt description for the design
              const aiPromptDescription = generateAIPromptDescription();

              const formData = new FormData();
              // Create a File object from the blob for upload
              const imageFile = new File([blob], fileName, {
                type: "image/png",
              });
              formData.append("design_image", imageFile);
              formData.append("description", String(aiPromptDescription));
              formData.append("is_public", "true");
              formData.append("ai_generated", "");
              // Add AI prompt for immediate processing
              formData.append("ai_prompt", String(aiPromptDescription));

              console.log("Auto-uploading to API:", {
                description: String(aiPromptDescription),
                ai_prompt: String(aiPromptDescription),
                is_public: "true",
                ai_generated: "",
                file_name: fileName,
              });

              const uploadResponse = await createMagicDesign(formData);
              toast.success("Thiết kế cũng đã được tải lên server thành công!");

              // Get the saved design ID from response and show AI modal
              if (uploadResponse.success && uploadResponse.data?.id) {
                setLastSavedDesignId(uploadResponse.data.id);
                setShowAIModal(true);
              }
            } catch (uploadError) {
              console.error("Auto-upload error:", uploadError);
              toast.error(
                "Không thể tải lên server, nhưng hình ảnh đã được lưu cục bộ!"
              );
            }
          }
          setIsExporting(false);
        }, "image/png");
      }
    } catch (error) {
      console.error("Error exporting design:", error);
      toast.error("Không thể xuất thiết kế thành hình ảnh");
      setIsExporting(false);
    }
  };

  // Generate detailed AI prompt description
  const generateAIPromptDescription = () => {
    const shapeVN = shapeLabels[design.shape];
    const frostingVN = frostingLabels[design.frosting];
    const toppingVN = toppingLabels[design.topping];
    const flavorsVN = selectedFlavors.map((f) => flavorLabels[f]);

    // Base description with cake details - emphasize tier count clearly
    let prompt = `Tạo hình ảnh một chiếc bánh kem hình ${shapeVN.toLowerCase()}`;

    // Emphasize tier count with specific description
    if (design.tiers === 1) {
      prompt += `, HIỂN THỊ MỘT TẦNG duy nhất`;
    } else if (design.tiers === 2) {
      prompt += `, HIỂN THỊ HAI TẦNG xếp chồng lên nhau (tầng dưới lớn hơn tầng trên)`;
    } else if (design.tiers === 3) {
      prompt += `, HIỂN THỊ BA TẦNG xếp chồng lên nhau (tầng dưới lớn nhất, tầng giữa vừa, tầng trên nhỏ nhất)`;
    }

    // Add size as note for bakers (not for AI generation)
    prompt += `. [Ghi chú kích thước cho thợ làm bánh ở góc trên ảnh: ${diameter}cm x ${height}cm`;
    if (design.shape !== "Round") {
      prompt += ` x ${width}cm`;
    }
    prompt += `]`;

    // Add flavors
    if (flavorsVN.length > 1) {
      prompt += ` Bánh có nhiều hương vị kết hợp gồm ${flavorsVN
        .join(", ")
        .toLowerCase()}.`;
    } else {
      prompt += ` Bánh có hương vị ${flavorsVN[0].toLowerCase()}.`;
    }

    // Add frosting
    if (design.frosting !== "none") {
      const frostingDesc =
        design.frosting === "Buttercream"
          ? "kem bơ mịn màng"
          : design.frosting === "Ganache"
          ? "ganache mịn bóng"
          : design.frosting === "Matcha"
          ? "kem trà xanh thanh mát"
          : frostingVN.toLowerCase();
      prompt += ` Toàn bộ bánh được phủ lớp ${frostingDesc}.`;
    }

    // Add toppings
    if (design.topping !== "none") {
      const toppingDesc =
        design.topping === "Strawberries"
          ? "trái cây tươi nhiều màu sắc"
          : design.topping === "Chocolate Chips"
          ? "chocolate chip thơm ngon"
          : design.topping === "Sprinkles"
          ? "kẹo rắc nhiều màu sắc"
          : design.topping === "Nuts"
          ? "hạt thơm bùi"
          : toppingVN.toLowerCase();
      prompt += ` Trên bề mặt trang trí topping ${toppingDesc}.`;
    }

    // Add decorations
    const decorationsList = Object.entries(design.decorations);
    if (decorationsList.length > 0) {
      const decorationsDesc = decorationsList
        .map(([decorValue, quantity]) => {
          const decoration = decorations.find((d) => d.value === decorValue);
          if (!decoration) return null;

          const decorName = decoration.label.split(" ")[0].toLowerCase();
          const decorDesc = decorValue.includes("ribbon")
            ? "ruy-băng trang trí duyên dáng"
            : decorValue.includes("candle")
            ? "nến sinh nhật"
            : decorValue.includes("flower")
            ? "hoa tươi xinh đẹp"
            : decorValue.includes("figurine")
            ? "tượng nhỏ đáng yêu"
            : decorValue.includes("pearl")
            ? "ngọc trai sang trọng"
            : decorValue.includes("happy birthday")
            ? "chữ chúc mừng sinh nhật"
            : decorName;

          return `${decorDesc} (${quantity} ${
            quantity > 1 ? "chiếc" : "chiếc"
          })`;
        })
        .filter(Boolean);

      if (decorationsDesc.length > 0) {
        prompt += ` Thêm ${decorationsDesc.join(", ")} trang trí tinh tế.`;
      }
    }

    // Add professional photography style
    prompt += ` Phong cách chụp ảnh ánh sáng mềm mại, nền sang trọng, làm nổi bật chi tiết và màu sắc của bánh.`;

    return prompt;
  };

  // Generate AI image for saved design
  const handleGenerateAI = async () => {
    if (!lastSavedDesignId || isGeneratingAI) return;

    setIsGeneratingAI(true);
    setShowAIModal(false);

    // Add pending AI generation placeholder
    const pendingItem = {
      id: `pending-${Date.now()}`,
      isLoading: true,
      description: generateAIPromptDescription(),
      created_at: new Date().toISOString(),
    };
    setPendingAIGeneration(pendingItem);
    setCurrentPage(1); // Reset to first page to show pending generation

    try {
      // Call API without description since it was already sent during design creation
      await generateAIImage(lastSavedDesignId);
      toast.success("Đang tạo ảnh AI cho thiết kế của bạn...");

      // Refresh AI images after a short delay to show the new one
      setTimeout(async () => {
        await loadAIImages();
        toast.success("Ảnh AI đã được tạo thành công!");
        setIsGeneratingAI(false);
        setPendingAIGeneration(null); // Remove loading placeholder
        setCurrentPage(1); // Reset to first page to show new image
      }, 3000);
    } catch (error) {
      console.error("Error generating AI image:", error);
      toast.error("Không thể tạo ảnh AI. Vui lòng thử lại!");
      setIsGeneratingAI(false);
      setPendingAIGeneration(null); // Remove loading placeholder on error
    }
  };

  // Handle AI image click to show full size
  const handleAIImageClick = (imageData) => {
    setSelectedAIImage(imageData);
    setShowImageModal(true);
  };

  // Close image modal
  const closeImageModal = () => {
    setShowImageModal(false);
    setSelectedAIImage(null);
  };

  // Pagination functions
  const getTotalPages = () => {
    const totalImages =
      aiGeneratedImages.length + (pendingAIGeneration ? 1 : 0);
    return Math.ceil(totalImages / imagesPerPage);
  };

  const getCurrentPageImages = () => {
    const startIndex = (currentPage - 1) * imagesPerPage;
    const endIndex = startIndex + imagesPerPage;

    // Combine pending generation with existing images
    const allImages = [];
    if (pendingAIGeneration) {
      allImages.push({ isPending: true, ...pendingAIGeneration });
    }
    allImages.push(...aiGeneratedImages);

    return allImages.slice(startIndex, endIndex);
  };

  const goToPage = (page) => {
    setCurrentPage(Math.max(1, Math.min(page, getTotalPages())));
  };

  const goToPreviousPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  const goToNextPage = () => {
    if (currentPage < getTotalPages()) {
      setCurrentPage(currentPage + 1);
    }
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
    <>
      <style>
        {`
          @keyframes shimmer {
            0% {
              transform: translateX(-100%);
            }
            100% {
              transform: translateX(100%);
            }
          }
        `}
      </style>
      <div className="min-h-screen bg-gradient-to-br from-pink-50 via-white to-yellow-50">
        {/* Top Navigation */}
        <header className="bg-white/90 backdrop-blur-sm border-b border-pink-100 px-6 py-4 sticky top-0 z-50">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-pink-400 to-yellow-400 rounded-xl flex items-center justify-center">
                <span className="text-white text-xl">🎂</span>
              </div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-pink-600 to-yellow-500 bg-clip-text text-transparent">
                Xưởng Thiết Kế Bánh
              </h1>
            </div>

            <div className="flex items-center gap-3">
              <button
                className="px-4 py-2 border border-gray-300 rounded-lg text-sm hover:bg-gray-50 transition-colors"
                onClick={resetDesign}
              >
                <RotateCcw className="w-4 h-4 mr-2 inline" />
                Đặt lại
              </button>
              <button
                className={`px-5 py-2 rounded-lg text-sm font-semibold flex items-center gap-2 shadow-sm transition-all duration-200
    border border-pink-300 bg-white text-pink-700 hover:bg-pink-100 hover:border-pink-400
    ${isExporting ? "opacity-50 cursor-not-allowed" : ""}
  `}
                onClick={exportDesign}
                disabled={isExporting}
              >
                <Download className="w-5 h-5 mr-2 inline" />
                {isExporting ? "Đang lưu..." : "Lưu thiết kế & tạo ảnh AI"}
              </button>
              <button
                className="px-4 py-2 bg-gradient-to-r from-pink-400 to-purple-400 text-white rounded-lg font-semibold shadow hover:from-pink-500 hover:to-purple-500 transition-all duration-200"
                onClick={() => navigate("/ai-generated-images")}
              >
                <Sparkles className="w-4 h-4 mr-2 inline" />
                Tạo bằng văn bản
              </button>
            </div>
          </div>
        </header>

        <div className="p-3 max-w-[1400px] mx-auto">
          <div className="flex flex-col lg:flex-row gap-10">
            {/* Cake Preview Area */}
            <div className="flex-1">
              <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-3 h-[750px]">
                {/* Cake Preview */}
                <div
                  className={`h-full transition-all duration-300 flex justify-center items-center ${
                    isAnimating
                      ? "scale-95 opacity-80"
                      : "scale-100 opacity-100"
                  }`}
                >
                  <div
                    ref={cakeDesignRef}
                    className="relative w-full h-full flex items-center justify-center bg-gradient-to-br from-pink-50 via-white to-yellow-50 rounded-2xl overflow-hidden"
                  >
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
                          return Array.from(
                            { length: quantity },
                            (_, index) => {
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
                                      currentDraggingItem?.type ===
                                        "decoration" &&
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
                            }
                          );
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
                  </div>
                </div>
              </div>
            </div>

            {/* Design Controls */}
            <div className="w-full lg:w-96">
              <div
                className="h-[750px] overflow-y-auto space-y-3 pr-2"
                style={{
                  scrollbarWidth: "thin",
                  scrollbarColor: "#f472b6 transparent",
                }}
                onScroll={(e) => {
                  // Add smooth scrolling visual feedback
                  e.target.style.scrollBehavior = "smooth";
                }}
              >
                {/* Description Input */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-3">
                  <h3 className="font-semibold text-gray-800 mb-3 flex items-center text-sm">
                    <span className="w-2 h-5 bg-gradient-to-b from-pink-400 to-purple-400 rounded-full mr-2"></span>
                    Mô tả thiết kế
                  </h3>
                  <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Mô tả chi tiết về thiết kế bánh của bạn (tùy chọn)..."
                    className="w-full h-16 p-2 border border-gray-200 rounded-lg resize-none focus:ring-2 focus:ring-pink-500 focus:border-transparent text-xs transition-all"
                    maxLength={500}
                  />
                  <div className="text-xs text-gray-400 mt-1 text-right">
                    {description.length}/500 ký tự
                  </div>
                </div>

                {/* Design Summary */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-3 bg-gradient-to-br from-pink-50 to-yellow-50">
                  <h3 className="font-semibold text-gray-800 mb-3 flex items-center text-sm">
                    <span className="w-2 h-5 bg-gradient-to-b from-pink-400 to-purple-400 rounded-full mr-2"></span>
                    Tóm tắt thiết kế
                  </h3>
                  <div className="space-y-2">
                    <div className="flex items-start gap-2">
                      <span className="font-medium text-pink-600 min-w-[70px] text-xs">
                        Cơ bản:
                      </span>
                      <span className="text-gray-700 text-xs">
                        {shapeLabels[design.shape]} - {design.tiers}{" "}
                        {design.tiers > 1 ? "tầng" : "tầng"}
                      </span>
                    </div>
                    <div className="flex items-start gap-2">
                      <span className="font-medium text-pink-600 min-w-[70px] text-xs">
                        Kích cỡ:
                      </span>
                      <span className="text-gray-700 text-xs">
                        {diameter}cm x {height}cm{" "}
                        {design.shape !== "Round" && `x ${width}cm`}
                      </span>
                    </div>
                    <div className="flex items-start gap-2">
                      <span className="font-medium text-pink-600 min-w-[70px] text-xs">
                        Hương vị:
                      </span>
                      <span className="text-gray-700 text-xs">
                        {selectedFlavors.map((f) => flavorLabels[f]).join(", ")}
                      </span>
                    </div>
                    <div className="flex items-start gap-2">
                      <span className="font-medium text-pink-600 min-w-[70px] text-xs">
                        Phủ kem:
                      </span>
                      <span className="text-gray-700 text-xs">
                        {frostingLabels[design.frosting]}
                      </span>
                    </div>
                    <div className="flex items-start gap-2">
                      <span className="font-medium text-pink-600 min-w-[70px] text-xs">
                        Topping:
                      </span>
                      <span className="text-gray-700 text-xs">
                        {toppingLabels[design.topping]}
                      </span>
                    </div>
                    <div className="flex items-start gap-2">
                      <span className="font-medium text-pink-600 min-w-[70px] text-xs">
                        Trang trí:
                      </span>
                      <span className="text-gray-700 text-xs">
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
                          : "Không có"}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Design Options Tabs */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-3">
                  <div className="flex gap-1 mb-2 bg-gray-50 rounded-lg p-1">
                    {["Cơ bản", "Phủ kem", "Topping", "Trang trí"].map(
                      (option, index) => (
                        <button
                          key={option}
                          onClick={() => setSelectedTab(option)}
                          className={`px-3 py-2 rounded-md text-xs font-medium flex-1 transition-all duration-200 ${
                            selectedTab === option
                              ? "bg-gradient-to-r from-pink-500 to-yellow-400 text-white shadow-md"
                              : "text-gray-600 hover:bg-white hover:shadow-sm"
                          }`}
                        >
                          {option}
                        </button>
                      )
                    )}
                  </div>
                </div>

                {/* Content based on selected tab */}
                {selectedTab === "Cơ bản" && (
                  <>
                    {/* Cake Shape */}
                    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-3">
                      <h3 className="font-semibold text-gray-800 mb-3 flex items-center text-sm">
                        <span className="w-2 h-5 bg-gradient-to-b from-pink-400 to-purple-400 rounded-full mr-2"></span>
                        Hình dáng bánh
                      </h3>
                      <div className="mb-3 p-2 bg-blue-50 border border-blue-200 rounded-lg">
                        <div className="flex items-center text-xs text-blue-700">
                          <svg
                            className="w-3 h-3 mr-2 flex-shrink-0"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth="2"
                              d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                            ></path>
                          </svg>
                          <span>
                            Chọn hình dáng cơ bản cho chiếc bánh của bạn
                          </span>
                        </div>
                      </div>
                      <div className="grid grid-cols-3 gap-2">
                        {shapes.map((shape) => (
                          <button
                            key={shape}
                            onClick={() => updateDesign({ shape })}
                            className={`p-2 rounded-xl border-2 text-xs font-medium transition-all duration-200 hover:scale-105 ${
                              design.shape === shape
                                ? "bg-gradient-to-r from-pink-500 to-yellow-400 text-white border-pink-500 shadow-lg"
                                : "bg-gray-50 text-gray-700 border-gray-200 hover:bg-gray-100 hover:border-gray-300"
                            }`}
                          >
                            <div className="text-center">
                              <div className="text-lg mb-1">
                                {shape === "Round"
                                  ? "⭕"
                                  : shape === "Square"
                                  ? "⬜"
                                  : "💖"}
                              </div>
                              {shapeLabels[shape]}
                            </div>
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Number of Tiers */}
                    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
                      <h3 className="font-semibold text-gray-800 mb-4 flex items-center">
                        <span className="w-2 h-6 bg-gradient-to-b from-pink-400 to-purple-400 rounded-full mr-2"></span>
                        Số tầng bánh
                      </h3>
                      <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                        <div className="flex items-center text-sm text-blue-700">
                          <svg
                            className="w-4 h-4 mr-2 flex-shrink-0"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth="2"
                              d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                            ></path>
                          </svg>
                          <span>Chọn số tầng cho chiếc bánh của bạn</span>
                        </div>
                      </div>
                      <div className="grid grid-cols-3 gap-3">
                        {tiers.map((tier) => (
                          <button
                            key={tier}
                            onClick={() => updateDesign({ tiers: tier })}
                            className={`p-4 rounded-xl border-2 text-sm font-medium transition-all duration-200 hover:scale-105 ${
                              design.tiers === tier
                                ? "bg-gradient-to-r from-pink-500 to-yellow-400 text-white border-pink-500 shadow-lg"
                                : "bg-gray-50 text-gray-700 border-gray-200 hover:bg-gray-100 hover:border-gray-300"
                            }`}
                          >
                            <div className="text-center">
                              <div className="text-lg mb-1">🎂</div>
                              {tier} Tầng
                            </div>
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Size Controls */}
                    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
                      <h3 className="font-semibold text-gray-800 mb-4 flex items-center">
                        <span className="w-2 h-6 bg-gradient-to-b from-pink-400 to-purple-400 rounded-full mr-2"></span>
                        Kích thước bánh
                      </h3>
                      <div className="space-y-6">
                        <div>
                          <div className="flex justify-between items-center mb-3">
                            <label className="text-sm font-medium text-gray-700 flex items-center">
                              <span className="w-3 h-3 bg-pink-400 rounded-full mr-2"></span>
                              Đường kính
                            </label>
                            <span className="text-sm font-semibold bg-pink-100 px-3 py-1 rounded-full text-pink-700">
                              {diameter} cm
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
                            className="w-full h-3 bg-pink-100 rounded-lg appearance-none cursor-pointer accent-pink-500"
                            style={{
                              background: `linear-gradient(to right, #ec4899 0%, #ec4899 ${
                                ((diameter - 10) / 40) * 100
                              }%, #fce7f3 ${
                                ((diameter - 10) / 40) * 100
                              }%, #fce7f3 100%)`,
                            }}
                          />
                          <div className="flex justify-between text-xs text-gray-400 mt-1">
                            <span>10cm</span>
                            <span>50cm</span>
                          </div>
                        </div>

                        <div>
                          <div className="flex justify-between items-center mb-3">
                            <label className="text-sm font-medium text-gray-700 flex items-center">
                              <span className="w-3 h-3 bg-yellow-400 rounded-full mr-2"></span>
                              Chiều cao
                            </label>
                            <span className="text-sm font-semibold bg-yellow-100 px-3 py-1 rounded-full text-yellow-700">
                              {height} cm
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
                            className="w-full h-3 bg-yellow-100 rounded-lg appearance-none cursor-pointer accent-yellow-500"
                            style={{
                              background: `linear-gradient(to right, #eab308 0%, #eab308 ${
                                ((height - 5) / 25) * 100
                              }%, #fef3c7 ${
                                ((height - 5) / 25) * 100
                              }%, #fef3c7 100%)`,
                            }}
                          />
                          <div className="flex justify-between text-xs text-gray-400 mt-1">
                            <span>5cm</span>
                            <span>30cm</span>
                          </div>
                        </div>

                        <div>
                          <div className="flex justify-between items-center mb-3">
                            <label className="text-sm font-medium text-gray-700 flex items-center">
                              <span className="w-3 h-3 bg-purple-400 rounded-full mr-2"></span>
                              Chiều rộng
                            </label>
                            <span className="text-sm font-semibold bg-purple-100 px-3 py-1 rounded-full text-purple-700">
                              {width} cm
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
                            className="w-full h-3 bg-purple-100 rounded-lg appearance-none cursor-pointer accent-purple-500"
                            style={{
                              background: `linear-gradient(to right, #a855f7 0%, #a855f7 ${
                                ((width - 10) / 30) * 100
                              }%, #f3e8ff ${
                                ((width - 10) / 30) * 100
                              }%, #f3e8ff 100%)`,
                            }}
                          />
                          <div className="flex justify-between text-xs text-gray-400 mt-1">
                            <span>10cm</span>
                            <span>40cm</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </>
                )}

                {selectedTab === "Phủ kem" && (
                  <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
                    <h3 className="font-semibold text-gray-800 mb-4 flex items-center">
                      <span className="w-2 h-6 bg-gradient-to-b from-pink-400 to-purple-400 rounded-full mr-2"></span>
                      Lựa chọn phủ kem
                    </h3>
                    <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                      <div className="flex items-center text-sm text-blue-700">
                        <svg
                          className="w-4 h-4 mr-2 flex-shrink-0"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                          ></path>
                        </svg>
                        <span>
                          Chọn loại phủ kem yêu thích cho chiếc bánh của bạn
                        </span>
                      </div>
                    </div>
                    <div className="grid grid-cols-1 gap-3">
                      {frostings.map((frosting) => (
                        <button
                          key={frosting}
                          onClick={() => updateDesign({ frosting })}
                          className={`p-4 rounded-xl border-2 text-sm font-medium transition-all duration-200 hover:scale-102 ${
                            design.frosting === frosting
                              ? "bg-gradient-to-r from-pink-500 to-yellow-400 text-white border-pink-500 shadow-lg"
                              : "bg-gray-50 text-gray-700 border-gray-200 hover:bg-gray-100 hover:border-gray-300"
                          }`}
                        >
                          <div className="flex items-center justify-center">
                            <span className="mr-2 text-lg">
                              {frosting === "none"
                                ? "🚫"
                                : frosting === "Buttercream"
                                ? "🧈"
                                : frosting === "Ganache"
                                ? "🍫"
                                : "🍃"}
                            </span>
                            {frostingLabels[frosting]}
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {selectedTab === "Topping" && (
                  <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
                    <h3 className="font-semibold text-gray-800 mb-4 flex items-center">
                      <span className="w-2 h-6 bg-gradient-to-b from-pink-400 to-purple-400 rounded-full mr-2"></span>
                      Lựa chọn topping
                    </h3>
                    <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                      <div className="flex items-center text-sm text-blue-700">
                        <svg
                          className="w-4 h-4 mr-2 flex-shrink-0"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                          ></path>
                        </svg>
                        <span>
                          {design.topping !== "none"
                            ? "Chạm vào hình ảnh để kéo thả và điều chỉnh kích thước topping!"
                            : "Chọn topping để trang trí chiếc bánh của bạn"}
                        </span>
                      </div>
                    </div>

                    {design.topping !== "none" && (
                      <div className="mb-6 p-4 bg-gradient-to-r from-pink-50 to-purple-50 border border-pink-200 rounded-xl">
                        <div className="flex justify-between items-center mb-3">
                          <label className="text-sm font-semibold text-pink-700 flex items-center">
                            <span className="w-3 h-3 bg-pink-500 rounded-full mr-2"></span>
                            Kích thước topping
                          </label>
                          <span className="text-sm font-bold bg-pink-200 px-3 py-1 rounded-full text-pink-800">
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
                        <div className="flex justify-between text-xs text-pink-600 mt-1">
                          <span>20%</span>
                          <span>200%</span>
                        </div>
                      </div>
                    )}

                    <div className="grid grid-cols-1 gap-3">
                      {toppings.map((topping) => (
                        <button
                          key={topping}
                          onClick={() => updateDesign({ topping })}
                          className={`p-4 rounded-xl border-2 text-sm font-medium transition-all duration-200 hover:scale-102 ${
                            design.topping === topping
                              ? "bg-gradient-to-r from-pink-500 to-yellow-400 text-white border-pink-500 shadow-lg"
                              : "bg-gray-50 text-gray-700 border-gray-200 hover:bg-gray-100 hover:border-gray-300"
                          }`}
                        >
                          <div className="flex items-center justify-center">
                            <span className="mr-2 text-lg">
                              {topping === "none"
                                ? "🚫"
                                : topping === "Strawberries"
                                ? "🍓"
                                : topping === "Chocolate Chips"
                                ? "🍫"
                                : topping === "Sprinkles"
                                ? "🌈"
                                : "🥜"}
                            </span>
                            {toppingLabels[topping]}
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {selectedTab === "Trang trí" && (
                  <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
                    <h3 className="font-semibold text-gray-800 mb-4 flex items-center">
                      <span className="w-2 h-6 bg-gradient-to-b from-pink-400 to-purple-400 rounded-full mr-2"></span>
                      Phụ kiện trang trí
                    </h3>
                    <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                      <div className="flex items-center text-sm text-blue-700">
                        <svg
                          className="w-4 h-4 mr-2 flex-shrink-0"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                          ></path>
                        </svg>
                        <span>
                          {Object.keys(design.decorations).length > 0
                            ? "Chạm vào từng phụ kiện để kéo thả và điều chỉnh kích thước!"
                            : "Chọn phụ kiện trang trí để làm đẹp chiếc bánh của bạn"}
                        </span>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      {decorations.map((decoration) => {
                        const isSelected =
                          decoration.value in design.decorations;
                        return (
                          <button
                            key={decoration.value}
                            onClick={() => toggleDecoration(decoration.value)}
                            className={`p-4 rounded-xl border-2 text-sm font-medium transition-all duration-200 hover:scale-105 ${
                              isSelected
                                ? "bg-gradient-to-r from-pink-500 to-yellow-400 text-white border-pink-500 shadow-lg"
                                : "bg-gray-50 text-gray-700 border-gray-200 hover:bg-gray-100 hover:border-gray-300"
                            }`}
                          >
                            <div className="text-center">
                              <div className="text-lg mb-1">
                                {decoration.label.split(" ").pop()}
                              </div>
                              <div className="text-xs">
                                {decoration.label
                                  .split(" ")
                                  .slice(0, -1)
                                  .join(" ")}
                              </div>
                            </div>
                          </button>
                        );
                      })}
                    </div>

                    {Object.keys(design.decorations).length > 0 && (
                      <div className="mt-6 pt-4 border-t border-pink-200">
                        <h4 className="text-sm font-semibold text-pink-700 mb-3 flex items-center">
                          <span className="w-2 h-4 bg-pink-500 rounded-full mr-2"></span>
                          Phụ kiện đã chọn:
                        </h4>
                        <div className="space-y-4">
                          {Object.entries(design.decorations).map(
                            ([decorValue, quantity]) => {
                              const decor = decorations.find(
                                (d) => d.value === decorValue
                              );
                              return (
                                <div
                                  key={decorValue}
                                  className="bg-gradient-to-r from-pink-50 to-purple-50 rounded-xl p-4 border border-pink-200"
                                >
                                  <div className="flex items-center justify-between mb-3">
                                    <div className="flex items-center">
                                      <span className="text-sm font-medium text-pink-800">
                                        {decor?.label || decorValue}
                                      </span>
                                      <button
                                        className="ml-3 px-2 py-1 text-xs bg-pink-200 text-pink-800 rounded-full hover:bg-pink-300 transition-colors"
                                        onClick={() =>
                                          toggleDecoration(decorValue)
                                        }
                                      >
                                        Xóa
                                      </button>
                                    </div>
                                    <div className="flex items-center bg-white rounded-lg border border-pink-200">
                                      <button
                                        onClick={() =>
                                          updateDecorationQuantity(
                                            decorValue,
                                            quantity - 1
                                          )
                                        }
                                        className="w-8 h-8 flex items-center justify-center text-pink-600 hover:bg-pink-50 rounded-l-lg transition-colors"
                                      >
                                        -
                                      </button>
                                      <span className="px-3 py-1 text-sm font-semibold text-pink-800 border-x border-pink-200 bg-pink-50">
                                        {quantity}
                                      </span>
                                      <button
                                        onClick={() =>
                                          updateDecorationQuantity(
                                            decorValue,
                                            quantity + 1
                                          )
                                        }
                                        className="w-8 h-8 flex items-center justify-center text-pink-600 hover:bg-pink-50 rounded-r-lg transition-colors"
                                      >
                                        +
                                      </button>
                                    </div>
                                  </div>

                                  {/* Scale sliders for each instance */}
                                  {Array.from({ length: quantity }, (_, i) => {
                                    const decorKey = `${decorValue}_${i}`;
                                    const scale =
                                      decorationsScales[decorKey] || 1;

                                    return (
                                      <div
                                        key={decorKey}
                                        className="pt-3 border-t border-pink-200"
                                      >
                                        <div className="flex justify-between items-center mb-2">
                                          <label className="text-xs font-medium text-pink-700">
                                            {decor?.label.split(" ")[0]} #
                                            {i + 1} - Kích thước
                                          </label>
                                          <span className="text-xs font-bold bg-pink-200 px-2 py-1 rounded-full text-pink-800">
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
                                        <div className="flex justify-between text-xs text-pink-600 mt-1">
                                          <span>20%</span>
                                          <span>200%</span>
                                        </div>
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
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-3">
                  <h3 className="font-semibold text-gray-800 mb-3 flex items-center text-sm">
                    <span className="w-2 h-5 bg-gradient-to-b from-pink-400 to-purple-400 rounded-full mr-2"></span>
                    Hương vị bánh
                  </h3>
                  <div className="mb-3 p-2 bg-amber-50 border border-amber-200 rounded-lg">
                    <div className="flex items-center text-xs text-amber-700">
                      <svg
                        className="w-3 h-3 mr-2 flex-shrink-0"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
                        ></path>
                      </svg>
                      <span>
                        Có thể chọn nhiều hương vị để tạo sự đa dạng cho bánh
                      </span>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    {flavors.map((flavor) => (
                      <button
                        key={flavor}
                        onClick={() => toggleFlavor(flavor)}
                        className={`px-3 py-2 rounded-xl text-xs font-medium transition-all duration-200 hover:scale-105 border-2 ${
                          selectedFlavors.includes(flavor)
                            ? flavor === "Vanilla"
                              ? "bg-gradient-to-r from-yellow-400 to-yellow-500 text-white border-yellow-500 shadow-lg"
                              : flavor === "Chocolate"
                              ? "bg-gradient-to-r from-amber-600 to-amber-700 text-white border-amber-600 shadow-lg"
                              : flavor === "Lemon"
                              ? "bg-gradient-to-r from-yellow-300 to-yellow-400 text-yellow-900 border-yellow-400 shadow-lg"
                              : "bg-gradient-to-r from-red-500 to-red-600 text-white border-red-500 shadow-lg"
                            : "bg-gray-50 text-gray-700 border-gray-200 hover:bg-gray-100 hover:border-gray-300"
                        }`}
                      >
                        <div className="text-center">
                          <div className="text-sm mb-1">
                            {flavor === "Vanilla"
                              ? "🍦"
                              : flavor === "Chocolate"
                              ? "🍫"
                              : flavor === "Lemon"
                              ? "🍋"
                              : "❤️"}
                          </div>
                          <div className="text-xs">{flavorLabels[flavor]}</div>
                        </div>
                      </button>
                    ))}
                  </div>
                  {selectedFlavors.length > 0 && (
                    <div className="mt-2 p-2 bg-green-50 border border-green-200 rounded-lg">
                      <div className="text-xs text-green-700">
                        <span className="font-medium">Đã chọn:</span>{" "}
                        {selectedFlavors.map((f) => flavorLabels[f]).join(", ")}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* AI Generated Images Section */}
          {(aiGeneratedImages.length > 0 || pendingAIGeneration) && (
            <div className="mt-8">
              <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-bold text-gray-800 flex items-center">
                    <span className="w-3 h-6 bg-gradient-to-b from-purple-400 to-pink-400 rounded-full mr-3"></span>
                    Ảnh AI được tạo gần đây
                  </h2>
                  {getTotalPages() > 1 && (
                    <div className="text-sm text-gray-500">
                      Trang {currentPage} / {getTotalPages()}
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {getCurrentPageImages().map((design, index) => {
                    if (design.isPending) {
                      return (
                        <div key={design.id} className="relative group">
                          <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-lg p-4 border-2 border-dashed border-purple-300 transition-all duration-200">
                            <div className="w-full h-48 bg-gradient-to-br from-purple-100 to-pink-100 rounded-lg flex items-center justify-center relative overflow-hidden">
                              {/* Loading animation */}
                              <div
                                className="absolute inset-0 opacity-50"
                                style={{
                                  background:
                                    "linear-gradient(90deg, transparent, rgba(255,255,255,0.6), transparent)",
                                  animation: "shimmer 2s infinite",
                                }}
                              ></div>
                              <div className="flex flex-col items-center justify-center z-10">
                                <div className="w-12 h-12 border-4 border-purple-400 border-t-transparent rounded-full animate-spin mb-3"></div>
                                <span className="text-purple-600 font-medium text-sm">
                                  Đang tạo ảnh AI...
                                </span>
                                <span className="text-purple-400 text-xs mt-1">
                                  Vui lòng chờ trong giây lát
                                </span>
                              </div>
                            </div>
                            <div className="mt-3">
                              <p className="text-sm text-gray-600 line-clamp-2">
                                {design.description.substring(0, 80)}
                                ...
                              </p>
                              <div className="mt-2 flex items-center justify-between">
                                <span className="text-xs text-purple-600 font-medium flex items-center">
                                  <div className="w-2 h-2 bg-purple-400 rounded-full mr-1 animate-pulse"></div>
                                  Đang tạo bởi AI
                                </span>
                                <span className="text-xs text-gray-400">
                                  {new Date(
                                    design.created_at
                                  ).toLocaleDateString("vi-VN")}
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    } else {
                      return (
                        <div key={design.id} className="relative group">
                          <div
                            className="bg-gradient-to-br from-pink-50 to-purple-50 rounded-lg p-4 border border-gray-200 hover:border-pink-300 transition-all duration-200 cursor-pointer"
                            onClick={() => handleAIImageClick(design)}
                          >
                            <div className="relative">
                              <img
                                src={design.ai_generated}
                                alt={`AI Generated Cake ${index + 1}`}
                                className="w-full h-48 object-cover rounded-lg shadow-sm group-hover:shadow-md transition-shadow duration-200"
                                onError={(e) => {
                                  e.target.style.display = "none";
                                }}
                              />
                              {/* Hover overlay */}
                              <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all duration-200 rounded-lg flex items-center justify-center">
                                <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 bg-white rounded-full p-2">
                                  <svg
                                    className="w-6 h-6 text-purple-600"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                  >
                                    <path
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                      strokeWidth="2"
                                      d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7"
                                    />
                                  </svg>
                                </div>
                              </div>
                            </div>
                            <div className="mt-3">
                              <p className="text-sm text-gray-600 line-clamp-2">
                                {design.description
                                  .split("\n")[0]
                                  .substring(0, 80)}
                                ...
                              </p>
                              <div className="mt-2 flex items-center justify-between">
                                <span className="text-xs text-purple-600 font-medium">
                                  Tạo bởi AI
                                </span>
                                <span className="text-xs text-gray-400">
                                  {new Date(
                                    design.created_at
                                  ).toLocaleDateString("vi-VN")}
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    }
                  })}
                </div>

                {/* Pagination Controls */}
                {getTotalPages() > 1 && (
                  <div className="mt-6 flex items-center justify-center space-x-2">
                    {/* Previous button */}
                    <button
                      onClick={goToPreviousPage}
                      disabled={currentPage === 1}
                      className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                        currentPage === 1
                          ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                          : "bg-white border border-gray-300 text-gray-700 hover:bg-gray-50"
                      }`}
                    >
                      <svg
                        className="w-4 h-4"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M15 19l-7-7 7-7"
                        />
                      </svg>
                    </button>

                    {/* Page numbers */}
                    {Array.from(
                      { length: getTotalPages() },
                      (_, i) => i + 1
                    ).map((page) => (
                      <button
                        key={page}
                        onClick={() => goToPage(page)}
                        className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                          currentPage === page
                            ? "bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-md"
                            : "bg-white border border-gray-300 text-gray-700 hover:bg-gray-50"
                        }`}
                      >
                        {page}
                      </button>
                    ))}

                    {/* Next button */}
                    <button
                      onClick={goToNextPage}
                      disabled={currentPage === getTotalPages()}
                      className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                        currentPage === getTotalPages()
                          ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                          : "bg-white border border-gray-300 text-gray-700 hover:bg-gray-50"
                      }`}
                    >
                      <svg
                        className="w-4 h-4"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M9 5l7 7-7 7"
                        />
                      </svg>
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}

          <div className="mt-8 text-center">
            <div className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-pink-100 to-purple-100 rounded-full">
              <span className="text-sm text-gray-600">
                © 2025 CakeStory. Được thiết kế với 💖 cho những người yêu bánh
                ngọt
              </span>
            </div>
          </div>
        </div>

        {/* AI Image View Modal */}
        {showImageModal && selectedAIImage && (
          <div
            className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-50 p-4"
            onClick={(e) => {
              if (e.target === e.currentTarget) {
                closeImageModal();
              }
            }}
          >
            <div className="bg-white rounded-xl max-w-4xl w-full max-h-[90vh] overflow-hidden shadow-2xl">
              {/* Modal Header */}
              <div className="flex items-center justify-between p-4 border-b border-gray-200">
                <h3 className="text-lg font-bold text-gray-800 flex items-center">
                  <span className="w-3 h-6 bg-gradient-to-b from-purple-400 to-pink-400 rounded-full mr-3"></span>
                  Ảnh AI được tạo
                </h3>
                <button
                  onClick={closeImageModal}
                  className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                >
                  <svg
                    className="w-6 h-6 text-gray-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              </div>

              {/* Modal Content */}
              <div className="p-6 overflow-y-auto max-h-[calc(90vh-80px)]">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Image Section */}
                  <div className="space-y-4">
                    <div className="relative">
                      <img
                        src={selectedAIImage.ai_generated}
                        alt="AI Generated Cake Full Size"
                        className="w-full h-auto max-h-[50vh] lg:max-h-[60vh] object-contain rounded-lg shadow-lg"
                        onError={(e) => {
                          e.target.src = "/placeholder-cake.jpg";
                        }}
                      />
                      <div className="absolute top-2 right-2 bg-purple-500 text-white px-2 py-1 rounded-full text-xs font-medium">
                        AI Generated
                      </div>
                    </div>

                    {/* Image Actions */}
                    <div className="flex gap-2">
                      <a
                        href={selectedAIImage.ai_generated}
                        download={`ai-cake-${selectedAIImage.id}.jpg`}
                        className="flex-1 px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg font-medium hover:from-purple-600 hover:to-pink-600 transition-all duration-200 text-center"
                      >
                        <svg
                          className="w-4 h-4 mr-2 inline"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                          />
                        </svg>
                        Tải xuống
                      </a>
                      <button
                        onClick={() => {
                          if (navigator.share) {
                            navigator.share({
                              title: "Ảnh bánh AI tuyệt đẹp",
                              text: "Xem ảnh bánh được tạo bởi AI này!",
                              url: selectedAIImage.ai_generated,
                            });
                          }
                        }}
                        className="px-4 py-2 border border-purple-300 text-purple-600 rounded-lg font-medium hover:bg-purple-50 transition-colors"
                      >
                        <svg
                          className="w-4 h-4 mr-2 inline"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.367 2.684 3 3 0 00-5.367-2.684z"
                          />
                        </svg>
                        Chia sẻ
                      </button>
                    </div>
                  </div>

                  {/* Description Section */}
                  <div className="space-y-4">
                    <div>
                      <h4 className="text-md font-semibold text-gray-800 mb-3 flex items-center">
                        <span className="w-2 h-4 bg-purple-500 rounded-full mr-2"></span>
                        Mô tả chi tiết
                      </h4>
                      <div className="bg-gradient-to-br from-purple-50 to-pink-50 border border-purple-200 rounded-lg p-4">
                        <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">
                          {selectedAIImage.description}
                        </p>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="bg-white border border-gray-200 rounded-lg p-3">
                        <div className="text-xs text-gray-500 mb-1">
                          Ngày tạo
                        </div>
                        <div className="text-sm font-medium text-gray-800">
                          {new Date(
                            selectedAIImage.created_at
                          ).toLocaleDateString("vi-VN", {
                            year: "numeric",
                            month: "long",
                            day: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </div>
                      </div>
                      <div className="bg-white border border-gray-200 rounded-lg p-3">
                        <div className="text-xs text-gray-500 mb-1">
                          Trạng thái
                        </div>
                        <div className="text-sm font-medium text-green-600 flex items-center">
                          <div className="w-2 h-2 bg-green-500 rounded-full mr-1"></div>
                          Hoàn thành
                        </div>
                      </div>
                    </div>

                    {/* AI Prompt used */}
                    {selectedAIImage.ai_prompt && (
                      <div>
                        <h4 className="text-md font-semibold text-gray-800 mb-3 flex items-center">
                          <span className="w-2 h-4 bg-pink-500 rounded-full mr-2"></span>
                          Prompt AI đã sử dụng
                        </h4>
                        <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                          <p className="text-sm text-gray-600 leading-relaxed">
                            {selectedAIImage.ai_prompt}
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* AI Generation Modal */}
        {showAIModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl max-w-2xl w-full shadow-2xl">
              <div className="p-6">
                <div className="text-center mb-4">
                  <div className="w-16 h-16 bg-gradient-to-r from-purple-400 to-pink-400 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Sparkles className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-800 mb-2">
                    Tạo ảnh AI
                  </h3>
                  <p className="text-gray-600 mb-4">
                    Thiết kế của bạn đã được lưu thành công! Dưới đây là mô tả
                    sẽ được gửi để tạo ảnh AI:
                  </p>
                </div>

                {/* AI Prompt Preview */}
                <div className="bg-gradient-to-r from-purple-50 to-pink-50 border border-purple-200 rounded-lg p-4 mb-6">
                  <h4 className="text-sm font-semibold text-purple-700 mb-2 flex items-center">
                    <span className="w-2 h-4 bg-purple-500 rounded-full mr-2"></span>
                    Mô tả AI sẽ được gửi:
                  </h4>
                  <p className="text-sm text-gray-700 leading-relaxed">
                    {generateAIPromptDescription()}
                  </p>
                </div>

                <div className="flex gap-3">
                  <button
                    onClick={() => setShowAIModal(false)}
                    className="flex-1 px-4 py-3 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 font-medium transition-colors"
                  >
                    Bỏ qua
                  </button>
                  <button
                    onClick={handleGenerateAI}
                    disabled={isGeneratingAI}
                    className={`flex-1 px-4 py-3 rounded-lg font-medium text-white transition-all duration-200 ${
                      isGeneratingAI
                        ? "bg-gray-400 cursor-not-allowed"
                        : "bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 shadow-lg hover:shadow-xl"
                    }`}
                  >
                    {isGeneratingAI ? (
                      <div className="flex items-center justify-center">
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                        Đang tạo...
                      </div>
                    ) : (
                      <>
                        <Sparkles className="w-4 h-4 mr-2 inline" />
                        Tạo ảnh AI
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default CakeDesign;
