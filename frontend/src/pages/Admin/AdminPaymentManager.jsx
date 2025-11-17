import React, { useEffect, useState } from "react";
import axios from "axios";
import { Search, Trash2 } from "lucide-react";
import PaymentModal from "../../components/Admin/modal/PaymentModal";
import OrderDetailModal from "../../components/Admin/modal/OrderDetailModal";

const API_URL = "http://localhost:2095/api/payments";
const ORDER_URL = "http://localhost:2095/api/orders";

const AdminPaymentManager = () => {
  const [payments, setPayments] = useState([]);
  const [pendingOrders, setPendingOrders] = useState([]);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [selectedPayment, setSelectedPayment] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedOrderDetail, setSelectedOrderDetail] = useState(null);
  const [isOrderDetailOpen, setIsOrderDetailOpen] = useState(false);

  // 🟩 Lấy danh sách payment
  const fetchPayments = async () => {
    try {
      const res = await axios.get(API_URL);
      setPayments(res.data);
    } catch (err) {
      console.error("Lỗi khi lấy payment:", err);
    }
  };
  

  // 🟦 Lấy danh sách order cần thanh toán
  const fetchPendingOrders = async () => {
    try {
      const res = await axios.get(ORDER_URL);
      const needPayment = (res.data || []).filter((o) => o.status === "served");
      setPendingOrders(needPayment);
    } catch (err) {
      console.error("Lỗi khi lấy orders:", err);
    }
  };

  // 🟢 Hàm lấy chi tiết order (theo orderId)

