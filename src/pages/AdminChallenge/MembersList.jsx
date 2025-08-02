import { useEffect, useState, useMemo } from "react";
import MemberCard from "./MemberCard";
import axiosInstance from "../../api/axios";

export default function MembersList({ challenge, onBack }) {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [users, setUsers] = useState([]);
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [usersRes, entriesRes] = await Promise.all([
          axiosInstance.get("/users"),
          axiosInstance.get("/challenge-entries"),
        ]);
        setUsers(usersRes.data.users || []);
        setEntries(entriesRes.data.entries || []);
        // Debug log rõ ràng
        console.log(
          "[DEBUG USERS]",
          JSON.stringify(usersRes.data.users, null, 2)
        );
        console.log(
          "[DEBUG ENTRIES]",
          JSON.stringify(
            entriesRes.data.entrines || entriesRes.data.entries,
            null,
            2
          )
        );
        console.log("[DEBUG CHALLENGE ID]", challenge.id);
      } catch (err) {
        console.error("Error fetching data:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [challenge.id]);

  // Map challenge entries to users for the current challenge
  const filteredUsers = useMemo(() => {
    // Lấy các entry thuộc challenge hiện tại
    // Lấy các entry thuộc challenge hiện tại
    const challengeEntries = entries.filter(
      (entry) => entry.challenge_id === challenge.id
    );
    // Lấy danh sách user_id đã tham gia challenge
    const userIdsInChallenge = new Set(challengeEntries.map((e) => e.user_id));
    // Lọc users theo user_id trong challenge
    let filtered = users.filter((user) => userIdsInChallenge.has(user.id));

    // Debug log chi tiết
    console.log(
      "[DEBUG CHALLENGE ENTRIES]",
      JSON.stringify(challengeEntries, null, 2)
    );
    console.log(
      "[DEBUG USER IDS IN CHALLENGE]",
      Array.from(userIdsInChallenge)
    );
    console.log("[DEBUG FILTERED USERS]", JSON.stringify(filtered, null, 2));

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(
        (user) =>
          user.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          user.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          user.level?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filter by status
    if (statusFilter !== "all") {
      filtered = filtered.filter((user) => user.status === statusFilter);
    }

    return filtered;
  }, [users, entries, challenge.id, searchTerm, statusFilter]);

  if (loading) {
    return (
      <div className="min-h-screen bg-rose-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-rose-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Đang tải dữ liệu...</p>
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
              {filteredUsers.filter((u) => u.status === "active").length}
            </p>
            <p className="text-sm text-gray-500">Đang hoạt động</p>
          </div>
          <div className="bg-white border border-gray-200 rounded-lg p-4 text-center shadow-sm">
            <div className="text-3xl mb-2">❌</div>
            <p className="text-2xl font-bold text-gray-700 mb-1">
              {filteredUsers.filter((u) => u.status === "banned").length}
            </p>
            <p className="text-sm text-gray-500">Bị cấm</p>
          </div>
        </div>

        {/* Members List */}
        <div className="flex flex-col gap-4">
          {filteredUsers.map((user) => (
            <MemberCard key={user.id} user={user} />
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
