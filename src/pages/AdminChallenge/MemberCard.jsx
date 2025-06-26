"use client"

export default function MemberCard({ user }) {
  return (
    <div
      style={{
        background: "white",
        border: "1px solid #e5e7eb",
        borderRadius: "8px",
        boxShadow: "0 1px 3px rgba(0, 0, 0, 0.1)",
        transition: "box-shadow 0.2s",
      }}
      onMouseEnter={(e) => (e.currentTarget.style.boxShadow = "0 4px 6px rgba(0, 0, 0, 0.1)")}
      onMouseLeave={(e) => (e.currentTarget.style.boxShadow = "0 1px 3px rgba(0, 0, 0, 0.1)")}
    >
      <div
        style={{
          padding: "24px",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          gap: "16px",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "16px", flex: "1" }}>
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
              src={user.avatar || "/placeholder.svg"}
              alt={user.name}
              style={{ width: "100%", height: "100%", objectFit: "cover" }}
            />
          </div>
          <div style={{ flex: "1", minWidth: "0" }}>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "12px",
                marginBottom: "8px",
                flexWrap: "wrap",
              }}
            >
              <h3 style={{ fontSize: "1.125rem", fontWeight: "bold", color: "#374151", margin: "0" }}>{user.name}</h3>
              <span
                style={{
                  padding: "4px 8px",
                  borderRadius: "4px",
                  fontSize: "12px",
                  fontWeight: "500",
                  background: user.status === "active" ? "#d1fae5" : "#fee2e2",
                  color: user.status === "active" ? "#065f46" : "#991b1b",
                }}
              >
                {user.status === "active" ? "Hoạt động" : "Bị cấm"}
              </span>
              <span
                style={{
                  padding: "4px 8px",
                  border: "1px solid #fce7f3",
                  color: "#be185d",
                  background: "#fdf2f8",
                  borderRadius: "4px",
                  fontSize: "12px",
                }}
              >
                {user.level}
              </span>
            </div>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
                gap: "16px",
                marginBottom: "12px",
                fontSize: "14px",
                color: "#6b7280",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <span style={{ flexShrink: "0" }}>📧</span>
                <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{user.email}</span>
              </div>
              {user.phone && (
                <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                  <span style={{ flexShrink: "0" }}>📱</span>
                  <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                    {user.phone}
                  </span>
                </div>
              )}
              {user.location && (
                <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                  <span style={{ flexShrink: "0" }}>📍</span>
                  <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                    {user.location}
                  </span>
                </div>
              )}
            </div>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "24px",
                fontSize: "14px",
                flexWrap: "wrap",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: "4px" }}>
                <span style={{ color: "#6b7280" }}>Tham gia: </span>
                <span style={{ fontWeight: "500", color: "#374151" }}>{user.joinDate}</span>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: "4px" }}>
                <span style={{ color: "#6b7280" }}>Challenges: </span>
                <span style={{ fontWeight: "500", color: "#374151" }}>
                  {user.completedChallenges}/{user.totalChallenges}
                </span>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: "4px" }}>
                <span style={{ color: "#6b7280" }}>Tỷ lệ: </span>
                <span style={{ fontWeight: "500", color: "#059669" }}>
                  {Math.round((user.completedChallenges / user.totalChallenges) * 100)}%
                </span>
              </div>
            </div>
          </div>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: "8px", flexShrink: "0" }}>
          {user.status === "active" ? (
            <button
              style={{
                padding: "8px 16px",
                background: "#ef4444",
                color: "white",
                border: "1px solid #ef4444",
                borderRadius: "6px",
                fontSize: "14px",
                cursor: "pointer",
                transition: "all 0.2s",
                whiteSpace: "nowrap",
              }}
              onMouseEnter={(e) => (e.target.style.backgroundColor = "#dc2626")}
              onMouseLeave={(e) => (e.target.style.backgroundColor = "#ef4444")}
            >
              🚫 Cấm
            </button>
          ) : (
            <button
              style={{
                padding: "8px 16px",
                background: "#10b981",
                color: "white",
                border: "1px solid #10b981",
                borderRadius: "6px",
                fontSize: "14px",
                cursor: "pointer",
                transition: "all 0.2s",
                whiteSpace: "nowrap",
              }}
              onMouseEnter={(e) => (e.target.style.backgroundColor = "#059669")}
              onMouseLeave={(e) => (e.target.style.backgroundColor = "#10b981")}
            >
              ✅ Bỏ cấm
            </button>
          )}
          <button
            style={{
              padding: "8px 16px",
              border: "1px solid #d1d5db",
              borderRadius: "6px",
              fontSize: "14px",
              cursor: "pointer",
              transition: "all 0.2s",
              background: "white",
              color: "#374151",
              whiteSpace: "nowrap",
            }}
            onMouseEnter={(e) => {
              e.target.style.borderColor = "#3b82f6"
              e.target.style.color = "#3b82f6"
            }}
            onMouseLeave={(e) => {
              e.target.style.borderColor = "#d1d5db"
              e.target.style.color = "#374151"
            }}
          >
            👁️ Xem profile
          </button>
        </div>
      </div>
    </div>
  )
}
