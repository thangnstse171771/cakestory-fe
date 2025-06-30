"use client"

import { useState } from "react"
import MemberCard from "./MemberCard"

export default function MembersList({ challenge, onBack }) {
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")

  // Fake data trực tiếp trong component
  const users = [
    {
      id: "1",
      name: "Minh Anh Nguyễn",
      avatar: "/placeholder.svg?height=40&width=40",
      email: "minhanh@email.com",
      phone: "0901234567",
      location: "Hồ Chí Minh",
      joinDate: "2024-12-15",
      status: "active",
      level: "Bánh sư cấp 3",
      totalChallenges: 12,
      completedChallenges: 8,
    },
    {
      id: "2",
      name: "Thanh Hoa Trần",
      avatar: "/placeholder.svg?height=40&width=40",
      email: "thanhhoa@email.com",
      phone: "0912345678",
      location: "Hà Nội",
      joinDate: "2024-12-16",
      status: "active",
      level: "Bánh sư cấp 2",
      totalChallenges: 8,
      completedChallenges: 6,
    },
    {
      id: "3",
      name: "Quỳnh Như Lê",
      avatar: "/placeholder.svg?height=40&width=40",
      email: "quynhnhu@email.com",
      phone: "0923456789",
      location: "Đà Nẵng",
      joinDate: "2024-12-17",
      status: "banned",
      level: "Bánh sư cấp 1",
      totalChallenges: 3,
      completedChallenges: 1,
    },
    {
      id: "4",
      name: "Văn Đức Phạm",
      avatar: "/placeholder.svg?height=40&width=40",
      email: "vanduc@email.com",
      phone: "0934567890",
      location: "Cần Thơ",
      joinDate: "2024-12-18",
      status: "active",
      level: "Bánh sư cấp 4",
      totalChallenges: 15,
      completedChallenges: 12,
    },
  ]

  const filteredUsers = users.filter((user) => {
    const matchesSearch =
      user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.level.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = statusFilter === "all" || user.status === statusFilter
    return matchesSearch && matchesStatus
  })

  return (
    <div style={{ minHeight: "100vh", backgroundColor: "#fff5f7" }}>
      <div style={{ maxWidth: "1200px", margin: "0 auto", padding: "24px 16px" }}>
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
            e.target.style.color = "#111827"
            e.target.style.backgroundColor = "#fce7f3"
            e.target.style.padding = "8px 12px"
            e.target.style.borderRadius = "6px"
          }}
          onMouseLeave={(e) => {
            e.target.style.color = "#374151"
            e.target.style.backgroundColor = "transparent"
            e.target.style.padding = "8px 0"
            e.target.style.borderRadius = "0"
          }}
        >
          ← Quay lại Challenge Detail
        </button>

        {/* Header */}
        <div style={{ marginBottom: "24px" }}>
          <h1 style={{ fontSize: "2rem", fontWeight: "bold", color: "#374151", margin: "0 0 8px 0" }}>
            Quản lý thành viên
          </h1>
          <p style={{ color: "#6b7280", margin: "0" }}>
            Challenge: <span style={{ fontWeight: "600", color: "#374151" }}>{challenge.title}</span>
          </p>
        </div>

        {/* Search and Filter */}
        <div
          style={{
            background: "white",
            border: "1px solid #e5e7eb",
            borderRadius: "8px",
            padding: "16px",
            marginBottom: "24px",
            boxShadow: "0 1px 3px rgba(0, 0, 0, 0.1)",
          }}
        >
          <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
            <div style={{ position: "relative", flex: "1" }}>
              <span
                style={{
                  position: "absolute",
                  left: "12px",
                  top: "50%",
                  transform: "translateY(-50%)",
                  color: "#9ca3af",
                }}
              >
                🔍
              </span>
              <input
                type="text"
                placeholder="Tìm kiếm theo tên, email hoặc level..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                style={{
                  width: "100%",
                  padding: "10px 12px 10px 40px",
                  border: "1px solid #d1d5db",
                  borderRadius: "6px",
                  fontSize: "14px",
                  boxSizing: "border-box",
                }}
              />
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                style={{
                  padding: "10px 12px",
                  background: "white",
                  border: "1px solid #d1d5db",
                  borderRadius: "6px",
                  fontSize: "14px",
                  color: "#374151",
                  cursor: "pointer",
                  minWidth: "180px",
                }}
              >
                <option value="all">Tất cả</option>
                <option value="active">Hoạt động</option>
                <option value="banned">Bị cấm</option>
              </select>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
            gap: "16px",
            marginBottom: "24px",
          }}
        >
          <div
            style={{
              background: "white",
              border: "1px solid #e5e7eb",
              borderRadius: "8px",
              padding: "16px",
              textAlign: "center",
              boxShadow: "0 1px 3px rgba(0, 0, 0, 0.1)",
            }}
          >
            <div style={{ fontSize: "2rem", marginBottom: "8px" }}>👥</div>
            <p style={{ fontSize: "1.5rem", fontWeight: "bold", color: "#374151", margin: "0 0 4px 0" }}>
              {users.length}
            </p>
            <p style={{ fontSize: "14px", color: "#6b7280", margin: "0" }}>Tổng thành viên</p>
          </div>
          <div
            style={{
              background: "white",
              border: "1px solid #e5e7eb",
              borderRadius: "8px",
              padding: "16px",
              textAlign: "center",
              boxShadow: "0 1px 3px rgba(0, 0, 0, 0.1)",
            }}
          >
            <div style={{ fontSize: "2rem", marginBottom: "8px" }}>✅</div>
            <p style={{ fontSize: "1.5rem", fontWeight: "bold", color: "#374151", margin: "0 0 4px 0" }}>
              {users.filter((u) => u.status === "active").length}
            </p>
            <p style={{ fontSize: "14px", color: "#6b7280", margin: "0" }}>Đang hoạt động</p>
          </div>
          <div
            style={{
              background: "white",
              border: "1px solid #e5e7eb",
              borderRadius: "8px",
              padding: "16px",
              textAlign: "center",
              boxShadow: "0 1px 3px rgba(0, 0, 0, 0.1)",
            }}
          >
            <div style={{ fontSize: "2rem", marginBottom: "8px" }}>❌</div>
            <p style={{ fontSize: "1.5rem", fontWeight: "bold", color: "#374151", margin: "0 0 4px 0" }}>
              {users.filter((u) => u.status === "banned").length}
            </p>
            <p style={{ fontSize: "14px", color: "#6b7280", margin: "0" }}>Bị cấm</p>
          </div>
          <div
            style={{
              background: "white",
              border: "1px solid #e5e7eb",
              borderRadius: "8px",
              padding: "16px",
              textAlign: "center",
              boxShadow: "0 1px 3px rgba(0, 0, 0, 0.1)",
            }}
          >
            <div style={{ fontSize: "2rem", marginBottom: "8px" }}>🏆</div>
            <p style={{ fontSize: "1.5rem", fontWeight: "bold", color: "#374151", margin: "0 0 4px 0" }}>
              {Math.round(
                users.reduce((sum, u) => sum + (u.completedChallenges / u.totalChallenges) * 100, 0) / users.length,
              )}
              %
            </p>
            <p style={{ fontSize: "14px", color: "#6b7280", margin: "0" }}>Tỷ lệ hoàn thành</p>
          </div>
        </div>

        {/* Members List */}
        <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          {filteredUsers.map((user) => (
            <MemberCard key={user.id} user={user} />
          ))}
        </div>

        {/* Empty State */}
        {filteredUsers.length === 0 && (
          <div style={{ textAlign: "center", padding: "48px 0" }}>
            <div style={{ fontSize: "4rem", marginBottom: "16px" }}>👥</div>
            <h3 style={{ fontSize: "1.25rem", fontWeight: "600", color: "#374151", margin: "0 0 8px 0" }}>
              Không tìm thấy thành viên nào
            </h3>
            <p style={{ color: "#6b7280", margin: "0" }}>Thử thay đổi từ khóa tìm kiếm hoặc bộ lọc</p>
          </div>
        )}
      </div>
    </div>
  )
}
