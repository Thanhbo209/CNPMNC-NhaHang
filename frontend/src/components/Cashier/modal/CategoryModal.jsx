import React, { useState, useEffect } from "react";
import { X } from "lucide-react";
import axios from "axios";

const CategoryModal = ({ isOpen, onClose, category, onSuccess }) => {
  const isEdit = !!category;
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [image, setImage] = useState("");

  useEffect(() => {
    if (isEdit) {
      setName(category.name || "");
      setDescription(category.description || "");
      setImage(category.image || "");
    } else {
      setName("");
      setDescription("");
      setImage("");
    }
  }, [category, isEdit]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (isEdit) {
        await axios.put(`http://localhost:2095/api/categories/${category._id}`, {
          name,
          description,
          image,
        });
      } else {
        await axios.post("http://localhost:2095/api/categories/create", {
          name,
          description,
          image,
        });
      }
      onSuccess?.();
      onClose();
    } catch (err) {
      console.error("❌ Lỗi khi lưu danh mục:", err);
      alert("Đã xảy ra lỗi khi lưu danh mục!");
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex justify-center items-center z-50">
      <div className="bg-white text-gray-800 rounded-2xl w-[420px] relative shadow-2xl overflow-hidden animate-fade-in">
        {/* Thanh tiêu đề màu xanh lá gradient */}
        <div className="bg-gradient-to-r from-green-500 to-emerald-600 p-4 flex justify-between items-center">
          <h2 className="text-lg font-semibold text-white">
            {isEdit ? " Chỉnh Sửa Danh Mục" : " Thêm Danh Mục"}
          </h2>
          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-white/20 text-white transition"
          >
            <X size={20} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 flex flex-col gap-4">
          {/* Tên danh mục */}
          <div>
            <label className="block text-sm text-gray-600 mb-1">
              Tên danh mục
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full p-2.5 rounded-lg bg-white border border-gray-300 
              focus:border-green-500 focus:ring-2 focus:ring-green-200 outline-none transition-all duration-200"
              placeholder="Nhập tên danh mục..."
              required
            />
          </div>

          {/* Mô tả */}
          <div>
            <label className="block text-sm text-gray-600 mb-1">Mô tả</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full p-2.5 rounded-lg bg-white border border-gray-300 
              focus:border-green-500 focus:ring-2 focus:ring-green-200 outline-none resize-none transition-all duration-200"
              placeholder="Mô tả ngắn..."
              rows={3}
            />
          </div>

          {/* Ảnh */}
          <div>
            <label className="block text-sm text-gray-600 mb-1">URL Ảnh</label>
            <input
              type="text"
              value={image}
              onChange={(e) => setImage(e.target.value)}
              className="w-full p-2.5 rounded-lg bg-white border border-gray-300 
              focus:border-green-500 focus:ring-2 focus:ring-green-200 outline-none transition-all duration-200"
              placeholder="https://..."
            />
          </div>

          {/* Preview ảnh */}
          {image && (
            <div className="mt-2">
              <img
                src={image}
                alt="Preview"
                className="w-full h-40 object-cover rounded-md border border-gray-200 shadow-sm"
              />
            </div>
          )}

          {/* Nút lưu */}
          <button
            type="submit"
            className="mt-4 w-full py-2.5 rounded-lg bg-green-600 text-white font-medium
            hover:bg-green-700 transition-all shadow-md hover:shadow-lg active:scale-[0.98]"
          >
            {isEdit ? "Lưu thay đổi" : "Thêm danh mục"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default CategoryModal;
