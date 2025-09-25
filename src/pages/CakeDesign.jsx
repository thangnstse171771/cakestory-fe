import { useState, useEffect, useRef } from "react";
import {
  Download,
  RotateCcw,
  Sparkles,
  AlertCircle,
  X,
  DollarSign,
  Wallet,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-hot-toast";
import html2canvas from "html2canvas";
import {
  createMagicDesign,
  generateAIImage,
  getCakeDesigns,
  getCakeDesignsByUserId,
  editCakeDesign,
} from "../api/cakeDesigns";
import {
  createPicture,
  getPicturesByUserId,
  deletePicture,
} from "../api/pictures";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { storage } from "../firebase";
import { useAuth } from "../contexts/AuthContext";
import { fetchWalletBalance } from "../api/axios";
import { createCakeQuote } from "../api/cakeOrder";

const AI_GENERATION_COST = 1000; // 1000 VND mỗi lần gen (cho thiết kế cake)

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
  const [selectedTab, setSelectedTab] = useState("Cơ bản");
  const [isAnimating, setIsAnimating] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [diameter, setDiameter] = useState(25);
  const [height, setHeight] = useState(15);
  const [width, setWidth] = useState(20);
  const [selectedFlavors, setSelectedFlavors] = useState(["Vanilla"]);
  const [description, setDescription] = useState("");
  const [wishMessage, setWishMessage] = useState("");
  const [recipientName, setRecipientName] = useState("");
  const [recipientAge, setRecipientAge] = useState("");
  const [eventDate, setEventDate] = useState("");
  const [showAIModal, setShowAIModal] = useState(false);
  const [isGeneratingAI, setIsGeneratingAI] = useState(false);
  const [lastSavedDesignId, setLastSavedDesignId] = useState(null);
  const [aiGeneratedImages, setAiGeneratedImages] = useState([]);
  const [pendingAIGeneration, setPendingAIGeneration] = useState(null); // New state for loading AI
  const [selectedAIImage, setSelectedAIImage] = useState(null); // New state for viewing AI image
  const [showImageModal, setShowImageModal] = useState(false); // New state for image modal
  const [currentPage, setCurrentPage] = useState(1); // Pagination state
  const [imagesPerPage] = useState(6); // Number of images per page
  const [showNavigateWarning, setShowNavigateWarning] = useState(true); // Warning banner visibility
  const [showEditModal, setShowEditModal] = useState(false); // New state for edit modal
  const [editPrompt, setEditPrompt] = useState(""); // New state for edit prompt
  const [isEditing, setIsEditing] = useState(false); // New state for editing status

  // Wallet states
  const [balance, setBalance] = useState(0);
  const [showBalanceWarning, setShowBalanceWarning] = useState(false);

  // Cake quote form states
  const [showCakeQuoteForm, setShowCakeQuoteForm] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    cake_size: "",
    special_requirements: "",
    budget_range: 500000,
    expires_at: "",
  });
  const [formErrors, setFormErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const navigate = useNavigate();
  const { user } = useAuth(); // Get current user

  // Session / resume constants for AI generation
  const AI_SESSION_KEY = "cakeDesignAIGenSession";
  const MAX_SESSION_MS = 180000; // 3 phút tối đa cho một lần tạo
  const POLL_INTERVAL = 2000; // 2s
  const pollRef = useRef(null);

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
  const designOptions = ["Cơ bản", "Phủ kem", "Topping", "Trang trí", "Khác"];
  // Pictures (Khác) states
  const [otherImages, setOtherImages] = useState([]);
  const [otherPage, setOtherPage] = useState(1);
  const [otherLimit] = useState(10);
  const [uploading, setUploading] = useState(false);
  const [uploadTitle, setUploadTitle] = useState("");
  const [uploadFile, setUploadFile] = useState(null);
  const [canvasImages, setCanvasImages] = useState({});
  const [showAddModal, setShowAddModal] = useState(false);
  const [confirmDeletePictureId, setConfirmDeletePictureId] = useState(null);
  const [uploadedSelections, setUploadedSelections] = useState({});

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
    setWishMessage(""); // Đặt lại câu chúc
    setRecipientName(""); // Đặt lại họ tên
    setRecipientAge(""); // Đặt lại tuổi
    setEventDate(""); // Đặt lại ngày tháng
  };

  // Toggle flavor selection
  const toggleFlavor = (flavor) => {
    setSelectedFlavors((prev) =>
      prev.includes(flavor)
        ? prev.filter((f) => f !== flavor)
        : [...prev, flavor]
    );
  };

  // Load AI generated images for current user
  const loadAIImages = async () => {
    try {
      if (!user?.id) {
        console.log("No user logged in");
        return;
      }

      const response = await getCakeDesignsByUserId(user.id, 1, 50, false); // Get more items to ensure we get all AI designs
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

  // Fetch user wallet balance
  const fetchUserBalance = async () => {
    try {
      const res = await fetchWalletBalance();
      let balanceValue = 0;

      if (res?.wallet?.balance !== undefined) {
        balanceValue =
          typeof res.wallet.balance === "string"
            ? parseFloat(res.wallet.balance)
            : res.wallet.balance;
      } else if (res?.balance !== undefined) {
        balanceValue =
          typeof res.balance === "string"
            ? parseFloat(res.balance)
            : res.balance;
      }

      setBalance(balanceValue);

      // Show warning if balance is low
      if (balanceValue < AI_GENERATION_COST) {
        setShowBalanceWarning(true);
      }
    } catch (error) {
      console.error("Error fetching balance:", error);
      setBalance(0);
    }
  };

  // Load AI images and wallet balance on component mount and when user changes
  useEffect(() => {
    if (user?.id) {
      loadAIImages();
      fetchUserBalance();
      loadOtherImages();
    }
  }, [user?.id]);

  // Load uploaded pictures by user
  const loadOtherImages = async (page = 1) => {
    try {
      if (!user?.id) return;
      const res = await getPicturesByUserId(user.id, page, otherLimit);
      if (res.success) {
        setOtherImages(res.data.pictures || []);
      }
    } catch (err) {
      console.error("Error loading other images:", err);
    }
  };

  // Warn before closing / reloading if AI generation in progress
  useEffect(() => {
    const handleBeforeUnload = (e) => {
      if (isGeneratingAI || pendingAIGeneration) {
        e.preventDefault();
        e.returnValue =
          "Đang tạo ảnh AI, vui lòng đợi hoàn tất trước khi rời trang.";
        return e.returnValue;
      }
    };
    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [isGeneratingAI, pendingAIGeneration]);

  // Resume an unfinished AI generation session (after refresh / navigate back)
  useEffect(() => {
    if (!user?.id) return; // Wait for user id
    try {
      const raw = localStorage.getItem(AI_SESSION_KEY);
      if (!raw) return;
      const session = JSON.parse(raw);
      if (!session?.startedAt || !session?.designId) return;
      const age = Date.now() - session.startedAt;
      if (age > MAX_SESSION_MS) {
        localStorage.removeItem(AI_SESSION_KEY);
        return;
      }
      // Start/resume placeholder & polling
      setLastSavedDesignId(session.designId);
      setIsGeneratingAI(true);
      if (!pendingAIGeneration) {
        setPendingAIGeneration({
          id: `resuming-${session.designId}`,
          isLoading: true,
          description: session.prompt || "Đang tiếp tục tạo ảnh AI...",
          created_at: new Date(session.startedAt).toISOString(),
        });
      }
      startPollingForResult(session.designId, session.startedAt);
    } catch (_) {
      // ignore parse errors
    }
    return () => {
      if (pollRef.current) clearInterval(pollRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id]);

  const startPollingForResult = (designId, startedAt) => {
    if (pollRef.current) clearInterval(pollRef.current);
    const began =
      typeof startedAt === "number" ? startedAt : Date.parse(startedAt);
    const poll = async () => {
      try {
        // Fetch latest designs for user
        const response = await getCakeDesignsByUserId(user.id, 1, 50, false);
        if (response.success) {
          const imagesWithAI = response.data.cakeDesigns.filter(
            (d) => d.ai_generated
          );
          // Update state list
          setAiGeneratedImages(imagesWithAI);
          const target = imagesWithAI.find(
            (d) => d.id === designId && d.ai_generated
          );
          if (target || Date.now() - began > MAX_SESSION_MS) {
            // Completed or timed out
            clearInterval(pollRef.current);
            pollRef.current = null;
            setIsGeneratingAI(false);
            setPendingAIGeneration(null);
            localStorage.removeItem(AI_SESSION_KEY);
          }
        }
      } catch (_) {
        // silent
      }
    };
    poll();
    pollRef.current = setInterval(poll, POLL_INTERVAL);
  };

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

  // Add external uploaded image to canvas (as overlay instance)
  const addCanvasImage = (picture) => {
    // Add an instance of this uploaded picture (allow multiple instances up to 10)
    const pictureId = String(picture.id);
    const currentQty = uploadedSelections[pictureId] || 0;
    if (currentQty >= 10) {
      toast.error("Mỗi ảnh chỉ được thêm tối đa 10 lần lên bánh");
      return;
    }

    const totalInstances = Object.keys(canvasImages).length;
    if (totalInstances >= 10) {
      toast.error("Chỉ được thêm tối đa 10 ảnh lên bánh");
      return;
    }

    const newIndex = currentQty; // zero-based
    const key = `uploaded_${pictureId}_${newIndex}`;

    setUploadedSelections((prev) => ({ ...prev, [pictureId]: currentQty + 1 }));
    setCanvasImages((prev) => ({
      ...prev,
      [key]: {
        id: pictureId,
        src: picture.imageUrl,
        title: picture.title,
        x: Math.random() * 10 - 5,
        y: -30 + Math.random() * 10,
        scale: 1,
      },
    }));
    // keep the currently selected tab (Khác) so user stays in the upload view
  };

  // Remove a single canvas instance and reindex remaining instances for the same picture
  const removeCanvasInstance = (instanceKey) => {
    setCanvasImages((prev) => {
      const next = { ...prev };
      const matches = instanceKey.match(/^uploaded_(.+?)_(\d+)$/);
      if (!matches) {
        delete next[instanceKey];
        return next;
      }
      const pictureId = matches[1];
      // Delete the instance
      delete next[instanceKey];

      // Reindex remaining keys for this picture
      const remaining = Object.keys(next)
        .filter((k) => k.startsWith(`uploaded_${pictureId}_`))
        .sort((a, b) => {
          const ai = Number(a.split("_").pop());
          const bi = Number(b.split("_").pop());
          return ai - bi;
        });

      const rebuilt = { ...next };
      remaining.forEach((oldKey, idx) => {
        const newKey = `uploaded_${pictureId}_${idx}`;
        if (oldKey !== newKey) {
          rebuilt[newKey] = { ...rebuilt[oldKey] };
          delete rebuilt[oldKey];
        }
      });

      return rebuilt;
    });

    // Update selection counts
    setUploadedSelections((prev) => {
      const pictureId = instanceKey.match(/^uploaded_(.+?)_/)[1];
      const qty = prev[pictureId] || 0;
      if (qty <= 1) {
        const copy = { ...prev };
        delete copy[pictureId];
        return copy;
      }
      return { ...prev, [pictureId]: qty - 1 };
    });
  };

  // Update quantity of uploaded picture instances (add/remove instances)
  const updateUploadedQuantity = (pictureId, newQuantity) => {
    const id = String(pictureId);
    const clamped = Math.max(1, Math.min(10, newQuantity));

    setUploadedSelections((prev) => ({ ...prev, [id]: clamped }));

    setCanvasImages((prev) => {
      const updated = { ...prev };
      // Count existing
      const existing = Object.keys(updated).filter((k) =>
        k.startsWith(`uploaded_${id}_`)
      ).length;
      if (clamped > existing) {
        for (let i = existing; i < clamped; i++) {
          updated[`uploaded_${id}_${i}`] = {
            id: id,
            src:
              (otherImages.find((o) => String(o.id) === id) || {}).imageUrl ||
              "",
            title:
              (otherImages.find((o) => String(o.id) === id) || {}).title || "",
            x: Math.random() * 10 - 5,
            y: -30 + Math.random() * 10,
            scale: 1,
          };
        }
      } else if (clamped < existing) {
        for (let i = clamped; i < existing; i++) {
          delete updated[`uploaded_${id}_${i}`];
        }
      }
      return updated;
    });
  };

  // Update scale for a specific instance key
  const updateUploadedScale = (instanceKey, scale) => {
    setCanvasImages((prev) => ({
      ...prev,
      [instanceKey]: {
        ...prev[instanceKey],
        scale: Math.max(0.2, Math.min(2.0, scale)),
      },
    }));
  };

  // Toggle selection of an uploaded picture (like toggleDecoration)
  const toggleUploadedSelection = (picture) => {
    const id = String(picture.id);
    const isSelected = !!uploadedSelections[id];
    if (isSelected) {
      // Remove all instances
      const keysToRemove = Object.keys(canvasImages).filter((k) =>
        k.startsWith(`uploaded_${id}_`)
      );
      keysToRemove.forEach((k) => removeCanvasInstance(k));
      setUploadedSelections((prev) => {
        const copy = { ...prev };
        delete copy[id];
        return copy;
      });
    } else {
      // Add one instance
      addCanvasImage(picture);
    }
  };

  const removeCanvasImage = (key) => {
    setCanvasImages((prev) => {
      const next = { ...prev };
      delete next[key];
      return next;
    });
  };

  // Upload picture handler
  const handleUploadPicture = async () => {
    if (!uploadFile || !uploadTitle || !user?.id) {
      toast.error("Vui lòng chọn ảnh và nhập tiêu đề");
      return;
    }
    setUploading(true);
    try {
      // 1) Upload file to Firebase Storage
      const storageRef = ref(
        storage,
        `pictures/${user.id}/${Date.now()}-${uploadFile.name}`
      );
      await uploadBytes(storageRef, uploadFile);
      const downloadURL = await getDownloadURL(storageRef);

      // 2) Create picture record on backend with the Firebase URL
      const payload = {
        title: uploadTitle,
        imageUrl: downloadURL,
      };
      const res = await createPicture(payload);

      if (res.success) {
        toast.success("Ảnh đã được tải lên");
        setUploadTitle("");
        setUploadFile(null);
        // If API returned the created picture, insert it immediately so user can select it without reloading
        if (res.data && res.data.picture) {
          setOtherImages((prev) => [res.data.picture, ...(prev || [])]);
        } else {
          await loadOtherImages(otherPage);
        }
      } else {
        toast.error(res.message || "Không thể tạo bản ghi ảnh");
      }
    } catch (err) {
      console.error("Upload error:", err);
      toast.error("Lỗi khi tải lên ảnh");
    } finally {
      setUploading(false);
    }
  };

  // Confirmed deletion (calls API)
  const handleConfirmDeletePicture = async (pictureId) => {
    try {
      // Optimistically remove from local state so preview updates immediately
      setCanvasImages((prev) => {
        const next = { ...prev };
        Object.keys(next).forEach((k) => {
          if (String(next[k].id) === String(pictureId)) delete next[k];
        });
        return next;
      });
      setOtherImages((prev) =>
        prev.filter((p) => String(p.id) !== String(pictureId))
      );
      setUploadedSelections((prev) => {
        const copy = { ...prev };
        delete copy[String(pictureId)];
        return copy;
      });
      setConfirmDeletePictureId(null);

      const res = await deletePicture(pictureId);
      if (res.success) {
        toast.success("Đã xoá ảnh");
      } else {
        toast.error(res.message || "Không thể xóa ảnh");
        // On failure, reload list to restore
        await loadOtherImages(otherPage);
      }
    } catch (err) {
      console.error(err);
      toast.error("Lỗi khi xóa ảnh");
      setConfirmDeletePictureId(null);
      await loadOtherImages(otherPage);
    }
  };

  // Open delete confirmation
  const requestDeletePicture = (pictureId) => {
    setConfirmDeletePictureId(pictureId);
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

        // Ensure uploaded overlay images are inlined as data URLs to avoid CORS tainting
        const inlineUploadedImages = async () => {
          const entries = Object.entries(canvasImages);
          for (const [key, img] of entries) {
            try {
              // fetch the image as blob then convert
              const resp = await fetch(img.src, { mode: "cors" });
              const blob = await resp.blob();
              const dataUrl = await new Promise((res, rej) => {
                const reader = new FileReader();
                reader.onloadend = () => res(reader.result);
                reader.onerror = rej;
                reader.readAsDataURL(blob);
              });
              // replace the src locally for capture
              const el = document.querySelectorAll("img").forEach((i) => {
                if (i.src === img.src) i.src = dataUrl;
              });
            } catch (e) {
              // ignore failures; html2canvas may still try to capture
            }
          }
        };

        await inlineUploadedImages();

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
                    )}\n\nChi tiết thiết kế:\n${designSummary}${
                      wishMessage && String(wishMessage).trim()
                        ? `\n\nCâu chúc: ${String(wishMessage).trim()}`
                        : ""
                    }${
                      recipientName && String(recipientName).trim()
                        ? `\nHọ tên: ${String(recipientName).trim()}${
                            recipientAge && String(recipientAge).trim()
                              ? `, ${String(recipientAge).trim()} tuổi`
                              : ""
                          }`
                        : ""
                    }${
                      eventDate && String(eventDate).trim()
                        ? `\nNgày: ${String(eventDate).trim()}`
                        : ""
                    }`
                  : `Chi tiết thiết kế:\n${designSummary}${
                      wishMessage && String(wishMessage).trim()
                        ? `\n\nCâu chúc: ${String(wishMessage).trim()}`
                        : ""
                    }${
                      recipientName && String(recipientName).trim()
                        ? `\nHọ tên: ${String(recipientName).trim()}${
                            recipientAge && String(recipientAge).trim()
                              ? `, ${String(recipientAge).trim()} tuổi`
                              : ""
                          }`
                        : ""
                    }${
                      eventDate && String(eventDate).trim()
                        ? `\nNgày: ${String(eventDate).trim()}`
                        : ""
                    }`;

              // Generate AI prompt description for the design
              const aiPromptDescription = generateAIPromptDescription();

              const formData = new FormData();
              // Create a File object from the blob for upload
              const imageFile = new File([blob], fileName, {
                type: "image/png",
              });
              formData.append("design_image", imageFile);
              formData.append(
                "description",
                String(
                  fullDescription +
                    "\n\nMô tả AI sẽ được gửi:\n" +
                    aiPromptDescription
                )
              );
              formData.append("is_public", "true");
              formData.append("ai_generated", "");
              // Add AI prompt for immediate processing
              formData.append("ai_prompt", String(aiPromptDescription));

              console.log("Auto-uploading to API:", {
                description: String(
                  fullDescription +
                    "\n\nMô tả AI sẽ được gửi:\n" +
                    aiPromptDescription
                ),
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

    // Ghép mô tả tự do của người dùng và thông tin bổ sung (nếu có)
    const userDesc = description?.trim();
    const additionalInfo = [];

    if (wishMessage?.trim()) {
      additionalInfo.push(`Câu chúc: "${wishMessage.trim()}"`);
    }
    if (recipientName?.trim()) {
      let nameInfo = `Tên người nhận: ${recipientName.trim()}`;
      if (recipientAge?.trim()) {
        nameInfo += ` (${recipientAge.trim()} tuổi)`;
      }
      additionalInfo.push(nameInfo);
    }
    if (eventDate?.trim()) {
      additionalInfo.push(`Ngày sự kiện: ${eventDate.trim()}`);
    }

    let fullUserDescription = "";
    if (userDesc) {
      fullUserDescription += userDesc;
    }
    if (additionalInfo.length > 0) {
      if (fullUserDescription) {
        fullUserDescription += ". ";
      }
      fullUserDescription += additionalInfo.join(", ");
    }

    if (fullUserDescription) {
      return `${fullUserDescription}. ${prompt}`.trim();
    }
    return prompt;
  };

  // Generate AI image for saved design
  const handleGenerateAI = async () => {
    if (!lastSavedDesignId || isGeneratingAI) return;

    // Check balance before generating
    if (balance < AI_GENERATION_COST) {
      setShowBalanceWarning(true);
      toast.error("Số dư không đủ để tạo ảnh AI!");
      return;
    }

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

    // Persist session to localStorage for resume
    localStorage.setItem(
      AI_SESSION_KEY,
      JSON.stringify({
        startedAt: Date.now(),
        designId: lastSavedDesignId,
        prompt: pendingItem.description,
      })
    );

    try {
      // Call API without description since it was already sent during design creation
      await generateAIImage(lastSavedDesignId);
      toast.success("Đang tạo ảnh AI cho thiết kế của bạn...");

      // Refresh AI images and balance after a short delay to show the new one
      setTimeout(async () => {
        await loadAIImages();
        await fetchUserBalance(); // Update balance after generation
        toast.success("Ảnh AI đã được tạo thành công!");
        setIsGeneratingAI(false);
        setPendingAIGeneration(null); // Remove loading placeholder
        setCurrentPage(1); // Reset to first page to show new image
        localStorage.removeItem(AI_SESSION_KEY);
      }, 3000);
    } catch (error) {
      console.error("Error generating AI image:", error);
      // Phân biệt lỗi safety (nội dung vi phạm) và lỗi chung
      const rawMsg =
        error?.response?.data?.error ||
        error?.response?.data?.message ||
        error?.message ||
        "";
      if (/safety|rejected|not allowed/i.test(rawMsg)) {
        toast.error(
          "Yêu cầu bị từ chối bởi hệ thống an toàn. Hãy chỉnh sửa mô tả: tránh nội dung phân biệt chủng tộc, tình dục, bạo lực, thù hằn, tự hại hoặc xúc phạm."
        );
      } else {
        toast.error("Không thể tạo ảnh AI. Vui lòng thử lại!");
      }
      setIsGeneratingAI(false);
      setPendingAIGeneration(null); // Remove loading placeholder on error
      localStorage.removeItem(AI_SESSION_KEY);
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

  // Open edit modal
  const openEditModal = () => {
    if (selectedAIImage) {
      setEditPrompt(selectedAIImage.description || "");
      setShowEditModal(true);
    }
  };

  // Close edit modal
  const closeEditModal = () => {
    setShowEditModal(false);
    setEditPrompt("");
  };

  // Handle create cake quote from AI image
  const handleCreateCakeQuote = async () => {
    if (!selectedAIImage) {
      toast.error("Không tìm thấy ảnh AI");
      return;
    }

    // Open cake quote form instead of creating immediately
    setShowCakeQuoteForm(true);

    // Pre-fill form data with default values
    setFormData({
      title: `Birthday Cake for 20 People`,
      description:
        selectedAIImage.description ||
        "Looking for a chocolate birthday cake with custom decorations",
      cake_size: `${diameter} inch`,
      special_requirements:
        selectedFlavors.length > 0
          ? `Gluten-free, no nuts, ${selectedFlavors.join(", ")} flavor`
          : "Gluten-free, no nuts",
      budget_range: 500000,
      expires_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
        .toISOString()
        .split("T")[0], // 30 days from now, format YYYY-MM-DD
    });
  };

  // Handle form input changes
  const handleFormChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));

    // Clear error for this field when user types
    if (formErrors[field]) {
      setFormErrors((prev) => ({
        ...prev,
        [field]: "",
      }));
    }
  };

  // Validate form data
  const validateForm = () => {
    const errors = {};

    // Title validation
    if (!formData.title.trim()) {
      errors.title = "Tiêu đề không được để trống";
    } else if (formData.title.trim().length < 5) {
      errors.title = "Tiêu đề phải có ít nhất 5 ký tự";
    } else if (formData.title.trim().length > 100) {
      errors.title = "Tiêu đề không được quá 100 ký tự";
    }

    // Description validation
    if (!formData.description.trim()) {
      errors.description = "Mô tả không được để trống";
    } else if (formData.description.trim().length < 10) {
      errors.description = "Mô tả phải có ít nhất 10 ký tự";
    } else if (formData.description.trim().length > 500) {
      errors.description = "Mô tả không được quá 500 ký tự";
    }

    // Cake size validation
    if (!formData.cake_size.trim()) {
      errors.cake_size = "Kích thước bánh không được để trống";
    } else if (formData.cake_size.trim().length < 2) {
      errors.cake_size = "Kích thước bánh không hợp lệ";
    } else if (formData.cake_size.trim().length > 50) {
      errors.cake_size = "Kích thước bánh không được quá 50 ký tự";
    }

    // Budget validation
    if (!formData.budget_range || formData.budget_range <= 0) {
      errors.budget_range = "Ngân sách phải lớn hơn 0";
    } else if (formData.budget_range < 50000) {
      errors.budget_range = "Ngân sách tối thiểu là 50,000 VND";
    } else if (formData.budget_range > 50000000) {
      errors.budget_range = "Ngân sách tối đa là 50,000,000 VND";
    }

    // Special requirements validation (optional but if provided, check length)
    if (
      formData.special_requirements.trim() &&
      formData.special_requirements.trim().length > 300
    ) {
      errors.special_requirements = "Yêu cầu đặc biệt không được quá 300 ký tự";
    }

    // Expires at validation (optional but if provided, must be future date)
    if (formData.expires_at) {
      const selectedDate = new Date(formData.expires_at);
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      if (selectedDate < today) {
        errors.expires_at = "Hạn cuối phải là ngày trong tương lai";
      }
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Handle form submit
  const handleSubmitCakeQuote = async () => {
    if (!selectedAIImage) {
      toast.error("Không tìm thấy ảnh AI");
      return;
    }

    // Validate form
    if (!validateForm()) {
      toast.error("Vui lòng kiểm tra và sửa các lỗi trong form");
      return;
    }

    setIsSubmitting(true);

    try {
      // Prepare cake quote data exactly as requested format
      const cakeQuoteData = {
        title: formData.title.trim(),
        description: formData.description.trim(),
        imageDesign: selectedAIImage.ai_generated,
        cake_size: formData.cake_size.trim(),
        special_requirements: formData.special_requirements.trim(),
        budget_range: parseInt(formData.budget_range),
        expires_at: formData.expires_at
          ? new Date(formData.expires_at + "T23:59:59Z").toISOString()
          : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
      };

      console.log("Creating cake quote:", cakeQuoteData);

      const response = await createCakeQuote(cakeQuoteData);
      console.log("Cake quote created:", response);

      toast.success("Đã tạo yêu cầu tìm thợ làm bánh thành công!");

      // Close form and image modal
      setShowCakeQuoteForm(false);
      setShowImageModal(false);
      setSelectedAIImage(null);

      // Navigate to cake quotes page
      navigate("/cake-quotes");
    } catch (error) {
      console.error("Error creating cake quote:", error);
      toast.error("Có lỗi xảy ra khi tạo yêu cầu tìm thợ làm bánh");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Close cake quote form
  const closeCakeQuoteForm = () => {
    setShowCakeQuoteForm(false);
    setFormData({
      title: "",
      description: "",
      cake_size: "",
      special_requirements: "",
      budget_range: 500000,
      expires_at: "",
    });
    setFormErrors({});
    setIsSubmitting(false);
  };

  // Handle edit AI image
  const handleEditAIImage = async () => {
    if (!selectedAIImage || !editPrompt.trim()) {
      toast.error("Vui lòng nhập prompt chỉnh sửa");
      return;
    }

    setIsEditing(true);
    try {
      // Fetch the image from URL and create a File object
      const response = await fetch(selectedAIImage.ai_generated);
      const blob = await response.blob();
      const file = new File([blob], `cake-design-${selectedAIImage.id}.png`, {
        type: "image/png",
      });

      // Create FormData
      const formData = new FormData();
      formData.append("design_image", file);
      formData.append("edit_prompt", editPrompt.trim());

      // Call edit API
      const result = await editCakeDesign(formData);

      if (result.success) {
        toast.success("Đã gửi yêu cầu chỉnh sửa ảnh AI!");
        closeEditModal();
        closeImageModal();
        // Reload AI images after a short delay
        setTimeout(() => {
          loadAIImages();
        }, 2000);
      } else {
        toast.error(result.message || "Không thể chỉnh sửa ảnh");
      }
    } catch (error) {
      console.error("Error editing AI image:", error);
      toast.error("Lỗi khi chỉnh sửa ảnh AI");
    } finally {
      setIsEditing(false);
    }
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
    } else if (currentDraggingItem.type === "uploaded") {
      // Update uploaded image position (percentage)
      setCanvasImages((prev) => ({
        ...prev,
        [currentDraggingItem.value]: {
          ...prev[currentDraggingItem.value],
          x: x,
          y: y,
        },
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
    } else if (currentDraggingItem.type === "uploaded") {
      setCanvasImages((prev) => ({
        ...prev,
        [currentDraggingItem.value]: {
          ...prev[currentDraggingItem.value],
          x: x,
          y: y,
        },
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

        {/* Navigation warning while AI generation is in progress */}
        {(isGeneratingAI || pendingAIGeneration) && showNavigateWarning && (
          <div className="max-w-[1400px] mx-auto px-6 mt-3">
            <div className="bg-gradient-to-r from-orange-400 to-pink-500 text-white px-4 py-3 rounded-lg flex items-start justify-between shadow-md">
              <div className="pr-4 text-sm">
                <strong className="font-semibold">Đang tạo ảnh AI:</strong> Vui
                lòng không đóng, tải lại trang hoặc chuyển sang trang khác cho
                đến khi hoàn tất để tránh bị gián đoạn.
              </div>
              <button
                onClick={() => setShowNavigateWarning(false)}
                className="text-white/80 hover:text-white ml-2"
                title="Ẩn cảnh báo"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>
        )}

        {/* Balance Warning */}
        {showBalanceWarning && (
          <div className="max-w-[1400px] mx-auto px-6 mt-4">
            <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded-lg">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <AlertCircle className="w-5 h-5 text-yellow-400 mr-3" />
                  <div>
                    <p className="text-sm font-medium text-yellow-800">
                      Số dư không đủ để tạo ảnh AI
                    </p>
                    <p className="text-sm text-yellow-700">
                      Số dư hiện tại: {balance.toLocaleString()} VND. Cần:{" "}
                      {AI_GENERATION_COST.toLocaleString()} VND
                    </p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => (window.location.href = "/wallet")}
                    className="px-4 py-2 bg-yellow-400 text-yellow-900 text-sm font-medium rounded-lg hover:bg-yellow-500 transition-colors"
                  >
                    Nạp tiền
                  </button>
                  <button
                    onClick={() => setShowBalanceWarning(false)}
                    className="text-yellow-400 hover:text-yellow-600"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

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

                      {/* Uploaded images (Khác) overlays */}
                      {Object.entries(canvasImages).map(([key, img]) => {
                        return (
                          <div
                            key={key}
                            className="absolute inset-0 flex items-center justify-center pointer-events-none"
                            style={{ zIndex: 18 }}
                          >
                            <img
                              src={img.src}
                              alt={img.title}
                              className={`w-full h-full object-contain transition-transform pointer-events-auto`}
                              onMouseDown={(e) => {
                                setIsDragging(true);
                                setCurrentDraggingItem({
                                  type: "uploaded",
                                  value: key,
                                });
                                if (e.dataTransfer)
                                  e.dataTransfer.setData(
                                    "text/plain",
                                    "uploaded"
                                  );
                                if (e.preventDefault) e.preventDefault();
                              }}
                              onMouseMove={handleDrag}
                              onMouseUp={handleDragEnd}
                              onMouseLeave={handleDragEnd}
                              onTouchStart={(e) => {
                                setIsDragging(true);
                                setCurrentDraggingItem({
                                  type: "uploaded",
                                  value: key,
                                });
                              }}
                              onTouchMove={handleTouchMove}
                              onTouchEnd={handleDragEnd}
                              style={{
                                transform: `scale(${img.scale}) translate(${img.x}%, ${img.y}%)`,
                                position: "relative",
                                cursor:
                                  isDragging &&
                                  currentDraggingItem?.value === key
                                    ? "grabbing"
                                    : "grab",
                              }}
                              draggable={false}
                            />
                          </div>
                        );
                      })}

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
                <div className="bg-gradient-to-r from-purple-100 to-pink-100 rounded-lg p-4 mb-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <DollarSign className="w-5 h-5 text-purple-600" />
                      <span className="font-medium text-purple-800">
                        Chi phí mỗi lần tạo ảnh AI:
                      </span>
                    </div>
                    <span className="text-lg font-bold text-purple-600">
                      {AI_GENERATION_COST.toLocaleString()} VND
                    </span>
                  </div>
                  <div className="mt-2 text-sm text-purple-700">
                    Số dư: {balance.toLocaleString()} VND
                  </div>
                </div>
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

                {/* Additional Information */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-3">
                  <h3 className="font-semibold text-gray-800 mb-3 flex items-center text-sm">
                    <span className="w-2 h-5 bg-gradient-to-b from-pink-400 to-purple-400 rounded-full mr-2"></span>
                    Thông tin thêm
                  </h3>
                  <div className="space-y-3">
                    {/* Wish Message */}
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">
                        Câu chúc
                      </label>
                      <textarea
                        value={wishMessage}
                        onChange={(e) => setWishMessage(e.target.value)}
                        placeholder="Câu chúc muốn viết lên bánh (tùy chọn)..."
                        className="w-full h-12 p-2 border border-gray-200 rounded-lg resize-none focus:ring-2 focus:ring-pink-500 focus:border-transparent text-xs transition-all"
                        maxLength={100}
                      />
                      <div className="text-xs text-gray-400 mt-1 text-right">
                        {wishMessage.length}/100 ký tự
                      </div>
                    </div>

                    {/* Name and Age Row */}
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1">
                          Họ tên
                        </label>
                        <input
                          type="text"
                          value={recipientName}
                          onChange={(e) => setRecipientName(e.target.value)}
                          placeholder="Tên người nhận..."
                          className="w-full p-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent text-xs transition-all"
                          maxLength={50}
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1">
                          Tuổi
                        </label>
                        <input
                          type="number"
                          value={recipientAge}
                          onChange={(e) => setRecipientAge(e.target.value)}
                          placeholder="Tuổi..."
                          className="w-full p-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent text-xs transition-all"
                          min="1"
                          max="150"
                        />
                      </div>
                    </div>

                    {/* Event Date */}
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">
                        Ngày tháng
                      </label>
                      <input
                        type="date"
                        value={eventDate}
                        onChange={(e) => setEventDate(e.target.value)}
                        className="w-full p-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent text-xs transition-all"
                      />
                    </div>
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
                    {designOptions.map((option, index) => (
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
                    ))}
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

                {selectedTab === "Khác" && (
                  <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="font-semibold text-gray-800 flex items-center">
                        <span className="w-2 h-6 bg-gradient-to-b from-pink-400 to-purple-400 rounded-full mr-2"></span>
                        Ảnh khác (Người dùng tải lên)
                      </h3>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => setShowAddModal(true)}
                          className="px-3 py-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg text-xs font-medium"
                        >
                          Thêm ảnh mới
                        </button>
                      </div>
                    </div>

                    <div className="mt-2">
                      <h4 className="text-sm font-semibold text-gray-700 mb-2">
                        Ảnh đã tải lên
                      </h4>

                      <div className="grid grid-cols-2 gap-3">
                        {otherImages.length === 0 && (
                          <div className="text-sm text-gray-500">
                            Chưa có ảnh nào
                          </div>
                        )}
                        {otherImages.map((pic) => {
                          const picId = String(pic.id);
                          const isSelected = !!uploadedSelections[picId];
                          return (
                            <div
                              key={pic.id}
                              className={`relative p-1 rounded-lg transition-all ${
                                isSelected
                                  ? "bg-gradient-to-r from-pink-500 to-yellow-400 text-white shadow-lg"
                                  : "bg-gray-50"
                              }`}
                            >
                              <button
                                onClick={() => toggleUploadedSelection(pic)}
                                className="flex items-center gap-2 w-full text-left p-2 rounded"
                              >
                                <img
                                  src={pic.imageUrl}
                                  alt={pic.title}
                                  className="w-16 h-12 object-cover rounded"
                                />
                                <div className="flex-1 text-xs">
                                  <div
                                    className={`font-medium ${
                                      isSelected ? "text-white" : ""
                                    }`}
                                  >
                                    {pic.title}
                                  </div>
                                  <div
                                    className={`text-xs ${
                                      isSelected
                                        ? "text-white/80"
                                        : "text-gray-400"
                                    }`}
                                  >
                                    {new Date(
                                      pic.created_at
                                    ).toLocaleDateString()}
                                  </div>
                                </div>
                              </button>

                              {/* small X to permanently delete (confirm) */}
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  requestDeletePicture(pic.id);
                                }}
                                className="absolute top-1 right-1 w-6 h-6 rounded-full bg-white/80 text-red-600 flex items-center justify-center text-xs hover:bg-white"
                              >
                                x
                              </button>
                            </div>
                          );
                        })}
                      </div>

                      {/* Selected uploaded images (like Phụ kiện đã chọn) */}
                      {Object.keys(uploadedSelections).length > 0 && (
                        <div className="mt-6 pt-4 border-t border-pink-200">
                          <h4 className="text-sm font-semibold text-pink-700 mb-3 flex items-center">
                            <span className="w-2 h-4 bg-pink-500 rounded-full mr-2"></span>
                            Phụ kiện đã chọn:
                          </h4>
                          <div className="space-y-4">
                            {Object.entries(uploadedSelections).map(
                              ([picId, qty]) => {
                                const pic =
                                  otherImages.find(
                                    (o) => String(o.id) === String(picId)
                                  ) || {};
                                return (
                                  <div
                                    key={picId}
                                    className="bg-gradient-to-r from-pink-50 to-purple-50 rounded-xl p-4 border border-pink-200"
                                  >
                                    <div className="flex items-center justify-between mb-3">
                                      <div className="flex items-center">
                                        <img
                                          src={pic.imageUrl}
                                          alt={pic.title}
                                          className="w-10 h-8 object-cover rounded mr-3"
                                        />
                                        <span className="text-sm font-medium text-pink-800">
                                          {pic.title || `Ảnh ${picId}`}
                                        </span>
                                        <button
                                          className="ml-3 px-2 py-1 text-xs bg-pink-200 text-pink-800 rounded-full hover:bg-pink-300 transition-colors"
                                          onClick={() => {
                                            // remove all instances
                                            const keysToRemove = Object.keys(
                                              canvasImages
                                            ).filter((k) =>
                                              k.startsWith(`uploaded_${picId}_`)
                                            );
                                            keysToRemove.forEach((k) =>
                                              removeCanvasInstance(k)
                                            );
                                          }}
                                        >
                                          Xóa
                                        </button>
                                      </div>
                                      <div className="flex items-center bg-white rounded-lg border border-pink-200">
                                        <button
                                          onClick={() =>
                                            updateUploadedQuantity(
                                              picId,
                                              qty - 1
                                            )
                                          }
                                          className="w-8 h-8 flex items-center justify-center text-pink-600 hover:bg-pink-50 rounded-l-lg"
                                        >
                                          -
                                        </button>
                                        <span className="px-3 py-1 text-sm font-semibold text-pink-800 border-x border-pink-200 bg-pink-50">
                                          {qty}
                                        </span>
                                        <button
                                          onClick={() =>
                                            updateUploadedQuantity(
                                              picId,
                                              qty + 1
                                            )
                                          }
                                          className="w-8 h-8 flex items-center justify-center text-pink-600 hover:bg-pink-50 rounded-r-lg"
                                        >
                                          +
                                        </button>
                                      </div>
                                    </div>

                                    {/* Per-instance scale sliders */}
                                    {Array.from({ length: qty }, (_, i) => {
                                      const instanceKey = `uploaded_${picId}_${i}`;
                                      const scale =
                                        (canvasImages[instanceKey] &&
                                          canvasImages[instanceKey].scale) ||
                                        1;
                                      return (
                                        <div
                                          key={instanceKey}
                                          className="pt-3 border-t border-pink-200"
                                        >
                                          <div className="flex justify-between items-center mb-2">
                                            <label className="text-xs font-medium text-pink-700">
                                              {pic.title
                                                ? pic.title.split(" ")[0]
                                                : "Ảnh"}{" "}
                                              #{i + 1} - Kích thước
                                            </label>
                                            <span className="text-xs font-bold bg-pink-200 px-2 py-1 rounded-full text-pink-800">
                                              {Math.round(scale * 100)}%
                                            </span>
                                          </div>
                                          <input
                                            type="range"
                                            min="20"
                                            max="200"
                                            value={Math.round(scale * 100)}
                                            onChange={(e) =>
                                              updateUploadedScale(
                                                instanceKey,
                                                Number(e.target.value) / 100
                                              )
                                            }
                                            className="w-full h-2.5 bg-pink-100 rounded-lg appearance-none cursor-pointer"
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

                      {/* Pagination for uploaded images when too many */}
                      {otherImages.length > otherLimit - 1 && (
                        <div className="mt-3 flex items-center justify-center gap-2">
                          <button
                            onClick={() => {
                              const next = Math.max(1, otherPage - 1);
                              setOtherPage(next);
                              loadOtherImages(next);
                            }}
                            className={`px-2 py-1 rounded bg-white border text-xs`}
                            disabled={otherPage === 1}
                          >
                            Prev
                          </button>
                          <div className="text-xs text-gray-600">
                            Trang {otherPage}
                          </div>
                          <button
                            onClick={() => {
                              const next = otherPage + 1;
                              setOtherPage(next);
                              loadOtherImages(next);
                            }}
                            className={`px-2 py-1 rounded bg-white border text-xs`}
                          >
                            Next
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {selectedTab === "Cơ bản" && (
                  /* Cake Flavors */
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
                            <div className="text-xs">
                              {flavorLabels[flavor]}
                            </div>
                          </div>
                        </button>
                      ))}
                    </div>
                    {selectedFlavors.length > 0 && (
                      <div className="mt-2 p-2 bg-green-50 border border-green-200 rounded-lg">
                        <div className="text-xs text-green-700">
                          <span className="font-medium">Đã chọn:</span>{" "}
                          {selectedFlavors
                            .map((f) => flavorLabels[f])
                            .join(", ")}
                        </div>
                      </div>
                    )}
                  </div>
                )}
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
            className="fixed inset-0 bg-gradient-to-br from-black/60 via-purple-900/40 to-pink-900/40 backdrop-blur-sm flex items-center justify-center z-50 p-4"
            onClick={(e) => {
              if (e.target === e.currentTarget) {
                closeImageModal();
              }
            }}
          >
            <div className="bg-white/95 backdrop-blur-xl rounded-3xl max-w-5xl w-full max-h-[95vh] overflow-hidden shadow-2xl border border-white/20 transform animate-in zoom-in-95 duration-300">
              {/* Modal Header */}
              <div className="flex items-center justify-between p-6 bg-gradient-to-r from-purple-50 via-pink-50 to-indigo-50 border-b border-purple-100/50 backdrop-blur-sm">
                <div className="flex items-center space-x-4">
                  <div className="relative">
                    <div className="w-12 h-12 bg-gradient-to-r from-purple-500 via-pink-500 to-indigo-500 rounded-2xl flex items-center justify-center shadow-lg">
                      <Sparkles className="w-6 h-6 text-white" />
                    </div>
                    <div className="absolute -top-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-white animate-pulse"></div>
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold bg-gradient-to-r from-purple-600 via-pink-600 to-indigo-600 bg-clip-text text-transparent">
                      Ảnh AI được tạo
                    </h3>
                    <p className="text-sm text-purple-600/70 mt-1">
                      Thiết kế bánh độc đáo được tạo bởi trí tuệ nhân tạo
                    </p>
                  </div>
                </div>
                <button
                  onClick={closeImageModal}
                  className="p-3 hover:bg-white/80 rounded-2xl transition-all duration-200 group hover:scale-105 hover:shadow-lg"
                >
                  <X className="w-6 h-6 text-gray-600 group-hover:text-gray-800 transition-colors" />
                </button>
              </div>

              {/* Modal Content */}
              <div className="p-6 overflow-y-auto max-h-[calc(95vh-100px)] bg-gradient-to-br from-white via-purple-50/20 to-pink-50/20">
                <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
                  {/* Image Section */}
                  <div className="space-y-6">
                    <div className="relative group overflow-hidden rounded-3xl bg-gradient-to-br from-purple-100 via-pink-50 to-indigo-100 p-6 shadow-xl">
                      <div className="absolute inset-0 bg-gradient-to-r from-purple-500/5 via-pink-500/5 to-indigo-500/5"></div>
                      <div className="relative overflow-hidden rounded-2xl shadow-2xl">
                        <img
                          src={selectedAIImage.ai_generated}
                          alt="AI Generated Cake Full Size"
                          className="w-full h-auto max-h-[55vh] xl:max-h-[65vh] object-contain rounded-2xl transition-all duration-500 group-hover:scale-[1.02]"
                          onError={(e) => {
                            e.target.src = "/placeholder-cake.jpg";
                          }}
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/10 via-transparent to-transparent rounded-2xl"></div>
                        <div className="absolute top-4 right-4 bg-gradient-to-r from-purple-500 to-pink-500 text-white px-4 py-2 rounded-2xl text-sm font-bold shadow-lg backdrop-blur-sm">
                          <Sparkles className="w-4 h-4 inline mr-2" />
                          AI Generated
                        </div>
                        <div className="absolute bottom-4 left-4 right-4">
                          <div className="bg-white/90 backdrop-blur-md rounded-xl p-3 shadow-lg border border-white/20">
                            <p className="text-xs text-gray-600 font-medium">
                              ✨ Được tạo bởi trí tuệ nhân tạo tiên tiến
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Image Actions */}
                    <div className="grid grid-cols-2 gap-3">
                      <button
                        onClick={openEditModal}
                        className="group relative overflow-hidden px-6 py-4 bg-gradient-to-r from-blue-500 via-purple-500 to-indigo-500 text-white rounded-2xl font-bold hover:from-blue-600 hover:via-purple-600 hover:to-indigo-600 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-[1.02]"
                      >
                        <div className="absolute inset-0 bg-gradient-to-r from-blue-400/20 to-purple-400/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                        <div className="relative flex items-center justify-center">
                          <svg
                            className="w-5 h-5 mr-2"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth="2"
                              d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                            />
                          </svg>
                          Chỉnh sửa
                        </div>
                      </button>

                      <button
                        onClick={handleCreateCakeQuote}
                        className="group relative overflow-hidden px-6 py-4 bg-gradient-to-r from-green-500 via-emerald-500 to-teal-500 text-white rounded-2xl font-bold hover:from-green-600 hover:via-emerald-600 hover:to-teal-600 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-[1.02]"
                      >
                        <div className="absolute inset-0 bg-gradient-to-r from-green-400/20 to-emerald-400/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                        <div className="relative flex items-center justify-center">
                          <svg
                            className="w-5 h-5 mr-2"
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
                          Tìm thợ làm bánh
                        </div>
                      </button>

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
                        className="group px-6 py-4 bg-white border-2 border-purple-200 text-purple-600 rounded-2xl font-bold hover:bg-purple-50 hover:border-purple-300 transition-all duration-200 shadow-md hover:shadow-lg transform hover:scale-[1.02]"
                      >
                        <div className="flex items-center justify-center">
                          <svg
                            className="w-5 h-5 mr-2"
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
                        </div>
                      </button>

                      <a
                        href={selectedAIImage.ai_generated}
                        download={`ai-cake-${selectedAIImage.id}.jpg`}
                        className="group px-6 py-4 bg-white border-2 border-indigo-200 text-indigo-600 rounded-2xl font-bold hover:bg-indigo-50 hover:border-indigo-300 transition-all duration-200 shadow-md hover:shadow-lg transform hover:scale-[1.02] flex items-center justify-center"
                      >
                        <Download className="w-5 h-5 mr-2" />
                        Tải xuống
                      </a>
                    </div>
                  </div>

                  {/* Description Section */}
                  <div className="space-y-6">
                    {/* Main Description Card */}
                    <div className="bg-white/80 backdrop-blur-sm rounded-3xl p-6 shadow-xl border border-purple-100/50">
                      <div className="flex items-center mb-4">
                        <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-pink-500 rounded-2xl flex items-center justify-center mr-4 shadow-lg">
                          <svg
                            className="w-5 h-5 text-white"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth="2"
                              d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                            />
                          </svg>
                        </div>
                        <h4 className="text-xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                          Mô tả chi tiết
                        </h4>
                      </div>
                      <div className="bg-gradient-to-br from-purple-50/80 to-pink-50/80 border border-purple-200/50 rounded-2xl p-6 shadow-inner">
                        <p className="text-gray-700 leading-relaxed whitespace-pre-wrap text-sm">
                          {selectedAIImage.description}
                        </p>
                      </div>
                    </div>

                    {/* Stats Cards */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="bg-gradient-to-br from-blue-50 to-indigo-100 border border-blue-200/50 rounded-2xl p-5 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-[1.02]">
                        <div className="flex items-center justify-between mb-3">
                          <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-xl flex items-center justify-center shadow-md">
                            <svg
                              className="w-4 h-4 text-white"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth="2"
                                d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                              />
                            </svg>
                          </div>
                          <div className="text-xs font-bold text-blue-600 bg-blue-200/50 px-2 py-1 rounded-lg">
                            NGÀY TẠO
                          </div>
                        </div>
                        <div className="text-sm font-bold text-gray-800 leading-tight">
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

                      <div className="bg-gradient-to-br from-green-50 to-emerald-100 border border-green-200/50 rounded-2xl p-5 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-[1.02]">
                        <div className="flex items-center justify-between mb-3">
                          <div className="w-8 h-8 bg-gradient-to-r from-green-500 to-emerald-500 rounded-xl flex items-center justify-center shadow-md">
                            <svg
                              className="w-4 h-4 text-white"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth="2"
                                d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                              />
                            </svg>
                          </div>
                          <div className="text-xs font-bold text-green-600 bg-green-200/50 px-2 py-1 rounded-lg">
                            TRẠNG THÁI
                          </div>
                        </div>
                        <div className="flex items-center">
                          <div className="w-3 h-3 bg-green-500 rounded-full mr-2 animate-pulse shadow-lg"></div>
                          <span className="text-sm font-bold text-gray-800">
                            Hoàn thành
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* AI Prompt Card */}
                    {selectedAIImage.ai_prompt && (
                      <div className="bg-white/80 backdrop-blur-sm rounded-3xl p-6 shadow-xl border border-pink-100/50">
                        <div className="flex items-center mb-4">
                          <div className="w-10 h-10 bg-gradient-to-r from-pink-500 to-rose-500 rounded-2xl flex items-center justify-center mr-4 shadow-lg">
                            <svg
                              className="w-5 h-5 text-white"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth="2"
                                d="M13 10V3L4 14h7v7l9-11h-7z"
                              />
                            </svg>
                          </div>
                          <h4 className="text-xl font-bold bg-gradient-to-r from-pink-600 to-rose-600 bg-clip-text text-transparent">
                            Prompt AI đã sử dụng
                          </h4>
                        </div>
                        <div className="bg-gradient-to-br from-gray-50/80 to-slate-50/80 border border-gray-200/50 rounded-2xl p-6 shadow-inner">
                          <div className="flex items-start space-x-3">
                            <div className="w-2 h-2 bg-pink-500 rounded-full mt-2 flex-shrink-0"></div>
                            <p className="text-sm text-gray-700 leading-relaxed">
                              {selectedAIImage.ai_prompt}
                            </p>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Additional Info Card */}
                    <div className="bg-gradient-to-br from-amber-50 to-orange-100 rounded-2xl p-6 border border-amber-200/50 shadow-lg">
                      <div className="flex items-center space-x-3 mb-3">
                        <div className="w-8 h-8 bg-gradient-to-r from-amber-500 to-orange-500 rounded-xl flex items-center justify-center shadow-md">
                          <svg
                            className="w-4 h-4 text-white"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth="2"
                              d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                            />
                          </svg>
                        </div>
                        <h5 className="text-lg font-bold text-amber-800">
                          Thông tin thêm
                        </h5>
                      </div>
                      <p className="text-sm text-amber-700 leading-relaxed">
                        💡 Hình ảnh này được tạo bằng công nghệ AI tiên tiến.
                        Bạn có thể sử dụng nó làm tham khảo để tìm kiếm thợ làm
                        bánh hoặc chỉnh sửa theo ý muốn.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Edit AI Image Modal */}
        {showEditModal && selectedAIImage && (
          <div
            className="fixed inset-0 bg-gradient-to-br from-black/60 via-blue-900/40 to-purple-900/40 backdrop-blur-sm flex items-center justify-center z-50 p-4"
            onClick={(e) => {
              if (e.target === e.currentTarget) {
                closeEditModal();
              }
            }}
          >
            <div className="bg-white/95 backdrop-blur-xl rounded-3xl max-w-3xl w-full shadow-2xl border border-white/20 max-h-[95vh] overflow-y-auto">
              {/* Header */}
              <div className="sticky top-0 bg-gradient-to-r from-blue-50 via-purple-50 to-indigo-50 p-6 rounded-t-3xl border-b border-blue-100/50">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="w-14 h-14 bg-gradient-to-r from-blue-500 via-purple-500 to-indigo-500 rounded-2xl flex items-center justify-center shadow-lg">
                      <svg
                        className="w-7 h-7 text-white"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                        />
                      </svg>
                    </div>
                    <div>
                      <h3 className="text-2xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 bg-clip-text text-transparent">
                        Chỉnh sửa ảnh AI
                      </h3>
                      <p className="text-sm text-gray-600 mt-1">
                        Mô tả thay đổi để tạo phiên bản mới của thiết kế bánh
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={closeEditModal}
                    disabled={isEditing}
                    className="p-3 hover:bg-white/80 rounded-2xl transition-all duration-200 group hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <X className="w-6 h-6 text-gray-600 group-hover:text-gray-800 transition-colors" />
                  </button>
                </div>
              </div>

              {/* Content */}
              <div className="p-6 space-y-6">
                {/* Current Image Preview */}
                <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-5 shadow-lg border border-gray-100">
                  <h4 className="text-lg font-bold text-gray-800 mb-4 flex items-center">
                    <svg
                      className="w-5 h-5 mr-3 text-purple-500"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                      />
                    </svg>
                    Ảnh hiện tại
                  </h4>
                  <div className="relative overflow-hidden rounded-xl shadow-lg group">
                    <img
                      src={selectedAIImage.ai_generated}
                      alt="Current AI Generated Cake"
                      className="w-full h-56 object-contain bg-gradient-to-br from-gray-50 to-gray-100 transition-transform duration-300 group-hover:scale-105"
                    />
                    <div className="absolute top-3 right-3 bg-purple-500 text-white px-3 py-1 rounded-full text-xs font-bold shadow-lg">
                      Bản gốc
                    </div>
                  </div>
                </div>

                {/* Edit Prompt Input */}
                <div className="mb-4">
                  <label className="block text-sm font-semibold text-gray-700 mb-3 flex items-center">
                    <svg
                      className="w-4 h-4 mr-2 text-blue-500"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"
                      />
                    </svg>
                    Mô tả thay đổi bạn muốn:
                  </label>

                  {/* Helpful hints */}
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-3">
                    <p className="text-xs text-blue-700 font-medium mb-2">
                      💡 Gợi ý viết prompt hiệu quả:
                    </p>
                    <ul className="text-xs text-blue-600 space-y-1">
                      <li>• Mô tả cụ thể: "Thêm hoa hồng đỏ trên đỉnh bánh"</li>
                      <li>
                        • Thay đổi màu sắc: "Đổi màu kem thành xanh pastel"
                      </li>
                      <li>
                        • Thêm decoration: "Rắc chocolate chips xung quanh"
                      </li>
                      <li>
                        • Thay đổi style: "Làm bánh theo phong cách vintage"
                      </li>
                    </ul>
                  </div>

                  <textarea
                    value={editPrompt}
                    onChange={(e) => setEditPrompt(e.target.value)}
                    placeholder="Ví dụ: Thêm những bông hoa hồng màu hồng trên đỉnh bánh, thay đổi màu kem từ trắng sang màu xanh pastel nhẹ, và rắc thêm chocolate sprinkles xung quanh cạnh bánh..."
                    className="w-full h-32 p-4 border-2 border-gray-300 rounded-xl resize-none focus:ring-4 focus:ring-blue-100 focus:border-blue-500 text-sm leading-relaxed transition-all duration-200 hover:border-gray-400"
                    maxLength={1000}
                    rows={6}
                  />
                  <div className="flex justify-between items-center mt-2">
                    <div className="text-xs text-gray-500">
                      <span className="font-medium">Mẹo:</span> Mô tả chi tiết
                      sẽ cho kết quả tốt hơn
                    </div>
                    <div
                      className={`text-xs font-medium ${
                        editPrompt.length > 900
                          ? "text-red-500"
                          : editPrompt.length > 750
                          ? "text-yellow-600"
                          : "text-gray-400"
                      }`}
                    >
                      {editPrompt.length}/1000 ký tự
                    </div>
                  </div>
                </div>

                {/* Original Description */}
                <div className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-2xl p-5 border border-amber-200/50">
                  <h4 className="text-lg font-bold text-amber-800 mb-4 flex items-center">
                    <svg
                      className="w-5 h-5 mr-3 text-amber-600"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                      />
                    </svg>
                    Mô tả gốc (tham khảo)
                  </h4>
                  <div className="bg-white/80 backdrop-blur-sm border border-amber-200 rounded-xl p-4 shadow-sm">
                    <p className="text-sm text-gray-700 leading-relaxed">
                      {selectedAIImage.description}
                    </p>
                  </div>
                </div>

                {/* Cost Information */}
                <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-2xl p-4 border border-green-200/50">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                        <DollarSign className="w-4 h-4 text-white" />
                      </div>
                      <div>
                        <p className="text-sm font-bold text-green-800">
                          Chi phí chỉnh sửa
                        </p>
                        <p className="text-xs text-green-600">
                          Tạo ảnh mới dựa trên thay đổi
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-bold text-green-700">
                        {AI_GENERATION_COST.toLocaleString()} VND
                      </p>
                      <p className="text-xs text-green-600">
                        Sẽ trừ từ ví của bạn
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Footer */}
              <div className="sticky bottom-0 bg-gradient-to-r from-gray-50 to-white p-6 rounded-b-3xl border-t border-gray-200/50 shadow-lg">
                <div className="flex gap-4">
                  <button
                    onClick={closeEditModal}
                    className="flex-1 px-6 py-4 border-2 border-gray-300 text-gray-700 rounded-2xl font-bold hover:bg-gray-50 hover:border-gray-400 transition-all duration-200 shadow-md hover:shadow-lg transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                    disabled={isEditing}
                  >
                    Hủy bỏ
                  </button>
                  <button
                    onClick={handleEditAIImage}
                    disabled={isEditing || !editPrompt.trim()}
                    className={`flex-1 px-6 py-4 rounded-2xl font-bold text-white transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-[1.02] disabled:transform-none ${
                      isEditing || !editPrompt.trim()
                        ? "bg-gray-400 cursor-not-allowed shadow-none"
                        : "bg-gradient-to-r from-blue-500 via-purple-500 to-indigo-500 hover:from-blue-600 hover:via-purple-600 hover:to-indigo-600"
                    }`}
                  >
                    {isEditing ? (
                      <div className="flex items-center justify-center">
                        <div className="w-5 h-5 border-3 border-white border-t-transparent rounded-full animate-spin mr-3"></div>
                        Đang tạo ảnh mới...
                      </div>
                    ) : (
                      <div className="flex items-center justify-center">
                        <Sparkles className="w-5 h-5 mr-3" />
                        Tạo ảnh mới ({AI_GENERATION_COST.toLocaleString()} VND)
                      </div>
                    )}
                  </button>
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
                <div className="bg-gradient-to-r from-purple-50 to-pink-50 border border-purple-200 rounded-lg p-4 mb-4">
                  <h4 className="text-sm font-semibold text-purple-700 mb-2 flex items-center">
                    <span className="w-2 h-4 bg-purple-500 rounded-full mr-2"></span>
                    Mô tả AI sẽ được gửi:
                  </h4>
                  <p className="text-sm text-gray-700 leading-relaxed">
                    {generateAIPromptDescription()}
                  </p>
                </div>

                {/* Cost Display */}
                <div className="bg-gradient-to-r from-green-100 to-blue-100 rounded-lg p-4 mb-6">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <DollarSign className="w-5 h-5 text-green-600" />
                      <span className="font-medium text-green-800">
                        Chi phí tạo ảnh AI:
                      </span>
                    </div>
                    <span className="text-lg font-bold text-green-600">
                      {AI_GENERATION_COST.toLocaleString()} VND
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2">
                      <Wallet className="w-4 h-4 text-blue-600" />
                      <span className="text-blue-700">Số dư hiện tại:</span>
                    </div>
                    <span
                      className={`font-medium ${
                        balance >= AI_GENERATION_COST
                          ? "text-green-600"
                          : "text-red-600"
                      }`}
                    >
                      {balance.toLocaleString()} VND
                    </span>
                  </div>
                  {balance < AI_GENERATION_COST && (
                    <div className="mt-2 text-xs text-red-600 bg-red-50 p-2 rounded">
                      ⚠️ Số dư không đủ để tạo ảnh AI. Vui lòng nạp thêm tiền.
                    </div>
                  )}
                </div>

                <div className="flex gap-3">
                  <button
                    onClick={() => setShowAIModal(false)}
                    className="flex-1 px-4 py-3 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 font-medium transition-colors"
                  >
                    Bỏ qua
                  </button>
                  {balance < AI_GENERATION_COST && (
                    <button
                      onClick={() => (window.location.href = "/wallet")}
                      className="flex-1 px-4 py-3 bg-yellow-500 text-white rounded-lg font-medium hover:bg-yellow-600 transition-colors"
                    >
                      <Wallet className="w-4 h-4 mr-2 inline" />
                      Nạp tiền
                    </button>
                  )}
                  <button
                    onClick={handleGenerateAI}
                    disabled={isGeneratingAI || balance < AI_GENERATION_COST}
                    className={`flex-1 px-4 py-3 rounded-lg font-medium text-white transition-all duration-200 ${
                      isGeneratingAI || balance < AI_GENERATION_COST
                        ? "bg-gray-400 cursor-not-allowed"
                        : "bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 shadow-lg hover:shadow-xl"
                    }`}
                  >
                    {isGeneratingAI ? (
                      <div className="flex items-center justify-center">
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                        Đang tạo...
                      </div>
                    ) : balance < AI_GENERATION_COST ? (
                      <>
                        <Wallet className="w-4 h-4 mr-2 inline" />
                        Không đủ tiền ({AI_GENERATION_COST.toLocaleString()}{" "}
                        VND)
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-4 h-4 mr-2 inline" />
                        Tạo ảnh AI ({AI_GENERATION_COST.toLocaleString()} VND)
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Add Image Modal */}
        {showAddModal && (
          <div
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
            onClick={(e) => {
              if (e.target === e.currentTarget) setShowAddModal(false);
            }}
          >
            <div className="bg-white rounded-xl max-w-md w-full shadow-2xl">
              <div className="p-6">
                <h3 className="text-lg font-bold mb-3">Thêm ảnh mới</h3>
                <div className="space-y-3">
                  <input
                    type="text"
                    placeholder="Tiêu đề ảnh"
                    value={uploadTitle}
                    onChange={(e) => setUploadTitle(e.target.value)}
                    className="w-full p-2 border border-gray-200 rounded-lg text-sm"
                  />
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => setUploadFile(e.target.files?.[0] || null)}
                    className="w-full text-sm"
                  />
                  <div className="flex gap-2">
                    <button
                      onClick={async () => {
                        await handleUploadPicture();
                        // close modal after upload success or keep open if failed
                        setShowAddModal(false);
                      }}
                      disabled={uploading}
                      className={`px-4 py-2 rounded-lg text-sm font-medium text-white ${
                        uploading
                          ? "bg-gray-400 cursor-not-allowed"
                          : "bg-gradient-to-r from-purple-500 to-pink-500"
                      }`}
                    >
                      {uploading ? "Đang tải..." : "Tải lên ảnh"}
                    </button>
                    <button
                      onClick={() => setShowAddModal(false)}
                      className="px-4 py-2 rounded-lg text-sm font-medium border border-gray-200"
                    >
                      Huỷ
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Delete confirmation modal for uploaded images */}
        {confirmDeletePictureId && (
          <div
            className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50 p-4"
            onClick={(e) => {
              if (e.target === e.currentTarget) setConfirmDeletePictureId(null);
            }}
          >
            <div className="bg-white rounded-xl max-w-sm w-full shadow-2xl">
              <div className="p-6">
                <h4 className="text-lg font-semibold mb-2">Xác nhận xóa</h4>
                <p className="text-sm text-gray-700 mb-4">
                  Bạn có chắc chắn muốn xóa ảnh này? Hành động này không thể
                  hoàn tác.
                </p>
                <div className="flex gap-2">
                  <button
                    onClick={() => setConfirmDeletePictureId(null)}
                    className="flex-1 px-4 py-2 border rounded"
                  >
                    Huỷ
                  </button>
                  <button
                    onClick={() =>
                      handleConfirmDeletePicture(confirmDeletePictureId)
                    }
                    className="flex-1 px-4 py-2 bg-red-600 text-white rounded"
                  >
                    Xóa
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Cake Quote Form Modal */}
        {showCakeQuoteForm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              {/* Header */}
              <div className="sticky top-0 bg-gradient-to-r from-green-50 to-emerald-50 border-b border-green-200 px-8 py-6 rounded-t-2xl shadow-sm">
                <div className="flex justify-between items-center">
                  <div className="flex items-center">
                    <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-emerald-500 rounded-xl flex items-center justify-center shadow-lg mr-4">
                      <svg
                        className="w-6 h-6 text-white"
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
                    <div>
                      <h3 className="text-2xl font-bold text-gray-800">
                        Tạo yêu cầu tìm thợ làm bánh
                      </h3>
                      <p className="text-gray-600 text-sm mt-1">
                        Điền thông tin để tìm thợ làm bánh phù hợp nhất
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={closeCakeQuoteForm}
                    disabled={isSubmitting}
                    className="text-gray-400 hover:text-gray-600 hover:bg-white rounded-lg p-2 transition-all duration-200 disabled:opacity-50"
                  >
                    <X className="w-6 h-6" />
                  </button>
                </div>
              </div>

              {/* Form Content */}
              <div className="px-8 py-6 space-y-8 bg-gradient-to-br from-gray-50 to-white">
                {/* Title */}
                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-gray-800 mb-3">
                    Tiêu đề yêu cầu <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => handleFormChange("title", e.target.value)}
                    className={`w-full px-4 py-3 border-2 rounded-xl transition-all duration-200 focus:ring-4 focus:ring-green-100 focus:border-green-400 bg-white shadow-sm ${
                      formErrors.title
                        ? "border-red-400 focus:border-red-400 focus:ring-red-100"
                        : "border-gray-200 hover:border-gray-300"
                    }`}
                    placeholder="e.g. Birthday Cake for 20 People"
                  />
                  {formErrors.title && (
                    <p className="text-red-500 text-sm mt-1 flex items-center">
                      <svg
                        className="w-4 h-4 mr-1"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path
                          fillRule="evenodd"
                          d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                          clipRule="evenodd"
                        />
                      </svg>
                      {formErrors.title}
                    </p>
                  )}
                </div>

                {/* Description */}
                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-gray-800 mb-3">
                    Mô tả chi tiết <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) =>
                      handleFormChange("description", e.target.value)
                    }
                    rows="4"
                    className={`w-full px-4 py-3 border-2 rounded-xl transition-all duration-200 focus:ring-4 focus:ring-green-100 focus:border-green-400 bg-white shadow-sm resize-none ${
                      formErrors.description
                        ? "border-red-400 focus:border-red-400 focus:ring-red-100"
                        : "border-gray-200 hover:border-gray-300"
                    }`}
                    placeholder="e.g. Looking for a chocolate birthday cake with custom decorations"
                  />
                  {formErrors.description && (
                    <p className="text-red-500 text-sm mt-1 flex items-center">
                      <svg
                        className="w-4 h-4 mr-1"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path
                          fillRule="evenodd"
                          d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                          clipRule="evenodd"
                        />
                      </svg>
                      {formErrors.description}
                    </p>
                  )}
                </div>

                {/* Two columns layout */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  {/* Cake Size */}
                  <div className="space-y-2">
                    <label className="block text-sm font-semibold text-gray-800 mb-3">
                      Kích thước bánh <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={formData.cake_size}
                      onChange={(e) =>
                        handleFormChange("cake_size", e.target.value)
                      }
                      className={`w-full px-4 py-3 border-2 rounded-xl transition-all duration-200 focus:ring-4 focus:ring-green-100 focus:border-green-400 bg-white shadow-sm ${
                        formErrors.cake_size
                          ? "border-red-400 focus:border-red-400 focus:ring-red-100"
                          : "border-gray-200 hover:border-gray-300"
                      }`}
                      placeholder="e.g. 8 inch, 25cm, 10x8 inch"
                    />
                    {formErrors.cake_size && (
                      <p className="text-red-500 text-sm mt-1 flex items-center">
                        <svg
                          className="w-4 h-4 mr-1"
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path
                            fillRule="evenodd"
                            d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                            clipRule="evenodd"
                          />
                        </svg>
                        {formErrors.cake_size}
                      </p>
                    )}
                  </div>

                  {/* Budget Range */}
                  <div className="space-y-2">
                    <label className="block text-sm font-semibold text-gray-800 mb-3">
                      Ngân sách (VND) <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="number"
                      value={formData.budget_range}
                      onChange={(e) =>
                        handleFormChange(
                          "budget_range",
                          parseInt(e.target.value) || 0
                        )
                      }
                      min="50000"
                      max="50000000"
                      step="10000"
                      className={`w-full px-4 py-3 border-2 rounded-xl transition-all duration-200 focus:ring-4 focus:ring-green-100 focus:border-green-400 bg-white shadow-sm ${
                        formErrors.budget_range
                          ? "border-red-400 focus:border-red-400 focus:ring-red-100"
                          : "border-gray-200 hover:border-gray-300"
                      }`}
                      placeholder="500000"
                    />
                    {formErrors.budget_range && (
                      <p className="text-red-500 text-sm mt-1 flex items-center">
                        <svg
                          className="w-4 h-4 mr-1"
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path
                            fillRule="evenodd"
                            d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                            clipRule="evenodd"
                          />
                        </svg>
                        {formErrors.budget_range}
                      </p>
                    )}
                    <p className="text-xs text-gray-500 mt-1">
                      Từ 50,000 - 50,000,000 VND
                    </p>
                  </div>
                </div>

                {/* Special Requirements */}
                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-gray-800 mb-3">
                    Yêu cầu đặc biệt
                    <span className="text-gray-400 font-normal ml-2">
                      (Tùy chọn)
                    </span>
                  </label>
                  <textarea
                    value={formData.special_requirements}
                    onChange={(e) =>
                      handleFormChange("special_requirements", e.target.value)
                    }
                    rows="3"
                    className={`w-full px-4 py-3 border-2 rounded-xl transition-all duration-200 focus:ring-4 focus:ring-green-100 focus:border-green-400 bg-white shadow-sm resize-none ${
                      formErrors.special_requirements
                        ? "border-red-400 focus:border-red-400 focus:ring-red-100"
                        : "border-gray-200 hover:border-gray-300"
                    }`}
                    placeholder="e.g. Gluten-free, no nuts, sugar-free, specific flavors"
                  />
                  {formErrors.special_requirements && (
                    <p className="text-red-500 text-sm mt-1 flex items-center">
                      <svg
                        className="w-4 h-4 mr-1"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path
                          fillRule="evenodd"
                          d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                          clipRule="evenodd"
                        />
                      </svg>
                      {formErrors.special_requirements}
                    </p>
                  )}
                </div>

                {/* Expires At */}
                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-gray-800 mb-3">
                    Hạn cuối nhận báo giá
                    <span className="text-gray-400 font-normal ml-2">
                      (Tùy chọn)
                    </span>
                  </label>
                  <input
                    type="date"
                    value={formData.expires_at}
                    onChange={(e) =>
                      handleFormChange("expires_at", e.target.value)
                    }
                    min={new Date().toISOString().split("T")[0]}
                    className={`w-full px-4 py-3 border-2 rounded-xl transition-all duration-200 focus:ring-4 focus:ring-green-100 focus:border-green-400 bg-white shadow-sm ${
                      formErrors.expires_at
                        ? "border-red-400 focus:border-red-400 focus:ring-red-100"
                        : "border-gray-200 hover:border-gray-300"
                    }`}
                  />
                  {formErrors.expires_at && (
                    <p className="text-red-500 text-sm mt-1 flex items-center">
                      <svg
                        className="w-4 h-4 mr-1"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path
                          fillRule="evenodd"
                          d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                          clipRule="evenodd"
                        />
                      </svg>
                      {formErrors.expires_at}
                    </p>
                  )}
                  <p className="text-xs text-gray-500 mt-1">
                    Để trống sẽ tự động đặt hạn 30 ngày từ hôm nay
                  </p>
                </div>

                {/* Image Preview - Enhanced */}
                {selectedAIImage && (
                  <div className="space-y-3">
                    <label className="block text-sm font-semibold text-gray-800 mb-3">
                      Hình ảnh tham khảo
                    </label>
                    <div className="relative group">
                      <div className="border-2 border-dashed border-gray-300 rounded-xl p-4 bg-gradient-to-br from-purple-50 to-pink-50 hover:from-purple-100 hover:to-pink-100 transition-all duration-200">
                        <div className="relative overflow-hidden rounded-lg shadow-lg">
                          <img
                            src={selectedAIImage.ai_generated}
                            alt="Cake Design Reference"
                            className="w-full h-48 object-cover transition-transform duration-300 group-hover:scale-105"
                          />
                          <div className="absolute top-2 right-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white px-3 py-1 rounded-full text-xs font-medium shadow-lg">
                            <svg
                              className="w-3 h-3 inline mr-1"
                              fill="currentColor"
                              viewBox="0 0 20 20"
                            >
                              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                            </svg>
                            AI Generated
                          </div>
                        </div>
                        <div className="mt-3 text-center">
                          <p className="text-sm text-gray-600 font-medium">
                            Thiết kế AI làm tham khảo
                          </p>
                          <p className="text-xs text-gray-500 mt-1">
                            Thợ làm bánh sẽ dựa trên hình này để báo giá
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Footer */}
              <div className="sticky bottom-0 bg-gradient-to-r from-gray-50 to-white px-8 py-6 rounded-b-2xl border-t border-gray-200 shadow-lg">
                <div className="flex gap-4 justify-end">
                  <button
                    onClick={closeCakeQuoteForm}
                    disabled={isSubmitting}
                    className="px-8 py-3 border-2 border-gray-300 text-gray-700 rounded-xl font-semibold hover:bg-gray-50 hover:border-gray-400 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Hủy
                  </button>
                  <button
                    onClick={handleSubmitCakeQuote}
                    disabled={isSubmitting}
                    className="px-8 py-3 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-xl font-semibold hover:from-green-600 hover:to-emerald-600 transform hover:scale-105 transition-all duration-200 shadow-lg hover:shadow-xl disabled:opacity-70 disabled:cursor-not-allowed disabled:transform-none"
                  >
                    {isSubmitting ? (
                      <div className="flex items-center">
                        <svg
                          className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          viewBox="0 0 24 24"
                        >
                          <circle
                            className="opacity-25"
                            cx="12"
                            cy="12"
                            r="10"
                            stroke="currentColor"
                            strokeWidth="4"
                          ></circle>
                          <path
                            className="opacity-75"
                            fill="currentColor"
                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                          ></path>
                        </svg>
                        Đang tạo yêu cầu...
                      </div>
                    ) : (
                      <div className="flex items-center">
                        <svg
                          className="w-5 h-5 mr-2"
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
                        Tạo yêu cầu
                      </div>
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
