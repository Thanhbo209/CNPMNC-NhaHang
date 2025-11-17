import React, { useState, useEffect } from "react";
import axios from "axios";
import { X } from "lucide-react";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const RoleModal = ({ isOpen, onClose, onSuccess, role }) => {
  const isEdit = Boolean(role);
  const [formData, setFormData] = useState({
    name: "",
    permission: "",
    description: "",
  });

  // Khi modal mở hoặc role thay đổi → gán dữ liệu
  useEffect(() => {
    if (isEdit && role) {
      setFormData({
        name: role.name || "",
        permission: role.permission?.join(",") || "",
        description: role.description || "",
      });
    } else {
      setFormData({ name: "", permission: "", description: "" });
    }
  }, [role, isEdit]);

  if (!isOpen) return null;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (isEdit) {
        const updatedData = {
          ...formData,
          permission: formData.permission
            ? formData.permission.split(",").map((p) => p.trim())
            : [],
        };
        await axios.put(`http://localhost:2095/api/roles/${role._id}`, updatedData);
        toast.success("Cập nhật vai trò thành công!", { theme: "light" });
      } else {
        await axios.post("http://localhost:2095/api/roles/create", formData);
        toast.success("Thêm vai trò mới thành công!", { theme: "light" });
      }

      setTimeout(() => {
        onClose();
        onSuccess?.();
      }, 1000);
    } catch (err) {
      console.error("Lỗi thao tác role:", err);
      toast.error("Thao tác thất bại!", { theme: "light" });
    }
  };

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 ">
      <div className="relative bg-white text-gray-800 rounded-2xl shadow-xl w-[450px] overflow-hidden animate-fade-in">
        {/* Thanh tiêu đề gradient */}
        <div
          className={`h-15 flex items-center justify-center text-lg font-semibold text-white
            ${isEdit
              ? "bg-gradient-to-r from-yellow-400 to-amber-500"
              : "bg-gradient-to-r from-green-400 to-emerald-600"
            }`}
        >
          {isEdit ? " Chỉnh sửa vai trò" : " Thêm vai trò mới"}
        </div>

        {/* Nút đóng */}
        <button
          onClick={onClose}
          className="absolute top-3 right-3 text-gray-600 hover:text-red-500 transition"
        >
          <X size={22} />
        </button>

        {/* Nội dung form */}
        <form onSubmit={handleSubmit} className="p-6 flex flex-col gap-4">
          {/* Tên vai trò */}
          <div>
            <label className="block text-sm font-medium mb-1">Tên vai trò</label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-green-400 outline-none"
              placeholder="Nhập tên vai trò..."
            />
          </div>

          {/* Permission */}
          <div>
            <label className="block text-sm font-medium mb-1">
              Quyền hạn (phân cách bằng dấu phẩy)
            </label>
            <input
              type="text"
              name="permission"
              value={formData.permission}
              onChange={handleChange}
              placeholder="vd: add_user,edit_user,delete_user"
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-green-400 outline-none"
            />
          </div>

          {/* Mô tả */}
          <div>
            <label className="block text-sm font-medium mb-1">Mô tả</label>
            <textarea
              name="description"
              rows="3"
              value={formData.description}
              onChange={handleChange}
              placeholder="Nhập mô tả cho vai trò..."
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-green-400 outline-none resize-none"
            />
          </div>

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
              {isEdit ? "Lưu thay đổi" : "Lưu vai trò"}
            </button>
          </div>
        </form>
      </div>

      <ToastContainer position="top-right" autoClose={2000} theme="light" />
    </div>
  );
};

export default RoleModal;