const fetchOrderDetail = async (orderId) => {
  try {
    const res = await axios.get(`${ORDER_URL}/${orderId}`);
    setSelectedOrderDetail([res.data]); // ✅ Chuyển thành mảng
    setIsOrderDetailOpen(true);
  } catch (err) {
    console.error("Lỗi khi lấy chi tiết order:", err);
  }
};


  useEffect(() => {
    fetchPayments();
    fetchPendingOrders();
  }, []);

  const handleOpenModal = (order = null, payment = null) => {
    setSelectedOrder(order);
    setSelectedPayment(payment);
    setIsModalOpen(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm("Bạn có chắc muốn xóa thanh toán này?")) {
      try {
        await axios.delete(`${API_URL}/${id}`);
        fetchPayments();
      } catch (err) {
        console.error("Lỗi khi xóa:", err);
      }
    }
  };

  return (
    <div className="min-h-screen bg-white rounded-xl text-gray-900 p-8 shadow-lg animate-fade-in">
      {/* --- Tiêu đề --- */}
      <div className="mb-8 flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-wide flex items-center gap-3">
          Quản lý Thanh Toán
        </h1>
      </div>

      {/* --- Đơn hàng cần thanh toán --- */}
      <section className="mb-12">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-semibold tracking-wide text-green-600 flex items-center gap-3">
            <span className="inline-block w-2 h-8 bg-gradient-to-b from-green-400 to-green-600 rounded-full shadow-lg shadow-green-300/40"></span>
            Đơn hàng cần thanh toán
          </h2>
        </div>

        {pendingOrders.length > 0 ? (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-7">
            {pendingOrders.map((order) => (
              <div
                key={order._id}
                onClick={() => handleOpenModal(order)}
                className="group relative cursor-pointer rounded-2xl overflow-hidden border border-gray-300 bg-white shadow-md hover:shadow-green-300/30 hover:border-green-400 transition-all duration-300 hover:-translate-y-1"
              >
                {/* Overlay hover */}
                <div className="absolute inset-0 opacity-0 group-hover:opacity-100 bg-gradient-to-tr from-green-100/20 via-transparent to-green-200/20 blur-2xl transition-all duration-500"></div>

                {/* Nội dung */}
                <div className="relative z-10 p-5 flex flex-col justify-between h-full">
                  <div className="mb-3">
                    <div className="flex items-center justify-between">
                      <h3 className="text-lg font-semibold text-gray-900">
                        Bàn{" "}
                        <span className="text-green-600 font-bold text-xl drop-shadow-[0_0_4px_rgba(34,197,94,0.5)]">
                          {order.table?.tableNumber || "?"}
                        </span>
                      </h3>
                      <span className="px-2 py-1 text-[10px] uppercase bg-green-100 text-green-600 rounded-md font-medium tracking-wider">
                        Served
                      </span>
                    </div>

                    <p className="text-sm text-gray-500 mt-1">
                      Mã Order:{" "}
                      <span className="font-mono text-gray-700">
                        {order._id.slice(-6).toUpperCase()}
                      </span>
                    </p>

                    <p className="text-sm text-gray-700 mt-2">
                      Tổng tiền:{" "}
                      <span className="text-green-600 font-semibold text-lg">
                        {order?.totalAmount?.toLocaleString() || "0"}₫
                      </span>
                    </p>

                    <div className="mt-2 text-gray-700 text-sm max-h-32 overflow-y-auto pr-1">
                      {(order.items || []).map((item, i) => (
                        <p key={`item-${i}`} className="flex justify-between">
                          <span>
                            {item.food?.name || "Món đã xóa"} x {item.quantity}
                          </span>
                          <span className="text-green-600">
                            {(
                              item.food?.price * item.quantity || 0
                            ).toLocaleString()}
                            ₫
                          </span>
                        </p>
                      ))}
                      {(order.addedItems || []).map((item, i) => (
                        <p
                          key={`added-${i}`}
                          className="flex justify-between text-sm text-gray-400"
                        >
                          <span>
                            {item.food?.name || "Món đã xóa"} x {item.quantity}{" "}
                            (món thêm)
                          </span>
                          <span className="text-green-600">
                            {(
                              item.food?.price * item.quantity || 0
                            ).toLocaleString()}
                            ₫
                          </span>
                        </p>
                      ))}
                    </div>
                  </div>

                  <div className="flex justify-between items-center text-xs text-gray-500 border-t border-gray-300 pt-3 mt-auto">
                    <p>
                      {order.createdAt
                        ? new Date(order.createdAt).toLocaleString()
                        : ""}
                    </p>
                    <span className="text-gray-400/80 group-hover:text-green-600 transition-colors duration-300">
                      Thanh toán →
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center mt-12">
            <p className="text-gray-400 italic">
              Không có đơn hàng nào cần thanh toán.
            </p>
          </div>
        )}
      </section>

      {/* --- Lịch sử Thanh Toán --- */}
      <section className="mt-12">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold tracking-wide text-blue-600 flex items-center gap-2">
            <span className="inline-block w-1.5 h-6 bg-blue-400 rounded-full"></span>
            Lịch sử Thanh Toán
          </h2>
        </div>

        <div className="overflow-x-auto bg-white rounded-2xl border border-gray-300 shadow-lg">
          <table className="min-w-full text-sm text-gray-900">
            <thead className="bg-gray-100 text-xs uppercase font-semibold tracking-wider">
              <tr>
                <th className="px-4 py-3 text-left">#</th>
                <th className="px-4 py-3 text-left">Mã Order</th>
                <th className="px-4 py-3 text-left">Phương thức</th>
                <th className="px-4 py-3 text-right">Số tiền</th>
                <th className="px-4 py-3 text-center">Trạng thái</th>
                <th className="px-4 py-3 text-left">Ngày thanh toán</th>
                <th className="px-4 py-3 text-center">Hành động</th>
              </tr>
            </thead>

            <tbody>
              {payments.length > 0 ? (
                payments.map((p, i) => (
                  <tr
                    key={p._id}
                    className="border-t border-gray-200 hover:bg-gray-50 transition-all duration-200 group"
                  >
                    <td className="px-4 py-3 font-medium text-gray-500">
                      {i + 1}
                    </td>
                    <td className="px-4 py-3 font-mono text-gray-700">
                      {p.order?._id || "-"}
                    </td>
                    <td className="px-4 py-3 capitalize text-gray-800">
                      {p.method || "-"}
                    </td>
                    <td className="px-4 py-3 text-right font-semibold text-green-600">
                      {p?.amount?.toLocaleString() || "0"}₫
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span
                        className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium
                      ${
                        p.status === "completed"
                          ? "bg-green-100 text-green-600 border border-green-200"
                          : p.status === "failed"
                          ? "bg-red-100 text-red-600 border border-red-200"
                          : "bg-yellow-100 text-yellow-600 border border-yellow-200"
                      }`}
                      >
                        {p.status || "pending"}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-gray-700">
                      {new Date(p.paidAt).toLocaleDateString("vi-VN", {
                        timeZone: "Asia/Ho_Chi_Minh",
                      })}
                    </td>
                    <td className="px-4 py-3 text-center">
                      <div className="flex justify-center gap-3 opacity-80 group-hover:opacity-100 transition">
                        <button
                          onClick={() => fetchOrderDetail(p.order?._id)}  
                          className="p-1.5 rounded bg-blue-100 hover:bg-blue-200 text-blue-600 transition-all duration-200 hover:shadow-lg"
                          title="Xem chi tiết đơn hàng"
                        >
                          <Search size={16} />
                        </button>

                        <button
                          onClick={() => handleDelete(p._id)}
                          className="p-1.5 rounded bg-red-100 hover:bg-red-200 text-red-600 transition-all duration-200 hover:shadow-lg"
                          title="Xóa thanh toán"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan="7"
                    className="text-center py-8 text-gray-400 italic tracking-wide"
                  >
                    Chưa có thanh toán nào.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>

      {isModalOpen && (
        <PaymentModal
          order={selectedOrder}
          payment={selectedPayment}
          onClose={() => {
            setIsModalOpen(false);
            setSelectedOrder(null);
            setSelectedPayment(null);
          }}
          onSuccess={() => {
            fetchPayments();
            fetchPendingOrders();
          }}
        />
      )}

      {isOrderDetailOpen && (
        <OrderDetailModal
          orders={selectedOrderDetail}
          onClose={() => {
            setIsOrderDetailOpen(false);
            setSelectedOrderDetail(null);
          }}
        />
      )}
    </div>
  );
};

export default AdminPaymentManager;
