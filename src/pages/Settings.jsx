import ChangePassword from "../components/ChangePassword";

const Settings = () => {
  return (
    <div className="max-w-2xl mx-auto bg-white p-8 rounded-xl shadow mt-8 space-y-8">
      <h1 className="text-3xl font-bold mb-6 text-center">Cài đặt</h1>
      {/* Thông tin tài khoản */}
      <section className="mb-6">
        <h2 className="text-xl font-semibold mb-2">Thông tin tài khoản</h2>
        <div className="bg-pink-50 p-4 rounded-lg">
          <div className="mb-2">
            <b>Tên:</b> Nguyễn Văn A
          </div>
          <div className="mb-2">
            <b>Email:</b> nguyenvana@email.com
          </div>
          <div className="mb-2">
            <b>Username:</b> nguyenvana
          </div>
        </div>
      </section>
      {/* Đổi mật khẩu */}
      <section className="mb-6">
        <h2 className="text-xl font-semibold mb-2">Đổi mật khẩu</h2>
        <ChangePassword />
      </section>
      {/* Tuỳ chọn theme */}
      <section className="mb-6">
        <h2 className="text-xl font-semibold mb-2">Chế độ giao diện</h2>
        <div className="bg-pink-50 p-4 rounded-lg flex items-center space-x-4">
          <span>Chọn chế độ:</span>
          <button className="bg-gray-200 px-4 py-2 rounded hover:bg-gray-300">
            Sáng
          </button>
          <button className="bg-gray-800 text-white px-4 py-2 rounded hover:bg-gray-700">
            Tối
          </button>
        </div>
      </section>
      {/* Báo cáo */}
      <section>
        <h2 className="text-xl font-semibold mb-2">Báo cáo sự cố</h2>
        <div className="bg-pink-50 p-4 rounded-lg">
          <div className="mb-2">
            Nếu bạn gặp sự cố, vui lòng gửi báo cáo cho chúng tôi.
          </div>
          <button className="bg-pink-500 text-white px-4 py-2 rounded hover:bg-pink-600">
            Gửi báo cáo
          </button>
        </div>
      </section>
    </div>
  );
};

export default Settings;
