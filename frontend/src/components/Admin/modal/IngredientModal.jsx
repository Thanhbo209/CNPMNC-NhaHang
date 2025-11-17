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
        await axios.put(`http://localhost:2095/api/ingredients/${ingredient._id}`, form);
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
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div className="bg-[#1e293b] text-white p-6 rounded-xl w-[400px] shadow-[0_0_25px_#000000] animate-fade-in">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">{ingredient ? "Chỉnh sửa" : "Thêm"} Nguyên Liệu</h2>
          <button onClick={onClose}>
            <X size={20} className="hover:text-red-400 transition" />
          </button>
        </div>

        <form className="space-y-3" onSubmit={handleSubmit}>
          <input
            name="name"
            value={form.name}
            onChange={handleChange}
            placeholder="Tên nguyên liệu"
            className="w-full p-2 rounded bg-slate-700 focus:ring-2 focus:ring-sky-500 outline-none"
          />
          <input
            name="quantity"
            value={form.quantity}
            onChange={handleChange}
            placeholder="Số lượng"
            type="number"
            className="w-full p-2 rounded bg-slate-700 focus:ring-2 focus:ring-sky-500 outline-none"
          />
          <input
            name="unit"
            value={form.unit}
            onChange={handleChange}
            placeholder="Đơn vị"
            className="w-full p-2 rounded bg-slate-700 focus:ring-2 focus:ring-sky-500 outline-none"
          />
          <input
            name="alertLevel"
            value={form.alertLevel}
            onChange={handleChange}
            placeholder="Mức cảnh báo"
            type="number"
            className="w-full p-2 rounded bg-slate-700 focus:ring-2 focus:ring-sky-500 outline-none"
          />

          {/* URL ảnh */}
          <div>
            <label className="flex items-center gap-2">
              <Image size={18} /> URL ảnh
            </label>
            <input
              type="text"
              name="image"
              value={form.image}
              onChange={handleChange}
              placeholder="https://example.com/image.jpg"
              className="w-full p-2 rounded bg-slate-700 focus:ring-2 focus:ring-sky-500 outline-none mt-1"
            />
            {form.image && (
              <img
                src={form.image}
                alt="preview"
                className="mt-2 w-20 h-20 object-cover rounded"
              />
            )}
          </div>

          <div className="flex justify-end mt-10 gap-2">
            <button type="button" onClick={onClose} className="px-4 py-2 bg-gray-600 rounded hover:bg-gray-500">
              Hủy
            </button>
            <button type="submit" className="py-1 px-5 rounded bg-blue-600 hover:bg-blue-700 transition-all shadow-[0_0_12px_#3b82f6]">
              Lưu
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default IngredientModal;
