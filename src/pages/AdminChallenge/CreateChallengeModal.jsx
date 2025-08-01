"use client";

import { useState } from "react";
import { createChallenge } from "../../api/challenge";
import { toast } from "react-toastify";

export default function CreateChallengeModal({ isOpen, onClose, onSuccess }) {
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.title || !formData.description) {
      toast.error("Vui lòng điền đầy đủ thông tin bắt buộc!");
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

      const result = await createChallenge(challengeData);
      toast.success("Tạo thử thách mới thành công!");
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
      if (onSuccess) {
        onSuccess(result);
      }
      onClose();
    } catch (error) {
      console.error("Error creating challenge:", error);
      toast.error(
        error.response?.data?.message || "Có lỗi xảy ra khi tạo thử thách!"
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

  if (!isOpen) return null;

  return (
    <div
      style={{
        position: "fixed",
        top: "0",
        left: "0",
        right: "0",
        bottom: "0",
        background: "rgba(0, 0, 0, 0.5)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: "1000",
        padding: "16px",
      }}
      onClick={onClose}
    >
      <div
        style={{
          background: "white",
          borderRadius: "8px",
          maxWidth: "800px",
          width: "100%",
          maxHeight: "90vh",
          overflowY: "auto",
          boxShadow: "0 20px 25px rgba(0, 0, 0, 0.1)",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            padding: "20px 24px",
            borderBottom: "1px solid #e5e7eb",
          }}
        >
          <h2
            style={{
              fontSize: "1.5rem",
              fontWeight: "600",
              color: "#374151",
              margin: "0",
            }}
          >
            Tạo Challenge Mới
          </h2>
          <button
            style={{
              background: "none",
              border: "none",
              fontSize: "28px",
              cursor: "pointer",
              color: "#6b7280",
              padding: "0",
              width: "32px",
              height: "32px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              borderRadius: "4px",
              transition: "all 0.2s",
            }}
            onClick={onClose}
            onMouseEnter={(e) => {
              e.target.style.background = "#f3f4f6";
              e.target.style.color = "#374151";
            }}
            onMouseLeave={(e) => {
              e.target.style.background = "none";
              e.target.style.color = "#6b7280";
            }}
          >
            ×
          </button>
        </div>

        <div
          style={{
            padding: "24px",
            display: "flex",
            flexDirection: "column",
            gap: "24px",
          }}
        >
          {/* Basic Info */}
          <div
            style={{ display: "flex", flexDirection: "column", gap: "16px" }}
          >
            <h3
              style={{
                fontSize: "1.125rem",
                fontWeight: "600",
                color: "#374151",
                margin: "0",
              }}
            >
              Thông tin cơ bản
            </h3>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: "16px",
              }}
            >
              <div
                style={{ display: "flex", flexDirection: "column", gap: "4px" }}
              >
                <label
                  style={{
                    fontWeight: "500",
                    color: "#374151",
                    fontSize: "14px",
                  }}
                  htmlFor="title"
                >
                  Tên Challenge *
                </label>
                <input
                  id="title"
                  type="text"
                  value={formData.title}
                  onChange={(e) =>
                    setFormData({ ...formData, title: e.target.value })
                  }
                  placeholder="Nhập tên challenge"
                  style={{
                    padding: "10px 12px",
                    border: "1px solid #d1d5db",
                    borderRadius: "6px",
                    fontSize: "14px",
                    fontFamily: "inherit",
                    transition: "all 0.2s",
                  }}
                />
              </div>
            </div>

            <div
              style={{ display: "flex", flexDirection: "column", gap: "4px" }}
            >
              <label
                style={{
                  fontWeight: "500",
                  color: "#374151",
                  fontSize: "14px",
                }}
                htmlFor="description"
              >
                Mô tả *
              </label>
              <textarea
                id="description"
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                placeholder="Mô tả chi tiết về challenge"
                rows={3}
                style={{
                  padding: "10px 12px",
                  border: "1px solid #d1d5db",
                  borderRadius: "6px",
                  fontSize: "14px",
                  fontFamily: "inherit",
                  transition: "all 0.2s",
                  resize: "vertical",
                  minHeight: "80px",
                }}
              />
            </div>
          </div>

          {/* Prize and Dates */}
          <div
            style={{ display: "flex", flexDirection: "column", gap: "16px" }}
          >
            <h3
              style={{
                fontSize: "1.125rem",
                fontWeight: "600",
                color: "#374151",
                margin: "0",
              }}
            >
              Giải thưởng & Thời gian
            </h3>
            <div
              style={{ display: "flex", flexDirection: "column", gap: "4px" }}
            >
              <label
                style={{
                  fontWeight: "500",
                  color: "#374151",
                  fontSize: "14px",
                }}
                htmlFor="prize"
              >
                Giải thưởng *
              </label>
              <select
                onChange={(e) =>
                  setFormData({ ...formData, prize: e.target.value })
                }
                style={{
                  padding: "10px 12px",
                  border: "1px solid #d1d5db",
                  borderRadius: "6px",
                  fontSize: "14px",
                  fontFamily: "inherit",
                  transition: "all 0.2s",
                }}
              >
                <option value="">Chọn giải thưởng có sẵn</option>
                {defaultPrizes.map((prize) => (
                  <option key={prize} value={prize}>
                    {prize}
                  </option>
                ))}
              </select>
              <input
                type="text"
                value={formData.prize}
                onChange={(e) =>
                  setFormData({ ...formData, prize: e.target.value })
                }
                placeholder="Hoặc nhập giải thưởng tùy chỉnh"
                style={{
                  padding: "10px 12px",
                  border: "1px solid #d1d5db",
                  borderRadius: "6px",
                  fontSize: "14px",
                  fontFamily: "inherit",
                  transition: "all 0.2s",
                  marginTop: "8px",
                }}
              />
            </div>

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: "16px",
              }}
            >
              <div
                style={{ display: "flex", flexDirection: "column", gap: "4px" }}
              >
                <label
                  style={{
                    fontWeight: "500",
                    color: "#374151",
                    fontSize: "14px",
                  }}
                  htmlFor="startDate"
                >
                  Ngày bắt đầu *
                </label>
                <input
                  id="startDate"
                  type="date"
                  value={formData.startDate}
                  onChange={(e) =>
                    setFormData({ ...formData, startDate: e.target.value })
                  }
                  style={{
                    padding: "10px 12px",
                    border: "1px solid #d1d5db",
                    borderRadius: "6px",
                    fontSize: "14px",
                    fontFamily: "inherit",
                    transition: "all 0.2s",
                  }}
                />
              </div>
              <div
                style={{ display: "flex", flexDirection: "column", gap: "4px" }}
              >
                <label
                  style={{
                    fontWeight: "500",
                    color: "#374151",
                    fontSize: "14px",
                  }}
                  htmlFor="endDate"
                >
                  Ngày kết thúc *
                </label>
                <input
                  id="endDate"
                  type="date"
                  value={formData.endDate}
                  onChange={(e) =>
                    setFormData({ ...formData, endDate: e.target.value })
                  }
                  style={{
                    padding: "10px 12px",
                    border: "1px solid #d1d5db",
                    borderRadius: "6px",
                    fontSize: "14px",
                    fontFamily: "inherit",
                    transition: "all 0.2s",
                  }}
                />
              </div>
            </div>
          </div>

          {/* Participants */}
          <div
            style={{ display: "flex", flexDirection: "column", gap: "16px" }}
          >
            <h3
              style={{
                fontSize: "1.125rem",
                fontWeight: "600",
                color: "#374151",
                margin: "0",
              }}
            >
              Số lượng người tham gia
            </h3>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr 1fr",
                gap: "16px",
              }}
            >
              <div
                style={{ display: "flex", flexDirection: "column", gap: "4px" }}
              >
                <label
                  style={{
                    fontWeight: "500",
                    color: "#374151",
                    fontSize: "14px",
                  }}
                  htmlFor="minParticipants"
                >
                  Số người tối thiểu *
                </label>
                <input
                  id="minParticipants"
                  type="number"
                  value={formData.minParticipants}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      minParticipants: Number.parseInt(e.target.value),
                    })
                  }
                  min="1"
                  style={{
                    padding: "10px 12px",
                    border: "1px solid #d1d5db",
                    borderRadius: "6px",
                    fontSize: "14px",
                    fontFamily: "inherit",
                    transition: "all 0.2s",
                  }}
                />
              </div>
              <div
                style={{ display: "flex", flexDirection: "column", gap: "4px" }}
              >
                <label
                  style={{
                    fontWeight: "500",
                    color: "#374151",
                    fontSize: "14px",
                  }}
                  htmlFor="maxParticipants"
                >
                  Số người tối đa *
                </label>
                <input
                  id="maxParticipants"
                  type="number"
                  value={formData.maxParticipants}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      maxParticipants: Number.parseInt(e.target.value),
                    })
                  }
                  min="1"
                  style={{
                    padding: "10px 12px",
                    border: "1px solid #d1d5db",
                    borderRadius: "6px",
                    fontSize: "14px",
                    fontFamily: "inherit",
                    transition: "all 0.2s",
                  }}
                />
              </div>
            </div>
          </div>

          {/* Hashtags */}
          <div
            style={{ display: "flex", flexDirection: "column", gap: "16px" }}
          >
            <h3
              style={{
                fontSize: "1.125rem",
                fontWeight: "600",
                color: "#374151",
                margin: "0",
              }}
            >
              Hashtags
            </h3>
            <div
              style={{ display: "flex", flexDirection: "column", gap: "4px" }}
            >
              <label
                style={{
                  fontWeight: "500",
                  color: "#374151",
                  fontSize: "14px",
                }}
                htmlFor="hashtag"
              >
                Hashtags (phân cách bằng dấu phẩy)
              </label>
              <input
                id="hashtag"
                type="text"
                value={formData.hashtag}
                onChange={(e) =>
                  setFormData({ ...formData, hashtag: e.target.value })
                }
                placeholder="VD: bánh-kem, hoa-hồng, trang-trí"
                style={{
                  padding: "10px 12px",
                  border: "1px solid #d1d5db",
                  borderRadius: "6px",
                  fontSize: "14px",
                  fontFamily: "inherit",
                  transition: "all 0.2s",
                }}
              />
              <div style={{ marginTop: "8px" }}>
                <p
                  style={{
                    fontSize: "14px",
                    color: "#6b7280",
                    margin: "0 0 8px 0",
                  }}
                >
                  Hashtags gợi ý:
                </p>
                <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
                  {defaultHashtags.map((tag) => (
                    <span
                      key={tag}
                      style={{
                        padding: "4px 8px",
                        border: "1px solid #fce7f3",
                        color: "#be185d",
                        background: "#fdf2f8",
                        borderRadius: "4px",
                        fontSize: "12px",
                        cursor: "pointer",
                        transition: "all 0.2s",
                      }}
                      onClick={() => addHashtag(tag)}
                      onMouseEnter={(e) => {
                        e.target.style.background = "#fce7f3";
                        e.target.style.borderColor = "#f9a8d4";
                      }}
                      onMouseLeave={(e) => {
                        e.target.style.background = "#fdf2f8";
                        e.target.style.borderColor = "#fce7f3";
                      }}
                    >
                      #{tag}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Rules and Requirements */}
          <div
            style={{ display: "flex", flexDirection: "column", gap: "16px" }}
          >
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: "16px",
              }}
            >
              <div
                style={{ display: "flex", flexDirection: "column", gap: "4px" }}
              >
                <label
                  style={{
                    fontWeight: "500",
                    color: "#374151",
                    fontSize: "14px",
                  }}
                  htmlFor="rules"
                >
                  Quy tắc (mỗi dòng một quy tắc)
                </label>
                <textarea
                  id="rules"
                  value={formData.rules}
                  onChange={(e) =>
                    setFormData({ ...formData, rules: e.target.value })
                  }
                  placeholder="Nhập các quy tắc, mỗi dòng một quy tắc"
                  rows={4}
                  style={{
                    padding: "10px 12px",
                    border: "1px solid #d1d5db",
                    borderRadius: "6px",
                    fontSize: "14px",
                    fontFamily: "inherit",
                    transition: "all 0.2s",
                    resize: "vertical",
                    minHeight: "80px",
                  }}
                />
              </div>
              <div
                style={{ display: "flex", flexDirection: "column", gap: "4px" }}
              >
                <label
                  style={{
                    fontWeight: "500",
                    color: "#374151",
                    fontSize: "14px",
                  }}
                  htmlFor="requirements"
                >
                  Yêu cầu (mỗi dòng một yêu cầu)
                </label>
                <textarea
                  id="requirements"
                  value={formData.requirements}
                  onChange={(e) =>
                    setFormData({ ...formData, requirements: e.target.value })
                  }
                  placeholder="Nhập các yêu cầu, mỗi dòng một yêu cầu"
                  rows={4}
                  style={{
                    padding: "10px 12px",
                    border: "1px solid #d1d5db",
                    borderRadius: "6px",
                    fontSize: "14px",
                    fontFamily: "inherit",
                    transition: "all 0.2s",
                    resize: "vertical",
                    minHeight: "80px",
                  }}
                />
              </div>
            </div>
          </div>
        </div>

        <div
          style={{
            display: "flex",
            justifyContent: "flex-end",
            gap: "12px",
            padding: "20px 24px",
            borderTop: "1px solid #e5e7eb",
          }}
        >
          <button
            style={{
              padding: "10px 20px",
              background: "white",
              border: "1px solid #d1d5db",
              borderRadius: "6px",
              color: "#374151",
              cursor: "pointer",
              fontWeight: "500",
              transition: "all 0.2s",
            }}
            onClick={onClose}
            onMouseEnter={(e) => {
              e.target.style.backgroundColor = "#f9fafb";
              e.target.style.borderColor = "#9ca3af";
            }}
            onMouseLeave={(e) => {
              e.target.style.backgroundColor = "white";
              e.target.style.borderColor = "#d1d5db";
            }}
          >
            Hủy
          </button>
          <button
            style={{
              padding: "10px 20px",
              background: "#f472b6",
              border: "1px solid #f472b6",
              borderRadius: "6px",
              color: "white",
              cursor: "pointer",
              fontWeight: "500",
              transition: "all 0.2s",
            }}
            onClick={handleSubmit}
            onMouseEnter={(e) => {
              e.target.style.backgroundColor = "#ec4899";
              e.target.style.borderColor = "#ec4899";
            }}
            onMouseLeave={(e) => {
              e.target.style.backgroundColor = "#f472b6";
              e.target.style.borderColor = "#f472b6";
            }}
          >
            Tạo Challenge
          </button>
        </div>
      </div>
    </div>
  );
}
