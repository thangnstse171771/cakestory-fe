"use client";

import { useState } from "react";
import axiosInstance from "../../api/axios";

// Fetch user profile by ID
const fetchUserProfile = async (userId) => {
  try {
    console.log("=== FETCHING USER PROFILE ===");
    console.log("User ID:", userId);

    const response = await axiosInstance.get(`/users/${userId}`);

    console.log("=== API RESPONSE ===");
    console.log("Full response:", response);
    console.log("Response data:", response.data);
    console.log("Response status:", response.status);

    return response.data;
  } catch (error) {
    console.error("=== ERROR FETCHING USER PROFILE ===");
    console.error("Error:", error);
    console.error("Error response:", error.response);
    console.error("Error message:", error.message);
    throw error;
  }
};

export default function MemberCard({
  user,
  participant,
  onRemove,
  isDeleting,
}) {
  const [showProfile, setShowProfile] = useState(false);
  const [profileData, setProfileData] = useState(null);
  const [isLoadingProfile, setIsLoadingProfile] = useState(false);

  // Debug logs
  console.log("=== MEMBER CARD DEBUG ===");
  console.log("User prop:", user);
  console.log("User ID:", user?.id || user?.user_id);
  console.log("Participant prop:", participant);

  const handleViewProfile = async () => {
    if (showProfile) {
      setShowProfile(false);
      return;
    }

    const userId = user?.id || user?.user_id;
    console.log("=== HANDLE VIEW PROFILE ===");
    console.log("Attempting to fetch profile for user ID:", userId);

    setIsLoadingProfile(true);
    try {
      const profile = await fetchUserProfile(userId);
      console.log("=== PROFILE FETCHED SUCCESSFULLY ===");
      console.log("Profile data:", profile);
      setProfileData(profile);
      setShowProfile(true);
    } catch (error) {
      console.error("=== FAILED TO FETCH PROFILE ===");
      console.error("Failed to fetch profile:", error);
      alert("Không thể tải thông tin profile");
    } finally {
      setIsLoadingProfile(false);
    }
  };
  return (
    <div
      style={{
        background: "white",
        border: "1px solid #e5e7eb",
        borderRadius: "8px",
        boxShadow: "0 1px 3px rgba(0, 0, 0, 0.1)",
        transition: "box-shadow 0.2s",
      }}
      onMouseEnter={(e) =>
        (e.currentTarget.style.boxShadow = "0 4px 6px rgba(0, 0, 0, 0.1)")
      }
      onMouseLeave={(e) =>
        (e.currentTarget.style.boxShadow = "0 1px 3px rgba(0, 0, 0, 0.1)")
      }
    >
      <div
        style={{
          padding: "20px",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          gap: "16px",
        }}
      >
        {/* Basic Info */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "16px",
            flex: "1",
          }}
        >
          <div
            style={{
              width: "48px",
              height: "48px",
              borderRadius: "50%",
              overflow: "hidden",
              flexShrink: "0",
              background: "#f3f4f6",
            }}
          >
            <img
              src={user?.avatar || "/placeholder.svg"}
              alt={user?.username || user?.name || "User"}
              style={{ width: "100%", height: "100%", objectFit: "cover" }}
            />
          </div>
          <div style={{ flex: "1", minWidth: "0" }}>
            <h3
              style={{
                fontSize: "1.125rem",
                fontWeight: "bold",
                color: "#374151",
                margin: "0 0 4px 0",
              }}
            >
              {user?.username || user?.name || "Không có tên"}
            </h3>
            <p
              style={{
                fontSize: "14px",
                color: "#6b7280",
                margin: "0",
              }}
            >
              ID: {user?.id || user?.user_id || "N/A"}
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div
          style={{
            display: "flex",
            gap: "8px",
            flexShrink: "0",
          }}
        >
          <button
            onClick={handleViewProfile}
            disabled={isLoadingProfile}
            style={{
              padding: "8px 16px",
              border: "1px solid #d1d5db",
              borderRadius: "6px",
              fontSize: "14px",
              cursor: isLoadingProfile ? "not-allowed" : "pointer",
              transition: "all 0.2s",
              background: "white",
              color: "#374151",
              whiteSpace: "nowrap",
            }}
            onMouseEnter={(e) => {
              if (!isLoadingProfile) {
                e.target.style.borderColor = "#3b82f6";
                e.target.style.color = "#3b82f6";
              }
            }}
            onMouseLeave={(e) => {
              if (!isLoadingProfile) {
                e.target.style.borderColor = "#d1d5db";
                e.target.style.color = "#374151";
              }
            }}
          >
            {isLoadingProfile
              ? "⏳ Đang tải..."
              : showProfile
              ? "▲ Ẩn profile"
              : "👁️ Xem profile"}
          </button>

          <button
            onClick={() => onRemove && onRemove(participant)}
            disabled={isDeleting}
            style={{
              padding: "8px 16px",
              background: isDeleting ? "#9ca3af" : "#dc2626",
              color: "white",
              border: `1px solid ${isDeleting ? "#9ca3af" : "#dc2626"}`,
              borderRadius: "6px",
              fontSize: "14px",
              cursor: isDeleting ? "not-allowed" : "pointer",
              transition: "all 0.2s",
              whiteSpace: "nowrap",
              opacity: isDeleting ? 0.7 : 1,
            }}
            onMouseEnter={(e) =>
              !isDeleting && (e.target.style.backgroundColor = "#b91c1c")
            }
            onMouseLeave={(e) =>
              !isDeleting && (e.target.style.backgroundColor = "#dc2626")
            }
          >
            {isDeleting ? "⏳ Đang xóa..." : "🗑️ Xóa"}
          </button>
        </div>
      </div>

      {/* Profile Details (Expandable) */}
      {showProfile && (
        <div
          style={{
            borderTop: "1px solid #e5e7eb",
            padding: "20px",
            background: "#f9fafb",
          }}
        >
          <h4
            style={{
              fontSize: "16px",
              fontWeight: "600",
              color: "#374151",
              margin: "0 0 16px 0",
            }}
          >
            Thông tin chi tiết
          </h4>

          {profileData ? (
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: "12px",
                fontSize: "14px",
              }}
            >
              <div style={{ display: "flex", flexWrap: "wrap", gap: "4px" }}>
                <strong style={{ color: "#374151", minWidth: "80px" }}>
                  Email:
                </strong>
                <span
                  style={{
                    color: "#6b7280",
                    wordBreak: "break-all",
                    flex: "1",
                  }}
                >
                  {profileData.user?.email || "Không có"}
                </span>
              </div>

              <div style={{ display: "flex", flexWrap: "wrap", gap: "4px" }}>
                <strong style={{ color: "#374151", minWidth: "80px" }}>
                  Số điện thoại:
                </strong>
                <span style={{ color: "#6b7280", flex: "1" }}>
                  {profileData.user?.phone_number || "Không có"}
                </span>
              </div>

              <div style={{ display: "flex", flexWrap: "wrap", gap: "4px" }}>
                <strong style={{ color: "#374151", minWidth: "80px" }}>
                  Họ tên:
                </strong>
                <span
                  style={{
                    color: "#6b7280",
                    wordBreak: "break-word",
                    flex: "1",
                  }}
                >
                  {profileData.user?.full_name || "Không có"}
                </span>
              </div>

              <div style={{ display: "flex", flexWrap: "wrap", gap: "4px" }}>
                <strong style={{ color: "#374151", minWidth: "80px" }}>
                  Địa chỉ:
                </strong>
                <span style={{ color: "#6b7280", flex: "1" }}>
                  {profileData.user?.address || "Không có"}
                </span>
              </div>

              <div
                style={{
                  display: "flex",
                  flexWrap: "wrap",
                  gap: "4px",
                  alignItems: "center",
                }}
              >
                <strong style={{ color: "#374151", minWidth: "80px" }}>
                  Role:
                </strong>
                <span
                  style={{
                    padding: "2px 8px",
                    borderRadius: "4px",
                    fontSize: "12px",
                    fontWeight: "500",
                    background:
                      profileData.user?.role === "admin"
                        ? "#ddd6fe"
                        : "#d1fae5",
                    color:
                      profileData.user?.role === "admin"
                        ? "#5b21b6"
                        : "#065f46",
                  }}
                >
                  {profileData.user?.role === "admin"
                    ? "Quản trị viên"
                    : profileData.user?.role === "user"
                    ? "Người dùng"
                    : profileData.user?.role || "Không có"}
                </span>
              </div>

              <div style={{ display: "flex", flexWrap: "wrap", gap: "4px" }}>
                <strong style={{ color: "#374151", minWidth: "80px" }}>
                  Username:
                </strong>
                <span
                  style={{
                    color: "#6b7280",
                    wordBreak: "break-all",
                    flex: "1",
                  }}
                >
                  {profileData.user?.username || "Không có"}
                </span>
              </div>
            </div>
          ) : (
            <div style={{ color: "#666", fontStyle: "italic" }}>
              Không có dữ liệu profile
            </div>
          )}
        </div>
      )}
    </div>
  );
}
