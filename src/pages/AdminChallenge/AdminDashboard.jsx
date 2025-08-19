"use client";

import { useState } from "react";
import ChallengeList from "./ChallengeList";
import ChallengeDetail from "./ChallengeDetail";
import MembersList from "./MembersList";
import AnalyticsTab from "./AnalyticsTab";
// import ChallengeModal from "./ChallengeModal";
import UpdateChallenge from "./UpdateChallenge";

export default function AdminDashboard() {
  const [currentView, setCurrentView] = useState("dashboard");
  const [activeTab, setActiveTab] = useState("challenges");
  const [selectedChallenge, setSelectedChallenge] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingChallenge, setEditingChallenge] = useState(null);

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

  const handleEditChallenge = (challenge) => {
    console.log("🔧 AdminDashboard: handleEditChallenge called", challenge);
    setEditingChallenge(challenge);
    setShowEditModal(true);
  };

  const handleEditSuccess = (updatedChallenge) => {
    console.log("✅ Challenge updated successfully:", updatedChallenge);
    setShowEditModal(false);
    setEditingChallenge(null);
    // Optionally refresh the challenge list here
    alert("Challenge đã được cập nhật thành công!");
  };

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

        {/* Tabs */}
        <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              background: "white",
              border: "1px solid #e5e7eb",
              borderRadius: "8px",
              overflow: "hidden",
            }}
          >
            <button
              style={{
                padding: "12px 16px",
                background: activeTab === "challenges" ? "#fce7f3" : "white",
                border: "none",
                cursor: "pointer",
                fontWeight: "500",
                color: activeTab === "challenges" ? "#be185d" : "#374151",
                transition: "all 0.2s",
              }}
              onClick={() => setActiveTab("challenges")}
              onMouseEnter={(e) => {
                if (activeTab !== "challenges")
                  e.target.style.backgroundColor = "#f9fafb";
              }}
              onMouseLeave={(e) => {
                if (activeTab !== "challenges")
                  e.target.style.backgroundColor = "white";
              }}
            >
              Quản lý Challenges
            </button>
            <button
              style={{
                padding: "12px 16px",
                background: activeTab === "analytics" ? "#fce7f3" : "white",
                border: "none",
                cursor: "pointer",
                fontWeight: "500",
                color: activeTab === "analytics" ? "#be185d" : "#374151",
                transition: "all 0.2s",
              }}
              onClick={() => setActiveTab("analytics")}
              onMouseEnter={(e) => {
                if (activeTab !== "analytics")
                  e.target.style.backgroundColor = "#f9fafb";
              }}
              onMouseLeave={(e) => {
                if (activeTab !== "analytics")
                  e.target.style.backgroundColor = "white";
              }}
            >
              Thống kê
            </button>
          </div>

          <div style={{ minHeight: "400px" }}>
            {activeTab === "challenges" && (
              <ChallengeList
                onViewDetail={handleViewChallengeDetail}
                onViewMembers={handleViewMembers}
                onEdit={handleEditChallenge}
              />
            )}
            {activeTab === "analytics" && <AnalyticsTab />}
          </div>
        </div>
      </div>

      {/* Edit Challenge Modal */}
      {/* <ChallengeModal
        isOpen={showEditModal}
        onClose={() => {
          setShowEditModal(false);
          setEditingChallenge(null);
        }}
        onSuccess={handleEditSuccess}
        editChallenge={editingChallenge}
        mode="edit"
      /> */}
      <UpdateChallenge
        isOpen={showEditModal}
        onClose={() => {
          setShowEditModal(false);
          setEditingChallenge(null);
        }}
        // onSuccess={handleEditSuccess}
        challenge={editingChallenge}
      />
    </div>
  );
}
