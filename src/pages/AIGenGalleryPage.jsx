import React, { useState, useEffect } from "react";

const HIDDEN_PROMPT =
  "Ảnh chụp cận cảnh, góc ngang, ánh sáng dịu đều, nền đơn giản mờ, tập trung vào một chiếc bánh kem thật đẹp, rõ ràng là bánh kem, đặt trên kệ, làm nổi bật chi tiết trang trí một cách tinh tế. Tuyệt đối không phải đồ vật, món ăn hay chủ thể nào khác ngoài bánh kem.";

const defaultFields = {
  name: "",
  color: "",
  layers: "",
  theme: "",
};

function composePrompt(fields) {
  // Đưa prompt người dùng nhập lên đầu, sau đó mới đến prompt ẩn
  let userPrompt = `Bánh kem${fields.name ? " " + fields.name : ""}`;
  if (fields.layers) userPrompt += `, ${fields.layers} tầng`;
  if (fields.color) userPrompt += `, màu ${fields.color}`;
  if (fields.theme) userPrompt += `, chủ đề ${fields.theme}`;
  userPrompt += ".";
  // Đảm bảo prompt người dùng nhập là phần đầu tiên, sau đó mới đến prompt ẩn để AI ưu tiên ý người dùng
  return `${userPrompt} ${HIDDEN_PROMPT}`;
}

