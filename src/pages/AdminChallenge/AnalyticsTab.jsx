// "use client";

// import { useMemo, useState, useRef, useEffect } from "react";

// export default function AnalyticsTab() {
//   // Fake data trực tiếp trong component
//   const stats = {
//     totalChallenges: 15,
//     activeChallenges: 3,
//     pendingChallenges: 2,
//     totalParticipants: 1247,
//   };

//   // Fake dữ liệu cho biểu đồ cột: số lượng challenge theo tháng
//   const monthlyData = [
//     { month: "01/2024", value: 2 },
//     { month: "02/2024", value: 1 },
//     { month: "03/2024", value: 3 },
//     { month: "04/2024", value: 2 },
//     { month: "05/2024", value: 1 },
//     { month: "06/2024", value: 2 },
//     { month: "07/2024", value: 4 },
//   ];

//   // Fake dữ liệu cho biểu đồ tròn: tỉ lệ trạng thái challenge
//   const pieData = [
//     { label: "Đang hoạt động", value: 3, color: "#a7f3d0" },
//     { label: "Chờ duyệt", value: 2, color: "#fde68a" },
//     { label: "Đã duyệt", value: 7, color: "#fbcfe8" },
//     { label: "Đã kết thúc", value: 3, color: "#c7d2fe" },
//   ];

//   // Fake top 5 challenge nhiều người tham gia nhất
//   const topChallenges = [
//     { name: "Bánh Kem Hoa Hồng", participants: 248 },
//     { name: "Macaron Pháp", participants: 156 },
//     { name: "Cupcake Giáng Sinh", participants: 120 },
//     { name: "Bánh Mì Sourdough", participants: 98 },
//     { name: "Bánh Flan Caramel", participants: 77 },
//   ];

//   // Dữ liệu bảng tất cả challenge (fake, giống ChallengeList)
//   const allChallenges = [
//     {
//       id: "1",
//       title: "Challenge Bánh Kem Hoa Hồng",
//       host: "Chef Minh Anh",
//       adminStatus: "Đang diễn ra",
//       participants: 248,
//       maxParticipants: 500,
//       startDate: "2024-12-15",
//       endDate: "2025-01-15",
//     },
//     {
//       id: "2",
//       title: "Cupcake Giáng Sinh",
//       host: "Baker Thanh Hoa",
//       adminStatus: "Chờ duyệt",
//       participants: 0,
//       maxParticipants: 300,
//       startDate: "2024-12-20",
//       endDate: "2025-01-03",
//     },
//     {
//       id: "3",
//       title: "Bánh Macaron Pháp",
//       host: "Chef Marie",
//       adminStatus: "Đã duyệt",
//       participants: 156,
//       maxParticipants: 200,
//       startDate: "2024-12-25",
//       endDate: "2025-01-15",
//     },
//     {
//       id: "4",
//       title: "Bánh Mì Sourdough",
//       host: "Chef Hữu Quốc",
//       adminStatus: "Đã kết thúc",
//       participants: 98,
//       maxParticipants: 150,
//       startDate: "2024-11-01",
//       endDate: "2024-11-21",
//     },
//     {
//       id: "5",
//       title: "Bánh Flan Caramel",
//       host: "Chef Ngọc Lan",
//       adminStatus: "Đã kết thúc",
//       participants: 77,
//       maxParticipants: 100,
//       startDate: "2024-10-10",
//       endDate: "2024-10-20",
//     },
//   ];

//   // Tính tổng cho pie chart
//   const pieTotal = useMemo(
//     () => pieData.reduce((sum, d) => sum + d.value, 0),
//     [pieData]
//   );

//   // State cho filter
//   const [statusFilter, setStatusFilter] = useState("Tất cả");
//   const [showDateFilter, setShowDateFilter] = useState(false);
//   const [dateRange, setDateRange] = useState({
//     startDate: null,
//     endDate: null,
//   });
//   const filterRef = useRef(null);

//   // Bộ lọc trạng thái
//   const statusOptions = [
//     "Tất cả",
//     "Đang diễn ra",
//     "Chờ duyệt",
//     "Đã duyệt",
//     "Đã kết thúc",
//   ];

