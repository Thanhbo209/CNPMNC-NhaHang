import React from "react";
import { X, Printer, Download } from "lucide-react";
import jsPDF from "jspdf";
import "jspdf-autotable";

const OrderDetailModal = ({ orders = [], onClose }) => {
  if (!orders || orders.length === 0) return null;

  // Sắp xếp đơn hàng mới nhất
  const sortedOrders = [...orders].sort(
    (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
  );

  const handleDownloadPDF = (order) => {
    const doc = new jsPDF();
    doc.setFont("Helvetica", "bold");
    doc.text("HÓA ĐƠN THANH TOÁN", 70, 15);
    doc.setFont("Helvetica", "normal");

    doc.text(`Bàn: ${order.table?.tableNumber || "?"}`, 15, 25);
    doc.text(
      `Khách hàng: ${order.user?.name || order.user?.email || "Ẩn danh"}`,
      15,
      32
    );
    doc.text(`Trạng thái: ${order.status}`, 15, 39);
    doc.text(
      `Ngày tạo: ${new Date(order.createdAt).toLocaleString("vi-VN")}`,
      15,
      46
    );
    doc.text(`Ghi chú: ${order.orderNote || "Không có"}`, 15, 53);

    // Chuẩn bị dữ liệu cho bảng
    const allItems = [...(order.items || []), ...(order.addedItems || [])];
    const rows = allItems.map((i) => [
      i.food?.name || "Món đã xóa",
      i.quantity,
      (i.food?.price || 0).toLocaleString("vi-VN") + "₫",
      ((i.food?.price || 0) * i.quantity).toLocaleString("vi-VN") + "₫",
    ]);

    doc.autoTable({
      startY: 60,
      head: [["Món ăn", "SL", "Đơn giá", "Thành tiền"]],
      body: rows,
      theme: "grid",
      styles: { fontSize: 10 },
    });

    const total = allItems.reduce(
      (sum, i) => sum + (i.food?.price || 0) * i.quantity,
      0
    );

    const finalY = doc.lastAutoTable.finalY + 10;
    doc.setFont("Helvetica", "bold");
    doc.text(`Tổng cộng: ${total.toLocaleString("vi-VN")}₫`, 140, finalY);

    // Xuất file
    doc.save(`Order_${order.table?.tableNumber || "Unknown"}.pdf`);
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-white w-[90%] max-w-3xl rounded-2xl shadow-2xl overflow-hidden animate-fade-in">
        {/* Header */}
        <div className="flex justify-between items-center px-6 py-4 border-b border-gray-200 bg-gradient-to-r from-green-500 to-emerald-600">
          <h2 className="text-xl font-semibold text-white">
            Chi tiết đơn hàng
          </h2>
          <button
            onClick={onClose}
            className="p-2 rounded-full bg-white/20 hover:bg-white/30 text-white transition"
          >
            <X size={20} />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 max-h-[70vh] overflow-y-auto space-y-6 bg-gradient-to-b from-gray-50 to-white">
          {sortedOrders.map((order, index) => {
            const allItems = [
              ...(order.items || []),
              ...(order.addedItems || []),
            ];
            const total =
              order.totalAmount ||
              allItems.reduce(
                (sum, i) => sum + (i.food?.price || 0) * i.quantity,
                0
              );

            return (
              <div
                key={order._id || index}
                className="rounded-2xl border border-gray-200 bg-white shadow-sm hover:shadow-md transition-all duration-300 p-5"
              >
                {/* Thông tin đơn */}
                <div className="mb-4 text-sm text-gray-700 space-y-2">
                  <div className="flex justify-between items-center">
                    <p className="font-medium">
                      ☕️ <span className="text-gray-500">Số bàn:</span>{" "}
                      <span className="font-bold text-gray-900">
                        {order.table?.tableNumber || "?"}
                      </span>
                    </p>
                    <span
                      className={`px-3 py-1 text-xs font-semibold rounded-full ${
                        order.status === "paid"
                          ? "bg-green-100 text-green-700"
                          : order.status === "preparing"
                          ? "bg-yellow-100 text-yellow-700"
                          : order.status === "served"
                          ? "bg-blue-100 text-blue-700"
                          : "bg-gray-100 text-gray-700"
                      }`}
                    >
                      {order.status}
                    </span>
                  </div>

                  <p>
                    <strong>👤 Khách hàng:</strong>{" "}
                    <span className="text-gray-800">
                      {order.user?.name || order.user?.email || "Không phải đặt bàn"}
                    </span>
                  </p>
                  <p>
                    <strong>📝 Ghi chú:</strong>{" "}
                    <span className="text-gray-600">
                      {order.orderNote || "Không có ghi chú"}
                    </span>
                  </p>
                  <p className="text-gray-500 text-xs">
                    ⏰ Ngày tạo:{" "}
                    {new Date(order.createdAt).toLocaleString("vi-VN")}
                  </p>
                </div>

                {/* Danh sách món */}
                <div>
                  <h3 className="font-semibold text-base text-gray-800 mb-2 border-b border-gray-200 pb-1 flex items-center gap-1">
                    🍽️ Danh sách món ăn
                  </h3>
                  <div className="divide-y divide-gray-100">
                    {allItems.length > 0 ? (
                      allItems.map((item, idx) => {
                        const s = (item.status || '').toString().toLowerCase();
                        const label = s === 'preparing' ? 'Đang nấu' : s === 'ready' ? 'Đã xong' : s === 'pending' ? 'Đang chờ' : (s === 'canceled' ? 'Đã hủy' : item.status || '—');
                        const badgeClass = s === 'preparing' ? 'bg-yellow-100 text-yellow-700' : s === 'ready' ? 'bg-green-100 text-green-700' : s === 'pending' ? 'bg-gray-100 text-gray-700' : s === 'canceled' ? 'bg-red-100 text-red-700' : 'bg-gray-100 text-gray-700';

                        return (
                          <div
                            key={idx}
                            className={`flex justify-between items-center py-2 text-sm hover:bg-gray-50 transition rounded-lg px-1 ${s === 'canceled' ? 'opacity-60' : ''}`}
                          >
                            {/* Trái: hình ảnh + tên món */}
                            <div className="flex items-center gap-3">
                              {item.food?.image ? (
                                <img
                                  src={item.food.image}
                                  alt={item.food?.name}
                                  className="w-10 h-10 rounded-lg object-cover border border-gray-200 shadow-sm"
                                />
                              ) : (
                                <div className="w-10 h-10 rounded-lg bg-gray-200 flex items-center justify-center text-gray-400 text-xs">
                                  N/A
                                </div>
                              )}

                              <div className="flex flex-col">
                                <div className="flex items-center gap-3">
                                  <span className="text-gray-800 font-medium">
                                    {item.food?.name || "Món đã xóa"}
                                  </span>
                                  <small className={`text-xs px-2 py-0.5 rounded-full ${badgeClass}`}>{label}</small>
                                </div>
                                <span className="text-gray-500 text-xs">
                                  Số lượng: {item.quantity}
                                </span>
                              </div>
                            </div>

                            {/* Phải: giá */}
                            <span className="text-green-600 font-semibold text-sm whitespace-nowrap">
                              {(
                                (item.food?.price || 0) * item.quantity
                              ).toLocaleString("vi-VN")}
                              ₫
                            </span>
                          </div>
                        );
                      })
                    ) : (
                      <p className="text-gray-400 italic text-sm py-2">
                        Không có món ăn nào
                      </p>
                    )}
                  </div>
                </div>

                {/* Tổng tiền */}
                <div className="mt-4 border-t border-gray-200 pt-3 text-right">
                  <p className="text-lg font-bold text-green-600">
                    Tổng cộng: {total.toLocaleString("vi-VN")}₫
                  </p>
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer */}
        <div className="border-t border-gray-200 px-6 py-3 flex justify-between bg-gray-50">
          <div className="flex gap-3">
            <button
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-gray-200 hover:bg-gray-300 text-gray-700 font-medium transition"
              onClick={() => alert("Chức năng in sẽ được bổ sung sau")}
            >
              <Printer size={18} /> In hóa đơn
            </button>
            <button
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-green-500 hover:bg-green-600 text-white font-semibold transition"
              onClick={() => handleDownloadPDF(sortedOrders[0])}
            >
              <Download size={18} /> Tải PDF
            </button>
          </div>
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-semibold transition shadow-sm"
          >
            Đóng
          </button>
        </div>
      </div>
    </div>
  );
};

export default OrderDetailModal;
