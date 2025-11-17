import React, { useState, useEffect } from "react";
import axios from "axios";

const TableModal = ({ onClose, refresh, editData }) => {
  const [form, setForm] = useState({
    tableNumber: "",
    location: "",
    floor: "",
    seats: 2,
    status: "available",
    isVIP: false,
  });

  useEffect(() => {
    if (editData) setForm(editData);
  }, [editData]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editData) {
        await axios.put(`http://localhost:2095/api/tables/${editData._id}`, form);
      } else {
        await axios.post("http://localhost:2095/api/tables/create", form);
      }
      refresh();
      onClose();
    } catch (err) {
      console.error(err);
      alert("Lỗi khi lưu dữ liệu bàn!");
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl w-[440px] shadow-2xl overflow-hidden  animate-fade-in">
        {/* Header với gradient xanh */}
        <div className="bg-gradient-to-r from-blue-500 to-blue-600 px-6 py-4 flex justify-between items-center">
          <h3 className="text-lg font-semibold text-white">
            {editData ? " Chỉnh sửa bàn" : " Thêm bàn mới"}
          </h3>
          <button
            onClick={onClose}
            className="text-white/80 hover:text-white transition"
          >
            ✖
          </button>
        </div>

        {/* Nội dung form */}
        <div className="p-6 bg-white">
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Số bàn */}
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Số bàn
              </label>
              <input
                type="number"
                className="w-full mt-1 p-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 outline-none"
                placeholder="Nhập số bàn..."
                value={form.tableNumber}
                onChange={(e) =>
                  setForm({ ...form, tableNumber: e.target.value })
                }
                required
              />
            </div>

            {/* Vị trí */}
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Vị trí
              </label>
              <input
                type="text"
                className="w-full mt-1 p-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 outline-none"
                placeholder="Nhập vị trí bàn (góc, cửa sổ, sân...)"
                value={form.location}
                onChange={(e) =>
                  setForm({ ...form, location: e.target.value })
                }
              />
            </div>

            {/* Tầng */}
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Tầng
              </label>
              <input
                type="number"
                className="w-full mt-1 p-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 outline-none"
                placeholder="Tầng (VD: 1, 2, 3)"
                value={form.floor}
                onChange={(e) => setForm({ ...form, floor: e.target.value })}
              />
            </div>

            {/* Số ghế */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Số ghế
              </label>
              <select
                className="w-full p-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 outline-none"
                value={form.seats}
                onChange={(e) =>
                  setForm({ ...form, seats: Number(e.target.value) })
                }
              >
                {[2, 4, 6, 8, 10].map((num) => (
                  <option key={num} value={num}>
                    {num} ghế
                  </option>
                ))}
              </select>
            </div>

            {/* Checkbox VIP */}
            <div className="flex items-center gap-2 mt-2">
              <input
                type="checkbox"
                id="vip"
                checked={form.isVIP}
                onChange={(e) => setForm({ ...form, isVIP: e.target.checked })}
                className="w-4 h-4 accent-yellow-500 cursor-pointer"
              />
              <label htmlFor="vip" className="text-gray-700 cursor-pointer">
                Bàn VIP
              </label>
            </div>

            {/* Nút hành động */}
            <div className="flex justify-end gap-3 pt-4 border-t border-gray-200 mt-6">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-lg bg-gray-200 hover:bg-gray-300 text-gray-700 font-medium transition"
              >
                Hủy
              </button>
              <button
                type="submit"
                className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-medium transition shadow-sm"
              >
                Lưu
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default TableModal;