//   // Hàm parse date dd/mm/yyyy hoặc yyyy-mm-dd
//   function parseDate(str) {
//     if (!str) return null;
//     if (str.includes("/")) {
//       const [d, m, y] = str.split("/");
//       return new Date(`${y}-${m}-${d}`);
//     }
//     if (str.includes("-")) {
//       const [y, m, d] = str.split("-");
//       return new Date(`${y}-${m}-${d}`);
//     }
//     return new Date(str);
//   }

//   // Filter challenge
//   const filteredChallenges = allChallenges.filter((c) => {
//     const matchStatus =
//       statusFilter === "Tất cả" || c.adminStatus === statusFilter;
//     let matchDate = true;
//     if (dateRange.startDate && dateRange.endDate) {
//       matchDate =
//         parseDate(c.startDate) >= dateRange.startDate &&
//         parseDate(c.endDate) <= dateRange.endDate;
//     }
//     return matchStatus && matchDate;
//   });

//   // Đóng popup khi click ngoài
//   useEffect(() => {
//     function handleClickOutside(e) {
//       if (filterRef.current && !filterRef.current.contains(e.target)) {
//         setShowDateFilter(false);
//       }
//     }
//     if (showDateFilter) {
//       document.addEventListener("mousedown", handleClickOutside);
//     } else {
//       document.removeEventListener("mousedown", handleClickOutside);
//     }
//     return () => document.removeEventListener("mousedown", handleClickOutside);
//   }, [showDateFilter]);

//   return (
//     <div
//       style={{
//         padding: "0",
//         display: "flex",
//         flexDirection: "column",
//         gap: 32,
//       }}
//     >
//       {/* Card thống kê */}
//       <div
//         style={{
//           display: "grid",
//           gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
//           gap: "24px",
//         }}
//       >
//         {/* Card cũ giữ lại, thêm hiệu ứng đẹp hơn */}
//         <StatCard
//           label="Tổng Challenges"
//           value={stats.totalChallenges}
//           icon="🏆"
//           bg="#fce7f3"
//         />
//         <StatCard
//           label="Đang hoạt động"
//           value={stats.activeChallenges}
//           icon="✅"
//           bg="#a7f3d0"
//         />
//         <StatCard
//           label="Chờ duyệt"
//           value={stats.pendingChallenges}
//           icon="⚠️"
//           bg="#fde68a"
//         />
//         <StatCard
//           label="Tổng thành viên"
//           value={stats.totalParticipants}
//           icon="👥"
//           bg="#c7d2fe"
//         />
//       </div>

