import { useState, useEffect } from "react";
import {
  Camera,
  ArrowLeft,
  X,
  Loader2,
  Trash2,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { authAPI } from "../api/auth";
import React from "react";
import { toast } from "react-toastify";

export default function EditProfile() {
  const { user, refreshUser, setUser } = useAuth();
  const [form, setForm] = useState({
    name: "",
    username: "",
    email: "",
    phone: "",
    location: "",
    profilePic: "",
  });
  const [preview, setPreview] = useState("");
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [avatarFile, setAvatarFile] = useState(null);
  const [removeAvatar, setRemoveAvatar] = useState(false);
  const [touched, setTouched] = useState({});
  const [errors, setErrors] = useState({});

  // Validation logic
  const validate = (values) => {
    const e = {};
    const name = values.name?.trim();
    const username = values.username?.trim();
    const email = values.email?.trim();
    const phone = values.phone?.trim();
    if (!name) e.name = "Họ tên bắt buộc";
    else if (name.length < 2) e.name = "Tối thiểu 2 ký tự";
    if (!username) e.username = "Username bắt buộc";
    else if (!/^[a-zA-Z0-9_\.]{3,20}$/.test(username))
      e.username = "3-20 ký tự, chữ/số/_/.";
    if (!email) e.email = "Email bắt buộc";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
      e.email = "Email không hợp lệ";
    if (phone) {
      if (!/^0\d{9}$/.test(phone)) e.phone = "SĐT phải 10 số và bắt đầu bằng 0";
    }
    return e;
  };
  const navigate = useNavigate();

  // Fetch user data from API on mount
  useEffect(() => {
    const fetchData = async () => {
      if (!user) return;
      setFetching(true);
      try {
        const data = await authAPI.getUserById(user.id);
        const u = data.user;
        setForm({
          name: u.full_name || "",
          username: u.username || "",
          email: u.email || "",
          phone: u.phone_number || "",
          location: u.address || "",
          profilePic: u.avatar || "",
        });
        setPreview(u.avatar || "");
        setRemoveAvatar(false);
      } catch (e) {
        // handle error
      } finally {
        setFetching(false);
      }
    };
    fetchData();
  }, [user]);

  // Re-validate whenever form changes
  useEffect(() => {
    setErrors(validate(form));
  }, [form]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleBlur = (e) => {
    const { name } = e.target;
    setTouched((prev) => ({ ...prev, [name]: true }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setAvatarFile(file);
      const reader = new FileReader();
      reader.onloadend = () => setPreview(reader.result);
      reader.readAsDataURL(file);
      setRemoveAvatar(false);
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!user) return;
    // Final validation
    const finalErrors = validate(form);
    setErrors(finalErrors);
    setTouched({
      name: true,
      // username & email không cần touch vì không chỉnh sửa
      phone: true,
      location: true,
    });
    if (Object.keys(finalErrors).length > 0) {
      toast.warn("Vui lòng sửa lỗi trước khi lưu");
      return;
    }
    setLoading(true);
    try {
      let avatarUrl = form.profilePic;
      if (avatarFile) {
        avatarUrl = await authAPI.uploadAvatarToFirebase(avatarFile, user.id);
      } else if (removeAvatar) {
        avatarUrl = null;
      }
      // Build payload, convert empty strings to null
      const payload = {
        email: form.email.trim() || null,
        full_name: form.name.trim() || null,
        address: form.location.trim() === "" ? null : form.location.trim(),
        phone_number: form.phone.trim() === "" ? null : form.phone.trim(),
        avatar: avatarUrl === "" ? null : avatarUrl,
      };
      await authAPI.updateUserById(user.id, payload);
      // Refresh context user to reflect new phone/address immediately
      const updatedData = await authAPI.getUserById(user.id);
      const fresh = updatedData.user || updatedData;
      if (fresh) {
        localStorage.setItem("user", JSON.stringify(fresh));
        if (setUser) setUser(fresh); // fallback if refreshUser not used
      } else if (refreshUser) {
        await refreshUser();
      }
      toast.success("Cập nhật thành công");
      setTimeout(() => navigate(-1), 600);
    } catch (err) {
      toast.error("Cập nhật thất bại");
    } finally {
      setLoading(false);
    }
  };

  if (fetching) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-pink-50">
        <div className="flex items-center gap-3 text-pink-600">
          <Loader2 className="w-6 h-6 animate-spin" /> Đang tải hồ sơ...
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-white to-rose-50 flex flex-col items-center py-10 px-4 lg:px-10">
      <div className="w-full max-w-5xl bg-white/95 backdrop-blur-sm rounded-3xl shadow-xl border border-pink-100 p-8 lg:p-12 relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none opacity-[0.04] bg-[radial-gradient(circle_at_20%_20%,#ec4899,transparent_60%)]" />
        <button
          className="absolute left-6 top-6 text-pink-400 hover:text-pink-600 z-10"
          onClick={() => navigate(-1)}
        >
          <ArrowLeft className="w-6 h-6" />
        </button>
        <h2 className="text-4xl font-extrabold text-center bg-clip-text text-transparent bg-gradient-to-r from-pink-500 via-rose-500 to-fuchsia-500 mb-12 z-10 tracking-tight">
          Chỉnh Sửa Hồ Sơ
        </h2>
        <form onSubmit={handleSave} className="space-y-8 relative z-10">
          <div className="flex flex-col xl:flex-row items-center xl:items-start gap-10 mb-2">
            <div className="relative group shrink-0">
              <div className="mb-4 text-center xl:text-left">
                <div className="flex items-center gap-2 justify-center xl:justify-start text-pink-600 font-semibold tracking-wide text-lg">
                  <span>Ảnh hồ sơ</span>
                </div>
              </div>
              <div className="w-56 h-56 rounded-2xl ring-4 ring-pink-100 overflow-hidden bg-gradient-to-br from-pink-100 to-rose-200 flex items-center justify-center shadow-inner">
                {preview ? (
                  <img
                    src={preview}
                    alt="Avatar"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                  />
                ) : (
                  <div className="text-8xl">👤</div>
                )}
              </div>

              <div className="flex gap-2 mt-3">
                <label className="flex-1 cursor-pointer flex items-center justify-center gap-2 px-3 py-2 rounded-md bg-pink-500 text-white tex</div>t-sm hover:bg-pink-600 transition-colors shadow">
                  <Camera className="w-4 h-4" /> Ảnh
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleImageChange}
                  />
                </label>
                {preview && !removeAvatar && (
                  <button
                    type="button"
                    onClick={() => {
                      setRemoveAvatar(true);
                      setPreview("");
                      setAvatarFile(null);
                    }}
                    className="px-3 py-2 rounded-md bg-white border text-pink-500 hover:bg-pink-50 text-sm flex items-center gap-1 shadow"
                  >
                    <Trash2 className="w-4 h-4" /> Xóa
                  </button>
                )}
              </div>
            </div>
            <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-8 w-full">
              <div className="md:col-span-2">
                <label className="block text-pink-500 font-semibold mb-1">
                  Họ và tên
                </label>
                <input
                  type="text"
                  name="name"
                  value={form.name}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  className={`w-full border rounded-lg px-5 py-3 focus:outline-none focus:ring-2 text-base transition-shadow font-medium ${
                    touched.name && errors.name
                      ? "border-red-400 focus:ring-red-300"
                      : "border-pink-200 focus:ring-pink-300"
                  }`}
                  required
                />
                {touched.name && errors.name && (
                  <p className="mt-1 text-xs text-red-500 flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" /> {errors.name}
                  </p>
                )}
              </div>
              <div>
                <label className="block text-pink-500 font-semibold mb-1">
                  Tên người dùng
                </label>
                <input
                  type="text"
                  name="username"
                  value={form.username}
                  readOnly
                  disabled
                  className="w-full border rounded-lg px-5 py-3 text-base bg-gray-50 text-gray-500 cursor-not-allowed border-gray-200"
                />
              </div>
              <div>
                <label className="block text-pink-500 font-semibold mb-1">
                  Email
                </label>
                <input
                  type="email"
                  name="email"
                  value={form.email}
                  readOnly
                  disabled
                  className="w-full border rounded-lg px-5 py-3 text-base bg-gray-50 text-gray-500 cursor-not-allowed border-gray-200"
                />
              </div>
              <div>
                <label className="block text-pink-500 font-semibold mb-1">
                  Số điện thoại
                </label>
                <input
                  type="text"
                  name="phone"
                  value={form.phone}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  placeholder="Ví dụ: 0901234567"
                  className={`w-full border rounded-lg px-5 py-3 focus:outline-none focus:ring-2 text-base transition-shadow ${
                    touched.phone && errors.phone
                      ? "border-red-400 focus:ring-red-300"
                      : "border-pink-200 focus:ring-pink-300"
                  }`}
                />
                {touched.phone && errors.phone && (
                  <p className="mt-1 text-xs text-red-500 flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" /> {errors.phone}
                  </p>
                )}
                {!errors.phone && form.phone && touched.phone && (
                  <p className="mt-1 text-xs text-green-600 flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3" /> Hợp lệ
                  </p>
                )}
              </div>

              <div className="md:col-span-2">
                <label className="block text-pink-500 font-semibold mb-1">
                  Địa chỉ
                </label>
                <input
                  type="text"
                  name="location"
                  value={form.location}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  placeholder="(Tuỳ chọn)"
                  className="w-full border border-pink-200 rounded-lg px-5 py-3 focus:outline-none focus:ring-2 focus:ring-pink-300 text-base"
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-pink-500 font-semibold mb-1">
                  Giới thiệu bản thân
                </label>
                <textarea
                  name="bio"
                  value={form.bio}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  rows={4}
                  placeholder="Chia sẻ đôi chút về bạn... (không bắt buộc)"
                  className="w-full border border-pink-200 rounded-lg px-5 py-3 focus:outline-none focus:ring-2 focus:ring-pink-300 resize-y min-h-[140px] text-base"
                />
              </div>
            </div>
          </div>
          <div className="flex flex-col md:flex-row justify-end md:items-center gap-5 pt-6 border-t border-pink-100">
            <button
              type="button"
              className="px-6 py-2 rounded-lg border border-pink-300 text-pink-500 font-medium hover:bg-pink-50 transition-colors flex items-center gap-2"
              onClick={() => navigate(-1)}
              disabled={loading}
            >
              <X className="w-4 h-4" /> Hủy
            </button>
            <button
              type="submit"
              className="px-6 py-2 rounded-lg bg-gradient-to-r from-pink-500 to-rose-500 text-white font-semibold hover:from-pink-600 hover:to-rose-600 transition-colors shadow-md flex items-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
              disabled={loading || Object.keys(errors).length > 0}
            >
              {loading && <Loader2 className="w-4 h-4 animate-spin" />}
              {loading ? "Đang lưu..." : "Lưu thay đổi"}
            </button>
          </div>
          {Object.keys(errors).length > 0 && (
            <div className="text-xs text-red-500 flex flex-wrap gap-x-4 gap-y-1 border border-red-200 bg-red-50 rounded-md p-3 mt-2">
              {Object.values(errors).map((m, i) => (
                <span key={i}>{m}</span>
              ))}
            </div>
          )}
        </form>
      </div>
    </div>
  );
}
