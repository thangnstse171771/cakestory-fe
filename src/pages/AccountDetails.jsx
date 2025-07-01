import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import {
  User,
  Mail,
  Phone,
  Home,
  Calendar,
  IdCard,
  UserCheck,
  UserX,
  Star,
  Store,
} from "lucide-react";

// // Fake data giống AdminDashboard
// const fakeAccounts = [
//   {
//     id: 1,
//     username: "user1",
//     email: "user1@example.com",
//     status: "active",
//     isPremium: false,
//     shop: null,
//     details: {
//       fullName: "Nguyen Van A",
//       phone: "0123456789",
//       address: "123 Đường ABC, Quận 1, TP.HCM",
//       createdAt: "2023-01-01",
//     },
//   },
//   {
//     id: 2,
//     username: "user2",
//     email: "user2@example.com",
//     status: "active",
//     isPremium: true,
//     shop: {
//       id: 1,
//       name: "Sweet Delights",
//       description: "Tiệm bánh ngọt nổi tiếng với các loại bánh kem tươi.",
//       address: "456 Đường DEF, Quận 3, TP.HCM",
//       createdAt: "2023-02-15",
//       owner: "user2",
//     },
//     details: {
//       fullName: "Tran Thi B",
//       phone: "0987654321",
//       address: "456 Đường DEF, Quận 3, TP.HCM",
//       createdAt: "2023-02-10",
//     },
//   },
//   {
//     id: 3,
//     username: "user3",
//     email: "user3@example.com",
//     status: "restricted",
//     isPremium: false,
//     shop: null,
//     details: {
//       fullName: "Le Van C",
//       phone: "0111222333",
//       address: "789 Đường GHI, Quận 5, TP.HCM",
//       createdAt: "2023-03-20",
//     },
//   },
//   {
//     id: 4,
//     username: "shop1",
//     email: "shop1@example.com",
//     status: "active",
//     isPremium: true,
//     shop: {
//       id: 2,
//       name: "Cake Paradise",
//       description: "Chuyên bánh sinh nhật và bánh cưới cao cấp.",
//       address: "789 Đường GHI, Quận 5, TP.HCM",
//       createdAt: "2023-04-01",
//       owner: "shop1",
//     },
//     details: {
//       fullName: "Pham Thi D",
//       phone: "0222333444",
//       address: "789 Đường GHI, Quận 5, TP.HCM",
//       createdAt: "2023-03-30",
//     },
//   },
//   {
//     id: 5,
//     username: "shop2",
//     email: "shop2@example.com",
//     status: "restricted",
//     isPremium: false,
//     shop: {
//       id: 3,
//       name: "Bakery Corner",
//       description: "Tiệm bánh nhỏ với các loại bánh mì và bánh ngọt handmade.",
//       address: "321 Đường XYZ, Quận 7, TP.HCM",
//       createdAt: "2023-05-10",
//       owner: "shop2",
//     },
//     details: {
//       fullName: "Nguyen Thi E",
//       phone: "0333444555",
//       address: "321 Đường XYZ, Quận 7, TP.HCM",
//       createdAt: "2023-05-05",
//     },
//   },
// ];

