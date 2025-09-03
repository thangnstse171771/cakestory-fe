// import React, { useEffect, useMemo, useState } from "react";
// import {
//   ArrowLeft,
//   RefreshCw,
//   Search,
//   Filter,
//   ArrowUpRight,
//   ArrowDownLeft,
//   Calendar,
//   Clock,
//   CheckCircle2,
//   XCircle,
//   AlertCircle,
//   Layers,
//   MinusCircle,
//   DollarSign,
//   ChevronLeft,
//   ChevronRight,
//   Sparkles,
//   Undo2,
// } from "lucide-react";
// import { useNavigate } from "react-router-dom";
// import { fetchWalletTransactionsByUserId } from "../../api/axios";

// // Map transaction types -> UI meta
// const TYPE_META = {
//   order_payment: {
//     label: "Thanh toán đơn hàng",
//     color: "bg-blue-50 text-blue-600 border-blue-200",
//     icon: <ShoppingCartIcon />,
//   },
//   ai_generation: {
//     label: "AI Generate",
//     color: "bg-purple-50 text-purple-600 border-purple-200",
//     icon: <Sparkles className="w-4 h-4" />,
//   },
//   refund: {
//     label: "Hoàn tiền",
//     color: "bg-emerald-50 text-emerald-600 border-emerald-200",
//     icon: <Undo2 className="w-4 h-4" />,
//   },
//   transfer: {
//     label: "Chuyển khoản",
//     color: "bg-amber-50 text-amber-600 border-amber-200",
//     icon: <ArrowUpRight className="w-4 h-4" />,
//   },
// };

// // Fallback icon component for order_payment without importing elsewhere
// function ShoppingCartIcon(props) {
//   return (
//     <svg
//       xmlns="http://www.w3.org/2000/svg"
//       viewBox="0 0 24 24"
//       fill="none"
//       stroke="currentColor"
//       strokeWidth="2"
//       strokeLinecap="round"
//       strokeLinejoin="round"
//       className={`w-4 h-4 ${props.className || ""}`}
//     >
//       <circle cx="9" cy="21" r="1" />
//       <circle cx="20" cy="21" r="1" />
//       <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
//     </svg>
//   );
// }

// const STATUS_META = {
//   pending: {
//     label: "Đang xử lý",
//     icon: <Clock className="w-3.5 h-3.5" />,
//     color: "bg-yellow-50 text-yellow-700 border-yellow-200",
//   },
//   completed: {
//     label: "Hoàn thành",
//     icon: <CheckCircle2 className="w-3.5 h-3.5" />,
//     color: "bg-green-50 text-green-700 border-green-200",
//   },
//   failed: {
//     label: "Thất bại",
//     icon: <XCircle className="w-3.5 h-3.5" />,
//     color: "bg-red-50 text-red-600 border-red-200",
//   },
//   rejected: {
//     label: "Từ chối",
//     icon: <XCircle className="w-3.5 h-3.5" />,
//     color: "bg-red-50 text-red-600 border-red-200",
//   },
// };

// const formatMoney = (n) => {
//   if (n == null || n === "") return "0";
//   const num = typeof n === "number" ? n : parseFloat(n);
//   return new Intl.NumberFormat("vi-VN").format(isFinite(num) ? num : 0);
// };

// const formatDateTime = (iso) => {
//   if (!iso) return "N/A";
//   try {
//     return new Date(iso).toLocaleString("vi-VN", {
//       year: "numeric",
//       month: "2-digit",
//       day: "2-digit",
//       hour: "2-digit",
//       minute: "2-digit",
//     });
//   } catch {
//     return iso;
//   }
// };

// const getUserId = () => {
//   try {
//     const user = JSON.parse(localStorage.getItem("user"));
//     return user?.id || user?.user_id || null;
//   } catch {
//     return null;
//   }
// };

