import React, { useEffect, useState } from "react";
import axios from "axios";
import { Save, X } from "lucide-react";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const API_URL = "http://localhost:2095/api/payments";
const ORDER_URL = "http://localhost:2095/api/orders";

const PaymentModal = ({ order, onClose, onSuccess }) => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  const [form, setForm] = useState({
    order: "",
    method: "",
    amount: "",
    paidAt: new Date().toISOString().substring(0, 10),
    customerCash: "",
    changeAmount: "",
  });

  // Lấy danh sách đơn hàng served
  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const res = await axios.get(`${ORDER_URL}?status=served`);
        setOrders(res.data || []);
      } catch (err) {
        toast.error("Không thể tải danh sách đơn hàng!");
      } finally {
        setLoading(false);
      }
    };
    fetchOrders();
  }, []);

  // Khi mở modal có Order sẵn
  useEffect(() => {
    if (order) {
      const subtotal = Number(order.totalAmount || 0);
      const tax = Math.round((subtotal * 8) / 100);
      const total = subtotal + tax;

      setForm({
        order: order._id || "",
        method: "",
        amount: total,
        paidAt: new Date().toISOString().substring(0, 10),
        customerCash: "",
        changeAmount: "",
      });
    }
  }, [order]);

  const handleMethodChange = (method) => {
    setForm((prev) => ({ ...prev, method }));
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;

    setForm((prev) => {
      let updated = { ...prev, [name]: value };

      if (name === "customerCash") {
        const subtotal = Number(order?.totalAmount || 0);
        const tax = Math.round((subtotal * 8) / 100);
        const totalWithTax = subtotal + tax;

        const change = Number(value) - totalWithTax;
        updated.changeAmount = change >= 0 ? change : 0;
      }
      return updated;
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.order || !form.method) {
      toast.warning("Vui lòng chọn phương thức thanh toán!");
      return;
    }

    if (form.method === "cash") {
      const subtotal = Number(order?.totalAmount || 0);
      const tax = Math.round((subtotal * 8) / 100);
      const total = subtotal + tax;

      if (Number(form.customerCash) < total) {
        toast.error("💸 Tiền khách đưa không đủ!");
        return;
      }
    }

    try {
      await axios.post(API_URL, {
        order: form.order,
        method: form.method,
        amount: form.amount,
        status: "completed",
        paidAt: form.paidAt,
      });

      await axios.put(`${ORDER_URL}/${form.order}`, { status: "paid" });

      toast.success("✅ Thanh toán thành công!");
      onSuccess();
      onClose();
    } catch (err) {
      toast.error("❌ Lỗi khi xử lý thanh toán!");
    }
  };

  const selectedOrder =
    orders.find((o) => o._id === form.order) || order || null;

  if (loading) {
    return (
      <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
        <div className="bg-white p-6 rounded-xl w-[400px] text-center shadow-lg">
          <p className="text-gray-600">Đang tải dữ liệu đơn hàng...</p>
        </div>
      </div>
    );
  }

  const subtotal = Number(selectedOrder?.totalAmount || 0);
  const tax = Math.round((subtotal * 8) / 100);
  const totalWithTax = subtotal + tax;

  return (
    <>
      <ToastContainer position="top-right" autoClose={2000} hideProgressBar />
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
        <div className="bg-white rounded-xl w-[700px] shadow-2xl overflow-hidden animate-fade-in">

          {/* Header */}
          <div className="bg-gradient-to-r from-green-500 to-green-600 px-6 py-4 flex justify-between items-center">
            <h2 className="text-lg font-semibold text-white">
              Thanh Toán Đơn Hàng #{selectedOrder?._id?.slice(-6) || ""}
            </h2>
            <button
              onClick={onClose}
              className="text-white/80 hover:text-white transition"
            >
              <X size={22} />
            </button>
          </div>

          {/* Nội dung */}
          <div className="p-6 bg-white">

            {/* Tổng tiền + thuế */}
            <div className="mb-5">
              <div className="bg-gray-50 border border-gray-200 p-4 rounded-lg mb-2">
                <div className="flex justify-between items-center mb-1">
                  <div className="text-gray-700">Thành tiền</div>
                  <div className="font-semibold text-gray-800">{subtotal.toLocaleString('vi-VN')}₫</div>
                </div>
                <div className="flex justify-between items-center mb-1">
                  <div className="text-gray-700">Thuế (8%)</div>
                  <div className="font-semibold text-gray-800">{tax.toLocaleString('vi-VN')}₫</div>
                </div>
                <div className="flex justify-between items-center">
                  <div className="text-gray-700">Tổng phải thu</div>
                  <div className="font-semibold text-green-700">{totalWithTax.toLocaleString('vi-VN')}₫</div>
                </div>
              </div>
            </div>

            {/* Phương thức thanh toán */}
            <div className="mb-5">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Chọn phương thức thanh toán:
              </label>

              <div className="flex gap-3">
                {["cash", "card", "transfer"].map((m) => (
                  <label
                    key={m}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg border cursor-pointer transition-all ${
                      form.method === m
                        ? "border-green-500 bg-green-50 text-green-700"
                        : "border-gray-300 hover:bg-gray-100 text-gray-700"
                    }`}
                  >
                    <input
                      type="radio"
                      name="paymentMethod"
                      checked={form.method === m}
                      onChange={() => handleMethodChange(m)}
                      className="accent-green-600"
                    />

                    {m === "cash"
                      ? "💵 Tiền mặt"
                      : m === "card"
                      ? "💳 Thẻ"
                      : "🏦 Chuyển khoản"}
                  </label>
                ))}
              </div>
            </div>

            {/* Cash */}
            {form.method === "cash" && (
              <div className="bg-green-50 border border-green-200 p-4 rounded-lg mb-4">
                <label className="block text-sm text-gray-700 mb-1">
                  Tiền khách đưa
                </label>
                <input
                  type="number"
                  name="customerCash"
                  value={form.customerCash}
                  onChange={handleInputChange}
                  className="w-full p-2 rounded border border-gray-300 focus:border-green-500 focus:ring-green-500 outline-none mb-2"
                />

                <p className="text-gray-700">
                  Tiền thối lại:{" "}
                  <span className="font-semibold text-green-600">
                    {form.changeAmount
                      ? form.changeAmount.toLocaleString("vi-VN")
                      : 0}
                    ₫
                  </span>
                </p>
              </div>
            )}

            {/* Chuyển khoản */}
            {form.method === "transfer" && (
              <div className="text-center bg-green-50 border border-green-200 p-4 rounded-lg mb-4">
                <p className="text-gray-700 mb-2">
                  Quét mã QR để chuyển khoản tổng tiền:
                </p>
                <p className="text-xl font-semibold text-green-700 mb-2">
                  {totalWithTax.toLocaleString("vi-VN")}₫
                </p>
                <img
                  src="/assets/qr-bank.png"
                  alt="QR chuyển khoản"
                  className="mx-auto w-48 h-48 rounded-lg border border-green-300"
                />
              </div>
            )}

            {/* Thanh toán thẻ */}
            {form.method === "card" && (
              <div className="text-center bg-green-50 border border-green-200 p-4 rounded-lg mb-4">
                <p className="text-gray-700">
                  Vui lòng quẹt thẻ qua máy POS để hoàn tất thanh toán.
                </p>
              </div>
            )}

            {/* Buttons */}
            <div className="flex justify-end gap-3 pt-3 border-t border-gray-200">
              <button
                onClick={onClose}
                className="px-4 py-2 rounded-lg bg-gray-200 hover:bg-gray-300 text-gray-700 font-medium"
              >
                Hủy
              </button>

              <button
                onClick={handleSubmit}
                className="flex items-center gap-2 px-4 py-2 rounded-lg bg-green-600 hover:bg-green-700 text-white font-medium shadow"
              >
                <Save size={18} /> Xác nhận thanh toán
              </button>
            </div>

          </div>
        </div>
      </div>
    </>
  );
};

export default PaymentModal;
