import React, { useEffect, useState } from "react";
import axios from "axios";
import { ClockPlus, Pen, Plus, Trash2, User, UserStar } from "lucide-react";
import UserModal from "../../components/Admin/modal/UserModal"; // ✅ dùng modal gộp mới
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

// Bản đồ màu theo role
const colorMap = {
  Admin: "bg-gradient-to-r from-red-500 to-red-700 text-white",
  Customer: "bg-gradient-to-r from-blue-500 to-blue-700 text-white",
  Staff: "bg-gradient-to-r from-green-500 to-green-700 text-white",
  Cashier: "bg-gradient-to-r from-yellow-500 to-amber-600 text-black",
  Chef: "bg-gradient-to-r from-orange-500 to-orange-700 text-white",
  Manager: "bg-gradient-to-r from-purple-500 to-purple-700 text-white",
};

const AdminUserManager = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);

  const [users, setUsers] = useState([]);
  const [totalUsers, setTotalUsers] = useState(0);
  const [adminCount, setAdminCount] = useState(0);
  const [recentUsers, setRecentUsers] = useState(0);

  // Xóa user
  const handleDelete = async (id) => {
    if (!window.confirm("Bạn có chắc muốn xóa người dùng này không?")) return;
    try {
      await axios.delete(`http://localhost:2095/api/users/${id}`);
      setUsers((prev) => prev.filter((u) => u._id !== id));
      setTotalUsers((prev) => prev - 1);
      toast.success("Xóa người dùng thành công!", { theme: "light" });
    } catch (err) {
      console.error("Lỗi xóa user:", err);
      toast.error(" Xóa thất bại!", { theme: "light" });
    }
  };

  // Fetch users
  const fetchUsers = async () => {
    try {
      const res = await axios.get("http://localhost:2095/api/users");
      setUsers(res.data.users || []);
      setTotalUsers(res.data.users.length || 0);
      setAdminCount(res.data.adminCount || 0);
      setRecentUsers(res.data.recentUsers || 0);
    } catch (err) {
      console.error("Lỗi tải user:", err);
      toast.error("⚠️ Không thể tải danh sách người dùng!", { theme: "light" });
    }
  };

  // Mở modal thêm mới
  const handleAdd = () => {
    setSelectedUser(null);
    setIsModalOpen(true);
  };

  // Mở modal chỉnh sửa
  const handleEdit = (user) => {
    setSelectedUser(user);
    setIsModalOpen(true);
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  return (
    <div className="min-h-screen bg-transparent text-white p-6">
      {/* ====== 3 Card Thống kê ====== */}
      <div className="grid grid-cols-3 gap-6 mb-10 animate-fade-in">
        <StatCard
          title="Tổng Người Dùng"
          value={totalUsers}
          color="purple"
          icon={<User size={18} />}
        />
        <StatCard
          title="Tổng Admin"
          value={adminCount}
          color="blue"
          icon={<UserStar size={18} />}
        />
        <StatCard
          title="Người Dùng Mới Hôm Nay"
          value={recentUsers}
          color="green"
          icon={<ClockPlus size={18} />}
        />
      </div>

      {/* ====== Bảng danh sách user ====== */}
      <div className="bg-white p-6 rounded-2xl shadow-lg shadow-black/10 animate-fade-in">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-gray-800">
            Danh sách người dùng
          </h2>
          <button
            onClick={handleAdd}
            className="px-4 py-2 flex items-center gap-x-2 text-white text-sm font-semibold tracking-wide
                 bg-green-500 rounded-lg
                 shadow-md shadow-green-300/40
                 transition transform hover:scale-105 hover:bg-green-400 hover:shadow-lg hover:shadow-green-400/50"
          >
            <Plus size={15} /> Thêm
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-100 text-gray-500 uppercase text-sm">
                <th className="py-3 px-4 rounded-tl-lg">Tên Người Dùng</th>
                <th className="py-3 px-4">Email</th>
                <th className="py-3 px-4">Chức Vụ</th>
                <th className="py-3 px-4">Ngày Tạo</th>
                <th className="py-3 px-4 rounded-tr-lg text-center">
                  Thao tác
                </th>
              </tr>
            </thead>
            <tbody>
              {users.map((user, index) => (
                <tr
                  key={user._id || index}
                  className="border-b border-gray-200 hover:bg-gray-50 transition-all duration-200"
                >
                  {/* Tên + avatar */}
                  <td className="py-3 px-4 flex items-center gap-3">
                    <img
                      src={user.avatar || "https://via.placeholder.com/40"}
                      alt={user.name}
                      className="w-10 h-10 rounded-full object-cover border border-gray-200"
                    />
                    <div>
                      <p className="font-medium text-gray-800">{user.name}</p>
                      <p className="text-gray-400 text-sm">
                        {user.email?.split("@")[0]
                          ? "@" + user.email.split("@")[0]
                          : ""}
                      </p>
                    </div>
                  </td>

                  {/* Email */}
                  <td className="py-3 px-4 text-gray-600">{user.email}</td>

                  {/* Role */}
                  <td className="py-3 px-4 capitalize">
                    {user.role?.name ? (
                      <span
                        className={`px-3 py-1 rounded-full text-sm font-medium ${
                          colorMap[user.role.name]
                        }`}
                      >
                        {user.role.name}
                      </span>
                    ) : (
                      <span className="px-3 py-1 rounded-full text-sm font-medium bg-gray-300 text-gray-700">
                        —
                      </span>
                    )}
                  </td>

                  {/* Created */}
                  <td className="py-3 px-4 text-gray-500">
                    {new Date(user.createdAt).toLocaleDateString("vi-VN")}
                  </td>

                  {/* Thao tác */}
                  <td className="py-3 px-4 text-center">
                    <div className="flex items-center justify-center gap-2">
                      {/* Sửa */}
                      <button
                        onClick={() => handleEdit(user)}
                        className="px-3 py-3 flex items-center gap-2 text-sm font-medium
                             bg-yellow-400 rounded-md text-black shadow-md shadow-yellow-300/40
                             hover:bg-yellow-300 hover:shadow-lg hover:shadow-yellow-400/50 transition transform hover:scale-105"
                      >
                        <Pen size={14} /> 
                      </button>

                      {/* Xóa */}
                      <button
                        onClick={() => handleDelete(user._id)}
                        className="px-3 py-3 flex items-center gap-2 text-sm font-medium
                             bg-red-500 rounded-md text-white shadow-md shadow-red-300/40
                             hover:bg-red-400 hover:shadow-lg hover:shadow-red-400/50 transition transform hover:scale-105"
                      >
                        <Trash2 size={14} /> 
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* ✅ Gọi modal gộp */}
      {isModalOpen && (
        <UserModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onSuccess={fetchUsers}
          user={selectedUser}
        />
      )}

      <ToastContainer
        position="top-right"
        autoClose={2500}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        pauseOnHover
        theme="light"
      />
    </div>
  );
};

// ==== StatCard giữ nguyên ====
const COLOR_CLASSES = {
  purple: {
    text: "text-purple-400",
    border: "border-purple-400",
    borderBg: "border-purple-500 opacity-40",
  },
  blue: {
    text: "text-blue-400",
    border: "border-blue-400",
    borderBg: "border-blue-500 opacity-40",
  },
  green: {
    text: "text-green-400",
    border: "border-green-400",
    borderBg: "border-green-500 opacity-40",
  },
  red: {
    text: "text-red-400",
    border: "border-red-400",
    borderBg: "border-red-500 opacity-40",
  },
};

const StatCard = ({ title, value, color, icon }) => {
  const c = COLOR_CLASSES[color] || COLOR_CLASSES.blue;
  return (
    <div className="bg-gradient-to-r from-white via-gray-50 to-white p-5 rounded-2xl flex items-center justify-between shadow-xl shadow-black/10 border border-gray-200">
      {/* Thông tin */}
      <div>
        <h3 className="text-xl font-bold text-gray-800">{title}</h3>
        <div className="flex items-center gap-x-2 mt-2">
          <p className="text-gray-700 font-bold text-[18px]">{value}</p>
          {React.cloneElement(icon, { className: `${c.text} w-5 h-5` })}
        </div>
      </div>

      {/* Vòng tròn spin */}
      <div className="relative w-20 h-20 flex items-center justify-center">
        <div
          className={`absolute inset-0 rounded-full border-4 ${c.borderBg} opacity-30`}
        ></div>
        <div
          className={`absolute inset-0 rounded-full border-t-4 ${c.border} animate-spin-slow`}
        ></div>
        <span className="absolute text-xl font-bold text-gray-800">
          {value}
        </span>
      </div>
    </div>
  );
};

export default AdminUserManager;