export default function AccountDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [account, setAccount] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    setTimeout(() => {
      const found = fakeAccounts.find((acc) => acc.id === Number(id));
      setAccount(found);
      setLoading(false);
    }, 500);
  }, [id]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-pink-50">
        <div className="w-10 h-10 border-4 border-pink-200 border-t-pink-500 rounded-full animate-spin mr-4"></div>
        <span className="text-pink-500 font-semibold text-lg">
          Loading details...
        </span>
      </div>
    );
  }
  if (!account) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-pink-50">
        <div className="text-2xl font-bold text-pink-600 mb-4">
          Account not found
        </div>
        <button
          onClick={() => navigate(-1)}
          className="px-6 py-2 rounded-lg bg-pink-500 text-white font-semibold hover:bg-pink-600"
        >
          Back
        </button>
      </div>
    );
  }
  return (
    <div className="min-h-screen bg-pink-50 py-10 px-2 md:px-8">
      <div className="max-w-7xl mx-auto">
        <button
          onClick={() => navigate(-1)}
          className="mb-8 px-6 py-2 rounded-lg bg-pink-500 text-white font-semibold hover:bg-pink-600"
        >
          ← Back
        </button>
        <h1 className="text-5xl font-extrabold text-pink-600 text-left mb-8 tracking-tight">
          Account Details
        </h1>
        {/* Card Info */}
        <div className="bg-white rounded-2xl shadow-xl p-10 mb-12 w-full">
          <div className="flex flex-col md:flex-row md:items-center md:gap-8 mb-8">
            {/* Avatar */}
            <div className="flex-shrink-0 flex items-center justify-center w-32 h-32 rounded-full bg-pink-100 border-4 border-pink-200 mr-0 md:mr-8 mb-6 md:mb-0">
              <User className="w-20 h-20 text-pink-300" />
            </div>
            {/* Main Info Grid */}
            <div className="flex-1 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div>
                <div className="flex items-center gap-2 text-gray-700 text-sm mb-1 font-bold">
                  <IdCard className="w-4 h-4" />
                  ID
                </div>
                <div className="text-xl font-bold text-red-500">
                  {account.id}
                </div>
              </div>
              <div>
                <div className="flex items-center gap-2 text-gray-700 text-sm mb-1 font-bold">
                  <User className="w-4 h-4" />
                  Username
                </div>
                <div className="text-lg font-bold text-blue-600">
                  {account.username}
                </div>
              </div>
              <div>
                <div className="flex items-center gap-2 text-gray-700 text-sm mb-1 font-bold">
                  <Mail className="w-4 h-4" />
                  Email
                </div>
                <div className="text-base font-bold text-blue-600 break-all">
                  {account.email}
                </div>
              </div>
              <div>
                <div className="flex items-center gap-2 text-gray-700 text-sm mb-1 font-bold">
                  <UserCheck className="w-4 h-4" />
                  Full Name
                </div>
                <div className="text-gray-900">{account.details.fullName}</div>
              </div>
              <div>
                <div className="flex items-center gap-2 text-gray-700 text-sm mb-1 font-bold">
                  <Phone className="w-4 h-4" />
                  Phone
                </div>
                <div className="text-gray-900">{account.details.phone}</div>
              </div>
              <div>
                <div className="flex items-center gap-2 text-gray-700 text-sm mb-1 font-bold">
                  <Home className="w-4 h-4" />
                  Address
                </div>
                <div className="text-gray-900">{account.details.address}</div>
              </div>
              <div>
                <div className="flex items-center gap-2 text-gray-700 text-sm mb-1 font-bold">
                  <Calendar className="w-4 h-4" />
                  Account Created
                </div>
                <div className="text-gray-900">{account.details.createdAt}</div>
              </div>
              <div>
                <div className="flex items-center gap-2 text-gray-700 text-sm mb-1 font-bold">
                  <UserX className="w-4 h-4" />
                  Status
                </div>
                <div className="flex gap-2 mt-1">
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-semibold ${
                      account.status === "active"
                        ? "bg-green-100 text-green-800"
                        : "bg-red-100 text-red-800"
                    }`}
                  >
                    {account.status}
                  </span>
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-semibold ${
                      account.isPremium
                        ? "bg-blue-100 text-blue-700"
                        : "bg-gray-100 text-gray-800"
                    }`}
                  >
                    {account.isPremium ? "Premium" : "Regular"}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
        {/* Shop Info */}
        {account.shop && (
          <div className="bg-white border border-pink-200 rounded-2xl shadow p-10 w-full mb-12">
            <div className="flex items-center gap-2 mb-6">
              <Store className="w-6 h-6 text-pink-400" />
              <h2 className="text-2xl font-bold text-pink-500">
                Shop Information
              </h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div>
                <div className="flex items-center gap-2 text-gray-700 text-sm mb-1 font-bold">
                  <Store className="w-4 h-4" />
                  Shop Name
                </div>
                <div className="text-lg font-bold text-blue-600">
                  {account.shop.name}
                </div>
              </div>
              <div>
                <div className="flex items-center gap-2 text-gray-700 text-sm mb-1 font-bold">
                  <Star className="w-4 h-4" />
                  Description
                </div>
                <div className="text-gray-900">{account.shop.description}</div>
              </div>
              <div>
                <div className="flex items-center gap-2 text-gray-700 text-sm mb-1 font-bold">
                  <Home className="w-4 h-4" />
                  Address
                </div>
                <div className="text-gray-900">{account.shop.address}</div>
              </div>
              <div>
                <div className="flex items-center gap-2 text-gray-700 text-sm mb-1 font-bold">
                  <Calendar className="w-4 h-4" />
                  Shop Created
                </div>
                <div className="text-gray-900">{account.shop.createdAt}</div>
              </div>
              <div>
                <div className="flex items-center gap-2 text-gray-700 text-sm mb-1 font-bold">
                  <User className="w-4 h-4" />
                  Owner
                </div>
                <div className="text-gray-900">{account.shop.owner}</div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
