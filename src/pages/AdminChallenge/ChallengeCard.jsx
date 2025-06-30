"use client"

import { useState } from "react"

export default function ChallengeCard({ challenge, onViewDetail, onViewMembers }) {
  const [showStatusModal, setShowStatusModal] = useState(false)
  const [cancelReason, setCancelReason] = useState("")

  const getStatusStyle = (status) => {
    switch (status) {
      case "Chờ duyệt":
        return { background: "#fef3c7", color: "#92400e", border: "1px solid #fde68a" }
      case "Đã duyệt":
        return { background: "#dbeafe", color: "#1e40af", border: "1px solid #93c5fd" }
      case "Đang diễn ra":
        return { background: "#d1fae5", color: "#065f46", border: "1px solid #86efac" }
      case "Bị hủy":
        return { background: "#fee2e2", color: "#991b1b", border: "1px solid #fca5a5" }
      default:
        return { background: "#f3f4f6", color: "#374151", border: "1px solid #d1d5db" }
    }
  }

  return (
    <div
      style={{
        background: "white",
        border: "1px solid #e5e7eb",
        borderRadius: "8px",
        boxShadow: "0 1px 3px rgba(0, 0, 0, 0.1)",
        overflow: "hidden",
        transition: "box-shadow 0.2s",
      }}
      onMouseEnter={(e) => (e.currentTarget.style.boxShadow = "0 4px 6px rgba(0, 0, 0, 0.1)")}
      onMouseLeave={(e) => (e.currentTarget.style.boxShadow = "0 1px 3px rgba(0, 0, 0, 0.1)")}
    >
      <div style={{ padding: "16px 16px 12px 16px" }}>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-start",
            marginBottom: "8px",
            gap: "12px",
          }}
        >
          <h3
            style={{
              fontSize: "1.125rem",
              fontWeight: "600",
              color: "#374151",
              margin: "0",
              lineHeight: "1.4",
            }}
          >
            {challenge.title}
          </h3>
          <span
            style={{
              padding: "4px 8px",
              borderRadius: "4px",
              fontSize: "12px",
              fontWeight: "500",
              whiteSpace: "nowrap",
              flexShrink: "0",
              ...getStatusStyle(challenge.adminStatus),
            }}
          >
            {challenge.adminStatus}
          </span>
        </div>
        <p
          style={{
            fontSize: "14px",
            color: "#6b7280",
            margin: "0",
            lineHeight: "1.4",
            display: "-webkit-box",
            WebkitLineClamp: "2",
            WebkitBoxOrient: "vertical",
            overflow: "hidden",
          }}
        >
          {challenge.description}
        </p>
      </div>

      <div style={{ padding: "0 16px 16px 16px", display: "flex", flexDirection: "column", gap: "16px" }}>
        {/* Prize */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "8px",
            padding: "8px",
            background: "#fffbeb",
            borderRadius: "6px",
          }}
        >
          <span style={{ color: "#d97706" }}>🎁</span>
          <span
            style={{
              fontSize: "14px",
              fontWeight: "500",
              color: "#92400e",
              lineHeight: "1.4",
              display: "-webkit-box",
              WebkitLineClamp: "1",
              WebkitBoxOrient: "vertical",
              overflow: "hidden",
            }}
          >
            {challenge.prize}
          </span>
        </div>

        {/* Stats */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px", fontSize: "14px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "4px", color: "#6b7280" }}>
            <span>👥</span>
            <span>
              {challenge.participants}/{challenge.maxParticipants}
            </span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "4px", color: "#6b7280" }}>
            <span>📅</span>
            <span>{challenge.duration}</span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "4px", color: "#6b7280" }}>
            <span>⏰</span>
            <span>{challenge.startDate}</span>
          </div>
          <div
            style={{
              padding: "4px 8px",
              border: "1px solid #d1d5db",
              borderRadius: "4px",
              fontSize: "12px",
              color: "#374151",
              textAlign: "center",
              width: "fit-content",
            }}
          >
            {challenge.difficulty}
          </div>
        </div>

        {/* Min Participants Warning */}
        {challenge.participants < challenge.minParticipants && (
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "8px",
              padding: "8px",
              background: "#fef3c7",
              borderRadius: "6px",
            }}
          >
            <span style={{ color: "#d97706" }}>⚠️</span>
            <span style={{ fontSize: "12px", color: "#92400e" }}>
              Cần thêm {challenge.minParticipants - challenge.participants} người để bắt đầu
            </span>
          </div>
        )}

        {/* Hashtags */}
        <div style={{ display: "flex", flexWrap: "wrap", gap: "4px" }}>
          {challenge.hashtags.slice(0, 3).map((tag, index) => (
            <span
              key={index}
              style={{
                padding: "2px 6px",
                border: "1px solid #fce7f3",
                color: "#be185d",
                background: "#fdf2f8",
                borderRadius: "4px",
                fontSize: "12px",
              }}
            >
              #{tag}
            </span>
          ))}
          {challenge.hashtags.length > 3 && (
            <span
              style={{
                padding: "2px 6px",
                border: "1px solid #d1d5db",
                color: "#374151",
                background: "#f9fafb",
                borderRadius: "4px",
                fontSize: "12px",
              }}
            >
              +{challenge.hashtags.length - 3}
            </span>
          )}
        </div>

        {/* Actions */}
        <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
          <button
            style={{
              padding: "6px 12px",
              border: "1px solid #d1d5db",
              borderRadius: "4px",
              fontSize: "12px",
              cursor: "pointer",
              transition: "all 0.2s",
              background: "white",
              color: "#374151",
            }}
            onClick={() => onViewDetail(challenge)}
            onMouseEnter={(e) => {
              e.target.style.borderColor = "#3b82f6"
              e.target.style.color = "#3b82f6"
            }}
            onMouseLeave={(e) => {
              e.target.style.borderColor = "#d1d5db"
              e.target.style.color = "#374151"
            }}
          >
            👁️ Xem
          </button>
          <button
            style={{
              padding: "6px 12px",
              border: "1px solid #d1d5db",
              borderRadius: "4px",
              fontSize: "12px",
              cursor: "pointer",
              transition: "all 0.2s",
              background: "white",
              color: "#374151",
            }}
            onMouseEnter={(e) => {
              e.target.style.borderColor = "#8b5cf6"
              e.target.style.color = "#8b5cf6"
            }}
            onMouseLeave={(e) => {
              e.target.style.borderColor = "#d1d5db"
              e.target.style.color = "#374151"
            }}
          >
            ✏️ Sửa
          </button>
          <button
            style={{
              padding: "6px 12px",
              border: "1px solid #d1d5db",
              borderRadius: "4px",
              fontSize: "12px",
              cursor: "pointer",
              transition: "all 0.2s",
              background: "white",
              color: "#374151",
            }}
            onClick={() => onViewMembers(challenge)}
            onMouseEnter={(e) => {
              e.target.style.borderColor = "#06b6d4"
              e.target.style.color = "#06b6d4"
            }}
            onMouseLeave={(e) => {
              e.target.style.borderColor = "#d1d5db"
              e.target.style.color = "#374151"
            }}
          >
            👥 Thành viên
          </button>

          {challenge.adminStatus === "Chờ duyệt" && (
            <>
              <button
                style={{
                  padding: "6px 12px",
                  background: "#10b981",
                  color: "white",
                  border: "1px solid #10b981",
                  borderRadius: "4px",
                  fontSize: "12px",
                  cursor: "pointer",
                  transition: "all 0.2s",
                }}
                onMouseEnter={(e) => (e.target.style.backgroundColor = "#059669")}
                onMouseLeave={(e) => (e.target.style.backgroundColor = "#10b981")}
              >
                ✅ Duyệt
              </button>
              <button
                style={{
                  padding: "6px 12px",
                  background: "#ef4444",
                  color: "white",
                  border: "1px solid #ef4444",
                  borderRadius: "4px",
                  fontSize: "12px",
                  cursor: "pointer",
                  transition: "all 0.2s",
                }}
                onClick={() => setShowStatusModal(true)}
                onMouseEnter={(e) => (e.target.style.backgroundColor = "#dc2626")}
                onMouseLeave={(e) => (e.target.style.backgroundColor = "#ef4444")}
              >
                ❌ Hủy
              </button>
            </>
          )}

          <button
            style={{
              padding: "6px 12px",
              border: "1px solid #d1d5db",
              borderRadius: "4px",
              fontSize: "12px",
              cursor: "pointer",
              transition: "all 0.2s",
              background: "white",
              color: "#374151",
            }}
            onMouseEnter={(e) => {
              e.target.style.background = "#ef4444"
              e.target.style.color = "white"
              e.target.style.borderColor = "#ef4444"
            }}
            onMouseLeave={(e) => {
              e.target.style.background = "white"
              e.target.style.color = "#374151"
              e.target.style.borderColor = "#d1d5db"
            }}
          >
            🗑️ Xóa
          </button>
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
              <h3 style={{ margin: "0", fontSize: "1.125rem", fontWeight: "600", color: "#374151" }}>Hủy Challenge</h3>
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
              <p style={{ margin: "0 0 16px 0", color: "#374151" }}>Bạn có chắc chắn muốn hủy challenge này?</p>
              <div style={{ marginBottom: "16px" }}>
                <label
                  style={{ display: "block", marginBottom: "4px", fontWeight: "500", color: "#374151" }}
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
                  onMouseEnter={(e) => (e.target.style.backgroundColor = "#f9fafb")}
                  onMouseLeave={(e) => (e.target.style.backgroundColor = "white")}
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
                  onMouseEnter={(e) => (e.target.style.backgroundColor = "#dc2626")}
                  onMouseLeave={(e) => (e.target.style.backgroundColor = "#ef4444")}
                >
                  Xác nhận hủy
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
