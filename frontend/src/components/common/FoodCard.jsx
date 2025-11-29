import { Edit, Trash2 } from "lucide-react";

const FoodCard = ({ food, handleEditFood, handleDeleteFood }) => {
  return (
    <div
      className={`bg-white p-4 rounded-xl border border-gray-300 shadow-[0_2px_10px_rgba(0,0,0,0.05)] cursor-pointer 
        transition-all animate-fade-in duration-300 hover:shadow-[0_4px_20px_rgba(0,0,0,0.1)]]`}
    >
      {/* Tên món */}
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-gray-900 font-semibold text-[17px] flex items-center gap-1 leading-tight">
          {food.name}
          {food.featured && (
            <span className="text-yellow-500 text-xl drop-shadow-[0_0_4px_#facc15] animate-pulse">
              ★
            </span>
          )}
        </h3>
      </div>

      {/* Chi tiết luôn hiển thị */}
      <img
        src={food.image || "/placeholder.png"}
        alt={food.name}
        className="w-full h-44 object-cover rounded-lg mb-3 shadow-sm"
      />

      <p className="text-gray-600 text-[14px] leading-snug mb-3 italic">
        {food.description || "Không có mô tả"}
      </p>

      <p className="text-[15px] font-semibold text-emerald-600 tracking-wide mb-3">
        {food.price.toLocaleString()}₫
      </p>

      <div className="flex justify-end gap-2">
        <button
          onClick={(e) => {
            e.stopPropagation();
            handleEditFood(food);
          }}
          className="p-1.5 rounded bg-yellow-100 hover:bg-yellow-200 text-yellow-600 
            transition-all duration-200 hover:shadow-[0_0_8px_rgba(234,179,8,0.5)]"
        >
          <Edit size={16} />
        </button>

        <button
          onClick={(e) => {
            e.stopPropagation();
            handleDeleteFood(food._id);
          }}
          className="p-1.5 rounded bg-red-100 hover:bg-red-200 text-red-600 
            transition-all duration-200 hover:shadow-[0_0_8px_rgba(239,68,68,0.5)]"
        >
          <Trash2 size={16} />
        </button>
      </div>
    </div>
  );
};

export default FoodCard;
