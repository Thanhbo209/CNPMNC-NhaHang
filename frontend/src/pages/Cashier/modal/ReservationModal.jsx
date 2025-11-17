import React, { useState, useEffect } from "react";
import axios from "axios";
import { toast } from "react-toastify";

const ReservationModal = ({ onClose, refresh, editData, tableId }) => {
  const [form, setForm] = useState({
    user: "",
    reservationTime: "",
    status: "pending",
    guests: 1,
    note: "",
  });

  useEffect(() => {
    if (editData) setForm(editData);
  }, [editData]);

  const getMinDateTime = () => {
    const now = new Date();
    now.setMinutes(now.getMinutes() - now.getTimezoneOffset());
    return now.toISOString().slice(0, 16);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const now = new Date();
    const selectedTime = new Date(form.reservationTime);
    if (selectedTime < now) {
      toast.error("❌ Không thể chọn thời gian trong quá khứ!");
      return;
    }

    try {
      if (editData) {
        await axios.put(
          `http://localhost:2095/api/reservations/${editData._id}`,
          form
        );
        toast.success("✅ Cập nhật đặt bàn thành công!");
      } else {
        await axios.post("http://localhost:2095/api/reservations/create", {
          ...form,
          table: tableId,
        });
        toast.success("✅ Tạo đặt bàn mới thành công!");
      }

      refresh();
      onClose();
    } catch (err) {
      toast.error("❌ Lỗi khi lưu đặt bàn!");
      console.error(err);
    }
  };

  const inputStyle =
    "w-full px-3.5 py-2.5 rounded-lg bg-[#2d3b50] text-gray-100 placeholder-gray-400 border border-gray-600 focus:border-green-400 focus:ring-2 focus:ring-green-500 outline-none transition-all duration-200";

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 animate-fade-in">
      <div className="relative bg-gradient-to-br from-[#1e293b] to-[#27364a] p-7 rounded-2xl w-[420px] text-white shadow-2xl border border-gray-700 transition-all duration-300">
        {/* Header */}
        <h3 className="text-2xl font-semibold mb-5 text-center tracking-wide bg-gradient-to-r from-green-400 to-emerald-500 bg-clip-text text-transparent drop-shadow-sm">
          {editData ? "✏️ Chỉnh sửa đặt bàn" : "🕓 Thêm đặt bàn mới"}
        </h3>

        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-3 right-4 text-gray-400 hover:text-gray-100 transition"
        >
          ✖
        </button>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* User ID */}
          <div>
            <label className="block mb-1 text-sm text-gray-300">
              ID Người dùng
            </label>
            <input
              className={inputStyle}
              placeholder="Nhập ID người dùng"
              value={form.user}
              onChange={(e) => setForm({ ...form, user: e.target.value })}
            />
          </div>

          {/* Datetime Picker */}
          <div>
            <label className="block mb-1 text-sm text-gray-300">
              Thời gian đặt bàn
            </label>
            <input
              type="datetime-local"
              className={`${inputStyle} cursor-pointer`}
              value={form.reservationTime}
              min={getMinDateTime()}
              onChange={(e) =>
                setForm({ ...form, reservationTime: e.target.value })
              }
            />
          </div>

          {/* Guests */}
          <div>
            <label className="block mb-1 text-sm text-gray-300">Số khách</label>
            <input
              type="number"
              className={inputStyle}
              placeholder="Số khách"
              min={1}
              value={form.guests}
              onChange={(e) => setForm({ ...form, guests: e.target.value })}
            />
          </div>

          {/* Note */}
          <div>
            <label className="block mb-1 text-sm text-gray-300">Ghi chú</label>
            <textarea
              className={`${inputStyle} resize-none h-20`}
              placeholder="Thêm ghi chú (tùy chọn)"
              value={form.note}
              onChange={(e) => setForm({ ...form, note: e.target.value })}
            />
          </div>

          {/* Buttons */}
          <div className="flex justify-end gap-3 pt-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-gray-600/80 rounded-md hover:bg-gray-500 transition-all duration-200 shadow-sm"
            >
              Hủy
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-gradient-to-r from-green-500 to-emerald-600 rounded-md hover:opacity-90 transition-all duration-200 shadow-md font-medium"
            >
              Lưu
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ReservationModal;
