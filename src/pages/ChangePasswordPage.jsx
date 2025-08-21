import ChangePassword from "../components/ChangePassword";

const ChangePasswordPage = () => {
  return (
    <div className="max-w-2xl mx-auto bg-white p-8 rounded-xl shadow mt-8 space-y-8">
      <h1 className="text-3xl font-bold mb-6 text-center">Đổi mật khẩu</h1>
      <p className="text-gray-600 text-sm text-center mb-4">
        Vui lòng nhập mật khẩu hiện tại và mật khẩu mới của bạn để tiếp tục.
      </p>
      <ChangePassword />
    </div>
  );
};

export default ChangePasswordPage;
