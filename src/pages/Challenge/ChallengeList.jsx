const handleBack = () => {
  setSelectedChallenge(null);
};

const handleJoinChallenge = async (challengeId) => {
  try {
    const result = await joinChallenge(challengeId);
    console.log("Join challenge response:", result);

    // Since the API returns entry object on success
    if (result && result.entry) {
      toast.success("Tham gia thử thách thành công!");
      // Refresh the challenges list to update UI
      const response = await getAllChallenges();
      if (response && response.challenges) {
        const formattedChallenges = response.challenges.map((challenge) => ({
          id: challenge.id || challenge._id,
          title: challenge.title || "Untitled Challenge",
          description: challenge.description || "",
          status: getStatusFromDates(challenge.start_date, challenge.end_date),
          startDate: formatDate(challenge.start_date),
          endDate: formatDate(challenge.end_date),
          duration: challenge.duration || "30 ngày",
          difficulty: challenge.difficulty || "Trung bình",
          prize: challenge.prize_description || "",
          participants: challenge.participants_count || 0,
          maxParticipants: challenge.max_participants || 100,
          minParticipants: challenge.min_participants || 10,
          tags: Array.isArray(challenge.hashtags) ? challenge.hashtags : [],
          hashtag: challenge.hashtag,
          image: challenge.image_url || IMAGE_URL,
          host: {
            name: challenge.host_name || "Admin",
            avatar: challenge.host_avatar || IMAGE_URL,
          },
        }));
        setChallenges(formattedChallenges);
      }
    }
  } catch (error) {
    console.error("Error joining challenge:", error);
    // Handle specific error cases
    if (error.response?.status === 400) {
      toast.error("Bạn đã tham gia thử thách này rồi hoặc thử thách đã đầy");
    } else if (error.response?.status === 404) {
      toast.error("Không tìm thấy thử thách này");
    } else {
      toast.error(
        error.response?.data?.message ||
          "Không thể tham gia thử thách. Vui lòng thử lại!"
      );
    }
  }
};
import { useState, useRef, useEffect } from "react";
import { DateRange } from "react-date-range";
import { addDays } from "date-fns";
import "react-date-range/dist/styles.css";
import "react-date-range/dist/theme/default.css";
import { getAllChallenges } from "../../api/challenge";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";

const IMAGE_URL =
  "https://friendshipcakes.com/wp-content/uploads/2023/05/banh-tao-hinh-21.jpg";

function parseDate(str) {
  // str: dd/mm/yyyy
  const [d, m, y] = str.split("/");
  return new Date(`${y}-${m}-${d}`);
}

