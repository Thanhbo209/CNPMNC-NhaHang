import React, { useState, useContext } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  Utensils,
  User,
  ShieldUser,
  ReceiptText,
  CreditCard,
  BookOpenCheck,
  Leaf,
  MessageCircleReply,
  ChevronRight,
  ArrowRight,
  ArrowLeft,
  LogOut,
} from "lucide-react";
import { AuthContext } from "../../login/AuthContext";

const Sidebar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { logout, user } = useContext(AuthContext); // lấy user hiện tại
  const [collapsed, setCollapsed] = useState(false);

  const active = (path) => location.pathname === path;

  const menuItems = [
    { path: "/admin/dashboard", label: "Dashboard", icon: LayoutDashboard },
    { path: "/admin/menu", label: "Menu", icon: Utensils },
    { path: "/admin/user", label: "Người Dùng", icon: User },
    { path: "/admin/role", label: "Chức Vụ", icon: ShieldUser },
    { path: "/admin/order", label: "Orders", icon: ReceiptText },
    { path: "/admin/payment", label: "Thanh Toán", icon: CreditCard },
    { path: "/admin/reservation", label: "Bàn & Đặt Chỗ", icon: BookOpenCheck },
    { path: "/admin/ingredient", label: "Nguyên Liệu", icon: Leaf },
    { path: "/admin/feedback", label: "Feedback", icon: MessageCircleReply },
  ];

  const handleLogout = () => {
    logout();
    navigate("/");
  };

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
          {/* Avatar */}
          <img
            src={
              user?.avatar ||
              "https://icons.veryicon.com/png/o/miscellaneous/user-avatar/user-avatar-male-5.png"
            }
            alt={user?.name || "User"}
            className="w-10 h-10 rounded-full object-cover shadow-md"
          />
          {!collapsed && (
            <div className="transition-opacity duration-300">
              <h2 className="text-sm font-semibold text-gray-800">
                {user?.name || "Unknown"}
              </h2>
              <p className="text-xs text-gray-500">
                {user?.email || "email@example.com"}
              </p>
            </div>
          )}
        </div>

        {/* Toggle */}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="p-1 rounded-md hover:bg-gray-100 text-gray-600 transition"
        >
          {collapsed ? <ArrowRight size={20} /> : <ArrowLeft size={20} />}
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto mt-4 px-2 flex flex-col justify-between">
        <div>
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
        </div>

        {/* Logout button */}
        <div className="mb-4">
          <button
            onClick={handleLogout}
            className="group relative flex items-center gap-3 px-4 py-2.5 rounded-lg text-red-600 hover:bg-red-50 w-full transition"
          >
            <LogOut size={18} />
            {!collapsed && <span className="text-sm">Đăng xuất</span>}
          </button>
        </div>
      </nav>
    </aside>
  );
};

export default Sidebar;