//       {/* Biểu đồ và bảng */}
//       <div
//         style={{
//           display: "grid",
//           gridTemplateColumns: "2fr 1fr",
//           gap: 32,
//           alignItems: "start",
//         }}
//       >
//         {/* Biểu đồ */}
//         <div
//           style={{
//             background: "white",
//             borderRadius: 16,
//             boxShadow: "0 2px 8px #0001",
//             padding: 32,
//           }}
//         >
//           <h3
//             style={{
//               fontWeight: 600,
//               fontSize: 20,
//               color: "#be185d",
//               marginBottom: 24,
//             }}
//           >
//             Thống kê số lượng Challenge theo tháng
//           </h3>
//           <div
//             style={{ display: "flex", alignItems: "end", height: 180, gap: 16 }}
//           >
//             {monthlyData.map((d, i) => (
//               <div
//                 key={d.month}
//                 style={{
//                   flex: 1,
//                   display: "flex",
//                   flexDirection: "column",
//                   alignItems: "center",
//                 }}
//               >
//                 <div
//                   style={{
//                     width: 32,
//                     height: d.value * 30,
//                     background:
//                       "linear-gradient(135deg, #fbc2eb 0%, #a6c1ee 100%)",
//                     borderRadius: 8,
//                     boxShadow: "0 2px 8px #0001",
//                     marginBottom: 8,
//                     transition: "height 0.3s",
//                   }}
//                   title={d.value + " challenge"}
//                 ></div>
//                 <span style={{ fontSize: 12, color: "#6b7280" }}>
//                   {d.month}
//                 </span>
//               </div>
//             ))}
//           </div>
//         </div>
//         {/* Biểu đồ tròn + bảng top */}
//         <div style={{ display: "flex", flexDirection: "column", gap: 32 }}>
//           <div
//             style={{
//               background: "white",
//               borderRadius: 16,
//               boxShadow: "0 2px 8px #0001",
//               padding: 24,
//               display: "flex",
//               flexDirection: "column",
//               alignItems: "center",
//             }}
//           >
//             <h4
//               style={{
//                 fontWeight: 600,
//                 fontSize: 16,
//                 color: "#be185d",
//                 marginBottom: 16,
//               }}
//             >
//               Tỉ lệ trạng thái Challenge
//             </h4>
//             <svg width={120} height={120} viewBox="0 0 120 120">
//               {(() => {
//                 let acc = 0;
//                 return pieData.map((d, i) => {
//                   const start = acc;
//                   const angle = (d.value / pieTotal) * 2 * Math.PI;
//                   acc += angle;
//                   const x1 = 60 + 50 * Math.sin(start);
//                   const y1 = 60 - 50 * Math.cos(start);
//                   const x2 = 60 + 50 * Math.sin(acc);
//                   const y2 = 60 - 50 * Math.cos(acc);
//                   const large = angle > Math.PI ? 1 : 0;
//                   return (
//                     <path
//                       key={d.label}
//                       d={`M60,60 L${x1},${y1} A50,50 0 ${large} 1 ${x2},${y2} Z`}
//                       fill={d.color}
//                       stroke="#fff"
//                       strokeWidth={2}
//                     />
//                   );
//                 });
//               })()}
//             </svg>
//             <div
//               style={{
//                 display: "flex",
//                 flexDirection: "column",
//                 gap: 4,
//                 marginTop: 12,
//               }}
//             >
//               {pieData.map((d) => (
//                 <div
//                   key={d.label}
//                   style={{
//                     display: "flex",
//                     alignItems: "center",
//                     gap: 8,
//                     fontSize: 14,
//                   }}
//                 >
//                   <span
//                     style={{
//                       width: 14,
//                       height: 14,
//                       background: d.color,
//                       borderRadius: 3,
//                       display: "inline-block",
//                     }}
//                   ></span>
//                   <span>{d.label}</span>
//                   <span style={{ color: "#6b7280" }}>{d.value}</span>
//                 </div>
//               ))}
//             </div>
//           </div>
//           <div
//             style={{
//               background: "white",
//               borderRadius: 16,
//               boxShadow: "0 2px 8px #0001",
//               padding: 24,
//             }}
//           >
//             <h4
//               style={{
//                 fontWeight: 600,
//                 fontSize: 16,
//                 color: "#be185d",
//                 marginBottom: 16,
//               }}
//             >
//               Top 5 Challenge nhiều người tham gia
//             </h4>
//             <table style={{ width: "100%", borderCollapse: "collapse" }}>
//               <thead>
//                 <tr style={{ color: "#be185d", fontWeight: 600, fontSize: 14 }}>
//                   <th style={{ textAlign: "left", padding: 8 }}>
//                     Tên Challenge
//                   </th>
//                   <th style={{ textAlign: "right", padding: 8 }}>Thành viên</th>
//                 </tr>
//               </thead>
//               <tbody>
//                 {topChallenges.map((c, i) => (
//                   <tr
//                     key={c.name}
//                     style={{ background: i % 2 === 0 ? "#fdf2f8" : "#fff" }}
//                   >
//                     <td style={{ padding: 8, borderRadius: 6 }}>{c.name}</td>
//                     <td
//                       style={{
//                         padding: 8,
//                         textAlign: "right",
//                         fontWeight: 500,
//                       }}
//                     >
//                       {c.participants}
//                     </td>
//                   </tr>
//                 ))}
//               </tbody>
//             </table>
//           </div>
//         </div>
//       </div>