// const UserTransactions = () => {
//   const navigate = useNavigate();
//   const [raw, setRaw] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState("");
//   const [refreshing, setRefreshing] = useState(false);
//   const [search, setSearch] = useState("");
//   const [typeFilter, setTypeFilter] = useState("all");
//   const [statusFilter, setStatusFilter] = useState("all");
//   const [datePreset, setDatePreset] = useState("all");
//   const [fromDate, setFromDate] = useState("");
//   const [toDate, setToDate] = useState("");
//   const [page, setPage] = useState(1);
//   const pageSize = 12;

//   const load = async () => {
//     setLoading(true);
//     setError("");
//     try {
//       const userId = getUserId();
//       if (!userId) throw new Error("Không tìm thấy userId");
//       const res = await fetchWalletTransactionsByUserId(userId);
//       const txs = Array.isArray(res?.transactions) ? res.transactions : [];
//       const normalized = txs.map((t) => ({
//         ...t,
//         amountNumber: parseFloat(t.amount) || 0,
//       }));
//       setRaw(
//         normalized.sort(
//           (a, b) => new Date(b.created_at) - new Date(a.created_at)
//         )
//       );
//     } catch (e) {
//       console.error(e);
//       setError(e?.message || "Không thể tải giao dịch. Vui lòng thử lại sau.");
//     } finally {
//       setLoading(false);
//     }
//   };

//   useEffect(() => {
//     load();
//   }, []);

//   const handleRefresh = async () => {
//     setRefreshing(true);
//     await load();
//     setRefreshing(false);
//   };

//   // Derived filter dates
//   useEffect(() => {
//     if (datePreset !== "custom") {
//       setFromDate("");
//       setToDate("");
//     }
//   }, [datePreset]);

//   const filtered = useMemo(() => {
//     let list = raw;
//     // Date range
//     const now = new Date();
//     let start = null;
//     if (datePreset === "today") {
//       start = new Date();
//       start.setHours(0, 0, 0, 0);
//     } else if (datePreset === "7d") {
//       start = new Date(now.getTime() - 7 * 86400000);
//     } else if (datePreset === "30d") {
//       start = new Date(now.getTime() - 30 * 86400000);
//     } else if (datePreset === "custom" && fromDate) {
//       start = new Date(fromDate);
//     }
//     let end = null;
//     if (datePreset === "custom" && toDate) {
//       end = new Date(toDate);
//       end.setHours(23, 59, 59, 999);
//     }
//     if (start) {
//       list = list.filter((t) => new Date(t.created_at) >= start);
//     }
//     if (end) {
//       list = list.filter((t) => new Date(t.created_at) <= end);
//     }
//     if (typeFilter !== "all")
//       list = list.filter((t) => t.transaction_type === typeFilter);
//     if (statusFilter !== "all")
//       list = list.filter((t) => t.status === statusFilter);
//     if (search.trim()) {
//       const kw = search.toLowerCase();
//       list = list.filter(
//         (t) =>
//           t.description?.toLowerCase().includes(kw) ||
//           String(t.id).includes(kw) ||
//           (t.order_id && String(t.order_id).includes(kw))
//       );
//     }
//     return list;
//   }, [raw, typeFilter, statusFilter, search, datePreset, fromDate, toDate]);

//   const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
//   const pageData = filtered.slice((page - 1) * pageSize, page * pageSize);
//   useEffect(() => {
//     if (page > totalPages) setPage(1);
//   }, [totalPages, page]);

//   const stats = useMemo(() => {
//     const s = {
//       count: raw.length,
//       totalOut: 0,
//       totalIn: 0,
//       byType: {},
//     };
//     raw.forEach((t) => {
//       const amt = t.amountNumber;
//       if (t.transaction_type === "refund") s.totalIn += amt;
//       else s.totalOut += amt;
//       s.byType[t.transaction_type] = (s.byType[t.transaction_type] || 0) + 1;
//     });
//     return s;
//   }, [raw]);

//   const renderTypeBadge = (type) => {
//     const meta = TYPE_META[type] || {
//       label: type,
//       color: "bg-gray-50 text-gray-600 border-gray-200",
//       icon: <Layers className="w-4 h-4" />,
//     };
//     return (
//       <span
//         className={`inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full border ${meta.color}`}
//       >
//         {meta.icon}
//         {meta.label}
//       </span>
//     );
//   };

