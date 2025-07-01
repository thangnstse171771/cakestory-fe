import { useState } from "react";
import { Camera, ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { authAPI } from "../api/auth";
import React from "react";

export default function EditProfile() {
  const { user } = useAuth();
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
  const navigate = useNavigate();

  // Fetch user data from API on mount
  React.useEffect(() => {
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
      } catch (e) {
        // handle error
      } finally {
        setFetching(false);
      }
    };
    fetchData();
  }, [user]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setAvatarFile(file);
      const reader = new FileReader();
      reader.onloadend = () => setPreview(reader.result);
      reader.readAsDataURL(file);
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!user) return;
    setLoading(true);
    try {
      let avatarUrl = form.profilePic;
      if (avatarFile) {
        avatarUrl = await authAPI.uploadAvatarToFirebase(avatarFile, user.id);
      }
      await authAPI.updateUserById(user.id, {
        email: form.email,
        full_name: form.name,
        address: form.location,
        phone_number: form.phone,
        avatar: avatarUrl,
        is_Baker: true, // hoặc lấy từ form nếu có checkbox
      });
      alert("Profile updated!");
      navigate(-1);
    } catch (err) {
      alert("Cập nhật thất bại!");
    } finally {
      setLoading(false);
    }
  };

  if (fetching) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        Loading...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-pink-50 flex flex-col items-center py-10 px-4">
      <div className="w-full max-w-xl bg-white rounded-2xl shadow-lg border border-pink-100 p-8 relative">
        <button
          className="absolute left-6 top-6 text-pink-400 hover:text-pink-600"
          onClick={() => navigate(-1)}
        >
          <ArrowLeft className="w-6 h-6" />
        </button>
        <h2 className="text-3xl font-bold text-center text-pink-500 mb-8">
          Edit Profile
        </h2>
        <form onSubmit={handleSave} className="space-y-6">
          <div className="flex flex-col items-center mb-6">
            <div className="relative">
              <img
                src={preview}
                alt="Profile Preview"
                className="w-32 h-32 rounded-full object-cover border-4 border-pink-200"
              />
              <label className="absolute bottom-0 right-0 bg-pink-400 text-white p-2 rounded-full cursor-pointer hover:bg-pink-500 transition-colors shadow-lg">
                <Camera className="w-5 h-5" />
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleImageChange}
                />
              </label>
            </div>
          </div>
          <div className="grid grid-cols-1 gap-4">
            <div>
              <label className="block text-pink-500 font-semibold mb-1">
                Name
              </label>
              <input
                type="text"
                name="name"
                value={form.name}
                onChange={handleChange}
                className="w-full border border-pink-200 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-pink-300"
                required
              />
            </div>
            <div>
              <label className="block text-pink-500 font-semibold mb-1">
                Username
              </label>
              <input
                type="text"
                name="username"
                value={form.username}
                onChange={handleChange}
                className="w-full border border-pink-200 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-pink-300"
                required
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
                onChange={handleChange}
                className="w-full border border-pink-200 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-pink-300"
                required
              />
            </div>
            <div>
              <label className="block text-pink-500 font-semibold mb-1">
                Phone
              </label>
              <input
                type="text"
                name="phone"
                value={form.phone}
                onChange={handleChange}
                className="w-full border border-pink-200 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-pink-300"
              />
            </div>
            <div>
              <label className="block text-pink-500 font-semibold mb-1">
                Website
              </label>
              <input
                type="text"
                name="website"
                value={form.website}
                onChange={handleChange}
                className="w-full border border-pink-200 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-pink-300"
              />
            </div>
            <div>
              <label className="block text-pink-500 font-semibold mb-1">
                Location
              </label>
              <input
                type="text"
                name="location"
                value={form.location}
                onChange={handleChange}
                className="w-full border border-pink-200 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-pink-300"
              />
            </div>
            <div>
              <label className="block text-pink-500 font-semibold mb-1">
                Bio
              </label>
              <textarea
                name="bio"
                value={form.bio}
                onChange={handleChange}
                rows={3}
                className="w-full border border-pink-200 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-pink-300"
              />
            </div>
          </div>
          <div className="flex justify-end space-x-4 mt-8">
            <button
              type="button"
              className="px-6 py-2 rounded-lg border border-pink-300 text-pink-400 font-semibold hover:bg-pink-50 transition-colors"
              onClick={() => navigate(-1)}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-2 rounded-lg bg-pink-400 text-white font-semibold hover:bg-pink-500 transition-colors shadow-md"
              disabled={loading}
            >
              {loading ? "Saving..." : "Save"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
