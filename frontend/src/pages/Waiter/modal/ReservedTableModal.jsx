import React from "react";

const ReservedTableModal = ({ onClose, onArrived, onCancel }) => {
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 animate-fade-in">
      <div className="bg-[#1e293b] text-white rounded-2xl p-6 w-[400px] animate-fade-in shadow-xl border border-slate-700">
        <h2 className="text-xl font-semibold mb-4 text-center">
          🕒 Bàn đang được đặt trước
        </h2>
        <p className="text-gray-300 text-center mb-6">
          Khách của bàn này đã tới hay bạn muốn hủy đặt bàn?
        </p>
        <div className="flex justify-center gap-4">
          <button
            onClick={onArrived}
            className="px-3 rounded bg-green-500/20 hover:bg-green-200 text-green-400 transition-all duration-200 
                                    hover:shadow-[0_0_8px_#22c55e,0_0_16px_#22c55e,0_0_32px_#4ade80]"
          >
             Khách đã tới
          </button>
          <button
            onClick={onCancel}
            className="px-4 py-2 rounded bg-red-500/20 hover:bg-red-200 text-red-400 transition-all duration-200 
                                    hover:shadow-[0_0_8px_#ef4444,0_0_16px_#f87171,0_0_32px_#fca5a5]"
          >
             Hủy đặt bàn
          </button>
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg bg-slate-600 hover:bg-slate-500"
          >
            Đóng
          </button>
        </div>
      </div>
    </div>
  );
};

export default ReservedTableModal;
