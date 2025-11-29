import React, { useEffect, useState } from "react";
import axios from "axios";
import { Plus, Pen, Trash2 } from "lucide-react";
import IngredientModal from "../../components/Admin/modal/IngredientModal";
import FoodRecipeModal from "../../components/Admin/modal/FoodRecipeModal";

const ChefIngredient = () => {
  const [ingredients, setIngredients] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedIngredient, setSelectedIngredient] = useState(null);
  const [foods, setFoods] = useState([]);
  const [selectedFood, setSelectedFood] = useState(null);
  const [isRecipeModalOpen, setIsRecipeModalOpen] = useState(false);

  const fetchIngredients = async () => {
    try {
      const res = await axios.get("http://localhost:2095/api/ingredients");
      setIngredients(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchFoods = async () => {
    try {
      const res = await axios.get("http://localhost:2095/api/foods");
      setFoods(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchIngredients();
    fetchFoods();
  }, []);

  const handleDelete = async (id) => {
    if (!window.confirm("Bạn có chắc muốn xóa nguyên liệu này không?")) return;
    try {
      await axios.delete(`http://localhost:2095/api/ingredients/${id}`);
      setIngredients((prev) => prev.filter((i) => i._id !== id));
    } catch (err) {
      console.error(err);
      alert("Xóa thất bại!");
    }
  };

  const handleEdit = (ingredient) => {
    setSelectedIngredient(ingredient);
    setIsModalOpen(true);
  };

  useEffect(() => {
    fetchIngredients();
  }, []);

  return (
    <div className="bg-white animate-fade-in text-gray-900 p-6 rounded-2xl shadow-lg mb-8">
      <div className="flex justify-between mb-6 animate-fade-in">
        <h2 className="text-xl font-semibold">Quản lý Nguyên Liệu</h2>
        <button
          onClick={() => {
            setSelectedIngredient(null);
            setIsModalOpen(true);
          }}
          className="px-4 flex gap-x-2 items-center justify-center py-2 text-black font-semibold text-sm tracking-wide
                       bg-green-400 rounded-md
                       shadow-[0_0_8px_#22c55e,0_0_16px_#22c55e]
                       transition duration-300
                       hover:bg-green-300 hover:shadow-[0_0_12px_#4ade80,0_0_24px_#4ade80]"
        >
          <Plus size={15} /> Thêm
        </button>
      </div>

      <table className="w-full text-left border-collapse bg-white overflow-hidden shadow-md">
        <thead>
          <tr className="bg-gray-100 border-b border-gray-200 text-gray-700 uppercase text-sm">
            <th className="py-3 px-4">Ảnh</th>
            <th className="py-3 px-4">Tên</th>
            <th className="py-3 px-4">Số lượng</th>
            <th className="py-3 px-4">Đơn vị</th>
            <th className="py-3 px-4">Mức cảnh báo</th>
            <th className="py-3 px-4 text-center">Thao tác</th>
          </tr>
        </thead>
        <tbody>
          {ingredients.map((i) => (
            <tr
              key={i._id}
              className="border-b border-gray-200 hover:bg-gray-50 transition"
            >
              <td className="py-3 px-4">
                {i.image ? (
                  <img
                    src={i.image}
                    alt={i.name}
                    className="w-12 h-12 object-cover rounded"
                  />
                ) : (
                  "—"
                )}
              </td>
              <td className="py-3 px-4">{i.name}</td>
              <td className="py-3 px-4">{i.quantity}</td>
              <td className="py-3 px-4">{i.unit}</td>
              <td className="py-3 px-4">{i.alertLevel}</td>
              <td className="py-3 px-4 text-center flex justify-center gap-2">
                <button
                  onClick={() => handleEdit(i)}
                  className="px-3 py-3 flex items-center gap-2 text-sm font-medium
                             bg-yellow-400 rounded-md text-black shadow-md shadow-yellow-300/40
                             hover:bg-yellow-300 hover:shadow-lg hover:shadow-yellow-400/50 transition transform hover:scale-105"
                >
                  <Pen size={16} />
                </button>
                <button
                  onClick={() => handleDelete(i._id)}
                  className="px-3 py-3 flex items-center gap-2 text-sm font-medium
                             bg-red-400 rounded-md text-black shadow-md shadow-yellow-300/40
                             hover:bg-red-300 hover:shadow-lg hover:shadow-yellow-400/50 transition transform hover:scale-105"
                >
                  <Trash2 size={16} />
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <div className="mt-10">
        <h2 className="text-xl font-semibold mb-4">Công Thức Món Ăn</h2>
        <div className="grid grid-cols-4 gap-4">
          {foods.map((food) => (
            <div
              key={food._id}
              className="relative bg-[#273349] rounded-lg overflow-hidden group cursor-pointer hover:shadow-[0_0_15px_#38bdf8] transition-all duration-300"
              onClick={() => {
                setSelectedFood(food);
                setIsRecipeModalOpen(true);
              }}
            >
              {/* Ảnh full card */}
              <img
                src={food.image || "/placeholder.png"}
                alt={food.name}
                className="w-full h-48 object-cover"
              />

              {/* Overlay màu mờ khi hover */}
              <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
                <button
                  className="opacity-0 cursor-pointer group-hover:opacity-100 scale-95 group-hover:scale-105 
            px-4 py-2 flex gap-x-2 items-center text-white font-semibold text-sm tracking-wide
                                 bg-blue-600 rounded-md
                                 shadow-[0_0_8px_#276FF5,0_0_16px_#276FF5]
                                 transition duration-300
                                 hover:bg-blue-500 hover:shadow-[0_0_12px_#276FF5,0_0_24px_#276FF5]"
                >
                  Xem công thức
                </button>
              </div>

              {/* Tên món ăn ở dưới ảnh */}
              <p className="absolute bottom-2 left-2 right-2 text-white font-medium text-center line-clamp-1 bg-black/50 rounded px-1">
                {food.name}
              </p>
            </div>
          ))}
        </div>
      </div>

      {isModalOpen && (
        <IngredientModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          ingredient={selectedIngredient}
          onUpdated={fetchIngredients}
        />
      )}

      {isRecipeModalOpen && selectedFood && (
        <FoodRecipeModal
          isOpen={isRecipeModalOpen}
          onClose={() => setIsRecipeModalOpen(false)}
          food={selectedFood}
          ingredients={ingredients}
          onUpdated={fetchFoods}
        />
      )}
    </div>
  );
};

export default ChefIngredient;
