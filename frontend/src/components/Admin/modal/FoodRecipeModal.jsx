import React, { useState, useEffect } from "react";
import axios from "axios";

const FoodRecipeModal = ({ isOpen, onClose, food, ingredients, onUpdated }) => {
  const [addedIngredients, setAddedIngredients] = useState([]);

  useEffect(() => {
    if (isOpen && food?.ingredients) {
      setAddedIngredients(
        food.ingredients.map((i) => ({
          ingredient: i.ingredient,
          quantity: Number(i.quantity),
          unit: i.unit,
        }))
      );
    } else {
      setAddedIngredients([]);
    }
  }, [isOpen, food]);

  if (!isOpen || !food) return null;

  const handleAddIngredient = (ingredient) => {
    if (addedIngredients.find((i) => i.ingredient._id === ingredient._id))
      return;
    setAddedIngredients([
      ...addedIngredients,
      { ingredient, quantity: 1, unit: ingredient.unit || "" },
    ]);
  };

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
    <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50">
      <div className="bg-white text-gray-800 w-[1200px] max-w-full p-6 rounded-2xl flex gap-6 relative shadow-lg animate-fade-in">
        {/* Thông tin món ăn */}
        <div className="w-1/2 flex flex-col items-center gap-4">
          <div className="w-[90%] overflow-hidden rounded-xl shadow-md">
            <img
              src={food.image || "/placeholder.png"}
              alt={food.name}
              className="w-full h-64 object-cover transform hover:scale-105 transition duration-300"
            />
          </div>
          <h2 className="text-2xl font-semibold mt-2 text-center">
            {food.name}
          </h2>
        </div>

        {/* Container nguyên liệu */}
        <div className="w-[80%] flex flex-col gap-4 max-h-[500px] mr-7 overflow-y-auto p-8 rounded-lg bg-gray-100">
          {/* Nguyên liệu có sẵn */}
          <div className="flex flex-col gap-2">
            <h3 className="font-semibold text-lg mb-2">Nguyên liệu có sẵn</h3>
            {ingredients.map((ing) => (
              <div
                key={ing._id}
                className="flex justify-between items-center bg-white p-3 rounded-lg hover:bg-gray-200 transition cursor-pointer"
              >
                <div className="flex items-center gap-3">
                  <img
                    src={ing.image || "/placeholder.png"}
                    alt={ing.name}
                    className="w-10 h-10 object-cover rounded"
                  />
                  <span className="text-gray-800 font-medium">{ing.name}</span>
                </div>
                <button
                  onClick={() => handleAddIngredient(ing)}
                  className="px-4 flex gap-x-2 items-center justify-center py-2 text-white font-semibold text-sm tracking-wide
                           bg-green-500 rounded-md
                           shadow-md
                           transition duration-300
                           hover:bg-green-400 hover:shadow-lg"
                >
                  Thêm
                </button>
              </div>
            ))}
          </div>

          {/* Nguyên liệu thêm cho món */}
          <div className="flex flex-col gap-2 mt-4">
            <h3 className="font-semibold text-lg mb-2">
              Nguyên liệu thêm cho món
            </h3>
            {addedIngredients.length === 0 && (
              <p className="text-gray-500 text-sm">Chưa thêm nguyên liệu nào</p>
            )}
            {addedIngredients.map((item, index) => (
              <div
                key={item.ingredient._id}
                className="flex justify-between items-center bg-white p-3 rounded-lg"
              >
                <div className="flex items-center gap-3">
                  <img
                    src={item.ingredient.image || "/placeholder.png"}
                    alt={item.ingredient.name}
                    className="w-10 h-10 object-cover rounded"
                  />
                  <span className="text-gray-800 font-medium">
                    {item.ingredient.name}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleDecrease(index)}
                    className="px-4 py-2 flex gap-x-2 items-center text-white font-semibold text-sm tracking-wide
                                     bg-red-500 rounded-md
                                     shadow-md
                                     transition duration-300
                                     hover:bg-red-400 hover:shadow-lg"
                  >
                    -
                  </button>
                  <span className="w-8 text-center font-medium">
                    {item.quantity}
                  </span>
                  <button
                    onClick={() => handleIncrease(index)}
                    className="px-4 flex gap-x-2 items-center justify-center py-2 text-white font-semibold text-sm tracking-wide
                           bg-green-500 rounded-md
                           shadow-md
                           transition duration-300
                           hover:bg-green-400 hover:shadow-lg"
                  >
                    +
                  </button>
                  <input
                    type="text"
                    value={item.unit}
                    onChange={(e) => handleChangeUnit(index, e.target.value)}
                    className="w-16 p-1 rounded-lg text-gray-800 text-center border border-gray-300"
                    placeholder="Đơn vị"
                  />
                </div>
              </div>
            ))}

            {addedIngredients.length > 0 && (
              <button
                onClick={handleSave}
                className="mt-4 w-full py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-semibold transition-all shadow-md"
              >
                Lưu nguyên liệu
              </button>
            )}
          </div>
        </div>

        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-red-500 hover:text-red-600 text-2xl font-bold"
        >
          ✕
        </button>
      </div>
    </div>
  );
};

export default FoodRecipeModal;
