import React, { useState, useEffect } from "react";
import axios from "axios";

const FoodRecipeModal = ({ isOpen, onClose, food, ingredients, onUpdated }) => {
  const [addedIngredients, setAddedIngredients] = useState([]);

  // Reset state khi modal mở
  useEffect(() => {
    if (isOpen && food?.ingredients) {
      setAddedIngredients(
        food.ingredients.map((i) => ({
          ingredient: i.ingredient, // đã populate
          quantity: Number(i.quantity),
          unit: i.unit,
        }))
      );
    } else {
      setAddedIngredients([]);
    }
  }, [isOpen, food]);

  if (!isOpen || !food) return null;

  // Thêm nguyên liệu vào danh sách thêm, không cộng
  const handleAddIngredient = (ingredient) => {
    if (addedIngredients.find((i) => i.ingredient._id === ingredient._id)) return;
    setAddedIngredients([...addedIngredients, { ingredient, quantity: 1, unit: ingredient.unit || "" }]);
  };

  // Chỉnh quantity bằng nút + / -
  const handleIncrease = (index) => {
    const updated = [...addedIngredients];
    updated[index].quantity = Number(updated[index].quantity) + 1;
    setAddedIngredients(updated);
  };

  const handleDecrease = (index) => {
    const updated = [...addedIngredients];
    if (updated[index].quantity > 1) {
      updated[index].quantity = Number(updated[index].quantity) - 1;
      setAddedIngredients(updated);
    }
  };

  const handleChangeUnit = (index, value) => {
    const updated = [...addedIngredients];
    updated[index].unit = value;
    setAddedIngredients(updated);
  };

  const handleSave = async () => {
    try {
      const newIngredients = addedIngredients.map((i) => ({
        ingredient: i.ingredient._id,
        quantity: i.quantity,
        unit: i.unit,
      }));

      await axios.put(`http://localhost:2095/api/foods/${food._id}`, {
        ingredients: newIngredients,
      });

      alert("Cập nhật nguyên liệu thành công!");
      onUpdated();
      onClose();
    } catch (err) {
      console.error(err);
      alert("Cập nhật thất bại!");
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
  <div className="bg-[#1e293b] text-white w-[1200px] max-w-full p-6 rounded-2xl flex gap-6 relative shadow-lg animate-fade-in">
    
    {/* Thông tin món ăn */}
    <div className="w-1/2 flex flex-col items-center gap-4">
      <div className="w-[90%] overflow-hidden rounded-xl shadow-md">
        <img
          src={food.image || "/placeholder.png"}
          alt={food.name}
          className="w-full h-64 object-cover transform hover:scale-105 transition duration-300"
        />
      </div>
      <h2 className="text-2xl font-semibold mt-2 text-center">{food.name}</h2>
    </div>

    {/* Container nguyên liệu (scroll chung) */}
    <div className="w-[80%] flex flex-col gap-4 max-h-[500px] mr-7 overflow-y-auto p-8 rounded-lg bg-[#273349]">
      
      {/* Nguyên liệu có sẵn */}
      <div className="flex flex-col gap-2">
        <h3 className="font-semibold text-lg mb-2">Nguyên liệu có sẵn</h3>
        {ingredients.map((ing) => (
          <div
            key={ing._id}
            className="flex justify-between items-center bg-[#1e293b] p-3 rounded-lg hover:bg-[#1e3a5f] transition cursor-pointer"
          >
            <div className="flex items-center gap-3">
              <img
                src={ing.image || "/placeholder.png"}
                alt={ing.name}
                className="w-10 h-10 object-cover rounded"
              />
              <span className="text-white font-medium">{ing.name}</span>
            </div>
            <button
              onClick={() => handleAddIngredient(ing)}
              className="px-4 flex gap-x-2 items-center justify-center py-2 text-black font-semibold text-sm tracking-wide
                       bg-green-400 rounded-md
                       shadow-[0_0_8px_#22c55e,0_0_16px_#22c55e]
                       transition duration-300
                       hover:bg-green-300 hover:shadow-[0_0_12px_#4ade80,0_0_24px_#4ade80]"
            >
              Thêm
            </button>
          </div>
        ))}
      </div>

      {/* Nguyên liệu thêm cho món */}
      <div className="flex flex-col gap-2 mt-4">
        <h3 className="font-semibold text-lg mb-2">Nguyên liệu thêm cho món</h3>
        {addedIngredients.length === 0 && (
          <p className="text-gray-400 text-sm">Chưa thêm nguyên liệu nào</p>
        )}
        {addedIngredients.map((item, index) => (
          <div
            key={item.ingredient._id}
            className="flex justify-between items-center bg-[#1e293b] p-3 rounded-lg"
          >
            <div className="flex items-center gap-3">
              <img
                src={item.ingredient.image || "/placeholder.png"}
                alt={item.ingredient.name}
                className="w-10 h-10 object-cover rounded"
              />
              <span className="text-white font-medium">{item.ingredient.name}</span>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => handleDecrease(index)}
                className="px-4 py-2 flex gap-x-2 items-center text-white font-semibold text-sm tracking-wide
                                 bg-red-600 rounded-md
                                 shadow-[0_0_8px_#dc2626,0_0_16px_#dc2626]
                                 transition duration-300
                                 hover:bg-red-500 hover:shadow-[0_0_12px_#ef4444,0_0_24px_#ef4444]"
              >
                -
              </button>
              <span className="w-8 text-center font-medium">{item.quantity}</span>
              <button
                onClick={() => handleIncrease(index)}
                className="px-4 flex gap-x-2 items-center justify-center py-2 text-black font-semibold text-sm tracking-wide
                       bg-green-400 rounded-md
                       shadow-[0_0_8px_#22c55e,0_0_16px_#22c55e]
                       transition duration-300
                       hover:bg-green-300 hover:shadow-[0_0_12px_#4ade80,0_0_24px_#4ade80]"
              >
                +
              </button>
              <input
                type="text"
                value={item.unit}
                onChange={(e) => handleChangeUnit(index, e.target.value)}
                className="w-16 p-1 rounded-lg text-white text-center"
                placeholder="Đơn vị"
              />
            </div>
          </div>
        ))}

        {addedIngredients.length > 0 && (
          <button
            onClick={handleSave}
            className="mt-4 w-full py-2 rounded-lg bg-blue-600 hover:bg-blue-700 transition-all shadow-[0_0_12px_#3b82f6]"
          >
            Lưu nguyên liệu
          </button>
        )}
      </div>
    </div>

    {/* Close button */}
    <button
      onClick={onClose}
      className="absolute top-4 right-4 text-red-400 hover:text-red-500 text-2xl font-bold"
    >
      ✕
    </button>
  </div>
</div>


  );
};

export default FoodRecipeModal;
