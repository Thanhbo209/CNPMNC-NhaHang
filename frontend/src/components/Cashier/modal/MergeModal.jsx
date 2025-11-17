import React, { useMemo, useState } from 'react';
import axios from 'axios';
import { X, Check } from 'lucide-react';
import { toast } from 'react-toastify';

const API_ORDERS = 'http://localhost:2095/api/orders';

const money = (v = 0) => `${Number(v || 0).toLocaleString('vi-VN')}₫`;

const MergeModal = ({ pendingOrders = [], onClose, onMerged }) => {
  const [selected, setSelected] = useState([]);
  const [loading, setLoading] = useState(false);

  const toggle = (id) => {
    setSelected((prev) => {
      if (prev.includes(id)) return prev.filter(x => x !== id);
      return [...prev, id];
    });
  };

  // map selected orders for quick access
  const selectedOrders = useMemo(() => {
    return pendingOrders.filter(o => selected.includes(o._id));
  }, [pendingOrders, selected]);

  const computeOrderSubtotal = (o) => {
    const items = [];
    if (Array.isArray(o.items)) items.push(...o.items);
    if (Array.isArray(o.addedItems)) items.push(...o.addedItems);
    return items.reduce((s, it) => {
      const price = (it.food && it.food.price) ? it.food.price : 0;
      const qty = it.quantity || 0;
      return s + price * qty;
    }, 0);
  };

  const aggregate = useMemo(() => {
    const byFood = [];
    let subtotal = 0;
    selectedOrders.forEach((o) => {
      const items = [];
      if (Array.isArray(o.items)) items.push(...o.items);
      if (Array.isArray(o.addedItems)) items.push(...o.addedItems);
      items.forEach(it => {
        const price = (it.food && it.food.price) ? it.food.price : 0;
        const qty = it.quantity || 0;
        const name = it.food?.name || 'Món đã xóa';
        const line = price * qty;
        subtotal += line;
        byFood.push({ name, qty, price, line, orderId: o._id });
      });
    });
    const taxPercent = 8;
    const taxAmount = Math.round((subtotal * taxPercent) / 100);
    const total = subtotal + taxAmount;
    return { items: byFood, subtotal, taxPercent, taxAmount, total };
  }, [selectedOrders]);

  const handleMerge = async () => {
    if (!selected || selected.length < 2) {
      toast.warning('Vui lòng chọn ít nhất 2 đơn để gộp');
      return;
    }
    setLoading(true);
    try {
      const res = await axios.post(`${API_ORDERS}/merge`, { orderIds: selected });
      toast.success('Gộp đơn thành công');
      onMerged && onMerged(res.data);
      onClose && onClose();
    } catch (err) {
      console.error('Lỗi gộp đơn', err);
      toast.error(err?.response?.data?.error || 'Lỗi khi gộp đơn');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl w-[1000px] max-w-[95%] shadow-2xl overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 bg-gradient-to-r from-blue-500 to-blue-600 text-white">
          <h3 className="font-semibold">Gộp Hóa Đơn</h3>
          <button onClick={onClose} className="opacity-90 hover:opacity-100"><X size={20} /></button>
        </div>

        <div className="p-4 grid grid-cols-12 gap-4">
          {/* Left: list of orders */}
          <div className="col-span-5 max-h-[480px] overflow-y-auto border rounded p-3">
            <p className="text-sm text-gray-600 mb-3">Chọn các đơn hàng đang chờ thanh toán để gộp.</p>
            {pendingOrders.length === 0 && (
              <div className="text-gray-400 text-center py-8">Không có đơn nào để gộp</div>
            )}

            <div className="space-y-2">
              {pendingOrders.map((o) => {
                const subtotal = computeOrderSubtotal(o);
                return (
                  <div key={o._id} className="p-2 rounded hover:bg-gray-50 flex items-start justify-between">
                    <label className="flex items-start gap-3">
                      <input type="checkbox" checked={selected.includes(o._id)} onChange={() => toggle(o._id)} className="mt-1 accent-blue-600" />
                      <div>
                        <div className="font-medium">Order {o._id?.slice(-6)} - Bàn: {o.table?.tableNumber || o.tableNumber || '-'}</div>
                        <div className="text-sm text-gray-500">{o.items?.length || 0} món • Tổng: {money(subtotal)}</div>
                        <div className="text-xs text-gray-400">{o.createdAt ? new Date(o.createdAt).toLocaleString('vi-VN') : ''}</div>
                      </div>
                    </label>
                    <div className="text-xs text-gray-500">{o.note || ''}</div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Right: preview */}
          <div className="col-span-7 max-h-[480px] overflow-y-auto border rounded p-3">
            <p className="text-sm text-gray-600 mb-3">Xem trước các món và tổng tiền của các đơn đã chọn</p>

            {selectedOrders.length === 0 ? (
              <div className="text-center text-gray-400 py-10">Chưa có đơn nào được chọn</div>
            ) : (
              <div className="space-y-4">
                {/* Per-order breakdown */}
                {selectedOrders.map((o) => (
                  <div key={`preview-${o._id}`} className="border rounded p-3">
                    <div className="flex items-center justify-between mb-2">
                      <div className="font-medium">Order {o._id?.slice(-6)} - Bàn {o.table?.tableNumber || o.tableNumber || '-'}</div>
                      <div className="text-sm text-gray-600">{money(computeOrderSubtotal(o))}</div>
                    </div>
                    <div className="text-sm text-gray-700 max-h-40 overflow-y-auto">
                      <table className="w-full text-sm">
                        <tbody>
                          {([...(o.items || []), ...(o.addedItems || [])]).map((it, idx) => {
                            const name = it.food?.name || 'Món đã xóa';
                            const qty = it.quantity || 0;
                            const price = (it.food && it.food.price) ? it.food.price : 0;
                            const line = price * qty;
                            return (
                              <tr key={idx} className="align-top">
                                <td className="py-1 text-gray-800">{name} x{qty}</td>
                                <td className="py-1 text-right text-gray-700">{money(price)}</td>
                                <td className="py-1 text-right text-green-600 font-medium">{money(line)}</td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  </div>
                ))}

                {/* Aggregated summary */}
                <div className="border-t pt-3">
                  <div className="flex justify-between items-center mb-2">
                    <div className="text-sm text-gray-600">Tạm tính</div>
                    <div className="font-semibold">{money(aggregate.subtotal)}</div>
                  </div>
                  <div className="flex justify-between items-center mb-2">
                    <div className="text-sm text-gray-600">Thuế ({aggregate.taxPercent}%)</div>
                    <div className="font-semibold">{money(aggregate.taxAmount)}</div>
                  </div>
                  <div className="flex justify-between items-center mt-2 text-lg font-bold">
                    <div>Tổng</div>
                    <div className="text-green-600">{money(aggregate.total)}</div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Buttons full width bottom */}
          <div className="col-span-12 mt-3 flex justify-end gap-3 px-3">
            <button onClick={onClose} className="px-4 py-2 bg-gray-200 rounded">Hủy</button>
            <button disabled={selected.length < 2 || loading} onClick={handleMerge} className={`px-4 py-2 rounded ${selected.length < 2 ? 'bg-gray-300' : 'bg-blue-600 text-white'}`}>
              {loading ? 'Đang xử lý...' : (<><Check size={16} className="inline-block mr-2"/> Gộp {selected.length > 0 ? `(${selected.length})` : ''}</>)}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MergeModal;