//       {/* Bảng quản lý tất cả challenge */}
//       <div
//         style={{
//           background: "white",
//           borderRadius: 16,
//           boxShadow: "0 2px 8px #0001",
//           padding: 32,
//           marginTop: 32,
//         }}
//       >
//         <h3
//           style={{
//             fontWeight: 600,
//             fontSize: 20,
//             color: "#be185d",
//             marginBottom: 24,
//           }}
//         >
//           Tất cả Challenge trong hệ thống
//         </h3>
//         {/* Filter bar */}
//         <div
//           style={{
//             display: "flex",
//             gap: 16,
//             alignItems: "center",
//             marginBottom: 24,
//             flexWrap: "wrap",
//           }}
//         >
//           <select
//             value={statusFilter}
//             onChange={(e) => setStatusFilter(e.target.value)}
//             style={{
//               padding: "8px 16px",
//               borderRadius: 8,
//               border: "1px solid #e5e7eb",
//               background: "#fdf2f8",
//               color: "#be185d",
//               fontWeight: 500,
//               fontSize: 15,
//               outline: "none",
//               boxShadow: "0 1px 4px #0001",
//               cursor: "pointer",
//             }}
//           >
//             {statusOptions.map((opt) => (
//               <option key={opt} value={opt}>
//                 {opt}
//               </option>
//             ))}
//           </select>
//           <div style={{ position: "relative" }} ref={filterRef}>
//             <button
//               style={{
//                 padding: "8px 16px",
//                 borderRadius: 8,
//                 border: "1px solid #e5e7eb",
//                 background: "#fdf2f8",
//                 color: "#be185d",
//                 fontWeight: 500,
//                 fontSize: 15,
//                 outline: "none",
//                 boxShadow: "0 1px 4px #0001",
//                 cursor: "pointer",
//               }}
//               onClick={() => setShowDateFilter((v) => !v)}
//             >
//               {dateRange.startDate && dateRange.endDate
//                 ? `${dateRange.startDate.toLocaleDateString()} - ${dateRange.endDate.toLocaleDateString()}`
//                 : "Lọc theo thời gian"}
//             </button>
//             {showDateFilter && (
//               <div
//                 style={{
//                   position: "absolute",
//                   zIndex: 10,
//                   top: 48,
//                   left: 0,
//                   background: "white",
//                   border: "1px solid #e5e7eb",
//                   borderRadius: 12,
//                   boxShadow: "0 2px 8px #0002",
//                   padding: 16,
//                 }}
//               >
//                 <label
//                   style={{
//                     display: "block",
//                     marginBottom: 8,
//                     color: "#be185d",
//                     fontWeight: 600,
//                   }}
//                 >
//                   Từ ngày
//                 </label>
//                 <input
//                   type="date"
//                   value={
//                     dateRange.startDate
//                       ? dateRange.startDate.toISOString().slice(0, 10)
//                       : ""
//                   }
//                   onChange={(e) =>
//                     setDateRange((r) => ({
//                       ...r,
//                       startDate: e.target.value
//                         ? new Date(e.target.value)
//                         : null,
//                     }))
//                   }
//                   style={{
//                     padding: 8,
//                     borderRadius: 6,
//                     border: "1px solid #e5e7eb",
//                     marginBottom: 12,
//                     width: 180,
//                   }}
//                 />
//                 <label
//                   style={{
//                     display: "block",
//                     marginBottom: 8,
//                     color: "#be185d",
//                     fontWeight: 600,
//                   }}
//                 >
//                   Đến ngày
//                 </label>
//                 <input
//                   type="date"
//                   value={
//                     dateRange.endDate
//                       ? dateRange.endDate.toISOString().slice(0, 10)
//                       : ""
//                   }
//                   onChange={(e) =>
//                     setDateRange((r) => ({
//                       ...r,
//                       endDate: e.target.value ? new Date(e.target.value) : null,
//                     }))
//                   }
//                   style={{
//                     padding: 8,
//                     borderRadius: 6,
//                     border: "1px solid #e5e7eb",
//                     marginBottom: 12,
//                     width: 180,
//                   }}
//                 />
//                 <div
//                   style={{
//                     display: "flex",
//                     gap: 8,
//                     justifyContent: "flex-end",
//                   }}
//                 >
//                   <button
//                     style={{
//                       padding: "6px 14px",
//                       borderRadius: 6,
//                       background: "#f3f4f6",
//                       color: "#be185d",
//                       border: "none",
//                       fontWeight: 500,
//                       cursor: "pointer",
//                     }}
//                     onClick={() => {
//                       setDateRange({ startDate: null, endDate: null });
//                       setShowDateFilter(false);
//                     }}
//                   >
//                     Xóa
//                   </button>
//                   <button
//                     style={{
//                       padding: "6px 14px",
//                       borderRadius: 6,
//                       background: "#fbcfe8",
//                       color: "#be185d",
//                       border: "none",
//                       fontWeight: 500,
//                       cursor: "pointer",
//                     }}
//                     onClick={() => setShowDateFilter(false)}
//                   >
//                     Áp dụng
//                   </button>
//                 </div>
//               </div>
//             )}
//           </div>
//         </div>
//         <table
//           style={{
//             width: "100%",
//             borderCollapse: "separate",
//             borderSpacing: 0,
//           }}
//         >
//           <thead>
//             <tr style={{ color: "#be185d", fontWeight: 600, fontSize: 15 }}>
//               <th style={{ textAlign: "left", padding: 12 }}>Tên Challenge</th>
//               <th style={{ textAlign: "left", padding: 12 }}>Host</th>
//               <th style={{ textAlign: "center", padding: 12 }}>Trạng thái</th>
//               <th style={{ textAlign: "center", padding: 12 }}>Thành viên</th>
//               <th style={{ textAlign: "center", padding: 12 }}>Thời gian</th>
//               <th style={{ textAlign: "center", padding: 12 }}></th>
//             </tr>
//           </thead>
//           <tbody>
//             {filteredChallenges.map((c, i) => (
//               <tr
//                 key={c.id}
//                 style={{
//                   background: i % 2 === 0 ? "#fdf2f8" : "#fff",
//                   borderRadius: 12,
//                 }}
//               >
//                 <td style={{ padding: 12, fontWeight: 500 }}>{c.title}</td>
//                 <td style={{ padding: 12 }}>{c.host}</td>
//                 <td style={{ padding: 12, textAlign: "center" }}>
//                   <span
//                     style={{
//                       background:
//                         c.adminStatus === "Đang diễn ra"
//                           ? "#a7f3d0"
//                           : c.adminStatus === "Chờ duyệt"
//                           ? "#fde68a"
//                           : c.adminStatus === "Đã duyệt"
//                           ? "#fbcfe8"
//                           : "#c7d2fe",
//                       color: "#374151",
//                       borderRadius: 8,
//                       padding: "4px 12px",
//                       fontWeight: 600,
//                       fontSize: 13,
//                     }}
//                   >
//                     {c.adminStatus}
//                   </span>
//                 </td>
//                 <td style={{ padding: 12, textAlign: "center" }}>
//                   {c.participants} / {c.maxParticipants}
//                 </td>
//                 <td style={{ padding: 12, textAlign: "center" }}>
//                   {c.startDate} - {c.endDate}
//                 </td>
//                 <td style={{ padding: 12, textAlign: "center" }}>
//                   <button
//                     style={{
//                       background: "#fbcfe8",
//                       color: "#be185d",
//                       border: "none",
//                       borderRadius: 8,
//                       padding: "6px 16px",
//                       fontWeight: 600,
//                       fontSize: 14,
//                       cursor: "pointer",
//                       boxShadow: "0 1px 4px #0001",
//                       transition: "background 0.2s",
//                     }}
//                     onMouseEnter={(e) =>
//                       (e.currentTarget.style.background = "#f472b6")
//                     }
//                     onMouseLeave={(e) =>
//                       (e.currentTarget.style.background = "#fbcfe8")
//                     }
//                   >
//                     Xem
//                   </button>
//                 </td>
//               </tr>
//             ))}
//           </tbody>
//         </table>
//       </div>
//     </div>
//   );
// }