//   const renderStatusBadge = (status) => {
//     const meta = STATUS_META[status] || {
//       label: status || "Khác",
//       icon: <AlertCircle className="w-3.5 h-3.5" />,
//       color: "bg-gray-50 text-gray-600 border-gray-200",
//     };
//     return (
//       <span
//         className={`inline-flex items-center gap-1.5 text-[11px] font-medium px-2 py-0.5 rounded-full border ${meta.color}`}
//       >
//         {meta.icon}
//         {meta.label}
//       </span>
//     );
//   };

//   return (
//     <div className="min-h-screen bg-gradient-to-br from-pink-50 via-white to-purple-50">
//       {/* Header */}
//       <div className="bg-white/80 backdrop-blur border-b border-pink-100 sticky top-0 z-20">
//         <div className="max-w-6xl mx-auto px-4 py-4 flex items-center gap-4">
//           <button
//             onClick={() => navigate(-1)}
//             className="p-2 rounded-xl border border-pink-100 hover:bg-pink-50 transition"
//           >
//             <ArrowLeft className="w-5 h-5 text-pink-600" />
//           </button>
//           <div>
//             <h1 className="text-xl md:text-2xl font-bold bg-gradient-to-r from-pink-600 to-purple-600 bg-clip-text text-transparent">
//               Giao dịch ví chi tiết
//             </h1>
//             <p className="text-sm text-gray-600">
//               {raw.length} giao dịch • Tổng chi: {formatMoney(stats.totalOut)} •
//               Tổng hoàn: {formatMoney(stats.totalIn)}
//             </p>
//           </div>
//           <div className="ml-auto flex items-center gap-2">
//             <button
//               onClick={handleRefresh}
//               disabled={refreshing}
//               className="flex items-center gap-1.5 bg-white border border-pink-200 px-3 py-2 rounded-lg text-pink-600 text-sm font-medium hover:bg-pink-50 disabled:opacity-60"
//             >
//               <RefreshCw
//                 className={`w-4 h-4 ${refreshing ? "animate-spin" : ""}`}
//               />
//               Làm mới
//             </button>
//           </div>
//         </div>
//       </div>

//       {/* Filters */}
//       <div className="max-w-6xl mx-auto px-4 py-4">
//         <div className="bg-white rounded-2xl shadow-sm border border-pink-100 p-4 md:p-6 space-y-4">
//           <div className="flex flex-col md:flex-row gap-4 md:items-end">
//             <div className="flex-1">
//               <label className="text-xs font-semibold text-gray-600 uppercase tracking-wide">
//                 Tìm kiếm
//               </label>
//               <div className="relative mt-1">
//                 <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
//                 <input
//                   value={search}
//                   onChange={(e) => setSearch(e.target.value)}
//                   placeholder="Mô tả, ID, ID đơn hàng..."
//                   className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-gray-200 focus:border-pink-400 focus:ring-2 focus:ring-pink-200 bg-white/50"
//                 />
//               </div>
//             </div>
//             <div>
//               <label className="text-xs font-semibold text-gray-600 uppercase tracking-wide">
//                 Loại
//               </label>
//               <select
//                 value={typeFilter}
//                 onChange={(e) => setTypeFilter(e.target.value)}
//                 className="mt-1 w-40 rounded-xl border border-gray-200 bg-white/50 py-2.5 px-3 focus:border-pink-400 focus:ring-2 focus:ring-pink-200"
//               >
//                 <option value="all">Tất cả</option>
//                 <option value="order_payment">Thanh toán</option>
//                 <option value="ai_generation">AI Generate</option>
//                 <option value="refund">Hoàn tiền</option>
//               </select>
//             </div>
//             <div>
//               <label className="text-xs font-semibold text-gray-600 uppercase tracking-wide">
//                 Trạng thái
//               </label>
//               <select
//                 value={statusFilter}
//                 onChange={(e) => setStatusFilter(e.target.value)}
//                 className="mt-1 w-40 rounded-xl border border-gray-200 bg-white/50 py-2.5 px-3 focus:border-pink-400 focus:ring-2 focus:ring-pink-200"
//               >
//                 <option value="all">Tất cả</option>
//                 <option value="pending">Đang xử lý</option>
//                 <option value="completed">Hoàn thành</option>
//                 <option value="failed">Thất bại</option>
//                 <option value="rejected">Từ chối</option>
//               </select>
//             </div>
//             <div>
//               <label className="text-xs font-semibold text-gray-600 uppercase tracking-wide">
//                 Thời gian
//               </label>
//               <select
//                 value={datePreset}
//                 onChange={(e) => setDatePreset(e.target.value)}
//                 className="mt-1 w-40 rounded-xl border border-gray-200 bg-white/50 py-2.5 px-3 focus:border-pink-400 focus:ring-2 focus:ring-pink-200"
//               >
//                 <option value="all">Tất cả</option>
//                 <option value="today">Hôm nay</option>
//                 <option value="7d">7 ngày</option>
//                 <option value="30d">30 ngày</option>
//                 <option value="custom">Tùy chọn</option>
//               </select>
//             </div>
//             {datePreset === "custom" && (
//               <div className="flex gap-2">
//                 <input
//                   type="date"
//                   value={fromDate}
//                   onChange={(e) => setFromDate(e.target.value)}
//                   className="mt-6 w-40 rounded-xl border border-gray-200 bg-white/50 py-2.5 px-3 focus:border-pink-400 focus:ring-2 focus:ring-pink-200"
//                 />
//                 <input
//                   type="date"
//                   value={toDate}
//                   onChange={(e) => setToDate(e.target.value)}
//                   className="mt-6 w-40 rounded-xl border border-gray-200 bg-white/50 py-2.5 px-3 focus:border-pink-400 focus:ring-2 focus:ring-pink-200"
//                 />
//               </div>
//             )}
//           </div>

