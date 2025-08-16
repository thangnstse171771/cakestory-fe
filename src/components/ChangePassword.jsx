import { useState } from "react";
import { useAuth } from "../contexts/AuthContext";

const ChangePassword = () => {
  const { user } = useAuth();
  const [form, setForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmNewPassword: "",
  });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setError("");
    setSuccess("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    if (
      !form.currentPassword ||
      !form.newPassword ||
      !form.confirmNewPassword
    ) {
      setError("Vui lòng nhập đầy đủ thông tin.");
      return;
    }
    if (form.newPassword.length < 8) {
      setError("Mật khẩu mới phải có ít nhất 8 ký tự.");
      return;
    }
    if (form.newPassword !== form.confirmNewPassword) {
      setError("Xác nhận mật khẩu không khớp.");
      return;
    }
    setLoading(true);
    try {
      const { changePassword } = await import("../api/auth").then(
        (m) => m.authAPI
      );
      await changePassword({
        currentPassword: form.currentPassword,
        newPassword: form.newPassword,
      });
      setSuccess("Đổi mật khẩu thành công!");
      setForm({ currentPassword: "", newPassword: "", confirmNewPassword: "" });
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Đổi mật khẩu thất bại. Vui lòng thử lại."
      );
    } finally {
      setLoading(false);
    }
  };

  if (!user) return null;

  return (
    <div className="max-w-md mx-auto bg-white p-8 rounded-xl shadow mt-8">
      <h2 className="text-2xl font-bold mb-4 text-center">Đổi mật khẩu</h2>
      {error && (
        <div className="mb-3 p-2 bg-red-100 text-red-700 rounded">{error}</div>
      )}
      {success && (
        <div className="mb-3 p-2 bg-green-100 text-green-700 rounded">
          {success}
        </div>
      )}
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1">
            Mật khẩu hiện tại
          </label>
          <input
            type="password"
            name="currentPassword"
            value={form.currentPassword}
            onChange={handleChange}
            className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-pink-500"
            placeholder="Nhập mật khẩu hiện tại"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Mật khẩu mới</label>
          <input
            type="password"
            name="newPassword"
            value={form.newPassword}
            onChange={handleChange}
            className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-pink-500"
            placeholder="Nhập mật khẩu mới"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">
            Xác nhận mật khẩu mới
          </label>
          <input
            type="password"
            name="confirmNewPassword"
            value={form.confirmNewPassword}
            onChange={handleChange}
            className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-pink-500"
            placeholder="Nhập lại mật khẩu mới"
            required
          />
        </div>
        <button
          type="submit"
          className="w-full bg-pink-500 text-white py-2 rounded-lg font-semibold hover:bg-pink-600 transition"
          disabled={loading}
        >
          {loading ? "Đang đổi mật khẩu..." : "Đổi mật khẩu"}
        </button>
      </form>
    </div>
  );
};

export default ChangePassword;