export default function AIGenGalleryPage() {
  const [fields, setFields] = useState(defaultFields);
  const [loading, setLoading] = useState(false);
  const [image, setImage] = useState(null);
  const [error, setError] = useState("");
  const [recentImages, setRecentImages] = useState([]);
  const [gallery, setGallery] = useState([]);
  const [tab, setTab] = useState("gen"); // 'gen' | 'gallery'
  const [loadingRecent, setLoadingRecent] = useState(false);
  const [loadingGallery, setLoadingGallery] = useState(false);

  // Fetch 3 latest images for preview
  useEffect(() => {
    setLoadingRecent(true);
    fetch("https://cakestory-be.onrender.com/api/ai/images", {
      headers: {
        accept: "*/*",
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
    })
      .then((res) => res.json())
      .then((data) => {
        if (data && data.data) setRecentImages(data.data.slice(0, 3));
        else setRecentImages([]);
      })
      .catch(() => setRecentImages([]))
      .finally(() => setLoadingRecent(false));
  }, [image]);

  // Fetch all gallery images
  useEffect(() => {
    if (tab !== "gallery") return;
    setLoadingGallery(true);
    fetch("https://cakestory-be.onrender.com/api/ai/images", {
      headers: {
        accept: "*/*",
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
    })
      .then((res) => res.json())
      .then((data) => {
        if (data && data.data) setGallery(data.data);
        else setGallery([]);
      })
      .catch(() => setGallery([]))
      .finally(() => setLoadingGallery(false));
  }, [tab, image]);

  const handleChange = (e) => {
    setFields({ ...fields, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setImage(null);
    const prompt = composePrompt(fields);
    try {
      await fetch("https://cakestory-be.onrender.com/api/ai/generate", {
        method: "POST",
        headers: {
          accept: "*/*",
          "Content-Type": "application/json",
          Authorization:
            "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MywidXNlcm5hbWUiOiJzb25ndGhhbmciLCJlbWFpbCI6InNvbmd0aGFuZ0BnbWFpbC5jb20iLCJyb2xlIjoidXNlciIsImZpcmViYXNlVWlkIjoiUWIwUVhVcDM1U1RNRUJZWlg2WFp1bHRUODFyMiIsImlhdCI6MTc1MzM1MjUwMiwiZXhwIjoxNzUzNDM4OTAyfQ.zD9PR651DBsYBpFiKkjPPjSfWzRC5TEzDqSfepX9m5M",
        },
        body: JSON.stringify({ prompt }),
      });
      // Poll lấy ảnh mới nhất
      let found = false;
      let pollCount = 0;
      let lastImageUrl = null;
      while (!found && pollCount < 30) {
        await new Promise((r) => setTimeout(r, 1000));
        pollCount++;
        const imgRes = await fetch(
          "https://cakestory-be.onrender.com/api/ai/images",
          {
            headers: {
              accept: "*/*",
              Authorization:
                "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MywidXNlcm5hbWUiOiJzb25ndGhhbmciLCJlbWFpbCI6InNvbmd0aGFuZ0BnbWFpbC5jb20iLCJyb2xlIjoidXNlciIsImZpcmViYXNlVWlkIjoiUWIwUVhVcDM1U1RNRUJZWlg2WFp1bHRUODFyMiIsImlhdCI6MTc1MzM1MjUwMiwiZXhwIjoxNzUzNDM4OTAyfQ.zD9PR651DBsYBpFiKkjPPjSfWzRC5TEzDqSfepX9m5M",
            },
          }
        );
        const imgData = await imgRes.json();
        if (imgData && imgData.data && imgData.data.length > 0) {
          // Tìm ảnh mới nhất có prompt gần giống
          const match = imgData.data.find(
            (img) => img.prompt && img.prompt.includes(fields.name)
          );
          if (match && match.image_url !== lastImageUrl) {
            setImage(match.image_url);
            found = true;
            break;
          }
          lastImageUrl = imgData.data[0].image_url;
        }
      }
      if (!found) setError("Tạo ảnh quá lâu, vui lòng thử lại sau.");
    } catch (err) {
      setError("Có lỗi xảy ra.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 to-purple-50 py-12 px-4">
      <div className="max-w-6xl mx-auto bg-white rounded-3xl shadow-2xl p-10 animate-fadeIn">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6 mb-12">
          <h1 className="text-5xl font-extrabold text-pink-600 tracking-tight drop-shadow">
            AI Bánh Kem
          </h1>
          <div className="flex gap-4">
            <button
              onClick={() => setTab("gen")}
              className={`px-8 py-3 rounded-xl text-lg font-bold transition-all duration-200 ${
                tab === "gen"
                  ? "bg-pink-500 text-white shadow-lg scale-105"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
            >
              Tạo ảnh AI
            </button>
            <button
              onClick={() => setTab("gallery")}
              className={`px-8 py-3 rounded-xl text-lg font-bold transition-all duration-200 ${
                tab === "gallery"
                  ? "bg-pink-500 text-white shadow-lg scale-105"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
            >
              Thư viện ảnh
            </button>
          </div>
        </div>
        {tab === "gen" && (
          <div className="grid md:grid-cols-2 gap-16">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="font-semibold text-2xl mb-4">
                Nhập thông tin bánh kem muốn tạo
              </div>
              <input
                name="name"
                value={fields.name}
                onChange={handleChange}
                placeholder="Tên bánh (ví dụ: Sinh nhật, Cưới,...)"
                className="w-full border-2 border-pink-200 rounded-xl px-4 py-3 text-lg focus:outline-none focus:ring-2 focus:ring-pink-400"
              />
              <input
                name="color"
                value={fields.color}
                onChange={handleChange}
                placeholder="Màu sắc chủ đạo (ví dụ: Hồng, xanh, neon...)"
                className="w-full border-2 border-pink-200 rounded-xl px-4 py-3 text-lg focus:outline-none focus:ring-2 focus:ring-pink-400"
              />
              <input
                name="layers"
                value={fields.layers}
                onChange={handleChange}
                placeholder="Số tầng (ví dụ: 1, 2, 3...)"
                className="w-full border-2 border-pink-200 rounded-xl px-4 py-3 text-lg focus:outline-none focus:ring-2 focus:ring-pink-400"
              />
              <input
                name="theme"
                value={fields.theme}
                onChange={handleChange}
                placeholder="Chủ đề trang trí (ví dụ: Hoạt hình, Hoa, Công nghệ...)"
                className="w-full border-2 border-pink-200 rounded-xl px-4 py-3 text-lg focus:outline-none focus:ring-2 focus:ring-pink-400"
              />
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-r from-pink-400 to-purple-400 text-white font-bold text-lg py-3 rounded-xl shadow hover:from-pink-500 hover:to-purple-500 transition-all duration-200"
              >
                {loading ? "Đang tạo ảnh..." : "Tạo ảnh AI"}
              </button>
              {error && (
                <div className="text-red-500 text-center mt-2 text-lg">
                  {error}
                </div>
              )}
            </form>
            <div className="flex flex-col items-center justify-center min-h-[400px]">
              {loading && (
                <div className="flex flex-col items-center">
                  <div className="animate-spin rounded-full h-24 w-24 border-b-4 border-pink-400 mb-4"></div>
                  <div className="text-pink-500 text-xl font-semibold">
                    Đang tạo ảnh, vui lòng đợi...
                  </div>
                </div>
              )}
              {image && !loading && (
                <div className="flex flex-col items-center">
                  <img
                    src={image}
                    alt="AI Cake"
                    className="rounded-2xl shadow-2xl max-h-[400px] object-contain border-4 border-pink-100"
                  />
                  <a
                    href={image}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-4 text-blue-500 underline text-lg"
                  >
                    Xem ảnh lớn
                  </a>
                </div>
              )}
              {!image && !loading && (
                <div className="text-gray-400 text-center text-lg">
                  Chưa có ảnh nào được tạo.
                </div>
              )}
              <div className="mt-12 w-full">
                <div className="font-semibold text-gray-700 text-lg mb-4">
                  Ảnh AI gần đây
                </div>
                {loadingRecent ? (
                  <div className="flex flex-col items-center py-6">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-pink-400 mb-2"></div>
                    <div className="text-base text-gray-400">
                      Đang tải ảnh...
                    </div>
                  </div>
                ) : recentImages.length === 0 ? (
                  <div className="flex flex-col items-center py-6">
                    <svg
                      width="48"
                      height="48"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="#e5e7eb"
                    >
                      <circle cx="12" cy="12" r="10" strokeWidth="2" />
                      <path
                        d="M8 15h8M9 10h.01M15 10h.01"
                        strokeWidth="2"
                        strokeLinecap="round"
                      />
                    </svg>
                    <div className="text-base text-gray-400 mt-2">
                      Chưa có ảnh nào.
                    </div>
                  </div>
                ) : (
                  <div className="flex gap-4 justify-center">
                    {recentImages.map((img) => (
                      <a
                        key={img.id}
                        href={img.image_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="block"
                      >
                        <img
                          src={img.image_url}
                          alt={img.prompt}
                          className="w-32 h-32 object-cover rounded-xl border-2 border-pink-100 hover:scale-105 transition-transform"
                          title={img.prompt}
                        />
                      </a>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
        {tab === "gallery" && (
          <div>
            <div className="font-semibold text-lg mb-4">
              Thư viện ảnh AI bánh kem
            </div>
            {loadingGallery ? (
              <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-pink-400"></div>
              </div>
            ) : gallery.length === 0 ? (
              <div className="text-center text-gray-400">Chưa có ảnh nào.</div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                {gallery.map((img) => (
                  <div
                    key={img.id}
                    className="bg-white rounded-xl shadow-lg p-4 flex flex-col items-center hover:shadow-2xl transition-shadow duration-200"
                  >
                    <img
                      src={img.image_url}
                      alt={img.prompt}
                      className="rounded-lg max-h-56 object-contain mb-3"
                    />
                    <div
                      className="text-xs text-gray-500 mb-1 truncate w-full text-center"
                      title={img.prompt}
                    >
                      {img.prompt}
                    </div>
                    <div className="text-[10px] text-gray-400">
                      {new Date(img.created_at).toLocaleString()}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
