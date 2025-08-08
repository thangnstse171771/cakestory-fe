import { useEffect, useState, useMemo } from "react";
import MemberCard from "./MemberCard";
import {
  fetchChallengeParticipants,
  deleteChallengeEntry,
} from "../../api/challenge";

export default function MembersList({ challenge, onBack }) {
  console.log("🚀 MembersList component mounted with challenge:", challenge);

  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [participants, setParticipants] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [deletingEntryId, setDeletingEntryId] = useState(null);

  // Hàm reload danh sách participants
  const reloadParticipants = async () => {
    if (!challenge?.id) return;

    setLoading(true);
    setError("");
    try {
      console.log("Reloading participants for challenge:", challenge.id);
      const response = await fetchChallengeParticipants(challenge.id);

      let participantsList = [];
      if (response && response.entries && Array.isArray(response.entries)) {
        participantsList = response.entries;
      } else if (Array.isArray(response)) {
        participantsList = response;
      } else if (
        response &&
        response.data &&
        Array.isArray(response.data.entries)
      ) {
        participantsList = response.data.entries;
      } else if (response && response.data && Array.isArray(response.data)) {
        participantsList = response.data;
      }

      console.log("Reloaded participants:", participantsList);
      setParticipants(participantsList);
    } catch (err) {
      console.error("Error reloading participants:", err);
      setError("Không thể tải lại danh sách thành viên.");
    } finally {
      setLoading(false);
    }
  };

  // Handle removing a member from challenge
  const handleRemoveMember = async (participant) => {
    const user = participant.User || participant.user;
    const userName = user?.username || user?.name || user?.email || "User";

    if (
      !confirm(
        `Bạn có chắc chắn muốn xóa ${userName} khỏi challenge này không?`
      )
    ) {
      return;
    }

    if (!participant.id) {
      alert("Không thể xóa: không tìm thấy ID của entry");
      return;
    }

    setDeletingEntryId(participant.id);

    try {
      await deleteChallengeEntry(participant.id);

      alert(`Đã xóa ${userName} khỏi challenge thành công!`);

      // Reload danh sách member từ server để đảm bảo dữ liệu chính xác
      await reloadParticipants();
    } catch (error) {
      console.error("Error removing member:", error);
      alert("Có lỗi xảy ra khi xóa thành viên. Vui lòng thử lại.");
    } finally {
      setDeletingEntryId(null);
    }
  };

  useEffect(() => {
    const fetchParticipants = async () => {
      console.log("fetchParticipants called with challenge:", challenge);

      if (!challenge?.id) {
        console.error("Challenge or challenge.id is missing:", challenge);
        setError("Challenge ID không hợp lệ");
        return;
      }

      setLoading(true);
      setError("");
      try {
        console.log("Fetching participants for challenge:", challenge.id);
        const response = await fetchChallengeParticipants(challenge.id);

        // API trả về object có thuộc tính entries chứa array các participants
        let participantsList = [];

        // Kiểm tra structure của response
        console.log("Raw API Response:", response);
        console.log("Response type:", typeof response);
        console.log("Response.entries:", response?.entries);

        // Dựa vào API testing, response có cấu trúc { entries: [...] }
        if (response && response.entries && Array.isArray(response.entries)) {
          participantsList = response.entries;
          console.log("✅ Using response.entries:", participantsList);
        } else if (Array.isArray(response)) {
          // Trường hợp API trả về array trực tiếp
          participantsList = response;
          console.log("✅ Using response as array:", participantsList);
        } else if (
          response &&
          response.data &&
          Array.isArray(response.data.entries)
        ) {
          // Trường hợp API trả về { data: { entries: [...] } }
          participantsList = response.data.entries;
          console.log("✅ Using response.data.entries:", participantsList);
        } else if (response && response.data && Array.isArray(response.data)) {
          // Trường hợp API trả về { data: [...] }
          participantsList = response.data;
          console.log("✅ Using response.data:", participantsList);
        } else {
          console.warn("❌ Unexpected API response structure:", response);
          console.warn("Available properties:", Object.keys(response || {}));
          participantsList = [];
        }

        console.log("Final processed participants:", participantsList);
        console.log("Participants count:", participantsList.length);
        setParticipants(participantsList);
      } catch (err) {
        console.error("Error fetching challenge participants:", err);
        setError("Không thể tải danh sách thành viên. Vui lòng thử lại.");
      } finally {
        setLoading(false);
      }
    };

    if (challenge?.id) {
      fetchParticipants();
    }
  }, [challenge.id]);

  // Filter participants based on search and status
  const filteredUsers = useMemo(() => {
    let filtered = participants;

    // Filter by search term (tìm trong thông tin user)
    if (searchTerm) {
      filtered = filtered.filter((participant) => {
        const user = participant.User || participant.user;
        return (
          user?.username?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          user?.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          user?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          user?.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          participant?.status?.toLowerCase().includes(searchTerm.toLowerCase())
        );
      });
    }

    // Filter by status (status của entry, không phải user)
    if (statusFilter !== "all") {
      filtered = filtered.filter((participant) => {
        const user = participant.User || participant.user;
        // Có thể filter theo entry status hoặc user status
        return (
          participant.status === statusFilter || user?.status === statusFilter
        );
      });
    }

    console.log("Filtered participants:", filtered);
    return filtered;
  }, [participants, searchTerm, statusFilter]);

  if (loading) {
    return (
      <div className="min-h-screen bg-rose-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-rose-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Đang tải danh sách thành viên...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-rose-50 flex items-center justify-center">
        <div className="text-center">
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
          <button
            onClick={() => window.location.reload()}
            className="bg-rose-500 text-white px-4 py-2 rounded hover:bg-rose-600"
          >
            Thử lại
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-rose-50">
      <div className="max-w-6xl mx-auto px-4 py-6">
        {/* Back Button */}
        <button
          className="text-gray-700 text-base cursor-pointer py-2 mb-6 transition-all duration-200 hover:text-gray-900 hover:bg-rose-100 hover:px-3 hover:rounded-md"
          onClick={onBack}
        >
          ← Quay lại Challenge Detail
        </button>

        {/* Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-700 mb-2">
            Quản lý thành viên
          </h1>
          <p className="text-gray-500">
            Challenge:{" "}
            <span className="font-semibold text-gray-700">
              {challenge.title}
            </span>
          </p>
        </div>

        {/* Search and Filter */}
        <div className="bg-white border border-gray-200 rounded-lg p-4 mb-6 shadow-sm">
          <div className="flex flex-col gap-4">
            <div className="relative flex-1">
              <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
                🔍
              </span>
              <input
                type="text"
                placeholder="Tìm kiếm theo tên, email hoặc level..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-3 py-2.5 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-rose-500 focus:border-rose-500"
              />
            </div>
            <div className="flex items-center gap-2">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-3 py-2.5 bg-white border border-gray-300 rounded-md text-sm text-gray-700 cursor-pointer min-w-[180px] focus:outline-none focus:ring-2 focus:ring-rose-500 focus:border-rose-500"
              >
                <option value="all">Tất cả</option>
                <option value="active">Hoạt động</option>
                <option value="banned">Bị cấm</option>
              </select>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
          <div className="bg-white border border-gray-200 rounded-lg p-4 text-center shadow-sm">
            <div className="text-3xl mb-2">👥</div>
            <p className="text-2xl font-bold text-gray-700 mb-1">
              {filteredUsers.length}
            </p>
            <p className="text-sm text-gray-500">Tổng thành viên</p>
          </div>
          <div className="bg-white border border-gray-200 rounded-lg p-4 text-center shadow-sm">
            <div className="text-3xl mb-2">✅</div>
            <p className="text-2xl font-bold text-gray-700 mb-1">
              {
                filteredUsers.filter((p) => {
                  const user = p.User || p.user;
                  return user?.status === "active" || p.status === "active";
                }).length
              }
            </p>
            <p className="text-sm text-gray-500">Đang hoạt động</p>
          </div>
          <div className="bg-white border border-gray-200 rounded-lg p-4 text-center shadow-sm">
            <div className="text-3xl mb-2">❌</div>
            <p className="text-2xl font-bold text-gray-700 mb-1">
              {
                filteredUsers.filter((p) => {
                  const user = p.User || p.user;
                  return user?.status === "banned" || p.status === "banned";
                }).length
              }
            </p>
            <p className="text-sm text-gray-500">Bị cấm</p>
          </div>
        </div>

        {/* Members List */}
        <div className="flex flex-col gap-4">
          {filteredUsers.map((participant) => (
            <MemberCard
              key={participant.id || participant.user_id}
              user={participant.User || participant.user}
              participant={participant}
              onRemove={handleRemoveMember}
              isDeleting={deletingEntryId === participant.id}
            />
          ))}
        </div>

        {/* Empty State */}
        {filteredUsers.length === 0 && !loading && (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">👥</div>
            <h3 className="text-xl font-semibold text-gray-700 mb-2">
              Không tìm thấy thành viên nào
            </h3>
            <p className="text-gray-500">
              Thử thay đổi từ khóa tìm kiếm hoặc bộ lọc
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