//           {/* Quick stats */}
//           <div className="grid grid-cols-2 md:grid-cols-4 gap-3 pt-2">
//             <div className="p-4 rounded-xl border border-pink-100 bg-gradient-to-br from-pink-50 to-white">
//               <div className="text-xs font-medium text-pink-600 mb-1">
//                 Tổng giao dịch
//               </div>
//               <div className="text-xl font-bold text-gray-800">
//                 {stats.count}
//               </div>
//             </div>
//             <div className="p-4 rounded-xl border border-rose-100 bg-gradient-to-br from-rose-50 to-white">
//               <div className="text-xs font-medium text-rose-600 mb-1">
//                 Tổng chi
//               </div>
//               <div className="text-xl font-bold text-gray-800">
//                 -{formatMoney(stats.totalOut)}
//               </div>
//             </div>
//             <div className="p-4 rounded-xl border border-emerald-100 bg-gradient-to-br from-emerald-50 to-white">
//               <div className="text-xs font-medium text-emerald-600 mb-1">
//                 Tổng hoàn
//               </div>
//               <div className="text-xl font-bold text-gray-800">
//                 +{formatMoney(stats.totalIn)}
//               </div>
//             </div>
//             <div className="p-4 rounded-xl border border-purple-100 bg-gradient-to-br from-purple-50 to-white">
//               <div className="text-xs font-medium text-purple-600 mb-1">
//                 Loại
//               </div>
//               <div className="text-sm text-gray-700 leading-tight space-y-1">
//                 {Object.entries(stats.byType).map(([k, v]) => (
//                   <div key={k} className="flex justify-between">
//                     <span className="capitalize truncate max-w-[90px]">
//                       {TYPE_META[k]?.label || k}
//                     </span>
//                     <span className="font-semibold">{v}</span>
//                   </div>
//                 ))}
//               </div>
//             </div>
//           </div>
//         </div>
//       </div>

//       {/* Content */}
//       <div className="max-w-6xl mx-auto px-4 pb-16">
//         {error && (
//           <div className="mb-6 p-4 rounded-xl border border-red-200 bg-red-50 flex items-start gap-3">
//             <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
//             <div>
//               <p className="font-medium text-red-700">Lỗi</p>
//               <p className="text-sm text-red-600">{error}</p>
//               <button
//                 onClick={load}
//                 className="mt-2 text-sm text-red-600 underline hover:no-underline"
//               >
//                 Thử lại
//               </button>
//             </div>
//           </div>
//         )}