export default function ChallengeList() {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedFilter, setSelectedFilter] = useState("Tất cả");

  const handleSelectChallenge = (challenge) => {
    navigate(`/challenge/details/${challenge.id}`);
  };

  const [showDateFilter, setShowDateFilter] = useState(false);
  const [dateRange, setDateRange] = useState({
    startDate: null,
    endDate: null,
    key: "selection",
  });
  const [challenges, setChallenges] = useState([]);
  const [loading, setLoading] = useState(false);
  const filterRef = useRef(null);

  const getStatusFromDates = (startDate, endDate) => {
    const now = new Date();
    const start = new Date(startDate);
    const end = new Date(endDate);

    if (now < start) return "Sắp diễn ra";
    if (now > end) return "Đã kết thúc";
    return "Đang diễn ra";
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return `${date.getDate().toString().padStart(2, "0")}/${(
      date.getMonth() + 1
    )
      .toString()
      .padStart(2, "0")}/${date.getFullYear()}`;
  };

  // Placeholder data for development

  useEffect(() => {
    const fetchChallenges = async () => {
      try {
        setLoading(true);

        // Gọi API và log response để debug
        const response = await getAllChallenges();
        console.log("Raw API Response:", response);

        if (response && response.challenges) {
          // Nếu có dữ liệu từ API, format và cập nhật state
          const apiChallenges = response.challenges.map((challenge) => {
            console.log("Processing challenge:", challenge);
            return {
              id: challenge.id || challenge._id,
              title: challenge.title || "Untitled Challenge",
              description: challenge.description || "",
              status: getStatusFromDates(
                challenge.start_date,
                challenge.end_date
              ),
              startDate: formatDate(challenge.start_date),
              endDate: formatDate(challenge.end_date),
              duration: challenge.duration || "30 ngày",
              difficulty: challenge.difficulty || "Trung bình",
              prize: challenge.prize_description || "",
              participants: challenge.participants_count || 0,
              maxParticipants: challenge.max_participants || 100,
              minParticipants: challenge.min_participants || 10,
              hashtag: challenge.hashtag,
              image: challenge.image_url || IMAGE_URL,
              tags: Array.isArray(challenge.hashtags) ? challenge.hashtags : [],
              host: {
                name: challenge.host_name || "Admin",
                avatar: challenge.host_avatar || IMAGE_URL,
              },
              rules: challenge.rules || "",
              requirements: challenge.requirements || "",
            };
          });

          console.log("Formatted API Challenges:", apiChallenges);
          setChallenges(apiChallenges);
        } else {
          toast.error("Không có thử thách nào từ API.");
        }
      } catch (error) {
        console.error("Error fetching challenges:", error);
        toast.error(
          error.response?.data?.message ||
            "Không thể kết nối với server. Vui lòng thử lại sau."
        );
      } finally {
        setLoading(false);
      }
    };

    fetchChallenges();
  }, []);

  const filters = ["Tất cả", "Đang diễn ra", "Sắp diễn ra", "Đã kết thúc"];

  const filteredChallenges = challenges.filter((challenge) => {
    const matchesSearch =
      !searchTerm ||
      challenge.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      challenge.description?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesFilter =
      selectedFilter === "Tất cả" || challenge.status === selectedFilter;

    let matchesDate = true;
    if (dateRange.startDate && dateRange.endDate) {
      const challengeStartDate = parseDate(challenge.startDate);
      const challengeEndDate = parseDate(challenge.endDate);
      if (challengeStartDate && challengeEndDate) {
        matchesDate =
          challengeStartDate >= dateRange.startDate &&
          challengeEndDate <= dateRange.endDate;
      }
    }

    return matchesSearch && matchesFilter && matchesDate;
  });

  const getDifficultyColor = (difficulty) => {
    switch (difficulty) {
      case "Dễ":
        return "bg-green-50 text-green-700 border-green-200";
      case "Trung bình":
        return "bg-yellow-50 text-yellow-700 border-yellow-200";
      case "Khó":
        return "bg-red-50 text-red-700 border-red-200";
      default:
        return "bg-gray-50 text-gray-700 border-gray-200";
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "Đang diễn ra":
        return "bg-green-50 text-green-700 border-green-200";
      case "Sắp diễn ra":
        return "bg-blue-50 text-blue-700 border-blue-200";
      case "Đã kết thúc":
        return "bg-gray-50 text-gray-700 border-gray-200";
      default:
        return "bg-gray-50 text-gray-700 border-gray-200";
    }
  };

  // Đóng popup khi click ngoài
  function handleClickOutside(e) {
    if (filterRef.current && !filterRef.current.contains(e.target)) {
      setShowDateFilter(false);
    }
  }

  useEffect(() => {
    if (showDateFilter) {
      document.addEventListener("mousedown", handleClickOutside);
    } else {
      document.removeEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [showDateFilter]);

  // Loading state
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen" style={{ backgroundColor: "#FFF5F7" }}>
      <div className="container mx-auto px-4 py-6 max-w-6xl">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-4">
            Cake Story Challenges
          </h1>
          <p className="text-gray-600 text-lg">
            Tham gia các thử thách làm bánh thú vị và nhận giải thưởng hấp dẫn
          </p>
        </div>

        {/* Search and Filter */}
        <div className="bg-white border border-gray-200 rounded-lg mb-6">
          <div className="p-4">
            <div className="flex flex-col md:flex-row gap-4 items-center">
              <div className="relative flex-1">
                <svg
                  className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                  />
                </svg>
                <input
                  placeholder="Tìm kiếm challenge..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 border border-gray-200 rounded-lg px-3 py-2 focus:border-pink-300 focus:outline-none"
                />
              </div>
              <div className="relative" ref={filterRef}>
                <button
                  className="p-2 rounded hover:bg-pink-100 border border-gray-200"
                  onClick={() => setShowDateFilter((v) => !v)}
                  aria-label="Bộ lọc ngày"
                >
                  <svg
                    className="h-5 w-5 text-gray-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M4 21v-2a4 4 0 014-4h8a4 4 0 014 4v2M6 7V5a2 2 0 012-2h8a2 2 0 012 2v2M6 7h12M6 11h12M6 15h8"
                    />
                  </svg>
                </button>
                {showDateFilter && (
                  <div className="absolute z-50 mt-2 left-0 bg-white border border-gray-200 rounded-lg shadow-lg p-2">
                    <DateRange
                      ranges={[
                        {
                          startDate: dateRange.startDate || new Date(),
                          endDate: dateRange.endDate || new Date(),
                          key: "selection",
                        },
                      ]}
                      onChange={(item) => {
                        setDateRange({
                          startDate: item.selection.startDate,
                          endDate: item.selection.endDate,
                          key: "selection",
                        });
                      }}
                      moveRangeOnFirstSelection={false}
                      rangeColors={["#ec4899"]}
                      showMonthAndYearPickers={true}
                      showDateDisplay={false}
                      editableDateInputs={true}
                      maxDate={addDays(new Date(), 365)}
                      locale={undefined}
                    />
                    <div className="flex justify-end mt-2">
                      <button
                        className="px-3 py-1 rounded bg-gray-100 hover:bg-gray-200 text-gray-700 text-sm mr-2"
                        onClick={() => {
                          setDateRange({
                            startDate: null,
                            endDate: null,
                            key: "selection",
                          });
                          setShowDateFilter(false);
                        }}
                      >
                        Xóa
                      </button>
                      <button
                        className="px-3 py-1 rounded bg-pink-400 hover:bg-pink-500 text-white text-sm"
                        onClick={() => setShowDateFilter(false)}
                      >
                        Áp dụng
                      </button>
                    </div>
                  </div>
                )}
              </div>
              <div className="flex items-center space-x-2">
                {filters.map((filter) => (
                  <button
                    key={filter}
                    className={`px-3 py-1 rounded text-sm ${
                      selectedFilter === filter
                        ? "bg-pink-400 hover:bg-pink-500 text-white"
                        : "border border-gray-300 text-gray-700 hover:bg-pink-50"
                    }`}
                    onClick={() => setSelectedFilter(filter)}
                  >
                    {filter}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Challenges Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredChallenges.map((challenge) => (
            <div
              key={challenge.id}
              className="bg-white border border-gray-200 rounded-lg shadow-sm hover:shadow-md transition-all duration-300 cursor-pointer hover:scale-105"
              onClick={() => handleSelectChallenge(challenge)}
            >
              <div className="relative">
                <img
                  src={challenge.image || IMAGE_URL}
                  alt={challenge.title}
                  className="w-full h-48 object-cover rounded-t-lg"
                />
                <div className="absolute top-3 right-3">
                  <span
                    className={`px-2 py-1 rounded text-xs border ${getStatusColor(
                      challenge.status
                    )}`}
                  >
                    {challenge.status}
                  </span>
                </div>
              </div>

              <div className="p-4 flex flex-col justify-between h-auto">
                <div>
                  <h3 className="text-lg font-bold text-gray-800 mb-2">
                    {challenge.title}
                  </h3>
                  <p
                    className="text-gray-600 text-sm mb-4"
                    style={{
                      display: "-webkit-box",
                      WebkitLineClamp: "2",
                      WebkitBoxOrient: "vertical",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      minHeight: "calc(2 * 1.4em)",
                      maxHeight: "calc(2 * 1.4em)",
                      lineHeight: "1.4",
                    }}
                  >
                    {challenge.description}
                  </p>

                  {/* Stats */}
                  <div className="flex items-center justify-between text-sm text-gray-600 mb-4">
                    {/* <div className="flex items-center space-x-1">
                      <svg
                        className="w-4 h-4 text-gray-500"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z"
                        />
                      </svg>
                      <span>
                        {challenge.participants}/{challenge.maxParticipants}{" "}
                        người
                      </span>
                    </div> */}
                    <div className="flex items-center space-x-1">
                      <svg
                        className="w-4 h-4 text-gray-500"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                        />
                      </svg>
                      <span>{challenge.startDate}</span>
                    </div>
                  </div>

                  {/* Tags */}
                  {challenge.tags && challenge.tags.length > 0 && (
                    <div className="flex flex-wrap gap-2 mb-4">
                      {challenge.tags.slice(0, 3).map((tag, index) => (
                        <span
                          key={index}
                          className="px-2 py-1 text-xs border border-pink-200 text-pink-600 rounded"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                {/* Action Button */}
                <button
                  className="w-full bg-pink-400 hover:bg-pink-500 text-white py-2 rounded-lg "
                  onClick={(e) => {
                    e.stopPropagation();
                    handleSelectChallenge(challenge);
                  }}
                >
                  Xem chi tiết
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Empty State */}
        {filteredChallenges.length === 0 && (
          <div className="text-center py-12">
            <div className="text-gray-400 mb-4">
              <svg
                className="w-16 h-16 mx-auto"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-gray-800 mb-2">
              Không tìm thấy challenge nào
            </h3>
            <p className="text-gray-600">
              Thử thay đổi từ khóa tìm kiếm hoặc bộ lọc
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
