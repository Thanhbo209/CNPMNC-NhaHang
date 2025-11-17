import React, { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import {
  LayoutDashboard,
  Utensils,
  ReceiptText,
  BookOpenCheck,
  MessageCircleReply,
  ChevronRight,
  ArrowRight,
  ArrowLeft,
} from "lucide-react";

const SidebarWaiter = () => {
  const location = useLocation();
  const [collapsed, setCollapsed] = useState(false);
  const active = (path) => location.pathname === path;

  const menuItems = [
    { path: "/Waiter/dashboard", label: "Dashboard", icon: LayoutDashboard },
    { path: "/Waiter/order", label: "Đơn hàng", icon: ReceiptText },
    { path: "/Waiter/order/history", label: "Lịch sử đơn", icon: ReceiptText },
    { path: "/Waiter/feedback", label: "Feedback", icon: MessageCircleReply },
  ];

  return (
    <aside
  className={`${
    collapsed ? "w-20" : "w-64"
  } bg-white text-gray-700 h-screen flex flex-col shadow-lg border-r border-gray-200 transition-all duration-300 ease-in-out sticky top-0`}
>

      {/* Header */}
      <div
        className={`flex items-center justify-between ${
          collapsed ? "px-3" : "px-4"
        } py-5 border-b border-gray-200`}
      >
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-r from-indigo-500 to-cyan-400 rounded-full flex items-center justify-center font-bold text-white shadow-md">
            T
          </div>
          {!collapsed && (
            <div className="transition-opacity duration-300">
              <h2 className="text-lg font-semibold text-gray-800">Phục vụ</h2>
              <p className="text-xs text-gray-500">Nhân viên phục vụ</p>
            </div>
          )}
        </div>

        {/* Nút toggle */}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="p-1 rounded-md hover:bg-gray-100 text-gray-600 transition"
        >
          {collapsed ? <ArrowRight size={20} /> : <ArrowLeft size={20} />}
        </button>
      </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto mt-4 px-2">
          {!collapsed && (
            <p className="text-xs uppercase text-gray-500 mb-3 tracking-wider px-3">
              Main Menu
            </p>
          )}
          <ul className="space-y-1">
            {menuItems.map(({ path, label, icon: Icon }) => {
              const isActive = active(path);
              return (
                <li key={path}>
                  <Link
                    to={path}
                    className={`group relative flex items-center gap-3 px-4 py-2.5 rounded-lg transition-all duration-200 ${
                      isActive
                        ? "bg-gradient-to-r from-indigo-500/10 to-cyan-400/10 text-indigo-600 font-medium"
                        : "hover:bg-gray-100 text-gray-700"
                    }`}
                  >
                    {/* Thanh bên trái khi active */}
                    {isActive && (
                      <span className="absolute left-0 top-0 h-full w-[4px] bg-gradient-to-b from-indigo-500 to-cyan-400 rounded-r-md"></span>
                    )}

                    <Icon
                      size={18}
                      className={`transition-colors ${
                        isActive
                          ? "text-indigo-500"
                          : "text-gray-400 group-hover:text-indigo-500"
                      }`}
                    />

                    {!collapsed && (
                      <div className="flex justify-between items-center w-full">
                        <span
                          className={`text-sm ${
                            isActive
                              ? "text-indigo-600"
                              : "text-gray-700 group-hover:text-gray-900"
                          }`}
                        >
                          {label}
                        </span>
                        <ChevronRight
                          size={16}
                          className={`transition-all duration-300 ${
                            isActive
                              ? "opacity-100 translate-x-0 text-indigo-500"
                              : "opacity-0 -translate-x-2 group-hover:opacity-50 group-hover:translate-x-0"
                          }`}
                        />
                      </div>
                    )}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>
    </aside>
  );
};

export default SidebarWaiter;
