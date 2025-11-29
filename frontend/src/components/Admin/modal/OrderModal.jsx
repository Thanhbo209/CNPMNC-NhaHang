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

  // --- Load danh sách món ăn ---
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

  // --- Load danh mục ---
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

  useEffect(() => {
    fetchCategories();
    if (isEditMode) {
      setForm({
        table: order.table?._id || table?._id,
        items: isServedOrder
          ? [] // không sửa items cũ nếu đã served
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

  // --- Lấy món theo category ---
  useEffect(() => {
    if (!selectedCategory) return;
    const fetchFoods = async () => {
      try {
        const res = await axios.get(
          `http://localhost:2095/api/foods?categoryId=${selectedCategory._id}`
        );
        setFoods(res.data);
      } catch (err) {
        console.error(err);
        toast.error("Không thể tải danh sách món ăn!");
      }
    };
    fetchFoods();
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

  // --- Thay đổi số lượng / ghi chú ---
  const handleChangeItem = (foodId, field, value) => {
    setForm({
      ...form,
      items: form.items.map((i) =>
        i.food === foodId ? { ...i, [field]: value } : i
      ),
    });
  };

  // --- Tính tổng tiền ---
  useEffect(() => {
    const total = [...(form.items || []), ...(order?.addedItems || [])].reduce(
      (sum, i) => {
        const foodId = i.food?._id || i.food;
        const food =
          allFoods.find((f) => f._id === foodId) ||
          foods.find((f) => f._id === foodId);
        return sum + (food ? food.price * i.quantity : 0);
      },
      0
    );
    setTotalAmount(total);
  }, [form.items, order?.addedItems, foods, allFoods]);

  // --- Lưu / update order ---
  const handleSubmit = async () => {
    try {
      if (!form.items.length && !(!isEditMode && order?.addedItems?.length)) {
        return toast.warning("Vui lòng chọn ít nhất 1 món ăn!");
      }

      let savedOrder;

      if (isEditMode) {
        if (isServedOrder) {
          // thêm món cho order đã served
          savedOrder = (
            await axios.patch(
              `http://localhost:2095/api/orders/${order._id}/add-items`,
              { addedItems: form.items }
            )
          ).data;
        } else {
          // update order
          savedOrder = (
            await axios.put(
              `http://localhost:2095/api/orders/${order._id}`,
              form
            )
          ).data;
        }
      } else {
        // tạo order mới
        savedOrder = (
          await axios.post("http://localhost:2095/api/orders/create", form)
        ).data;
      }

      // ✅ callback để AdminOrderManager cập nhật ngay
      onSaved?.(savedOrder);
      onClose();
    } catch (err) {
      console.error(err);
      toast.error("Không thể lưu order!");
    }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50">
      <ToastContainer
        position="top-right"
        autoClose={2000}
        hideProgressBar
        theme="light"
      />

      <div className="relative bg-white w-[1500px] rounded-2xl border border-gray-200 p-6 shadow-lg animate-fade-in">
        <button
          onClick={onClose}
          className="absolute top-3 right-3 text-gray-600 hover:text-gray-800 transition"
        >
          <X size={22} />
        </button>

        <h2 className="text-2xl font-bold mb-5 text-gray-800">
          {isEditMode ? "✏️ Chỉnh sửa Order" : "🧾 Tạo Order mới"} —{" "}
          <span className="text-gray-600 font-bold">
            Bàn {table?.tableNumber || "?"}
          </span>
        </h2>

        <div className="flex gap-6">
          {/* --- Danh sách món ăn --- */}
          <div className="flex-1 flex flex-col">
            <div className="flex gap-2 mb-3 overflow-x-auto">
              {categories.map((cat) => (
                <button
                  key={cat._id}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-4 py-2 rounded-lg font-medium whitespace-nowrap transition-all ${
                    selectedCategory?._id === cat._id
                      ? "bg-gray-800 text-white shadow"
                      : "bg-gray-200 text-gray-800 hover:bg-gray-300"
                  }`}
                >
                  {cat.name}
                </button>
              ))}
            </div>

            <div className="flex-1 bg-gray-50 rounded-2xl p-5 border border-gray-300 shadow-inner overflow-y-auto max-h-[450px]">
              <h3 className="text-lg font-semibold mb-4 text-gray-700">
                🌿 Danh sách món ăn
              </h3>
              <div className="grid grid-cols-2 gap-4">
                {foods.map((food) => (
                  <div
                    key={food._id}
                    onClick={() => handleAddItem(food)}
                    className="bg-white rounded-xl border border-gray-300 overflow-hidden shadow-sm hover:shadow-md transition cursor-pointer"
                  >
                    <div className="relative">
                      <img
                        src={food.image || "/no-image.jpg"}
                        alt={food.name}
                        className="w-full h-28 object-cover"
                      />
                    </div>
                    <div className="p-3">
                      <h4 className="font-semibold text-sm text-gray-800 truncate mb-1">
                        {food.name}
                      </h4>
                      <p className="text-gray-600 text-sm font-medium mb-3">
                        {food.price.toLocaleString()}₫
                      </p>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleAddItem(food);
                        }}
                        className="w-full py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white transition-all font-medium"
                      >
                        <Plus size={14} className="inline-block mr-1" /> Thêm
                        món
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* --- Món đã chọn --- */}
          <div className="flex-1 bg-gray-100 rounded-2xl p-5 border border-gray-300 shadow-inner flex flex-col">
            <h3 className="text-lg font-semibold mb-4 text-gray-700">
              🧩 Món đã chọn
            </h3>

            {!form.items.length && !order?.addedItems?.length ? (
              <p className="text-gray-500 italic text-center my-8">
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
                      key={`new-${item.food}`}
                      className="flex items-center justify-between bg-white rounded-xl p-3 border border-gray-300"
                    >
                      <div className="flex items-center gap-3">
                        <img
                          src={food?.image || "/no-image.jpg"}
                          alt={food?.name || ""}
                          className="w-14 h-14 object-cover rounded-lg border border-gray-300"
                        />
                        <div>
                          <p className="font-semibold text-sm text-gray-800">
                            {food?.name || "Món đã xóa"}
                          </p>
                          <p className="text-gray-600 text-xs">
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
                          className="w-14 text-center bg-gray-100 rounded-md py-1 text-sm text-gray-800"
                        />
                        <input
                          type="text"
                          value={item.note}
                          disabled={isServedOrder}
                          placeholder="Ghi chú"
                          onChange={(e) =>
                            handleChangeItem(item.food, "note", e.target.value)
                          }
                          className="bg-gray-100 rounded-md py-1 px-2 text-sm w-36 text-gray-800"
                        />
                        {!isServedOrder && (
                          <button
                            onClick={() => handleRemoveItem(item.food)}
                            className="text-red-500 hover:text-red-600 transition"
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

            <div className="mt-auto pt-4 border-t border-gray-300 text-right text-gray-800">
              Tổng:{" "}
              <span className="text-gray-900 text-lg font-semibold">
                {totalAmount.toLocaleString()}₫
              </span>
            </div>
          </div>
        </div>

        {/* Ghi chú + trạng thái */}
        <div className="mt-6 flex gap-4">
          <div className="flex-1">
            <label className="block mb-1 text-gray-700 text-sm">
              Ghi chú Order:
            </label>
            <textarea
              value={form.orderNote}
              onChange={(e) => setForm({ ...form, orderNote: e.target.value })}
              rows={2}
              className="w-full bg-gray-100 rounded-lg p-2 text-sm text-gray-800 border border-gray-300"
            />
          </div>

          <div>
            <label className="block mb-1 text-gray-700 text-sm">
              Trạng thái:
            </label>
            <select
              value={form.status}
              onChange={(e) => setForm({ ...form, status: e.target.value })}
              className="bg-gray-100 px-3 py-2 rounded-lg text-sm text-gray-800 border border-gray-300"
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

        {/* Buttons */}
        <div className="mt-6 flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-blue-100 hover:bg-blue-300 rounded-lg text-gray-800 transition-all"
          >
            Hủy
          </button>
          <button
            onClick={handleSubmit}
            className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-semibold transition-all"
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
