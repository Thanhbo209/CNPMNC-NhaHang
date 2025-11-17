import React, { useEffect, useState } from "react";
import axios from "axios";
import { Plus, Utensils, Grid, Layers, Star, Edit, Trash2 } from "lucide-react";
import StatCard from "../../components/common/StatCard";
import CategoryModal from "../../components/Admin/modal/CategoryModal";
import FoodModal from "../../components/Admin/modal/FoodModal";
import FoodCard from "../../components/common/FoodCard";
import toast from "react-hot-toast";

const AdminMenuManager = () => {
  // ========================= STATE =========================
  const [categories, setCategories] = useState([]);
  const [foods, setFoods] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null);

  // Modal control
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);

  const [isFoodModalOpen, setIsFoodModalOpen] = useState(false);
  const [editingFood, setEditingFood] = useState(null);

  // Stats
  const [totalCategories, setTotalCategories] = useState(0);
  const [totalFoods, setTotalFoods] = useState(0);
  const [featuredFoods, setFeaturedFoods] = useState(0);
  const [todayFoods, setTodayFoods] = useState(0);

  // ========================= FETCH DATA =========================
  const fetchCategories = async () => {
    try {
      const res = await axios.get("http://localhost:2095/api/categories");
      setCategories(res.data);
      setTotalCategories(res.data.length);
    } catch (err) {
      console.error("❌ Lỗi fetch categories:", err);
    }
  };

  const fetchFoods = async () => {
    try {
      const res = await axios.get("http://localhost:2095/api/foods");
      setFoods(res.data);
      setTotalFoods(res.data.length);
      setFeaturedFoods(res.data.filter((f) => f.featured).length);

      const today = new Date().toISOString().slice(0, 10);
      setTodayFoods(res.data.filter((f) => f.createdAt?.slice(0, 10) === today).length);
    } catch (err) {
      console.error("❌ Lỗi fetch foods:", err);
    }
  };

  useEffect(() => {
    fetchCategories();
    fetchFoods();
  }, []);

  // ========================= HANDLERS =========================
  const handleAddCategory = () => {
    setEditingCategory(null);
    setIsCategoryModalOpen(true);
  };

  const handleEditCategory = (category) => {
    setEditingCategory(category);
    setIsCategoryModalOpen(true);
  };

  const handleDeleteCategory = async (id) => {
    if (!window.confirm("Bạn có chắc muốn xóa danh mục này?")) return;
    try {
      await axios.delete(`http://localhost:2095/api/categories/${id}`);
      fetchCategories();
      toast.success("Xóa danh mục thành công!");
    } catch (err) {
      console.error(err);
      toast.error("Xóa thất bại!");
    }
  };

  const handleOpenFoodModal = (food = null) => {
    setEditingFood(food);
    setIsFoodModalOpen(true);
  };

  const handleDeleteFood = async (id) => {
    if (!window.confirm("Bạn có chắc muốn xóa món ăn này?")) return;
    try {
      await axios.delete(`http://localhost:2095/api/foods/${id}`);
      fetchFoods();
      toast.success("Xóa món ăn thành công!");
    } catch (err) {
      console.error(err);
      toast.error("Xóa thất bại!");
    }
  };

  const filteredFoods = selectedCategory
    ? foods.filter((f) => f.category?._id === selectedCategory)
    : [];

  // ========================= RENDER =========================
  return (
    <div className="p-8">
      {/* ====== 4 Thẻ thống kê ====== */}
      <div className="grid grid-cols-4 gap-6 mb-10 animate-fade-in">
        <StatCard title="Tổng Danh Mục" value={totalCategories} color="purple" icon={<Grid size={18} />} />
        <StatCard title="Tổng Món Ăn" value={totalFoods} color="blue" icon={<Utensils size={18} />} />
        <StatCard title="Món Đặc Biệt" value={featuredFoods} color="red" icon={<Star size={18} />} />
        <StatCard title="Món Ăn Hôm Nay" value={todayFoods} color="green" icon={<Layers size={18} />} />
      </div>

      {/* ====== Quản lý danh mục ====== */}
      <div className="bg-white p-6 rounded-2xl shadow-[0_0_15px_rgba(0,0,0,0.1)] mb-8 border border-gray-200">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-gray-800 tracking-wide flex items-center gap-2">
            📂 Danh Mục
          </h2>
          <button
            onClick={handleAddCategory}
            className="flex items-center gap-2 px-4 py-2 rounded-lg 
              bg-gradient-to-r from-violet-600 to-fuchsia-500 
              text-white font-medium transition-all duration-300 
              hover:scale-[1.05] hover:shadow-[0_0_12px_#c084fc,0_0_24px_#a855f7]"
          >
            <Plus size={18} /> Thêm Danh Mục
          </button>
        </div>

        <div className="grid grid-cols-4 gap-6 animate-fade-in">
          {categories.map((cat) => (
            <div
              key={cat._id}
              onClick={() => setSelectedCategory(cat._id)}
              className={`group relative cursor-pointer overflow-hidden bg-gray-50 p-4 rounded-2xl border transition-all duration-300
                ${
                  selectedCategory === cat._id
                    ? "border-violet-500 shadow-[0_0_12px_#8b5cf6,0_0_24px_#a78bfa]"
                    : "border-gray-200 hover:border-violet-400 hover:shadow-[0_0_10px_rgba(139,92,246,0.3)]"
                }`}
            >
              <div className="relative w-full h-32 overflow-hidden rounded-xl mb-3">
                <img
                  src={cat.image || "/placeholder.png"}
                  alt={cat.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
              </div>

              <div className="min-h-[90px] flex flex-col justify-between">
                <div>
                  <h3 className="font-semibold text-gray-900 text-lg truncate">{cat.name}</h3>
                  <p className="text-gray-600 text-sm line-clamp-2">{cat.description}</p>
                </div>

                <div className="flex justify-end gap-2 mt-3">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleEditCategory(cat);
                    }}
                    className="p-1.5 rounded bg-yellow-100 hover:bg-yellow-200 text-yellow-600 transition-all duration-200 hover:shadow-[0_0_10px_rgba(250,204,21,0.6)]"
                  >
                    <Edit size={16} />
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeleteCategory(cat._id);
                    }}
                    className="p-1.5 rounded bg-red-100 hover:bg-red-200 text-red-600 transition-all duration-200 hover:shadow-[0_0_10px_rgba(239,68,68,0.6)]"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ====== Quản lý món ăn ====== */}
      <div className="bg-white p-6 rounded-2xl shadow-[0_0_25px_rgba(0,0,0,0.06)] border border-gray-200 transition-all duration-300">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-semibold text-gray-800 tracking-wide">Danh Sách Món Ăn</h2>

          {selectedCategory && (
            <button
              onClick={() => handleOpenFoodModal(null)}
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-gradient-to-r from-sky-400 to-blue-500 
                text-white font-medium transition-all duration-300 
                hover:scale-[1.05] hover:shadow-[0_0_15px_rgba(56,189,248,0.5),0_0_30px_rgba(59,130,246,0.4)]"
            >
              <Plus size={18} /> Thêm Món Ăn
            </button>
          )}
        </div>

        <div className="flex gap-6 items-start">
          {/* --- DANH SÁCH MÓN ĂN --- */}
          <div className="flex-1 bg-gray-50 p-5 rounded-xl shadow-sm border border-gray-200">
            {selectedCategory ? (
              filteredFoods.length > 0 ? (
                <div className="grid grid-cols-2 gap-4">
                  {filteredFoods.map((food) => (
                    <FoodCard
                      key={food._id}
                      food={food}
                      handleEditFood={() => handleOpenFoodModal(food)}
                      handleDeleteFood={handleDeleteFood}
                    />
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 italic text-center py-10">Chưa có món ăn nào trong danh mục này.</p>
              )
            ) : (
              <p className="text-gray-500 italic text-center py-10">
                Chọn một danh mục để xem danh sách món ăn.
              </p>
            )}
          </div>

          {/* --- BẢNG MÓN NỔI BẬT --- */}
          <div className="w-[300px] bg-white p-4 rounded-xl border border-gray-200 shadow-[0_0_15px_rgba(0,0,0,0.05)]">
            <h2 className="text-lg font-semibold text-yellow-600 mb-4 flex items-center justify-center gap-2">
              🌟 Món nổi bật
            </h2>
            <div className="flex flex-col gap-3">
              {foods.filter((f) => f.featured).length > 0 ? (
                foods
                  .filter((f) => f.featured)
                  .map((food) => (
                    <div
                      key={food._id}
                      className="flex justify-between items-center gap-3 bg-gray-50 p-2 rounded-lg 
                        border border-gray-200 hover:border-sky-400 hover:bg-sky-50
                        hover:shadow-[0_0_10px_rgba(56,189,248,0.25)]
                        transition-all duration-200 transform hover:scale-[1.02]"
                    >
                      <img
                        src={food.image || "/placeholder.png"}
                        alt={food.name}
                        className="w-14 h-14 object-cover rounded-lg flex-shrink-0 shadow-sm"
                      />
                      <div className="flex-1 flex flex-col justify-center gap-1">
                        <p className="text-gray-800 font-semibold line-clamp-1">{food.name}</p>
                        <p className="text-gray-500 text-sm line-clamp-2">
                          {food.description || "Không có mô tả"}
                        </p>
                      </div>
                      <p className="text-emerald-600 font-semibold text-right whitespace-nowrap">
                        {food.price.toLocaleString()}₫
                      </p>
                    </div>
                  ))
              ) : (
                <p className="text-gray-500 italic text-center py-6">Chưa có món nổi bật</p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ====== MODALS ====== */}
      {isCategoryModalOpen && (
        <CategoryModal
          isOpen={isCategoryModalOpen}
          onClose={() => setIsCategoryModalOpen(false)}
          category={editingCategory}
          onSuccess={() => {
            fetchCategories();
            toast.success(editingCategory ? "Cập nhật danh mục thành công!" : "Thêm danh mục thành công!");
          }}
        />
      )}

      {isFoodModalOpen && (
        <FoodModal
          open={isFoodModalOpen}
          onClose={() => setIsFoodModalOpen(false)}
          food={editingFood}
          categoryId={selectedCategory}
          onSuccess={() => {
            fetchFoods();
            toast.success(editingFood ? "Cập nhật món ăn thành công!" : "Thêm món ăn thành công!");
          }}
        />
      )}
    </div>
  );
};

export default AdminMenuManager;
