"use client";

import { useState, useEffect } from "react";
import { getChallengeParticipantCount } from "../../api/challenge";

export default function ChallengeDetail({ challenge, onBack, onViewMembers }) {
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [cancelReason, setCancelReason] = useState("");
  const [participantCount, setParticipantCount] = useState(0);
  const [loadingCount, setLoadingCount] = useState(false);

  // Fetch participant count when component mounts
  useEffect(() => {
    const fetchParticipantCount = async () => {
      if (challenge?.id) {
        setLoadingCount(true);
        try {
          const count = await getChallengeParticipantCount(challenge.id);
          setParticipantCount(count);
        } catch (error) {
          console.error("Error fetching participant count:", error);
          setParticipantCount(0);
        } finally {
          setLoadingCount(false);
        }
      }
    };

    fetchParticipantCount();
  }, [challenge?.id]);

  const getStatusStyle = (status) => {
    switch (status) {
      case "Chờ duyệt":
        return { background: "#fef3c7", color: "#92400e" };
      case "Đã duyệt":
        return { background: "#dbeafe", color: "#1e40af" };
      case "Đang diễn ra":
        return { background: "#d1fae5", color: "#065f46" };
      case "Bị hủy":
        return { background: "#fee2e2", color: "#991b1b" };
      default:
        return { background: "#f3f4f6", color: "#374151" };
    }
  };

  const getDifficultyStyle = (difficulty) => {
    switch (difficulty) {
      case "Dễ":
        return { background: "#d1fae5", color: "#065f46" };
      case "Trung bình":
        return { background: "#fef3c7", color: "#92400e" };
      case "Khó":
        return { background: "#fee2e2", color: "#991b1b" };
      default:
        return { background: "#f3f4f6", color: "#374151" };
    }
  };

  return (
    <div style={{ minHeight: "100vh", backgroundColor: "#fff5f7" }}>
      <div
        style={{ maxWidth: "1200px", margin: "0 auto", padding: "24px 16px" }}
      >
        {/* Back Button */}
        <button
          style={{
            background: "none",
            border: "none",
            color: "#374151",
            fontSize: "16px",
            cursor: "pointer",
            padding: "8px 0",
            marginBottom: "24px",
            transition: "all 0.2s",
          }}
          onClick={onBack}
          onMouseEnter={(e) => {
            e.target.style.color = "#111827";
            e.target.style.backgroundColor = "#fce7f3";
            e.target.style.padding = "8px 12px";
            e.target.style.borderRadius = "6px";
          }}
          onMouseLeave={(e) => {
            e.target.style.color = "#374151";
            e.target.style.backgroundColor = "transparent";
            e.target.style.padding = "8px 0";
            e.target.style.borderRadius = "0";
          }}
        >
          ← Quay lại Dashboard
        </button>

        {/* Hero Section */}
        <div style={{ marginBottom: "24px" }}>
          <div
            style={{
              position: "relative",
              borderRadius: "8px",
              overflow: "hidden",
              boxShadow: "0 10px 25px rgba(0, 0, 0, 0.1)",
            }}
          >
            <img
              src={challenge.image || "/placeholder.svg"}
              alt={challenge.title}
              style={{ width: "100%", height: "320px", objectFit: "cover" }}
            />
            <div
              style={{
                position: "absolute",
                inset: "0",
                background:
                  "linear-gradient(to top, rgba(0, 0, 0, 0.6), transparent)",
              }}
            ></div>
            <div
              style={{
                position: "absolute",
                bottom: "0",
                left: "0",
                right: "0",
                padding: "32px",
                color: "white",
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "12px",
                  marginBottom: "16px",
                }}
              >
                <span
                  style={{
                    padding: "6px 12px",
                    borderRadius: "6px",
                    fontSize: "14px",
                    fontWeight: "500",
                    ...getStatusStyle(challenge.adminStatus),
                  }}
                >
                  {challenge.adminStatus}
                </span>
                <span
                  style={{
                    padding: "6px 12px",
                    borderRadius: "6px",
                    fontSize: "14px",
                    fontWeight: "500",
                    ...getDifficultyStyle(challenge.difficulty),
                  }}
                >
                  {challenge.difficulty}
                </span>
              </div>
              <h1
                style={{
                  fontSize: "2.5rem",
                  fontWeight: "bold",
                  margin: "0 0 8px 0",
                  lineHeight: "1.2",
                }}
              >
                {challenge.title}
              </h1>
              <p
                style={{
                  fontSize: "1.25rem",
                  opacity: "0.9",
                  maxWidth: "768px",
                  margin: "0",
                  lineHeight: "1.4",
                }}
              >
                {challenge.description}
              </p>
            </div>
          </div>
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "2fr 1fr",
            gap: "24px",
          }}
        >
          {/* Main Content */}
          <div
            style={{ display: "flex", flexDirection: "column", gap: "24px" }}
          >
            {/* Challenge Info */}
            <div
              style={{
                background: "white",
                border: "1px solid #e5e7eb",
                borderRadius: "8px",
                boxShadow: "0 1px 3px rgba(0, 0, 0, 0.1)",
                overflow: "hidden",
              }}
            >
              <div
                style={{
                  background: "linear-gradient(to right, #fce7f3, #f3e8ff)",
                  padding: "16px",
                }}
              >
                <h2
                  style={{
                    fontSize: "1.25rem",
                    color: "#374151",
                    margin: "0",
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                  }}
                >
                  🏆 Thông tin Challenge
                </h2>
              </div>
              <div style={{ padding: "24px" }}>
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(4, 1fr)",
                    gap: "24px",
                    marginBottom: "24px",
                  }}
                >
                  <div
                    style={{
                      textAlign: "center",
                      padding: "16px",
                      borderRadius: "8px",
                      background: "#eff6ff",
                    }}
                  >
                    <div style={{ fontSize: "2rem", marginBottom: "8px" }}>
                      📅
                    </div>
                    <p
                      style={{
                        fontSize: "14px",
                        color: "#6b7280",
                        margin: "0 0 4px 0",
                      }}
                    >
                      Thời gian
                    </p>
                    <p
                      style={{
                        fontWeight: "bold",
                        color: "#374151",
                        margin: "0",
                      }}
                    >
                      {challenge.duration}
                    </p>
                  </div>
                  <div
                    style={{
                      textAlign: "center",
                      padding: "16px",
                      borderRadius: "8px",
                      background: "#ecfdf5",
                    }}
                  >
                    <div style={{ fontSize: "2rem", marginBottom: "8px" }}>
                      👥
                    </div>
                    <p
                      style={{
                        fontSize: "14px",
                        color: "#6b7280",
                        margin: "0 0 4px 0",
                      }}
                    >
                      Thành viên
                    </p>
                    <p
                      style={{
                        fontWeight: "bold",
                        color: "#374151",
                        margin: "0",
                      }}
                    >
                      {participantCount}/{challenge.maxParticipants}
                    </p>
                  </div>
                  <div
                    style={{
                      textAlign: "center",
                      padding: "16px",
                      borderRadius: "8px",
                      background: "#f5f3ff",
                    }}
                  >
                    <div style={{ fontSize: "2rem", marginBottom: "8px" }}>
                      ⏰
                    </div>
                    <p
                      style={{
                        fontSize: "14px",
                        color: "#6b7280",
                        margin: "0 0 4px 0",
                      }}
                    >
                      Bắt đầu
                    </p>
                    <p
                      style={{
                        fontWeight: "bold",
                        color: "#374151",
                        margin: "0",
                      }}
                    >
                      {challenge.startDate}
                    </p>
                  </div>
                  <div
                    style={{
                      textAlign: "center",
                      padding: "16px",
                      borderRadius: "8px",
                      background: "#fff7ed",
                    }}
                  >
                    <div style={{ fontSize: "2rem", marginBottom: "8px" }}>
                      🎁
                    </div>
                    <p
                      style={{
                        fontSize: "14px",
                        color: "#6b7280",
                        margin: "0 0 4px 0",
                      }}
                    >
                      Kết thúc
                    </p>
                    <p
                      style={{
                        fontWeight: "bold",
                        color: "#374151",
                        margin: "0",
                      }}
                    >
                      {challenge.endDate}
                    </p>
                  </div>
                </div>

                {/* Host Info */}
                <div
                  style={{ borderTop: "1px solid #e5e7eb", paddingTop: "24px" }}
                >
                  <h3
                    style={{
                      fontSize: "1.125rem",
                      fontWeight: "600",
                      color: "#374151",
                      margin: "0 0 16px 0",
                    }}
                  >
                    Được tổ chức bởi
                  </h3>
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "16px",
                      padding: "16px",
                      background: "#f9fafb",
                      borderRadius: "8px",
                    }}
                  >
                    <div
                      style={{
                        width: "64px",
                        height: "64px",
                        borderRadius: "50%",
                        overflow: "hidden",
                        flexShrink: "0",
                      }}
                    >
                      <img
                        src={challenge.host.avatar || "/placeholder.svg"}
                        alt={challenge.host.name}
                        style={{
                          width: "100%",
                          height: "100%",
                          objectFit: "cover",
                        }}
                      />
                    </div>
                    <div>
                      <p
                        style={{
                          fontSize: "1.25rem",
                          fontWeight: "bold",
                          color: "#374151",
                          margin: "0 0 4px 0",
                        }}
                      >
                        {challenge.host.name}
                      </p>
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "8px",
                        }}
                      >
                        <span style={{ color: "#fbbf24" }}>⭐⭐⭐⭐⭐</span>
                        <span style={{ fontSize: "14px", color: "#6b7280" }}>
                          Master Chef
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Prize */}
            <div
              style={{
                background: "white",
                border: "1px solid #e5e7eb",
                borderRadius: "8px",
                boxShadow: "0 1px 3px rgba(0, 0, 0, 0.1)",
                overflow: "hidden",
              }}
            >
              <div
                style={{
                  background: "linear-gradient(to right, #fffbeb, #fef3c7)",
                  padding: "16px",
                }}
              >
                <h2
                  style={{
                    fontSize: "1.25rem",
                    color: "#374151",
                    margin: "0",
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                  }}
                >
                  🎁 Giải thưởng
                </h2>
              </div>
              <div style={{ padding: "24px" }}>
                <div
                  style={{
                    background: "linear-gradient(to right, #fef3c7, #fed7aa)",
                    padding: "24px",
                    borderRadius: "8px",
                  }}
                >
                  <p
                    style={{
                      fontSize: "1.125rem",
                      fontWeight: "bold",
                      color: "#374151",
                      margin: "0",
                    }}
                  >
                    {challenge.prize}
                  </p>
                </div>
              </div>
            </div>

            {/* Rules */}
            <div
              style={{
                background: "white",
                border: "1px solid #e5e7eb",
                borderRadius: "8px",
                boxShadow: "0 1px 3px rgba(0, 0, 0, 0.1)",
                overflow: "hidden",
              }}
            >
              <div
                style={{
                  background: "linear-gradient(to right, #ecfdf5, #d1fae5)",
                  padding: "16px",
                }}
              >
                <h2
                  style={{
                    fontSize: "1.25rem",
                    color: "#374151",
                    margin: "0",
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                  }}
                >
                  ✅ Quy tắc tham gia
                </h2>
              </div>
              <div style={{ padding: "24px" }}>
                <ul
                  style={{
                    listStyle: "none",
                    padding: "0",
                    margin: "0",
                    display: "flex",
                    flexDirection: "column",
                    gap: "12px",
                  }}
                >
                  {(Array.isArray(challenge.rules) ? challenge.rules : []).map(
                    (rule, index) => (
                      <li
                        key={index}
                        style={{
                          display: "flex",
                          alignItems: "flex-start",
                          gap: "12px",
                        }}
                      >
                        <div
                          style={{
                            width: "24px",
                            height: "24px",
                            background: "#d1fae5",
                            borderRadius: "50%",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            color: "#065f46",
                            fontWeight: "bold",
                            fontSize: "14px",
                            flexShrink: "0",
                            marginTop: "2px",
                          }}
                        >
                          {index + 1}
                        </div>
                        <span style={{ color: "#374151", lineHeight: "1.5" }}>
                          {rule}
                        </span>
                      </li>
                    )
                  )}
                </ul>
              </div>
            </div>

            {/* Requirements */}
            <div
              style={{
                background: "white",
                border: "1px solid #e5e7eb",
                borderRadius: "8px",
                boxShadow: "0 1px 3px rgba(0, 0, 0, 0.1)",
                overflow: "hidden",
              }}
            >
              <div
                style={{
                  background: "linear-gradient(to right, #eff6ff, #dbeafe)",
                  padding: "16px",
                }}
              >
                <h2
                  style={{
                    fontSize: "1.25rem",
                    color: "#374151",
                    margin: "0",
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                  }}
                >
                  ⚠️ Yêu cầu tham gia
                </h2>
              </div>
              <div style={{ padding: "24px" }}>
                <ul
                  style={{
                    listStyle: "none",
                    padding: "0",
                    margin: "0",
                    display: "flex",
                    flexDirection: "column",
                    gap: "12px",
                  }}
                >
                  {(Array.isArray(challenge.requirements)
                    ? challenge.requirements
                    : []
                  ).map((req, index) => (
                    <li
                      key={index}
                      style={{
                        display: "flex",
                        alignItems: "flex-start",
                        gap: "12px",
                      }}
                    >
                      <span
                        style={{
                          color: "#3b82f6",
                          flexShrink: "0",
                          marginTop: "2px",
                        }}
                      >
                        ✓
                      </span>
                      <span style={{ color: "#374151", lineHeight: "1.5" }}>
                        {req}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div
            style={{ display: "flex", flexDirection: "column", gap: "24px" }}
          >
            {/* Quick Actions */}
            <div
              style={{
                background: "white",
                border: "1px solid #e5e7eb",
                borderRadius: "8px",
                boxShadow: "0 1px 3px rgba(0, 0, 0, 0.1)",
                padding: "16px",
                position: "sticky",
                top: "24px",
              }}
            >
              <h3
                style={{
                  fontSize: "1.125rem",
                  color: "#374151",
                  margin: "0 0 12px 0",
                }}
              >
                Hành động nhanh
              </h3>
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "12px",
                }}
              >
                <button
                  style={{
                    width: "100%",
                    padding: "10px 16px",
                    border: "none",
                    borderRadius: "6px",
                    fontWeight: "500",
                    cursor: "pointer",
                    transition: "all 0.2s",
                    background: "#3b82f6",
                    color: "white",
                  }}
                  onClick={() => {
                    console.log(
                      "View Members clicked with challenge:",
                      challenge
                    );
                    console.log("onViewMembers function:", onViewMembers);
                    if (typeof onViewMembers === "function") {
                      onViewMembers(challenge);
                    } else {
                      console.error(
                        "onViewMembers is not a function, navigating manually"
                      );
                      // Fallback: có thể navigate manually hoặc show message
                      alert(
                        "Chức năng xem thành viên chưa được kích hoạt từ component cha"
                      );
                    }
                  }}
                  onMouseEnter={(e) =>
                    (e.target.style.backgroundColor = "#2563eb")
                  }
                  onMouseLeave={(e) =>
                    (e.target.style.backgroundColor = "#3b82f6")
                  }
                >
                  👥 Xem thành viên ({loadingCount ? "..." : participantCount})
                </button>
                <button
                  style={{
                    width: "100%",
                    padding: "10px 16px",
                    border: "1px solid #d1d5db",
                    borderRadius: "6px",
                    fontWeight: "500",
                    cursor: "pointer",
                    transition: "all 0.2s",
                    background: "white",
                    color: "#374151",
                  }}
                  onMouseEnter={(e) =>
                    (e.target.style.backgroundColor = "#f9fafb")
                  }
                  onMouseLeave={(e) =>
                    (e.target.style.backgroundColor = "white")
                  }
                >
                  ✏️ Chỉnh sửa
                </button>
                {challenge.adminStatus === "Chờ duyệt" && (
                  <>
                    <button
                      style={{
                        width: "100%",
                        padding: "10px 16px",
                        border: "none",
                        borderRadius: "6px",
                        fontWeight: "500",
                        cursor: "pointer",
                        transition: "all 0.2s",
                        background: "#10b981",
                        color: "white",
                      }}
                      onMouseEnter={(e) =>
                        (e.target.style.backgroundColor = "#059669")
                      }
                      onMouseLeave={(e) =>
                        (e.target.style.backgroundColor = "#10b981")
                      }
                    >
                      ✅ Duyệt Challenge
                    </button>
                    <button
                      style={{
                        width: "100%",
                        padding: "10px 16px",
                        border: "none",
                        borderRadius: "6px",
                        fontWeight: "500",
                        cursor: "pointer",
                        transition: "all 0.2s",
                        background: "#ef4444",
                        color: "white",
                      }}
                      onClick={() => setShowStatusModal(true)}
                      onMouseEnter={(e) =>
                        (e.target.style.backgroundColor = "#dc2626")
                      }
                      onMouseLeave={(e) =>
                        (e.target.style.backgroundColor = "#ef4444")
                      }
                    >
                      ❌ Hủy Challenge
                    </button>
                  </>
                )}
              </div>
            </div>

            {/* Participants Info */}
            <div
              style={{
                background: "white",
                border: "1px solid #e5e7eb",
                borderRadius: "8px",
                boxShadow: "0 1px 3px rgba(0, 0, 0, 0.1)",
                padding: "16px",
              }}
            >
              <h3
                style={{
                  fontSize: "1.125rem",
                  color: "#374151",
                  margin: "0 0 12px 0",
                }}
              >
                Thông tin tham gia
              </h3>
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "16px",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: "8px",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      fontSize: "14px",
                    }}
                  >
                    <span style={{ color: "#6b7280" }}>Tiến độ đăng ký</span>
                    <span style={{ fontWeight: "500" }}>
                      {participantCount}/{challenge.maxParticipants}
                    </span>
                  </div>
                  <div
                    style={{
                      width: "100%",
                      height: "8px",
                      background: "#e5e7eb",
                      borderRadius: "4px",
                      overflow: "hidden",
                    }}
                  >
                    <div
                      style={{
                        height: "100%",
                        background: "#f472b6",
                        transition: "width 0.3s",
                        width: `${
                          challenge.maxParticipants > 0
                            ? (participantCount / challenge.maxParticipants) *
                              100
                            : 0
                        }%`,
                      }}
                    ></div>
                  </div>
                </div>

                {challenge.participants < challenge.minParticipants && (
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "8px",
                      padding: "12px",
                      background: "#fffbeb",
                      border: "1px solid #fed7aa",
                      borderRadius: "6px",
                    }}
                  >
                    <span style={{ color: "#d97706" }}>⚠️</span>
                    <span
                      style={{
                        fontSize: "14px",
                        color: "#92400e",
                        fontWeight: "500",
                      }}
                    >
                      Cần thêm{" "}
                      {challenge.minParticipants - challenge.participants} người
                      để bắt đầu
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Hashtags */}
            <div
              style={{
                background: "white",
                border: "1px solid #e5e7eb",
                borderRadius: "8px",
                boxShadow: "0 1px 3px rgba(0, 0, 0, 0.1)",
                padding: "16px",
              }}
            >
              <h3
                style={{
                  fontSize: "1.125rem",
                  color: "#374151",
                  margin: "0 0 12px 0",
                }}
              >
                # Hashtags
              </h3>
              <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
                {(Array.isArray(challenge.hashtags)
                  ? challenge.hashtags
                  : []
                ).map((tag, index) => (
                  <span
                    key={index}
                    style={{
                      padding: "4px 8px",
                      border: "1px solid #fce7f3",
                      color: "#be185d",
                      background: "#fdf2f8",
                      borderRadius: "4px",
                      fontSize: "14px",
                    }}
                  >
                    #{tag}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Cancel Modal */}
      {showStatusModal && (
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
          }}
          onClick={() => setShowStatusModal(false)}
        >
          <div
            style={{
              background: "white",
              borderRadius: "8px",
              maxWidth: "500px",
              width: "90%",
              maxHeight: "90vh",
              overflowY: "auto",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                padding: "16px",
                borderBottom: "1px solid #e5e7eb",
              }}
            >
              <h3
                style={{
                  margin: "0",
                  fontSize: "1.125rem",
                  fontWeight: "600",
                  color: "#374151",
                }}
              >
                Hủy Challenge
              </h3>
              <button
                style={{
                  background: "none",
                  border: "none",
                  fontSize: "24px",
                  cursor: "pointer",
                  color: "#6b7280",
                  padding: "0",
                  width: "24px",
                  height: "24px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
                onClick={() => setShowStatusModal(false)}
              >
                ×
              </button>
            </div>
            <div style={{ padding: "16px" }}>
              <p style={{ margin: "0 0 16px 0", color: "#374151" }}>
                Bạn có chắc chắn muốn hủy challenge này?
              </p>
              <div style={{ marginBottom: "16px" }}>
                <label
                  style={{
                    display: "block",
                    marginBottom: "4px",
                    fontWeight: "500",
                    color: "#374151",
                  }}
                  htmlFor="cancelReason"
                >
                  Lý do hủy
                </label>
                <textarea
                  id="cancelReason"
                  value={cancelReason}
                  onChange={(e) => setCancelReason(e.target.value)}
                  placeholder="Nhập lý do hủy challenge"
                  rows={3}
                  style={{
                    width: "100%",
                    padding: "8px 12px",
                    border: "1px solid #d1d5db",
                    borderRadius: "6px",
                    fontFamily: "inherit",
                    resize: "vertical",
                    boxSizing: "border-box",
                  }}
                />
              </div>
              <div
                style={{
                  display: "flex",
                  justifyContent: "flex-end",
                  gap: "8px",
                  paddingTop: "16px",
                  borderTop: "1px solid #e5e7eb",
                }}
              >
                <button
                  style={{
                    padding: "8px 16px",
                    background: "white",
                    border: "1px solid #d1d5db",
                    borderRadius: "6px",
                    color: "#374151",
                    cursor: "pointer",
                    transition: "all 0.2s",
                  }}
                  onClick={() => setShowStatusModal(false)}
                  onMouseEnter={(e) =>
                    (e.target.style.backgroundColor = "#f9fafb")
                  }
                  onMouseLeave={(e) =>
                    (e.target.style.backgroundColor = "white")
                  }
                >
                  Hủy bỏ
                </button>
                <button
                  style={{
                    padding: "8px 16px",
                    background: "#ef4444",
                    border: "1px solid #ef4444",
                    borderRadius: "6px",
                    color: "white",
                    cursor: "pointer",
                    transition: "all 0.2s",
                  }}
                  onMouseEnter={(e) =>
                    (e.target.style.backgroundColor = "#dc2626")
                  }
                  onMouseLeave={(e) =>
                    (e.target.style.backgroundColor = "#ef4444")
                  }
                >
                  Xác nhận hủy
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
