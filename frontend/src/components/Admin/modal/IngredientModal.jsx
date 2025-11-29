import React, { useEffect, useState } from "react";
import { X, Image } from "lucide-react";
import axios from "axios";

const IngredientModal = ({ isOpen, onClose, ingredient, onUpdated }) => {
  const [form, setForm] = useState({
    name: "",
    quantity: "",
    unit: "",
    alertLevel: "",
    image: "",
  });

  useEffect(() => {
    if (ingredient) {
      setForm({
        name: ingredient.name || "",
        quantity: ingredient.quantity || "",
        unit: ingredient.unit || "",
        alertLevel: ingredient.alertLevel || "",
        image: ingredient.image || "",
      });
    } else {
      setForm({ name: "", quantity: "", unit: "", alertLevel: "", image: "" });
    }
  }, [ingredient]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (ingredient) {
        await axios.put(
          `http://localhost:2095/api/ingredients/${ingredient._id}`,
          form
        );
      } else {
        await axios.post("http://localhost:2095/api/ingredients/create", form);
      }
      onUpdated();
      onClose();
    } catch (err) {
      console.error(err);
      alert("Thao tác thất bại!");
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50">
      <div
        className="
          bg-white text-gray-800 
          p-6 rounded-xl w-[420px] 
          shadow-[0_6px_30px_rgba(0,0,0,0.15)] 
          animate-fade-in
        "
      >
        {/* Header */}
        <div className="flex justify-between items-center mb-4 border-b pb-2">
          <h2 className="text-xl font-semibold">
            {ingredient ? "Chỉnh sửa" : "Thêm"} Nguyên Liệu
          </h2>
          <button onClick={onClose}>
            <X
              size={20}
              className="text-gray-500 hover:text-red-500 transition"
            />
          </button>
        </div>

        <form className="space-y-3" onSubmit={handleSubmit}>
          {/* Name */}
          <input
            name="name"
            value={form.name}
            onChange={handleChange}
            placeholder="Tên nguyên liệu"
            className="
              w-full p-2.5 rounded-lg 
              border border-gray-300 bg-white 
              focus:border-blue-500 focus:ring-2 focus:ring-blue-300 
              transition-all outline-none
            "
          />

          {/* Quantity */}
          <input
            name="quantity"
            value={form.quantity}
            onChange={handleChange}
            placeholder="Số lượng"
            type="number"
            className="
              w-full p-2.5 rounded-lg 
              border border-gray-300 bg-white
              focus:border-blue-500 focus:ring-2 focus:ring-blue-300 
              transition-all outline-none
            "
          />

          {/* Unit */}
          <input
            name="unit"
            value={form.unit}
            onChange={handleChange}
            placeholder="Đơn vị"
            className="
              w-full p-2.5 rounded-lg 
              border border-gray-300 bg-white
              focus:border-blue-500 focus:ring-2 focus:ring-blue-300 
              transition-all outline-none
            "
          />

          {/* Alert Level */}
          <input
            name="alertLevel"
            value={form.alertLevel}
            onChange={handleChange}
            placeholder="Mức cảnh báo"
            type="number"
            className="
              w-full p-2.5 rounded-lg 
              border border-gray-300 bg-white
              focus:border-blue-500 focus:ring-2 focus:ring-blue-300 
              transition-all outline-none
            "
          />

          {/* Image URL */}
          <div>
            <label className="flex items-center gap-2 text-gray-700 mb-1">
              <Image size={18} className="text-gray-500" /> URL ảnh
            </label>
            <input
              type="text"
              name="image"
              value={form.image}
              onChange={handleChange}
              placeholder="https://example.com/image.jpg"
              className="
                w-full p-2.5 rounded-lg 
                border border-gray-300 bg-white
                focus:border-blue-500 focus:ring-2 focus:ring-blue-300 
                transition-all outline-none
              "
            />

            {/* Preview */}
            {form.image && (
              <img
                src={form.image}
                alt="preview"
                className="mt-3 w-24 h-24 object-cover rounded-lg border shadow-sm"
              />
            )}
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="
                px-4 py-2 rounded-lg 
                bg-gray-200 text-gray-700 
                hover:bg-gray-300 transition
              "
            >
              Hủy
            </button>

            <button
              type="submit"
              className="
                px-5 py-2 rounded-lg 
                bg-blue-600 text-white
                hover:bg-blue-700 
                shadow-[0_0_10px_rgba(59,130,246,0.5)]
                transition
              "
            >
              Lưu
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default IngredientModal;
