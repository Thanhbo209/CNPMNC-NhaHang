import React, { useState, useEffect } from "react";
import { X } from "lucide-react";
import axios from "axios";

const FoodModal = ({ open, onClose, onSuccess, food, categoryId }) => {
  const isEdit = Boolean(food);

  const [form, setForm] = useState({
    name: "",
    description: "",
    price: "",
    image: "",
    featured: false,
    available: true,
  });

  useEffect(() => {
    if (isEdit && food) {
      setForm({
        name: food.name || "",
        description: food.description || "",
        price: food.price || "",
        image: food.image || "",
        featured: food.featured || false,
        available: food.available ?? true,
      });
    } else {
      setForm({
        name: "",
        description: "",
        price: "",
        image: "",
        featured: false,
        available: true,
      });
    }
  }, [food, isEdit]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm({
      ...form,
      [name]: type === "checkbox" ? checked : value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (isEdit) {
        await axios.put(`http://localhost:2095/api/foods/${food._id}`, form);
      } else {
        await axios.post("http://localhost:2095/api/foods/create", {
          ...form,
          category: categoryId,
        });
      }
      onSuccess();
      onClose();
    } catch (err) {
      console.error("❌ Lỗi khi lưu món ăn:", err);
      alert("Đã xảy ra lỗi khi lưu món ăn!");
    }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex justify-center items-center z-50 animate-fade-in">
      <div className="bg-white text-gray-800 rounded-2xl w-[420px] relative shadow-2xl  overflow-hidden">
        {/* Thanh tiêu đề xanh lá gradient */}
        <div className="bg-gradient-to-r from-green-500 to-emerald-600 p-4 flex justify-between items-center">
          <h2 className="text-lg font-semibold text-white">
            {isEdit ? " Chỉnh Sửa Món Ăn" : " Thêm Món Ăn"}
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
          {/* Tên món */}
          <div>
            <label className="block text-sm text-gray-600 mb-1">Tên món</label>
            <input
              type="text"
              name="name"
              value={form.name}
              onChange={handleChange}
              className="w-full p-2.5 rounded-lg bg-white border border-gray-300 
              focus:border-green-500 focus:ring-2 focus:ring-green-200 outline-none transition-all duration-200"
              placeholder="Nhập tên món ăn..."
              required
            />
          </div>

          {/* Mô tả */}
          <div>
            <label className="block text-sm text-gray-600 mb-1">Mô tả</label>
            <textarea
              name="description"
              value={form.description}
              onChange={handleChange}
              className="w-full p-2.5 rounded-lg bg-white border border-gray-300 
              focus:border-green-500 focus:ring-2 focus:ring-green-200 outline-none resize-none transition-all duration-200"
              placeholder="Mô tả ngắn..."
              rows={3}
            ></textarea>
          </div>

          {/* Giá */}
          <div>
            <label className="block text-sm text-gray-600 mb-1">Giá (₫)</label>
            <input
              type="number"
              name="price"
              value={form.price}
              onChange={handleChange}
              className="w-full p-2.5 rounded-lg bg-white border border-gray-300 
              focus:border-green-500 focus:ring-2 focus:ring-green-200 outline-none transition-all duration-200"
              placeholder="Nhập giá..."
              required
            />
          </div>

          {/* URL ảnh */}
          <div>
            <label className="block text-sm text-gray-600 mb-1">URL Ảnh</label>
            <input
              type="text"
              name="image"
              value={form.image}
              onChange={handleChange}
              className="w-full p-2.5 rounded-lg bg-white border border-gray-300 
              focus:border-green-500 focus:ring-2 focus:ring-green-200 outline-none transition-all duration-200"
              placeholder="https://..."
            />
          </div>

          {/* Xem trước ảnh */}
          {form.image && (
            <div className="mt-2 w-full h-40 border border-gray-200 rounded-md overflow-hidden shadow-sm">
              <img
                src={form.image}
                alt="Preview"
                className="w-full h-full object-cover"
              />
            </div>
          )}

          {/* Checkbox */}
          <div className="flex items-center justify-between mt-2 space-x-6">
            {/* Featured */}
            <label className="flex items-center gap-2 text-gray-700 cursor-pointer group">
              <input
                type="checkbox"
                name="featured"
                checked={form.featured}
                onChange={handleChange}
                className="hidden peer"
              />
              <div
                className="w-5 h-5 rounded-md border border-gray-400 bg-white 
                  peer-checked:border-yellow-400 peer-checked:bg-yellow-400
                  peer-checked:shadow-[0_0_8px_#facc15] transition-all duration-200"
              ></div>
              <span className="group-hover:text-yellow-500 transition-colors duration-200">
                Đặc biệt
              </span>
            </label>

            {/* Available */}
            <label className="flex items-center gap-2 text-gray-700 cursor-pointer group">
              <input
                type="checkbox"
                name="available"
                checked={form.available}
                onChange={handleChange}
                className="hidden peer"
              />
              <div
                className="w-5 h-5 rounded-md border border-gray-400 bg-white 
                  peer-checked:border-emerald-400 peer-checked:bg-emerald-400
                  peer-checked:shadow-[0_0_8px_#34d399] transition-all duration-200"
              ></div>
              <span className="group-hover:text-emerald-500 transition-colors duration-200">
                Còn phục vụ
              </span>
            </label>
          </div>

          {/* Submit */}
          <button
            type="submit"
            className={`mt-4 w-full py-2.5 rounded-lg text-white font-medium transition-all shadow-md hover:shadow-lg active:scale-[0.98] ${
              isEdit
                ? "bg-yellow-500 hover:bg-yellow-600"
                : "bg-green-600 hover:bg-green-700"
            }`}
          >
            {isEdit ? "Lưu Thay Đổi" : "Thêm Món Ăn"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default FoodModal;
