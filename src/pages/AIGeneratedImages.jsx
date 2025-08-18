import React, { useEffect, useState } from "react";
import {
  Sparkles,
  Palette,
  Download,
  Share2,
  Eye,
  X,
  Layers,
  Crown,
  AlertCircle,
  Wallet,
  DollarSign,
  Clock,
  CheckCircle,
  Image as ImageIcon,
  RefreshCw,
  Heart,
  Star,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { useAuth } from "../contexts/AuthContext";
import { fetchWalletBalance } from "../api/axios";

const AI_GENERATION_COST = 3000; // 3000 VND mỗi lần gen (cho 3 tấm)
const IMAGES_PER_PAGE = 6; // 12 ảnh mỗi trang

export default function AIGeneratedImages() {
  const { user } = useAuth();
  const [images, setImages] = useState([]);
  const [recentImages, setRecentImages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [generatingImages, setGeneratingImages] = useState([
    false,
    false,
    false,
  ]); // Track loading state for 3 images
  const [error, setError] = useState("");
  const [balance, setBalance] = useState(0);
  const [showBalanceWarning, setShowBalanceWarning] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  // Free usage (freemium) state
  const [freeUsage, setFreeUsage] = useState({ remaining: 0, max: 0 });
  const [loadingFreeUsage, setLoadingFreeUsage] = useState(false);

  // Form state
  const [promptForm, setPromptForm] = useState({
    shape: "",
    tiers: 1,
    style: "",
    color: "",
    theme: "",
    decoration: "",
    customPrompt: "",
  });

  // Modal states
  const [selectedImage, setSelectedImage] = useState(null);
  const [showImageModal, setShowImageModal] = useState(false);

  useEffect(() => {
    fetchImages();
    fetchUserBalance();
    fetchFreeUsageCount();
    // Poll free usage count every 30s so user sees live updates
    const interval = setInterval(() => {
      fetchFreeUsageCount();
    }, 30000);
    return () => clearInterval(interval);
  }, []);

  const fetchFreeUsageCount = async () => {
    setLoadingFreeUsage(true);
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(
        "https://cakestory-be.onrender.com/api/ai/freeUsageCount",
        {
          headers: {
            accept: "application/json",
            Authorization: token ? `Bearer ${token}` : "",
          },
        }
      );
      if (res.ok) {
        const data = await res.json();
        if (data?.data) {
          setFreeUsage({
            remaining: data.data.remainingFree ?? 0,
            max: data.data.maxFree ?? 0,
          });
        }
      }
    } catch (e) {
      // silent fail – don't block UX
    } finally {
      setLoadingFreeUsage(false);
    }
  };

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

  const fetchImages = async () => {
    setLoading(true);
    setError("");
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(
        "https://cakestory-be.onrender.com/api/ai/images",
        {
          headers: {
            accept: "*/*",
            Authorization: token ? `Bearer ${token}` : "",
          },
        }
      );
      const data = await res.json();
      if (data && data.data) {
        setImages(data.data);
        setRecentImages(data.data.slice(0, 3)); // Get 3 most recent
      } else {
        setError("Không lấy được ảnh.");
      }
    } catch (err) {
      setError("Có lỗi xảy ra khi tải ảnh.");
    } finally {
      setLoading(false);
    }
  };

  const generatePrompt = () => {
    const { shape, tiers, style, color, theme, decoration, customPrompt } =
      promptForm;

    let prompt = "Tạo hình ảnh một chiếc bánh kem";

    if (shape) {
      prompt += ` hình ${shape.toLowerCase()}.`;
    }

    if (tiers > 1) {
      prompt += ` Phải có ${tiers} Tầng.`;
    }

    if (style) {
      prompt += ` Phong cách: ${style.toLowerCase()}.`;
    }

    if (color) {
      prompt += ` Màu: ${color.toLowerCase()}.`;
    }

    if (theme) {
      prompt += ` Chủ đề: ${theme.toLowerCase()}.`;
    }

    if (decoration) {
      prompt += ` Trang trí: ${decoration.toLowerCase()}.`;
    }

    if (customPrompt.trim()) {
      prompt += ` Mô tả: ${customPrompt}`;
    }

    prompt += ". Phong cách chụp ảnh chuyên nghiệp, ánh sáng mềm mại, nền đẹp.";

    return prompt;
  };

  const handleGenerate = async () => {
    const hasFree = freeUsage.remaining > 0;
    const wantImages = 3; // Mỗi lượt (dù miễn phí hay trả phí) tạo 3 ảnh
    if (!hasFree && balance < AI_GENERATION_COST) {
      setShowBalanceWarning(true);
      return;
    }

    const prompt = generatePrompt();
    if (
      !prompt.trim() ||
      prompt ===
        "Tạo hình ảnh một chiếc bánh kem. Phong cách chụp ảnh chuyên nghiệp, ánh sáng mềm mại, nền đẹp."
    ) {
      setError("Vui lòng chọn ít nhất một tùy chọn hoặc nhập mô tả tùy chỉnh.");
      return;
    }

    setGenerating(true);
    setGeneratingImages([true, true, true]);
    setError("");

    try {
      const token = localStorage.getItem("token");
      const newImages = [];

      // Helper to poll for new image (shared by free & paid calls)
      const pollForNewImage = async (indexLabel) => {
        let found = false;
        let pollCount = 0;
        while (!found && pollCount < 30) {
          await new Promise((resolve) => setTimeout(resolve, 2000));
          pollCount++;
          const imagesRes = await fetch(
            "https://cakestory-be.onrender.com/api/ai/images",
            {
              headers: {
                accept: "*/*",
                Authorization: token ? `Bearer ${token}` : "",
              },
            }
          );
          const imagesData = await imagesRes.json();
          if (imagesData?.data?.length > 0) {
            const latestImage = imagesData.data.find(
              (img) =>
                !images.some((existingImg) => existingImg.id === img.id) &&
                !newImages.some((newImg) => newImg.id === img.id)
            );
            if (latestImage) {
              newImages.push(latestImage);
              found = true;
            }
          }
        }
        if (!found)
          throw new Error(`Tạo ảnh thứ ${indexLabel} mất quá nhiều thời gian`);
      };

      // Flow hợp nhất: nếu còn lượt free dùng endpoint free, hết dùng endpoint trả phí.
      for (let i = 0; i < wantImages; i++) {
        try {
          const endpoint = hasFree
            ? "https://cakestory-be.onrender.com/api/ai/freeGenerateImage"
            : "https://cakestory-be.onrender.com/api/ai/generate";
          const response = await fetch(endpoint, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: token ? `Bearer ${token}` : "",
            },
            body: JSON.stringify({ prompt }),
          });
          if (!response.ok)
            throw new Error(
              `Không thể tạo ảnh AI thứ ${i + 1} (${
                hasFree ? "miễn phí" : "trả phí"
              })`
            );
          await pollForNewImage(i + 1);
        } catch (err) {
          console.error(`Error generating image ${i + 1}:`, err);
        }
      }

      if (newImages.length > 0) {
        // Update images list with new images
        setImages((prevImages) => [...newImages, ...prevImages]);
        setRecentImages(newImages);

        // Reset to first page when new images are added
        setCurrentPage(1);

        // Update balance & free usage after successful generation
        await fetchUserBalance();
        await fetchFreeUsageCount();

        // Reset form
        setPromptForm({
          shape: "",
          tiers: 1,
          style: "",
          color: "",
          theme: "",
          decoration: "",
          customPrompt: "",
        });

        if (newImages.length < wantImages) {
          setError(
            `Chỉ tạo được ${newImages.length}/${wantImages} ảnh. Vui lòng thử lại để tạo thêm.`
          );
        }
      } else {
        setError("Không thể tạo ảnh nào. Vui lòng thử lại sau.");
      }
    } catch (err) {
      console.error("Generation error:", err);
      setError("Có lỗi xảy ra khi tạo ảnh AI.");
    } finally {
      setGenerating(false);
      setGeneratingImages([false, false, false]); // Reset all loading states
    }
  };

  const handleImageClick = (image) => {
    setSelectedImage(image);
    setShowImageModal(true);
  };

  const handleDownload = (imageUrl, filename) => {
    const link = document.createElement("a");
    link.href = imageUrl;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleShare = async (image) => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: "Ảnh bánh AI tuyệt đẹp",
          text: `Xem ảnh bánh này được tạo bởi AI: ${image.prompt}`,
          url: image.image_url,
        });
      } catch (err) {
        console.log("Share failed:", err);
      }
    } else {
      // Fallback to copy link
      navigator.clipboard.writeText(image.image_url);
      alert("Đã copy link ảnh!");
    }
  };

  // Pagination calculations
  const totalPages = Math.ceil(images.length / IMAGES_PER_PAGE);
  const startIndex = (currentPage - 1) * IMAGES_PER_PAGE;
  const endIndex = startIndex + IMAGES_PER_PAGE;
  const currentImages = images.slice(startIndex, endIndex);

  const handlePageChange = (page) => {
    setCurrentPage(page);
    // Scroll to top of gallery
    document
      .querySelector("#gallery-section")
      ?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-indigo-50 py-8 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-3 mb-4">
            <div className="p-3 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full">
              <Sparkles className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
              AI Tạo Ảnh Bánh Kem
            </h1>
          </div>
          <p className="text-gray-600 text-lg max-w-2xl mx-auto">
            Sử dụng AI để tạo ra những hình ảnh bánh kem tuyệt đẹp theo ý tưởng
            của bạn
          </p>
        </div>

        {/* Balance Warning */}
        {showBalanceWarning && freeUsage.remaining === 0 && (
          <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-6 rounded-lg">
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
        )}

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Left Panel - AI Generation Form */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl shadow-xl p-6 sticky top-8">
              <div className="flex items-center gap-3 mb-6">
                <Palette className="w-6 h-6 text-purple-500" />
                <h2 className="text-xl font-bold text-gray-800">Tạo Ảnh AI</h2>
              </div>

              {/* Cost Display (ẩn phần thông tin chi phí nếu còn lượt miễn phí) */}
              <div className="bg-gradient-to-r from-purple-100 to-pink-100 rounded-lg p-4 mb-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <DollarSign className="w-5 h-5 text-purple-600" />
                    <span className="font-medium text-purple-800">
                      Chi phí mỗi lần:
                    </span>
                  </div>
                  {freeUsage.remaining === 0 && (
                    <span className="text-lg font-bold text-purple-600">
                      {AI_GENERATION_COST.toLocaleString()} VND
                    </span>
                  )}
                </div>
                <div className="mt-2 text-sm text-purple-700">
                  {freeUsage.remaining === 0 ? (
                    <>
                      Tạo được 3 ảnh mỗi lần • Số dư: {balance.toLocaleString()}{" "}
                      VND
                    </>
                  ) : (
                    <>Bạn có 1 lượt tạo (3 ảnh) miễn phí 🎁</>
                  )}
                  {loadingFreeUsage ? (
                    <span className="block mt-1 text-xs text-purple-600 animate-pulse">
                      Đang kiểm tra lượt miễn phí...
                    </span>
                  ) : (
                    <span className="block mt-1 text-xs text-purple-700"></span>
                  )}
                </div>
              </div>

              {/* Form Fields */}
              <div className="space-y-4">
                {/* Free-text Input for Shape */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Hình dạng bánh (ví dụ: tròn, vuông, trái tim)
                  </label>
                  <input
                    type="text"
                    value={promptForm.shape}
                    onChange={(e) =>
                      setPromptForm({ ...promptForm, shape: e.target.value })
                    }
                    placeholder="Nhập hình dạng bánh..."
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  />
                </div>

                {/* Free-text Input for Tiers */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Số tầng (ví dụ: 1 tầng, 2 tầng)
                  </label>
                  <input
                    type="text"
                    value={promptForm.tiers}
                    onChange={(e) =>
                      setPromptForm({ ...promptForm, tiers: e.target.value })
                    }
                    placeholder="Nhập số tầng bánh..."
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  />
                </div>

                {/* Free-text Input for Style */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Phong cách (ví dụ: cổ điển, hiện đại)
                  </label>
                  <input
                    type="text"
                    value={promptForm.style}
                    onChange={(e) =>
                      setPromptForm({ ...promptForm, style: e.target.value })
                    }
                    placeholder="Nhập phong cách bánh..."
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  />
                </div>

                {/* Free-text Input for Color */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Màu sắc chủ đạo (ví dụ: đỏ, xanh, vàng)
                  </label>
                  <input
                    type="text"
                    value={promptForm.color}
                    onChange={(e) =>
                      setPromptForm({ ...promptForm, color: e.target.value })
                    }
                    placeholder="Nhập màu sắc chủ đạo..."
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  />
                </div>

                {/* Free-text Input for Theme */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Chủ đề (ví dụ: sinh nhật, cưới hỏi)
                  </label>
                  <input
                    type="text"
                    value={promptForm.theme}
                    onChange={(e) =>
                      setPromptForm({ ...promptForm, theme: e.target.value })
                    }
                    placeholder="Nhập chủ đề bánh..."
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  />
                </div>

                {/* Free-text Input for Decoration */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Trang trí (ví dụ: hoa, nến, ruy băng)
                  </label>
                  <input
                    type="text"
                    value={promptForm.decoration}
                    onChange={(e) =>
                      setPromptForm({
                        ...promptForm,
                        decoration: e.target.value,
                      })
                    }
                    placeholder="Nhập kiểu trang trí..."
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  />
                </div>

                {/* Custom Prompt */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Mô tả thêm (tùy chọn)
                  </label>
                  <textarea
                    value={promptForm.customPrompt}
                    onChange={(e) =>
                      setPromptForm({
                        ...promptForm,
                        customPrompt: e.target.value,
                      })
                    }
                    placeholder="Thêm chi tiết mô tả về bánh kem bạn muốn tạo..."
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none"
                    rows={3}
                  />
                </div>

                {/* Generated Prompt Preview */}
                {(promptForm.shape ||
                  promptForm.style ||
                  promptForm.color ||
                  promptForm.theme ||
                  promptForm.decoration ||
                  promptForm.customPrompt) && (
                  <div className="bg-gray-50 rounded-lg p-3">
                    <div className="text-xs font-medium text-gray-600 mb-1">
                      Prompt sẽ được gửi:
                    </div>
                    <div className="text-sm text-gray-800">
                      {generatePrompt()}
                    </div>
                  </div>
                )}

                {/* Generate Button */}
                <button
                  onClick={handleGenerate}
                  // Disable only if currently generating OR (no free usage left AND balance insufficient)
                  disabled={
                    generating ||
                    (freeUsage?.remaining <= 0 && balance < AI_GENERATION_COST)
                  }
                  className="w-full py-4 bg-gradient-to-r from-purple-500 to-pink-500 text-white font-bold rounded-lg hover:from-purple-600 hover:to-pink-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center justify-center gap-2"
                >
                  {generating ? (
                    <>
                      <RefreshCw className="w-5 h-5 animate-spin" />
                      Đang tạo ảnh...
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-5 h-5" />
                      {freeUsage?.remaining > 0 ? (
                        <>Tạo Ảnh AI (Miễn phí )</>
                      ) : (
                        <>
                          Tạo Ảnh AI ({AI_GENERATION_COST.toLocaleString()} VND)
                        </>
                      )}
                    </>
                  )}
                </button>

                {error && (
                  <div className="text-red-500 text-sm text-center bg-red-50 p-3 rounded-lg">
                    {error}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Right Panel - Images Gallery */}
          <div className="lg:col-span-2">
            {/* Recent Generated Images */}
            {(recentImages.length > 0 || generatingImages.some(Boolean)) && (
              <div className="mb-8">
                <div className="flex items-center gap-3 mb-4">
                  <Clock className="w-5 h-5 text-purple-500" />
                  <h2 className="text-xl font-bold text-gray-800">
                    3 Ảnh Mới Nhất
                  </h2>
                  {generating && (
                    <div className="flex items-center gap-2">
                      <RefreshCw className="w-4 h-4 text-purple-500 animate-spin" />
                      <span className="text-sm text-purple-600">
                        Đang tạo...
                      </span>
                    </div>
                  )}
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {[0, 1, 2].map((index) => {
                    const img = recentImages[index];
                    const isLoading = generatingImages[index];

                    if (isLoading) {
                      return (
                        <div
                          key={`loading-${index}`}
                          className="group relative bg-white rounded-xl shadow-lg overflow-hidden"
                        >
                          <div className="aspect-square relative bg-gradient-to-br from-purple-100 to-pink-100 flex items-center justify-center">
                            <div className="text-center">
                              <RefreshCw className="w-8 h-8 text-purple-500 animate-spin mx-auto mb-2" />
                              <p className="text-sm text-purple-600 font-medium">
                                Đang tạo ảnh {index + 1}...
                              </p>
                            </div>
                          </div>
                          <div className="p-4">
                            <div className="h-4 bg-gray-200 rounded animate-pulse mb-2"></div>
                            <div className="h-3 bg-gray-200 rounded animate-pulse w-3/4"></div>
                            <div className="flex items-center justify-between mt-3">
                              <div className="h-3 bg-gray-200 rounded animate-pulse w-16"></div>
                              <div className="flex gap-2">
                                <div className="w-8 h-8 bg-gray-200 rounded-lg animate-pulse"></div>
                                <div className="w-8 h-8 bg-gray-200 rounded-lg animate-pulse"></div>
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    }

                    if (!img) {
                      return (
                        <div
                          key={`placeholder-${index}`}
                          className="group relative bg-gray-50 rounded-xl shadow-lg overflow-hidden border-2 border-dashed border-gray-300"
                        >
                          <div className="aspect-square relative flex items-center justify-center">
                            <div className="text-center">
                              <ImageIcon className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                              <p className="text-sm text-gray-500">
                                Ảnh {index + 1}
                              </p>
                            </div>
                          </div>
                          <div className="p-4">
                            <p className="text-sm text-gray-400 text-center">
                              Chưa có ảnh
                            </p>
                          </div>
                        </div>
                      );
                    }

                    return (
                      <div
                        key={img.id}
                        className="group relative bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-all duration-300"
                      >
                        <div className="aspect-square relative">
                          <img
                            src={img.image_url}
                            alt={img.prompt}
                            className="w-full h-full object-cover cursor-pointer"
                            onClick={() => handleImageClick(img)}
                          />
                          <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-all duration-300 flex items-center justify-center pointer-events-none">
                            <Eye className="w-8 h-8 text-white opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                          </div>
                        </div>
                        <div className="p-4">
                          <p
                            className="text-sm text-gray-600 line-clamp-2"
                            title={img.prompt}
                          >
                            {img.prompt}
                          </p>
                          <div className="flex items-center justify-between mt-3">
                            <span className="text-xs text-gray-400">
                              {new Date(img.created_at).toLocaleDateString(
                                "vi-VN"
                              )}
                            </span>
                            <div className="flex gap-2">
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleDownload(
                                    img.image_url,
                                    `cake-ai-${img.id}.jpg`
                                  );
                                }}
                                className="p-2 text-gray-500 hover:text-purple-500 hover:bg-purple-50 rounded-lg transition-colors"
                                title="Tải xuống"
                              >
                                <Download className="w-4 h-4" />
                              </button>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleShare(img);
                                }}
                                className="p-2 text-gray-500 hover:text-pink-500 hover:bg-pink-50 rounded-lg transition-colors"
                                title="Chia sẻ"
                              >
                                <Share2 className="w-4 h-4" />
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* All Images Gallery */}
            <div id="gallery-section">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <ImageIcon className="w-5 h-5 text-purple-500" />
                  <h2 className="text-xl font-bold text-gray-800">
                    Thư Viện Ảnh AI
                  </h2>
                  <span className="text-sm text-gray-500">
                    ({images.length} ảnh)
                  </span>
                </div>
                <button
                  onClick={fetchImages}
                  className="flex items-center gap-2 px-4 py-2 text-purple-600 hover:text-purple-700 hover:bg-purple-50 rounded-lg transition-colors"
                >
                  <RefreshCw className="w-4 h-4" />
                  Làm mới
                </button>
              </div>

              {loading ? (
                <div className="flex justify-center items-center h-64">
                  <div className="text-center">
                    <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-purple-400 mx-auto mb-4"></div>
                    <p className="text-gray-500">Đang tải ảnh...</p>
                  </div>
                </div>
              ) : error ? (
                <div className="text-center py-12">
                  <AlertCircle className="w-12 h-12 text-red-400 mx-auto mb-4" />
                  <p className="text-red-500">{error}</p>
                </div>
              ) : images.length === 0 ? (
                <div className="text-center py-12">
                  <ImageIcon className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500">Chưa có ảnh nào được tạo</p>
                </div>
              ) : (
                <div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {currentImages.map((img) => (
                      <div
                        key={img.id}
                        className="group relative bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-all duration-300"
                      >
                        <div className="aspect-square relative">
                          <img
                            src={img.image_url}
                            alt={img.prompt}
                            className="w-full h-full object-cover cursor-pointer"
                            onClick={() => handleImageClick(img)}
                          />
                          <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-all duration-300 flex items-center justify-center pointer-events-none">
                            <Eye className="w-8 h-8 text-white opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                          </div>
                          <div className="absolute top-3 right-3 bg-purple-500 text-white px-2 py-1 rounded-full text-xs font-medium">
                            AI
                          </div>
                        </div>
                        <div className="p-4">
                          <p
                            className="text-sm text-gray-600 line-clamp-2 mb-3"
                            title={img.prompt}
                          >
                            {img.prompt}
                          </p>
                          <div className="flex items-center justify-between">
                            <span className="text-xs text-gray-400">
                              {new Date(img.created_at).toLocaleDateString(
                                "vi-VN"
                              )}
                            </span>
                            <div className="flex gap-2">
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleDownload(
                                    img.image_url,
                                    `cake-ai-${img.id}.jpg`
                                  );
                                }}
                                className="p-2 text-gray-500 hover:text-purple-500 hover:bg-purple-50 rounded-lg transition-colors"
                                title="Tải xuống"
                              >
                                <Download className="w-4 h-4" />
                              </button>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleShare(img);
                                }}
                                className="p-2 text-gray-500 hover:text-pink-500 hover:bg-pink-50 rounded-lg transition-colors"
                                title="Chia sẻ"
                              >
                                <Share2 className="w-4 h-4" />
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Pagination */}
                  {totalPages > 1 && (
                    <div className="flex items-center justify-center mt-8 space-x-2">
                      {/* Previous Button */}
                      <button
                        onClick={() => handlePageChange(currentPage - 1)}
                        disabled={currentPage === 1}
                        className="flex items-center justify-center w-10 h-10 rounded-lg border border-gray-300 text-gray-500 hover:bg-purple-50 hover:text-purple-600 hover:border-purple-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-transparent disabled:hover:text-gray-500 disabled:hover:border-gray-300 transition-colors"
                      >
                        <ChevronLeft className="w-5 h-5" />
                      </button>

                      {/* Page Numbers */}
                      {[...Array(totalPages)].map((_, index) => {
                        const page = index + 1;
                        const isCurrentPage = page === currentPage;

                        // Show first page, last page, current page, and 2 pages around current
                        const showPage =
                          page === 1 ||
                          page === totalPages ||
                          Math.abs(page - currentPage) <= 2;

                        // Show dots when there's a gap
                        const showDots =
                          (page === 2 && currentPage > 4) ||
                          (page === totalPages - 1 &&
                            currentPage < totalPages - 3);

                        if (!showPage && !showDots) return null;

                        if (showDots) {
                          return (
                            <span
                              key={`dots-${page}`}
                              className="px-3 py-2 text-gray-400"
                            >
                              ...
                            </span>
                          );
                        }

                        if (!showPage) return null;

                        return (
                          <button
                            key={page}
                            onClick={() => handlePageChange(page)}
                            className={`flex items-center justify-center w-10 h-10 rounded-lg border transition-colors ${
                              isCurrentPage
                                ? "bg-gradient-to-r from-purple-500 to-pink-500 text-white border-transparent shadow-lg"
                                : "border-gray-300 text-gray-700 hover:bg-purple-50 hover:text-purple-600 hover:border-purple-300"
                            }`}
                          >
                            {page}
                          </button>
                        );
                      })}

                      {/* Next Button */}
                      <button
                        onClick={() => handlePageChange(currentPage + 1)}
                        disabled={currentPage === totalPages}
                        className="flex items-center justify-center w-10 h-10 rounded-lg border border-gray-300 text-gray-500 hover:bg-purple-50 hover:text-purple-600 hover:border-purple-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-transparent disabled:hover:text-gray-500 disabled:hover:border-gray-300 transition-colors"
                      >
                        <ChevronRight className="w-5 h-5" />
                      </button>
                    </div>
                  )}

                  {/* Page Info */}
                  {totalPages > 1 && (
                    <div className="text-center mt-4 text-sm text-gray-500">
                      Trang {currentPage} / {totalPages} • Hiển thị{" "}
                      {startIndex + 1}-{Math.min(endIndex, images.length)} của{" "}
                      {images.length} ảnh
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Image Detail Modal */}
        {showImageModal && selectedImage && (
          <div className="fixed inset-0 bg-black bg-opacity-90 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-3xl shadow-2xl max-w-6xl w-full max-h-[95vh] overflow-hidden">
              {/* Modal Header */}
              <div className="flex items-center justify-between p-6 border-b bg-gradient-to-r from-purple-50 to-pink-50">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg">
                    <Sparkles className="w-5 h-5 text-white" />
                  </div>
                  <h3 className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                    Chi tiết ảnh AI
                  </h3>
                </div>
                <button
                  onClick={() => setShowImageModal(false)}
                  className="p-3 text-gray-500 hover:text-gray-700 hover:bg-white hover:shadow-md rounded-xl transition-all duration-200"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              {/* Modal Content */}
              <div className="flex flex-col lg:flex-row overflow-hidden max-h-[calc(95vh-80px)]">
                {/* Image Section */}
                <div className="flex-1 bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center p-6">
                  <div className="relative max-w-full max-h-full">
                    <img
                      src={selectedImage.image_url}
                      alt={selectedImage.prompt}
                      className="max-w-full max-h-[60vh] lg:max-h-[80vh] object-contain rounded-xl shadow-2xl"
                      style={{ minHeight: "300px" }}
                    />
                    <div className="absolute top-4 right-4 bg-gradient-to-r from-purple-500 to-pink-500 text-white px-3 py-1 rounded-full text-sm font-medium shadow-lg">
                      <Sparkles className="w-4 h-4 inline mr-1" />
                      AI Generated
                    </div>
                  </div>
                </div>

                {/* Info Section */}
                <div className="lg:w-96 flex flex-col p-6 space-y-6">
                  {/* Prompt Description */}
                  <div className="bg-gradient-to-br from-purple-50 to-pink-50 p-5 rounded-xl border border-purple-100">
                    <div className="flex items-center gap-2 mb-3">
                      <div className="p-1 bg-gradient-to-r from-purple-500 to-pink-500 rounded-md">
                        <Eye className="w-4 h-4 text-white" />
                      </div>
                      <h4 className="text-lg font-semibold text-gray-800">
                        Mô tả
                      </h4>
                    </div>
                    <p className="text-gray-700 text-base leading-relaxed">
                      {selectedImage.prompt}
                    </p>
                  </div>

                  {/* Image Details */}
                  <div className="bg-gray-50 p-5 rounded-xl border border-gray-200">
                    <h4 className="text-lg font-semibold text-gray-800 mb-3">
                      Thông tin ảnh
                    </h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Ngày tạo:</span>
                        <span className="font-medium text-gray-800">
                          {new Date(
                            selectedImage.created_at
                          ).toLocaleDateString("vi-VN")}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">ID:</span>
                        <span className="font-medium text-gray-800">
                          #{selectedImage.id}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="space-y-3">
                    <button
                      onClick={() =>
                        handleDownload(
                          selectedImage.image_url,
                          `cake-ai-${selectedImage.id}.jpg`
                        )
                      }
                      className="w-full flex items-center justify-center gap-3 px-6 py-4 bg-gradient-to-r from-purple-500 to-pink-500 text-white font-semibold rounded-xl hover:from-purple-600 hover:to-pink-600 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                    >
                      <Download className="w-5 h-5" />
                      Tải xuống ảnh
                    </button>
                    <button
                      onClick={() => handleShare(selectedImage)}
                      className="w-full flex items-center justify-center gap-3 px-6 py-4 bg-white text-gray-700 font-semibold rounded-xl hover:bg-gray-50 transition-all duration-200 border-2 border-gray-200 hover:border-gray-300 shadow-md hover:shadow-lg"
                    >
                      <Share2 className="w-5 h-5" />
                      Chia sẻ ảnh
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