// // Card thống kê đẹp
// function StatCard({ label, value, icon, bg }) {
//   return (
//     <div
//       style={{
//         background: "white",
//         border: "1px solid #e5e7eb",
//         borderRadius: "16px",
//         boxShadow: "0 2px 8px #0001",
//         overflow: "hidden",
//         transition: "transform 0.2s, box-shadow 0.2s",
//         padding: 24,
//         display: "flex",
//         alignItems: "center",
//         gap: 16,
//         cursor: "pointer",
//       }}
//       onMouseEnter={(e) => {
//         e.currentTarget.style.transform = "translateY(-4px) scale(1.03)";
//         e.currentTarget.style.boxShadow = "0 6px 16px #0002";
//       }}
//       onMouseLeave={(e) => {
//         e.currentTarget.style.transform = "none";
//         e.currentTarget.style.boxShadow = "0 2px 8px #0001";
//       }}
//     >
//       <div
//         style={{
//           width: 54,
//           height: 54,
//           background: bg,
//           borderRadius: 12,
//           display: "flex",
//           alignItems: "center",
//           justifyContent: "center",
//           fontSize: 28,
//         }}
//       >
//         {icon}
//       </div>
//       <div>
//         <div style={{ fontSize: 14, color: "#6b7280", marginBottom: 4 }}>
//           {label}
//         </div>
//         <div style={{ fontSize: 28, fontWeight: 700, color: "#be185d" }}>
//           {value}
//         </div>
//       </div>
//     </div>
//   );
// }
