import React, { useEffect, useState } from "react";
import axios from "axios";
import { X } from "lucide-react";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const UserModal = ({ isOpen, onClose, onSuccess, user }) => {
  const isEdit = Boolean(user);
  const [roles, setRoles] = useState([]);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    role: "",
    avatar: "",
  });

  // 🔹 Load danh sách vai trò
  useEffect(() => {
    if (isOpen) {
      axios
        .get("http://localhost:2095/api/roles")
        .then((res) => setRoles(res.data.roles))
        .catch((err) => console.error("Lỗi tải roles:", err));
    }
  }, [isOpen]);

  // 🔹 Gán dữ liệu khi chỉnh sửa
  useEffect(() => {
    if (isEdit && user) {
      setFormData({
        name: user.name || "",
        email: user.email || "",
        password: "",
        role: user.role?._id || "",
        avatar: user.avatar || "",
      });
    } else {
      setFormData({
        name: "",
        email: "",
        password: "",
        role: "",
        avatar: "",
      });
    }
  }, [user, isEdit]);

  if (!isOpen) return null;

  // 🔹 Xử lý thay đổi input
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // 🔹 Submit
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (
      !formData.name ||
      !formData.role ||
      (!isEdit && (!formData.email || !formData.password))
    ) {
      toast.warn("Vui lòng nhập đầy đủ thông tin!", { theme: "light" });
      return;
    }

    try {
      if (isEdit) {
        await axios.put(`http://localhost:2095/api/users/${user._id}`, {
          name: formData.name,
          avatar: formData.avatar,
          role: formData.role,
        });
        toast.success("Cập nhật người dùng thành công!", { theme: "light" });
      } else {
        await axios.post("http://localhost:2095/api/users/create", formData);
        toast.success("Thêm người dùng thành công!", { theme: "light" });
      }

      setTimeout(() => {
        onClose();
        if (onSuccess) onSuccess();
      }, 1000);
    } catch (err) {
      console.error("Lỗi khi lưu người dùng:", err);
      toast.error("Thao tác thất bại!", { theme: "light" });
    }
  };

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex justify-center items-center z-50 animate-fade-in">
      <div className="relative bg-white text-gray-800 rounded-2xl shadow-xl w-[480px] overflow-hidden">
        {/* Thanh tiêu đề gradient */}
        <div
          className={`h-15 flex items-center justify-center font-semibold text-lg text-white
            ${
              isEdit
                ? "bg-gradient-to-r from-yellow-400 to-amber-500"
                : "bg-gradient-to-r from-green-400 to-emerald-600"
            }`}
        >
          {isEdit ? " Chỉnh sửa người dùng" : " Thêm người dùng"}
        </div>

        {/* Nút đóng */}
        <button
          onClick={onClose}
          className="absolute top-3 right-3 text-gray-600 hover:text-red-500 transition"
        >
          <X size={22} />
        </button>

        {/* Form nội dung */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {/* Họ tên */}
          <div>
            <label className="block text-sm font-medium mb-1">Họ và tên</label>
            <input
              name="name"
              onChange={handleChange}
              value={formData.name}
              type="text"
              placeholder="Nhập họ và tên..."
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-green-400 outline-none"
            />
          </div>

          {/* Email */}
          <div>
            <label className="block text-sm font-medium mb-1">Email</label>
            <input
              name="email"
              onChange={handleChange}
              value={formData.email}
              type="email"
              placeholder="Nhập email..."
              disabled={isEdit}
              className={`w-full px-4 py-2 border rounded-lg outline-none ${
                isEdit
                  ? "bg-gray-100 text-gray-500 cursor-not-allowed"
                  : "focus:ring-2 focus:ring-green-400"
              }`}
            />
          </div>

          {/* Mật khẩu (chỉ khi thêm) */}
          {!isEdit && (
            <div>
              <label className="block text-sm font-medium mb-1">Mật khẩu</label>
              <input
                name="password"
                onChange={handleChange}
                value={formData.password}
                type="password"
                placeholder="Nhập mật khẩu..."
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-green-400 outline-none"
              />
            </div>
          )}

          {/* Vai trò */}
          <div>
            <label className="block text-sm font-medium mb-1">Vai trò</label>
            <select
              name="role"
              onChange={handleChange}
              value={formData.role}
              className="w-full px-4 py-2 border rounded-lg bg-white focus:ring-2 focus:ring-green-400 outline-none"
            >
              <option value="">-- Chọn vai trò --</option>
              {roles.map((r) => (
                <option key={r._id} value={r._id}>
                  {r.name}
                </option>
              ))}
            </select>
          </div>

          {/* Avatar */}
          <div>
            <label className="block text-sm font-medium mb-1">
              Avatar (tùy chọn)
            </label>
            <input
              name="avatar"
              onChange={handleChange}
              value={formData.avatar}
              type="text"
              placeholder="Nhập URL ảnh đại diện..."
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-green-400 outline-none"
            />
          </div>

          {/* Preview ảnh */}
          {formData.avatar && (
            <div className="mt-3 w-full h-40 border rounded-lg overflow-hidden shadow-sm">
              <img
                src={formData.avatar}
                alt="Preview"
                className="w-full h-full object-cover"
              />
            </div>
          )}

          {/* Nút hành động */}
          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2 rounded-lg bg-gray-200 hover:bg-gray-300 text-gray-700 transition"
            >
              Hủy
            </button>
            <button
              type="submit"
              className={`px-5 py-2 rounded-lg font-semibold text-white shadow-md transition transform hover:scale-[1.03] ${
                isEdit
                  ? "bg-gradient-to-r from-yellow-400 to-amber-500 hover:from-yellow-300 hover:to-amber-400"
                  : "bg-gradient-to-r from-green-400 to-emerald-600 hover:from-green-300 hover:to-emerald-500"
              }`}
            >
              {isEdit ? "Lưu thay đổi" : "Thêm người dùng"}
            </button>
          </div>
        </form>
      </div>

      <ToastContainer position="top-right" autoClose={2000} theme="light" />
    </div>
  );
};

export default UserModal;
