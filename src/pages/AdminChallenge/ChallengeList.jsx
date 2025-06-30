"use client"

import { useState } from "react"
import CreateChallengeModal from "./CreateChallengeModal"
import ChallengeCard from "./ChallengeCard"

export default function ChallengeList({ onViewDetail, onViewMembers }) {
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [statusFilter, setStatusFilter] = useState("all")

  // Fake data trực tiếp trong component
  const challenges = [
    {
      id: "1",
      title: "Challenge Bánh Kem Hoa Hồng",
      description: "Thử thách 30 ngày làm bánh kem với chủ đề hoa hồng lãng mạn",
      image: "/placeholder.svg?height=400&width=600",
      participants: 248,
      maxParticipants: 500,
      minParticipants: 20,
      duration: "30 ngày",
      difficulty: "Trung bình",
      prize: "Bộ dụng cụ làm bánh cao cấp + Voucher 1.000.000đ",
      adminStatus: "Đang diễn ra",
      startDate: "2024-12-15",
      endDate: "2025-01-15",
      host: { name: "Chef Minh Anh", avatar: "/placeholder.svg?height=40&width=40" },
      hashtags: ["bánh-kem", "hoa-hồng", "trang-trí", "lãng-mạn"],
      rules: [
        "Mỗi tuần hoàn thành ít nhất 2 sản phẩm theo chủ đề hoa hồng",
        "Chia sẻ ảnh và video quá trình làm bánh",
        "Tương tác tích cực với cộng đồng",
      ],
      requirements: [
        "Có kinh nghiệm làm bánh kem cơ bản tối thiểu 6 tháng",
        "Sở hữu dụng cụ làm bánh cần thiết",
        "Cam kết tham gia đầy đủ thời gian 30 ngày",
      ],
    },
    {
      id: "2",
      title: "Cupcake Giáng Sinh",
      description: "Tạo ra những chiếc cupcake đầy màu sắc cho mùa Giáng Sinh",
      image: "/placeholder.svg?height=400&width=600",
      participants: 0,
      maxParticipants: 300,
      minParticipants: 15,
      duration: "14 ngày",
      difficulty: "Dễ",
      prize: "Voucher 500.000đ + Bộ khuôn cupcake",
      adminStatus: "Chờ duyệt",
      startDate: "2024-12-20",
      endDate: "2025-01-03",
      host: { name: "Baker Thanh Hoa", avatar: "/placeholder.svg?height=40&width=40" },
      hashtags: ["cupcake", "giáng-sinh", "màu-sắc"],
      rules: ["Thiết kế theo chủ đề Giáng Sinh", "Sử dụng màu sắc tươi sáng"],
      requirements: ["Kinh nghiệm làm cupcake", "Dụng cụ trang trí"],
    },
    {
      id: "3",
      title: "Bánh Macaron Pháp",
      description: "Học cách làm bánh macaron Pháp chuẩn vị",
      image: "/placeholder.svg?height=400&width=600",
      participants: 156,
      maxParticipants: 200,
      minParticipants: 10,
      duration: "21 ngày",
      difficulty: "Khó",
      prize: "Khóa học làm bánh chuyên nghiệp",
      adminStatus: "Đã duyệt",
      startDate: "2024-12-25",
      endDate: "2025-01-15",
      host: { name: "Chef Marie", avatar: "/placeholder.svg?height=40&width=40" },
      hashtags: ["macaron", "pháp", "cao-cấp"],
      rules: ["Tuân thủ công thức chuẩn", "Chia sẻ kết quả hàng tuần"],
      requirements: ["Kinh nghiệm làm bánh trung cấp", "Máy đánh trứng chuyên dụng"],
    },
  ]

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
      {/* Action Bar */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: "16px",
        }}
      >
        <div style={{ display: "flex", gap: "8px" }}>
          <select
            style={{
              padding: "8px 12px",
              background: "white",
              border: "1px solid #d1d5db",
              borderRadius: "6px",
              fontSize: "14px",
              color: "#374151",
              cursor: "pointer",
              minWidth: "180px",
            }}
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="all">Tất cả</option>
            <option value="pending">Chờ duyệt</option>
            <option value="approved">Đã duyệt</option>
            <option value="active">Đang diễn ra</option>
          </select>
        </div>

        <button
          style={{
            background: "#f472b6",
            color: "white",
            border: "none",
            padding: "10px 16px",
            borderRadius: "6px",
            fontWeight: "500",
            cursor: "pointer",
            transition: "background-color 0.2s",
          }}
          onClick={() => setShowCreateModal(true)}
          onMouseEnter={(e) => (e.target.style.backgroundColor = "#ec4899")}
          onMouseLeave={(e) => (e.target.style.backgroundColor = "#f472b6")}
        >
          ➕ Tạo Challenge Mới
        </button>
      </div>

      {/* Challenges Grid */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(350px, 1fr))",
          gap: "24px",
        }}
      >
        {challenges.map((challenge) => (
          <ChallengeCard
            key={challenge.id}
            challenge={challenge}
            onViewDetail={onViewDetail}
            onViewMembers={onViewMembers}
          />
        ))}
      </div>

      {/* Create Challenge Modal */}
      {showCreateModal && <CreateChallengeModal isOpen={showCreateModal} onClose={() => setShowCreateModal(false)} />}
    </div>
  )
}
