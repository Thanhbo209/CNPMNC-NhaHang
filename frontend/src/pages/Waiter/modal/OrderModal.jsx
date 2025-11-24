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
        // keep _id and status so we can prevent removing items that are preparing/ready
        items: isServedOrder
          ? []
          : order.items?.map((i) => ({
            _id: i._id,
            food: i.food?._id || i.food,
            quantity: i.quantity,
            note: i.note || "",
            status: i.status || 'pending',
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
    // find item in form
    const target = form.items.find(i => (i._id && String(i._id) === String(foodId)) || String(i.food) === String(foodId));
    if (target && (String(target.status).toLowerCase() === 'preparing' || String(target.status).toLowerCase() === 'ready')) {
      return toast.error('Không thể xóa món đang chế biến hoặc đã sẵn sàng.');
    }
    setForm({ ...form, items: form.items.filter((i) => String(i.food) !== String(foodId) && String(i._id) !== String(foodId)) });
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
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50">
      <ToastContainer position="top-right" autoClose={2000} hideProgressBar theme="light" />

      <div className="relative bg-white w-[1000px] rounded-2xl border border-gray-200 p-6 shadow-2xl animate-fade-in">
        <button
          onClick={onClose}
          className="absolute top-3 right-3 text-gray-500 hover:text-black transition"
        >
          <X size={22} />
        </button>

        {/* Tiêu đề */}
        <h2 className="text-2xl font-bold mb-5 text-gray-700">
          {isEditMode ? "✏️ Chỉnh sửa Order" : "🧾 Tạo Order mới"} —{" "}
          <span className="text-green-600 font-bold">
            Bàn {table?.tableNumber || "?"}
          </span>
        </h2>

        <div className="flex gap-6">
          {/* Danh mục */}
          <div className="flex-1 flex flex-col">
            <div className="flex gap-2 mb-3 overflow-x-auto">
              {categories.map((cat) => (
                <button
                  key={cat._id}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-4 py-2 rounded-lg font-medium whitespace-nowrap transition-all ${selectedCategory?._id === cat._id
                      ? "bg-green-600 text-white shadow"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                    }`}
                >
                  {cat.name}
                </button>
              ))}
            </div>

            {/* Danh sách món */}
            <div className="flex-1 bg-gray-50 rounded-2xl p-5 border border-gray-200 shadow-inner overflow-y-auto max-h-[450px]">
              <h3 className="text-lg font-semibold mb-4 text-gray-700">
                🌿 Danh sách món ăn
              </h3>

              {/* 2 sản phẩm mỗi hàng */}
              <div className="grid grid-cols-2 gap-4">
                {foods.map((food) => (
                  <div
                    key={food._id}
                    onClick={() => handleAddItem(food)}
                    className="group bg-white rounded-xl border border-gray-200 hover:border-green-500 overflow-hidden shadow-sm hover:shadow-lg transition cursor-pointer"
                  >
                    <img
                      src={food.image || "/no-image.jpg"}
                      alt={food.name}
                      className="w-full h-32 object-cover group-hover:scale-105 transition"
                    />
                    <div className="p-3">
                      <h4 className="font-semibold text-sm text-gray-800 truncate mb-1">
                        {food.name}
                      </h4>
                      <p className="text-green-600 text-sm font-medium mb-3">
                        {food.price.toLocaleString()}₫
                      </p>

                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleAddItem(food);
                        }}
                        className="w-full py-2 rounded-lg bg-green-500 hover:bg-green-400 text-white shadow font-medium"
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
          <div className="flex-1 bg-gray-50 rounded-2xl p-5 border border-gray-200 shadow-inner flex flex-col">
            <h3 className="text-lg font-semibold mb-4 text-gray-700">
              🧩 Món đã chọn
            </h3>

            {!form.items.length ? (
              <p className="text-gray-500 text-center italic my-8">
                — Chưa có món nào —
              </p>
            ) : (
              <div className="space-y-4 overflow-y-auto max-h-[380px] pr-2">
                {form.items.map((item) => {
                  const food =
                    foods.find((f) => f._id === item.food) ||
                    allFoods.find((f) => f._id === item.food);

                  return (
                    <div
                      key={item.food}
                      className="flex items-center justify-between bg-white rounded-xl p-3 border border-gray-200 shadow-sm"
                    >
                      <div className="flex items-center gap-3">
                        <img
                          src={food?.image || "/no-image.jpg"}
                          alt={food?.name}
                          className="w-14 h-14 rounded-lg object-cover border"
                        />
                        <div>
                          <p className="font-semibold text-sm text-gray-800">
                            {food?.name}
                          </p>
                          <p className="text-green-600 text-xs">
                            {(food?.price || 0).toLocaleString()}₫
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <input
                          type="number"
                          min={1}
                          value={item.quantity}
                          onChange={(e) =>
                            handleChangeItem(item.food, "quantity", +e.target.value)
                          }
                          className="w-14 text-center bg-gray-100 rounded-md py-1 text-sm"
                        />

                        <input
                          type="text"
                          value={item.note}
                          placeholder="Ghi chú"
                          onChange={(e) =>
                            handleChangeItem(item.food, "note", e.target.value)
                          }
                          className="bg-gray-100 rounded-md py-1 px-2 text-sm w-36"
                        />

                        <button
                          onClick={() => handleRemoveItem(item.food)}
                          className="text-red-500 hover:text-red-600 transition"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            <div className="mt-auto pt-4 border-t border-gray-300 text-right text-gray-800">
              Tổng:{" "}
              <span className="text-green-600 text-lg font-semibold">
                {totalAmount.toLocaleString()}₫
              </span>
            </div>
          </div>
        </div>

        {/* Ghi chú & trạng thái */}
        <div className="mt-6 flex gap-4">
          <div className="flex-1">
            <label className="block mb-1 text-gray-600 text-sm">Ghi chú Order:</label>
            <textarea
              value={form.orderNote}
              onChange={(e) => setForm({ ...form, orderNote: e.target.value })}
              rows={2}
              className="w-full bg-gray-100 rounded-lg p-2 text-sm border border-gray-300"
            />
          </div>

          <div>
            <label className="block mb-1 text-gray-600 text-sm">Trạng thái:</label>
            <select
              value={form.status}
              onChange={(e) => setForm({ ...form, status: e.target.value })}
              className="bg-gray-100 px-3 py-2 rounded-lg text-sm border border-gray-300"
            >
              <option value="pending">Chờ xử lý</option>
              <option value="preparing">Đang chuẩn bị</option>
              <option value="served">Đã phục vụ</option>
              <option value="paid">Đã thanh toán</option>
            </select>
          </div>
        </div>

        <div className="mt-6 flex justify-end gap-3">
          <button className="px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded-lg text-gray-700">
            Hủy
          </button>

          <button className="px-4 py-2 rounded-lg bg-green-600 hover:bg-green-500 text-white shadow font-semibold">
            {isEditMode ? "Cập nhật Order" : "Lưu Order"}
          </button>
        </div>
      </div>
    </div>

  );
};

export default OrderModal;
