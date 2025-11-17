import React from "react";

const COLORS = {
  purple: {
    from: "from-purple-600",
    to: "to-fuchsia-500",
    text: "text-purple-600",
    border: "border-purple-400",
  },
  blue: {
    from: "from-sky-600",
    to: "to-blue-500",
    text: "text-sky-600",
    border: "border-sky-400",
  },
  green: {
    from: "from-green-600",
    to: "to-emerald-400",
    text: "text-green-600",
    border: "border-green-400",
  },
  red: {
    from: "from-red-600",
    to: "to-rose-500",
    text: "text-red-600",
    border: "border-red-400",
  },
};

const StatCard = ({ title, value, color = "blue", icon }) => {
  const c = COLORS[color] || COLORS.blue;

  return (
    <div
      className={`bg-white p-[3px] rounded-2xl shadow-lg transition-all hover:scale-[1.03]`}
    >
      {/* Nền trắng trong khung gradient */}
      <div className="bg-white p-5 rounded-2xl flex items-center justify-between h-full">
        {/* Thông tin bên trái */}
        <div>
          <h3 className="text-lg font-semibold text-gray-800">{title}</h3>
          <div className={`flex gap-x-1 ${c.text} items-center mt-2`}>
            <p className="font-bold text-[20px]">{value}</p>
            {icon}
          </div>
        </div>

        {/* Vòng tròn xoay bên phải */}
        <div className="relative w-16 h-16 flex items-center justify-center">
          {/* Viền ngoài mờ */}
          <div
            className={`absolute inset-0 rounded-full border-4 ${c.border} opacity-30`}
          ></div>

          {/* Vòng xoay gradient */}
          <div
            className={`absolute inset-0 rounded-full bg-gradient-to-tr ${c.from} ${c.to} animate-spin-slow [mask:linear-gradient(white,transparent)]`}
          ></div>

          {/* Nền trong của vòng */}
          <div className="absolute inset-[5px] bg-white rounded-full flex items-center justify-center">
            <span className={`text-sm font-semibold ${c.text}`}>{value}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StatCard;
