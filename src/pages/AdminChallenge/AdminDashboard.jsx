"use client";

import { useState } from "react";
import ChallengeList from "./ChallengeList";
import ChallengeDetail from "./ChallengeDetail";
import MembersList from "./MembersList";

export default function AdminDashboard() {
  const [currentView, setCurrentView] = useState("dashboard");
  const [selectedChallenge, setSelectedChallenge] = useState(null);

  const handleViewChallengeDetail = (challenge) => {
    setSelectedChallenge(challenge);
    setCurrentView("challenge-detail");
  };

  const handleViewMembers = (challenge) => {
    console.log("🔥 handleViewMembers called with challenge:", challenge);
    setSelectedChallenge(challenge);
    setCurrentView("members");
  };

  const handleBackToDashboard = () => {
    setCurrentView("dashboard");
    setSelectedChallenge(null);
  };

  const handleBackToDetail = () => {
    setCurrentView("challenge-detail");
  };

  // Đã bỏ tab Analytics & chức năng edit, nên lược bỏ toàn bộ code liên quan.

  // Challenge Detail Page
  if (currentView === "challenge-detail" && selectedChallenge) {
    return (
      <ChallengeDetail
        challenge={selectedChallenge}
        onBack={handleBackToDashboard}
        onViewMembers={handleViewMembers}
      />
    );
  }

  // Members Page
  if (currentView === "members" && selectedChallenge) {
    return (
      <MembersList challenge={selectedChallenge} onBack={handleBackToDetail} />
    );
  }

  // Main Dashboard
  return (
    <div style={{ minHeight: "100vh", backgroundColor: "#fff5f7" }}>
      <div
        style={{ maxWidth: "1200px", margin: "0 auto", padding: "24px 16px" }}
      >
        {/* Header */}
        <div style={{ marginBottom: "32px" }}>
          <h1
            style={{
              fontSize: "2rem",
              fontWeight: "bold",
              color: "#374151",
              margin: "0 0 8px 0",
            }}
          >
            Admin Dashboard
          </h1>
          <p style={{ color: "#6b7280", margin: "0" }}>
            Quản lý challenges và người dùng
          </p>
        </div>

        {/* Danh sách challenges (đã bỏ tab Analytics) */}
        <div style={{ minHeight: "400px" }}>
          <ChallengeList
            onViewDetail={handleViewChallengeDetail}
            onViewMembers={handleViewMembers}
          />
        </div>
      </div>

      {/* Đã loại bỏ modal chỉnh sửa và Analytics */}
    </div>
  );
}
