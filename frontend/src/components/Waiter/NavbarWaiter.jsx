import React from "react";
import {
  Search,
  Home,
  ReceiptText,
  BookOpenCheck,
  Utensils,
  Bell,
  MessageCircle,
  Loader,
  Mail,
} from "lucide-react";

const NavbarWaiter = () => {
  return (
    <header className="flex items-center justify-between px-6 py-3 bg-white border-b border-gray-200 shadow-sm">
      {/* LEFT: Logo + Search */}
      <div className="flex items-center gap-4">
        {/* Logo spin icon */}
        <div className="flex items-center justify-center w-8 h-8 rounded-full bg-gradient-to-r from-indigo-500 to-cyan-400">
          <Loader className="w-4 h-4 text-white animate-spin" />
        </div>

        {/* Search Box */}
        <div className="relative">
          <Search className="absolute left-3 top-2.5 text-gray-400 w-4 h-4" />
          <input
            type="text"
            placeholder="Tìm kiếm..."
            className="bg-gray-50 text-sm text-gray-700 pl-9 pr-3 py-2 rounded-lg border border-gray-200 focus:border-indigo-400 focus:ring-1 focus:ring-indigo-300 outline-none transition-all placeholder-gray-400 w-56"
          />
        </div>
      </div>

      {/* MIDDLE: Menu Icons */}
      <nav className="flex items-center gap-2">
        {[
          { icon: Home, label: "Trang chủ", color: "from-green-500 to-emerald-400" },
          { icon: ReceiptText, label: "Đơn hàng", color: "from-emerald-500 to-teal-400" },
          { icon: BookOpenCheck, label: "Đặt bàn", color: "from-green-400 to-lime-400" },
          { icon: Utensils, label: "Thực đơn", color: "from-lime-500 to-green-400" },
        ].map(({ icon: Icon, label, color }) => (
          <button
            key={label}
            className={`relative w-10 h-10 flex items-center justify-center rounded-xl text-gray-500 hover:text-white transition-all duration-300
              hover:shadow-lg group`}
            title={label}
          >
            <div
              className={`absolute inset-0 opacity-0 group-hover:opacity-100 bg-gradient-to-r ${color} rounded-xl transition-all duration-300`}
            ></div>
            <Icon className="w-5 h-5 relative z-10 transition-transform duration-300 group-hover:scale-110" />
          </button>
        ))}
      </nav>

      {/* RIGHT: Notifications + User */}
      <div className="flex items-center gap-5">
        <div className="relative group">
          <Mail className="w-5 h-5 text-gray-500 hover:text-indigo-500 transition-all duration-300 group-hover:scale-110" />
          <span className="absolute -top-1 -right-1 bg-rose-500 text-white text-[10px] font-semibold px-1.5 py-[1px] rounded-full">
            3
          </span>
        </div>
        <div className="relative group">
          <Bell className="w-5 h-5 text-gray-500 hover:text-indigo-500 transition-all duration-300 group-hover:scale-110" />
          <span className="absolute -top-1 -right-1 bg-cyan-500 text-white text-[10px] font-semibold px-1.5 py-[1px] rounded-full">
            2
          </span>
        </div>

        {/* Avatar */}
        <div className="w-9 h-9 rounded-full overflow-hidden border-2 border-transparent hover:border-indigo-400 transition-all duration-300">
          <img
            src="https://i.pravatar.cc/302"
            alt="Waiter Avatar"
            className="w-full h-full object-cover"
          />
        </div>
      </div>
    </header>
  );
};

export default NavbarWaiter;
