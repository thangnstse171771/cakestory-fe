"use client";

import { useState, useEffect } from "react";
import { createChallenge, updateChallenge } from "../../api/challenge";
// import { toast } from "react-toastify";

export default function ChallengeModal({
  isOpen,
  onClose,
  onSuccess,
  editChallenge = null,
  mode = "create", // "create" or "edit"
}) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    prize: "",
    startDate: "",
    endDate: "",
    maxParticipants: 500,
    minParticipants: 10,
    hashtag: "",
    rules: "",
    requirements: "",
  });

  const defaultPrizes = [
    "Bộ dụng cụ làm bánh cao cấp",
    "Voucher 500.000đ",
    "Khóa học làm bánh chuyên nghiệp",
    "Chuyến du lịch",
    "Máy đánh trứng KitchenAid",
  ];
  const defaultHashtags = ["bánh", "thử-thách", "sáng-tạo", "học-hỏi"];

  // Load data when editing
  useEffect(() => {
    if (mode === "edit" && editChallenge) {
      console.log("Loading edit data:", editChallenge);

      // Convert date format if needed
      const formatDate = (dateStr) => {
        if (!dateStr) return "";
        const date = new Date(dateStr);
        return date.toISOString().split("T")[0]; // YYYY-MM-DD format
      };

      setFormData({
        title: editChallenge.title || "",
        description: editChallenge.description || "",
        prize: editChallenge.prize_description || editChallenge.prize || "",
        startDate: formatDate(
          editChallenge.start_date || editChallenge.startDate
        ),
        endDate: formatDate(editChallenge.end_date || editChallenge.endDate),
        maxParticipants:
          editChallenge.max_participants ||
          editChallenge.maxParticipants ||
          500,
        minParticipants:
          editChallenge.min_participants || editChallenge.minParticipants || 10,
        hashtag: Array.isArray(editChallenge.hashtags)
          ? editChallenge.hashtags.join(", ")
          : editChallenge.hashtag || "",
        rules: Array.isArray(editChallenge.rules)
          ? editChallenge.rules.join("\n")
          : editChallenge.rules || "",
        requirements: Array.isArray(editChallenge.requirements)
          ? editChallenge.requirements.join("\n")
          : editChallenge.requirements || "",
      });
    } else if (mode === "create") {
      // Reset form for create mode
      setFormData({
        title: "",
        description: "",
        prize: "",
        startDate: "",
        endDate: "",
        maxParticipants: 500,
        minParticipants: 10,
        hashtag: "",
        rules: "",
        requirements: "",
      });
    }
  }, [mode, editChallenge, isOpen]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.title || !formData.description) {
      alert("Vui lòng điền đầy đủ thông tin bắt buộc!");
      return;
    }

    try {
      setLoading(true);
      const challengeData = {
        title: formData.title,
        description: formData.description,
        max_participants: formData.maxParticipants,
        min_participants: formData.minParticipants,
        start_date: formData.startDate,
        end_date: formData.endDate,
        hashtag: formData.hashtag,
        prize_description: formData.prize,
        rules: formData.rules,
        requirements: formData.requirements,
      };

      let result;
      if (mode === "edit" && editChallenge?.id) {
        result = await updateChallenge(editChallenge.id, challengeData);
        alert("Cập nhật thử thách thành công!");
      } else {
        result = await createChallenge(challengeData);
        alert("Tạo thử thách mới thành công!");
      }

      if (onSuccess) {
        onSuccess(result);
      }
      onClose();
    } catch (error) {
      console.error(
        `Error ${mode === "edit" ? "updating" : "creating"} challenge:`,
        error
      );
      alert(
        error.response?.data?.message ||
          `Có lỗi xảy ra khi ${mode === "edit" ? "cập nhật" : "tạo"} thử thách!`
      );
    } finally {
      setLoading(false);
    }
  };

  const addHashtag = (tag) => {
    const currentTags = (formData.hashtag || "")
      .split(",")
      .map((t) => t.trim());
    if (!currentTags.includes(tag)) {
      setFormData({
        ...formData,
        hashtag: formData.hashtag ? `${formData.hashtag}, ${tag}` : tag,
      });
    }
  };

  if (!isOpen) {
    console.log("🚫 ChallengeModal not rendering - isOpen is false");
    return null;
  }

  console.log("✅ ChallengeModal rendering with:", {
    isOpen,
    mode,
    editChallenge,
  });

  return (
    <div
      style={{
        position: "fixed",
        top: "0",
        left: "0",
        width: "100%",
        height: "100%",
        backgroundColor: "rgba(0, 0, 0, 0.5)",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        zIndex: "1000",
      }}
      onClick={onClose}
    >
      <div
        style={{
          backgroundColor: "white",
          borderRadius: "12px",
          width: "90%",
          maxWidth: "600px",
          maxHeight: "90vh",
          overflow: "auto",
          boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.25)",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div
          style={{
            padding: "24px 24px 16px",
            borderBottom: "1px solid #e5e7eb",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <h2
            style={{
              fontSize: "24px",
              fontWeight: "bold",
              color: "#111827",
              margin: "0",
            }}
          >
            {mode === "edit" ? "Sửa thử thách" : "Tạo thử thách mới"}
          </h2>
          <button
            onClick={onClose}
            style={{
              background: "none",
              border: "none",
              fontSize: "24px",
              cursor: "pointer",
              color: "#6b7280",
              padding: "0",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              width: "32px",
              height: "32px",
              borderRadius: "50%",
              transition: "all 0.2s",
            }}
            onMouseEnter={(e) => {
              e.target.style.backgroundColor = "#f3f4f6";
              e.target.style.color = "#374151";
            }}
            onMouseLeave={(e) => {
              e.target.style.backgroundColor = "transparent";
              e.target.style.color = "#6b7280";
            }}
          >
            ×
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} style={{ padding: "24px" }}>
          <div
            style={{ display: "flex", flexDirection: "column", gap: "20px" }}
          >
            {/* Title */}
            <div>
              <label
                style={{
                  display: "block",
                  fontSize: "14px",
                  fontWeight: "500",
                  color: "#374151",
                  marginBottom: "6px",
                }}
              >
                Tiêu đề thử thách *
              </label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) =>
                  setFormData({ ...formData, title: e.target.value })
                }
                placeholder="Nhập tiêu đề thử thách..."
                required
                style={{
                  width: "100%",
                  padding: "12px",
                  border: "1px solid #d1d5db",
                  borderRadius: "8px",
                  fontSize: "14px",
                  boxSizing: "border-box",
                }}
              />
            </div>

            {/* Description */}
            <div>
              <label
                style={{
                  display: "block",
                  fontSize: "14px",
                  fontWeight: "500",
                  color: "#374151",
                  marginBottom: "6px",
                }}
              >
                Mô tả thử thách *
              </label>
              <textarea
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                placeholder="Mô tả chi tiết về thử thách..."
                required
                rows={4}
                style={{
                  width: "100%",
                  padding: "12px",
                  border: "1px solid #d1d5db",
                  borderRadius: "8px",
                  fontSize: "14px",
                  resize: "vertical",
                  boxSizing: "border-box",
                }}
              />
            </div>

            {/* Date Range */}
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: "16px",
              }}
            >
              <div>
                <label
                  style={{
                    display: "block",
                    fontSize: "14px",
                    fontWeight: "500",
                    color: "#374151",
                    marginBottom: "6px",
                  }}
                >
                  Ngày bắt đầu
                </label>
                <input
                  type="date"
                  value={formData.startDate}
                  onChange={(e) =>
                    setFormData({ ...formData, startDate: e.target.value })
                  }
                  style={{
                    width: "100%",
                    padding: "12px",
                    border: "1px solid #d1d5db",
                    borderRadius: "8px",
                    fontSize: "14px",
                    boxSizing: "border-box",
                  }}
                />
              </div>
              <div>
                <label
                  style={{
                    display: "block",
                    fontSize: "14px",
                    fontWeight: "500",
                    color: "#374151",
                    marginBottom: "6px",
                  }}
                >
                  Ngày kết thúc
                </label>
                <input
                  type="date"
                  value={formData.endDate}
                  onChange={(e) =>
                    setFormData({ ...formData, endDate: e.target.value })
                  }
                  style={{
                    width: "100%",
                    padding: "12px",
                    border: "1px solid #d1d5db",
                    borderRadius: "8px",
                    fontSize: "14px",
                    boxSizing: "border-box",
                  }}
                />
              </div>
            </div>

            {/* Participants */}
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: "16px",
              }}
            >
              <div>
                <label
                  style={{
                    display: "block",
                    fontSize: "14px",
                    fontWeight: "500",
                    color: "#374151",
                    marginBottom: "6px",
                  }}
                >
                  Số người tối thiểu
                </label>
                <input
                  type="number"
                  value={formData.minParticipants}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      minParticipants: parseInt(e.target.value) || 10,
                    })
                  }
                  min="1"
                  style={{
                    width: "100%",
                    padding: "12px",
                    border: "1px solid #d1d5db",
                    borderRadius: "8px",
                    fontSize: "14px",
                    boxSizing: "border-box",
                  }}
                />
              </div>
              <div>
                <label
                  style={{
                    display: "block",
                    fontSize: "14px",
                    fontWeight: "500",
                    color: "#374151",
                    marginBottom: "6px",
                  }}
                >
                  Số người tối đa
                </label>
                <input
                  type="number"
                  value={formData.maxParticipants}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      maxParticipants: parseInt(e.target.value) || 500,
                    })
                  }
                  min={formData.minParticipants}
                  style={{
                    width: "100%",
                    padding: "12px",
                    border: "1px solid #d1d5db",
                    borderRadius: "8px",
                    fontSize: "14px",
                    boxSizing: "border-box",
                  }}
                />
              </div>
            </div>

            {/* Prize */}
            <div>
              <label
                style={{
                  display: "block",
                  fontSize: "14px",
                  fontWeight: "500",
                  color: "#374151",
                  marginBottom: "6px",
                }}
              >
                Giải thưởng
              </label>
              <div style={{ marginBottom: "8px" }}>
                <div
                  style={{
                    display: "flex",
                    flexWrap: "wrap",
                    gap: "8px",
                    marginBottom: "8px",
                  }}
                >
                  {defaultPrizes.map((prize) => (
                    <button
                      key={prize}
                      type="button"
                      onClick={() => setFormData({ ...formData, prize: prize })}
                      style={{
                        padding: "6px 12px",
                        fontSize: "12px",
                        backgroundColor: "#f3f4f6",
                        border: "1px solid #d1d5db",
                        borderRadius: "20px",
                        cursor: "pointer",
                        transition: "all 0.2s",
                      }}
                      onMouseEnter={(e) => {
                        e.target.style.backgroundColor = "#e5e7eb";
                      }}
                      onMouseLeave={(e) => {
                        e.target.style.backgroundColor = "#f3f4f6";
                      }}
                    >
                      {prize}
                    </button>
                  ))}
                </div>
              </div>
              <textarea
                value={formData.prize}
                onChange={(e) =>
                  setFormData({ ...formData, prize: e.target.value })
                }
                placeholder="Mô tả giải thưởng..."
                rows={2}
                style={{
                  width: "100%",
                  padding: "12px",
                  border: "1px solid #d1d5db",
                  borderRadius: "8px",
                  fontSize: "14px",
                  resize: "vertical",
                  boxSizing: "border-box",
                }}
              />
            </div>

            {/* Hashtags */}
            <div>
              <label
                style={{
                  display: "block",
                  fontSize: "14px",
                  fontWeight: "500",
                  color: "#374151",
                  marginBottom: "6px",
                }}
              >
                Hashtags
              </label>
              <div style={{ marginBottom: "8px" }}>
                <div
                  style={{
                    display: "flex",
                    flexWrap: "wrap",
                    gap: "8px",
                    marginBottom: "8px",
                  }}
                >
                  {defaultHashtags.map((tag) => (
                    <button
                      key={tag}
                      type="button"
                      onClick={() => addHashtag(tag)}
                      style={{
                        padding: "6px 12px",
                        fontSize: "12px",
                        backgroundColor: "#f3f4f6",
                        border: "1px solid #d1d5db",
                        borderRadius: "20px",
                        cursor: "pointer",
                        transition: "all 0.2s",
                      }}
                      onMouseEnter={(e) => {
                        e.target.style.backgroundColor = "#e5e7eb";
                      }}
                      onMouseLeave={(e) => {
                        e.target.style.backgroundColor = "#f3f4f6";
                      }}
                    >
                      #{tag}
                    </button>
                  ))}
                </div>
              </div>
              <input
                type="text"
                value={formData.hashtag}
                onChange={(e) =>
                  setFormData({ ...formData, hashtag: e.target.value })
                }
                placeholder="Nhập hashtags (cách nhau bằng dấu phẩy)..."
                style={{
                  width: "100%",
                  padding: "12px",
                  border: "1px solid #d1d5db",
                  borderRadius: "8px",
                  fontSize: "14px",
                  boxSizing: "border-box",
                }}
              />
            </div>

            {/* Rules */}
            <div>
              <label
                style={{
                  display: "block",
                  fontSize: "14px",
                  fontWeight: "500",
                  color: "#374151",
                  marginBottom: "6px",
                }}
              >
                Luật chơi
              </label>
              <textarea
                value={formData.rules}
                onChange={(e) =>
                  setFormData({ ...formData, rules: e.target.value })
                }
                placeholder="Nhập các luật chơi (mỗi luật một dòng)..."
                rows={3}
                style={{
                  width: "100%",
                  padding: "12px",
                  border: "1px solid #d1d5db",
                  borderRadius: "8px",
                  fontSize: "14px",
                  resize: "vertical",
                  boxSizing: "border-box",
                }}
              />
            </div>

            {/* Requirements */}
            <div>
              <label
                style={{
                  display: "block",
                  fontSize: "14px",
                  fontWeight: "500",
                  color: "#374151",
                  marginBottom: "6px",
                }}
              >
                Yêu cầu
              </label>
              <textarea
                value={formData.requirements}
                onChange={(e) =>
                  setFormData({ ...formData, requirements: e.target.value })
                }
                placeholder="Nhập các yêu cầu (mỗi yêu cầu một dòng)..."
                rows={3}
                style={{
                  width: "100%",
                  padding: "12px",
                  border: "1px solid #d1d5db",
                  borderRadius: "8px",
                  fontSize: "14px",
                  resize: "vertical",
                  boxSizing: "border-box",
                }}
              />
            </div>
          </div>

          {/* Footer */}
          <div
            style={{
              display: "flex",
              justifyContent: "flex-end",
              gap: "12px",
              marginTop: "32px",
              paddingTop: "24px",
              borderTop: "1px solid #e5e7eb",
            }}
          >
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              style={{
                padding: "12px 24px",
                fontSize: "14px",
                fontWeight: "500",
                color: "#374151",
                backgroundColor: "white",
                border: "1px solid #d1d5db",
                borderRadius: "8px",
                cursor: loading ? "not-allowed" : "pointer",
                transition: "all 0.2s",
                opacity: loading ? 0.7 : 1,
              }}
              onMouseEnter={(e) =>
                !loading && (e.target.style.backgroundColor = "#f9fafb")
              }
              onMouseLeave={(e) =>
                !loading && (e.target.style.backgroundColor = "white")
              }
            >
              Hủy
            </button>
            <button
              type="submit"
              disabled={loading}
              style={{
                padding: "12px 24px",
                fontSize: "14px",
                fontWeight: "500",
                color: "white",
                backgroundColor: loading ? "#9ca3af" : "#dc2626",
                border: "none",
                borderRadius: "8px",
                cursor: loading ? "not-allowed" : "pointer",
                transition: "all 0.2s",
                display: "flex",
                alignItems: "center",
                gap: "8px",
              }}
              onMouseEnter={(e) =>
                !loading && (e.target.style.backgroundColor = "#b91c1c")
              }
              onMouseLeave={(e) =>
                !loading && (e.target.style.backgroundColor = "#dc2626")
              }
            >
              {loading && (
                <div
                  style={{
                    width: "16px",
                    height: "16px",
                    border: "2px solid transparent",
                    borderTop: "2px solid white",
                    borderRadius: "50%",
                    animation: "spin 1s linear infinite",
                  }}
                />
              )}
              {loading
                ? mode === "edit"
                  ? "Đang cập nhật..."
                  : "Đang tạo..."
                : mode === "edit"
                ? "Cập nhật thử thách"
                : "Tạo thử thách"}
            </button>
          </div>
        </form>

        <style jsx>{`
          @keyframes spin {
            0% {
              transform: rotate(0deg);
            }
            100% {
              transform: rotate(360deg);
            }
          }
        `}</style>
      </div>
    </div>
  );
}