//         {loading ? (
//           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 animate-pulse">
//             {Array.from({ length: 6 }).map((_, i) => (
//               <div
//                 key={i}
//                 className="h-40 rounded-2xl bg-gradient-to-r from-pink-100/40 to-purple-100/40"
//               ></div>
//             ))}
//           </div>
//         ) : filtered.length === 0 ? (
//           <div className="text-center py-24 border-2 border-dashed rounded-3xl border-pink-200 bg-white/50">
//             <Sparkles className="w-12 h-12 mx-auto text-pink-400 mb-4" />
//             <h3 className="text-lg font-semibold text-gray-700 mb-2">
//               Không có giao dịch phù hợp
//             </h3>
//             <p className="text-sm text-gray-500 max-w-md mx-auto">
//               Thử thay đổi bộ lọc hoặc thời gian khác nhé.
//             </p>
//           </div>
//         ) : (
//           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
//             {pageData.map((t) => {
//               const isRefund = t.transaction_type === "refund";
//               const sign = isRefund ? "+" : "-";
//               return (
//                 <div
//                   key={t.id}
//                   className="group relative bg-white rounded-2xl border border-pink-100/70 hover:border-pink-300 shadow-sm hover:shadow-md transition overflow-hidden"
//                 >
//                   <div className="absolute inset-0 bg-gradient-to-br from-pink-50/60 via-transparent to-purple-50/60 opacity-0 group-hover:opacity-100 transition" />
//                   <div className="p-4 flex flex-col h-full relative z-10">
//                     <div className="flex items-start justify-between gap-3">
//                       {renderTypeBadge(t.transaction_type)}
//                       {renderStatusBadge(t.status)}
//                     </div>
//                     <div className="mt-3 flex items-baseline gap-2">
//                       <span
//                         className={`text-lg font-bold tracking-tight ${
//                           isRefund ? "text-emerald-600" : "text-rose-600"
//                         }`}
//                       >
//                         {sign}
//                         {formatMoney(t.amountNumber)}
//                       </span>
//                       <span className="text-xs text-gray-500 font-medium">
//                         VND
//                       </span>
//                     </div>
//                     {t.order_id && (
//                       <div className="mt-1 text-xs text-pink-600 font-medium">
//                         Đơn hàng #{t.order_id}
//                       </div>
//                     )}
//                     <p className="mt-2 text-sm text-gray-700 line-clamp-3 leading-relaxed">
//                       {t.description || "Không có mô tả"}
//                     </p>
//                     <div className="mt-auto pt-4 flex items-center justify-between text-xs text-gray-500">
//                       <span>{formatDateTime(t.created_at)}</span>
//                       <span className="font-mono text-gray-400">
//                         ID #{t.id}
//                       </span>
//                     </div>
//                   </div>
//                 </div>
//               );
//             })}
//           </div>
//         )}

//         {/* Pagination */}
//         {filtered.length > 0 && (
//           <div className="mt-10 flex items-center justify-center gap-2">
//             <button
//               onClick={() => setPage((p) => Math.max(1, p - 1))}
//               disabled={page === 1}
//               className="p-2 rounded-lg border border-pink-200 bg-white text-pink-600 hover:bg-pink-50 disabled:opacity-40"
//             >
//               <ChevronLeft className="w-5 h-5" />
//             </button>
//             <div className="text-sm font-medium text-gray-600">
//               Trang {page} / {totalPages}
//             </div>
//             <button
//               onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
//               disabled={page === totalPages}
//               className="p-2 rounded-lg border border-pink-200 bg-white text-pink-600 hover:bg-pink-50 disabled:opacity-40"
//             >
//               <ChevronRight className="w-5 h-5" />
//             </button>
//           </div>
//         )}
//       </div>
//     </div>
//   );
// };

// export default UserTransactions;
import React from "react";

export default function UserTransactions() {
  return <div>UserTransactions</div>;
}
