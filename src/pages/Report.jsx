const fakeReports = [
  {
    id: 1,
    title: "Không đăng nhập được",
    status: "Đã xử lý",
    date: "2024-05-01",
  },
  {
    id: 2,
    title: "Lỗi giao diện trên mobile",
    status: "Đang xử lý",
    date: "2024-05-03",
  },
  {
    id: 3,
    title: "Không nhận được email xác thực",
    status: "Chờ phản hồi",
    date: "2024-05-05",
  },
];

const Report = () => {
  return (
    <div className="max-w-2xl mx-auto bg-white p-8 rounded-xl shadow mt-8">
      <h1 className="text-3xl font-bold mb-6 text-center">Báo cáo sự cố</h1>
      <table className="w-full text-left border border-pink-100 rounded-lg overflow-hidden">
        <thead className="bg-pink-100">
          <tr>
            <th className="py-2 px-4">Tiêu đề</th>
            <th className="py-2 px-4">Trạng thái</th>
            <th className="py-2 px-4">Ngày gửi</th>
          </tr>
        </thead>
        <tbody>
          {fakeReports.map((r) => (
            <tr key={r.id} className="border-t">
              <td className="py-2 px-4">{r.title}</td>
              <td className="py-2 px-4">{r.status}</td>
              <td className="py-2 px-4">{r.date}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default Report;
