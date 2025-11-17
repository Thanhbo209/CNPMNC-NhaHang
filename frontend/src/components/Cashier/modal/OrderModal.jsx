import React, { useEffect, useState } from "react";
import axios from "axios";
import { X, Plus, Trash2 } from "lucide-react";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const OrderModal = ({ open, onClose, order, table, onSaved }) => {
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [foods, setFoods] = useState([]);
  const [allFoods, setAllFoods] = useState([]);
  const [form, setForm] = useState({
    table: table?._id,
    items: [],
    orderNote: "",
    status: "pending",
  });
  const [totalAmount, setTotalAmount] = useState(0);

  const isEditMode = Boolean(order?._id);
  const isServedOrder = order?.status === "served";

  // --- Fetch all foods ---
  useEffect(() => {
    const fetchAllFoods = async () => {
      try {
        const res = await axios.get("http://localhost:2095/api/foods");
        setAllFoods(res.data);
      } catch (err) {
        console.error(err);
        toast.error("Không thể tải danh sách món ăn!");
      }
    };
    fetchAllFoods();
  }, []);

  // --- Fetch categories ---
  const fetchCategories = async () => {
    try {
      const res = await axios.get("http://localhost:2095/api/categories");
      setCategories(res.data);
      if (res.data.length > 0) setSelectedCategory(res.data[0]);
    } catch (err) {
      console.error(err);
      toast.error("Không thể tải danh mục!");
    }
  };

  // --- Fetch foods by category ---
  const fetchFoods = async (categoryId) => {
    try {
      const res = await axios.get(
        `http://localhost:2095/api/foods?categoryId=${categoryId}`
      );
      setFoods(res.data);
    } catch (err) {
      console.error(err);
      toast.error("Không thể tải danh sách món ăn!");
    }
  };

  // --- Khi mở modal ---
  useEffect(() => {
    fetchCategories();

    if (order?._id) {
      setForm({
        table: order.table?._id || table?._id,
        items: isServedOrder
          ? []
          : order.items?.map((i) => ({
              food: i.food?._id || i.food,
              quantity: i.quantity,
              note: i.note || "",
            })) || [],
        orderNote: order.orderNote || "",
        status: order.status || "pending",
      });
    } else {
      setForm({
        table: table?._id,
        items: [],
        orderNote: "",
        status: "pending",
      });
    }
  }, [order, table]);

  // --- Khi đổi danh mục ---
  useEffect(() => {
    if (selectedCategory) fetchFoods(selectedCategory._id);
  }, [selectedCategory]);

  // --- Thêm món ---
  const handleAddItem = (food) => {
    const exists = form.items.find((i) => i.food === food._id);
    const updated = exists
      ? form.items.map((i) =>
          i.food === food._id ? { ...i, quantity: i.quantity + 1 } : i
        )
      : [...form.items, { food: food._id, quantity: 1, note: "" }];
    setForm({ ...form, items: updated });
  };

  // --- Xóa món ---
  const handleRemoveItem = (foodId) => {
    setForm({ ...form, items: form.items.filter((i) => i.food !== foodId) });
  };

  // --- Chỉnh số lượng / ghi chú ---
  const handleChangeItem = (foodId, field, value) => {
    const updated = form.items.map((i) =>
      i.food === foodId ? { ...i, [field]: value } : i
    );
    setForm({ ...form, items: updated });
  };

  // --- Submit ---
  const handleSubmit = async () => {
    try {
      if (!form.items.length && !(!isEditMode && order?.addedItems?.length)) {
        return toast.warning("Vui lòng chọn ít nhất 1 món ăn!");
      }

      let savedOrder;

      if (isEditMode) {
        if (isServedOrder) {
          savedOrder = (
            await axios.patch(
              `http://localhost:2095/api/orders/${order._id}/add-items`,
              { addedItems: form.items }
            )
          ).data;
        } else {
          savedOrder = (
            await axios.put(`http://localhost:2095/api/orders/${order._id}`, form)
          ).data;
        }
      } else {
        savedOrder = (
          await axios.post("http://localhost:2095/api/orders/create", form)
        ).data;
      }

      onSaved?.(savedOrder);
      onClose();
    } catch (err) {
      console.error(err);
      toast.error("Không thể lưu order!");
    }
  };

  // --- Tính tổng tiền ---
  useEffect(() => {
    const total = [
      ...(form.items || []),
      ...(order?.addedItems || []),
    ].reduce((sum, i) => {
      const foodId = i.food?._id || i.food;
      const food =
        allFoods.find((f) => f._id === foodId) ||
        foods.find((f) => f._id === foodId);
      return sum + (food ? food.price * i.quantity : 0);
    }, 0);
    setTotalAmount(total);
  }, [form.items, order?.addedItems, foods, allFoods]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50">
      <ToastContainer position="top-right" autoClose={2000} hideProgressBar theme="light" />

      <div className="relative bg-gradient-to-br from-emerald-900/80 to-green-800/80 w-[1000px] rounded-2xl border border-emerald-600/60 p-6 shadow-[0_0_25px_rgba(34,197,94,0.4)] animate-fade-in">
        <button
          onClick={onClose}
          className="absolute top-3 right-3 text-emerald-300 hover:text-white transition"
        >
          <X size={22} />
        </button>

        {/* Tiêu đề */}
        <h2 className="text-2xl font-bold mb-5 text-emerald-100">
          {isEditMode ? "✏️ Chỉnh sửa Order" : "🧾 Tạo Order mới"} —{" "}
          <span className="text-emerald-400 font-bold">
            Bàn {table?.tableNumber || "?"}
          </span>
        </h2>

        {/* 2 cột chính */}
        <div className="flex gap-6">
          {/* Danh sách món ăn */}
          <div className="flex-1 flex flex-col">
            {/* Danh mục */}
            <div className="flex gap-2 mb-3 overflow-x-auto">
              {categories.map((cat) => (
                <button
                  key={cat._id}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-4 py-2 rounded-lg font-medium whitespace-nowrap transition-all ${
                    selectedCategory?._id === cat._id
                      ? "bg-emerald-600 text-white shadow-[0_0_10px_#22c55e]"
                      : "bg-emerald-800/40 text-emerald-200 hover:bg-emerald-700/60"
                  }`}
                >
                  {cat.name}
                </button>
              ))}
            </div>

            {/* Danh sách món */}
            <div className="flex-1 custom-scroll bg-gradient-to-br from-slate-900/70 to-emerald-900/30 rounded-2xl p-5 border border-emerald-700/60 shadow-inner overflow-y-auto max-h-[450px]">
              <h3 className="text-lg font-semibold mb-4 text-emerald-200">
                🌿 Danh sách món ăn
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {foods.map((food) => (
                  <div
                    key={food._id}
                    onClick={() => handleAddItem(food)}
                    className="group bg-slate-900/60 rounded-xl border border-emerald-700/40 hover:border-emerald-400 overflow-hidden shadow-md hover:shadow-[0_0_16px_#22c55e90] transition-all duration-300 cursor-pointer"
                  >
                    <div className="relative">
                      <img
                        src={food.image || "/no-image.jpg"}
                        alt={food.name}
                        className="w-full h-28 object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-all"></div>
                    </div>
                    <div className="p-3">
                      <h4 className="font-semibold text-sm text-white truncate mb-1">
                        {food.name}
                      </h4>
                      <p className="text-emerald-400 text-sm font-medium mb-3">
                        {food.price.toLocaleString()}₫
                      </p>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleAddItem(food);
                        }}
                        className="w-full py-2 rounded-lg bg-gradient-to-r from-emerald-600 to-green-500 hover:from-emerald-500 hover:to-green-400 text-white transition-all shadow-[0_0_12px_#22c55e80] font-medium"
                      >
                        <Plus size={14} className="inline-block mr-1" />
                        Thêm món
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Món đã chọn */}
          <div className="flex-1 bg-slate-900/70 rounded-2xl p-5 border border-emerald-700/60 shadow-inner flex flex-col">
            <h3 className="text-lg font-semibold mb-4 text-emerald-200">
              🧩 Món đã chọn
            </h3>

            {!form.items.length && !order?.addedItems?.length ? (
              <p className="text-emerald-300/70 italic text-center my-8">
                — Chưa có món nào —
              </p>
            ) : (
              <div className="space-y-4 overflow-y-auto max-h-[380px] pr-2 custom-scroll">
                {form.items.map((item) => {
                  const food =
                    foods.find((f) => f._id === item.food) ||
                    allFoods.find((f) => f._id === item.food);
                  return (
                    <div
                      key={`new-${item.food}`}
                      className="flex items-center justify-between bg-emerald-900/40 rounded-xl p-3 border border-emerald-700/50"
                    >
                      <div className="flex items-center gap-3">
                        <img
                          src={food?.image || "/no-image.jpg"}
                          alt={food?.name || ""}
                          className="w-14 h-14 object-cover rounded-lg border border-emerald-700"
                        />
                        <div>
                          <p className="font-semibold text-sm text-white">
                            {food?.name || "Món đã xóa"}
                          </p>
                          <p className="text-emerald-400 text-xs">
                            {(food?.price || 0).toLocaleString()}₫
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <input
                          type="number"
                          min={1}
                          value={item.quantity}
                          disabled={isServedOrder}
                          onChange={(e) =>
                            handleChangeItem(
                              item.food,
                              "quantity",
                              parseInt(e.target.value)
                            )
                          }
                          className="w-14 text-center bg-emerald-800/50 rounded-md py-1 text-sm text-white"
                        />
                        <input
                          type="text"
                          value={item.note}
                          disabled={isServedOrder}
                          placeholder="Ghi chú"
                          onChange={(e) =>
                            handleChangeItem(item.food, "note", e.target.value)
                          }
                          className="bg-emerald-800/50 rounded-md py-1 px-2 text-sm w-36 text-white"
                        />
                        {!isServedOrder && (
                          <button
                            onClick={() => handleRemoveItem(item.food)}
                            className="text-red-400 hover:text-red-500 transition"
                          >
                            <Trash2 size={16} />
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            <div className="mt-auto pt-4 border-t border-emerald-700 text-right text-white">
              Tổng:{" "}
              <span className="text-emerald-400 text-lg font-semibold">
                {totalAmount.toLocaleString()}₫
              </span>
            </div>
          </div>
        </div>

        {/* Ghi chú & trạng thái */}
        <div className="mt-6 flex gap-4">
          <div className="flex-1">
            <label className="block mb-1 text-emerald-200 text-sm">
              Ghi chú Order:
            </label>
            <textarea
              value={form.orderNote}
              onChange={(e) => setForm({ ...form, orderNote: e.target.value })}
              rows={2}
              className="w-full bg-emerald-900/40 rounded-lg p-2 text-sm text-white border border-emerald-700"
            />
          </div>

          <div>
            <label className="block mb-1 text-emerald-200 text-sm">
              Trạng thái:
            </label>
            <select
              value={form.status}
              onChange={(e) => setForm({ ...form, status: e.target.value })}
              className="bg-emerald-900/40 px-3 py-2 rounded-lg text-sm text-white border border-emerald-700"
            >
              {(() => {
                switch (form.status) {
                  case "pending":
                    return (
                      <>
                        <option value="pending">Chờ xử lý</option>
                        <option value="preparing">Đang chuẩn bị</option>
                      </>
                    );
                  case "preparing":
                    return (
                      <>
                        <option value="preparing">Đang chuẩn bị</option>
                        <option value="served">Đã phục vụ</option>
                      </>
                    );
                  case "served":
                    return <option value="served">Đã phục vụ</option>;
                  case "paid":
                    return <option value="paid">Đã thanh toán</option>;
                  default:
                    return null;
                }
              })()}
            </select>
          </div>
        </div>

        {/* Nút hành động */}
        <div className="mt-6 flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-emerald-800/60 hover:bg-emerald-700/60 rounded-lg text-white transition-all"
          >
            Hủy
          </button>
          <button
            onClick={handleSubmit}
            className="px-4 py-2 rounded-lg bg-gradient-to-r from-emerald-600 to-green-500 hover:from-emerald-500 hover:to-green-400 text-white shadow-[0_0_12px_#22c55e80] font-semibold transition-all"
          >
            {isEditMode
              ? isServedOrder
                ? "Thêm món mới"
                : "Cập nhật Order"
              : "Lưu Order"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default OrderModal;
