import React, { useEffect, useState } from "react";
import axios from "axios";
import { Plus, Pen, Trash2, Shield, ShieldCheck, ClockPlus } from "lucide-react";
import RoleModal from "../../components/Admin/modal/RoleModal";

const AdminRoleManager = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedRole, setSelectedRole] = useState(null);

  const [roles, setRoles] = useState([]);
  const [totalRoles, setTotalRoles] = useState(0);
  const [totalPermissions, setTotalPermissions] = useState(0);
  const [recentRoles, setRecentRoles] = useState(0);

  const fetchRoles = async () => {
    try {
      const res = await axios.get("http://localhost:2095/api/roles");
      const { roles, totalRoles, totalPermissions, recentRoles } = res.data;
      setRoles(roles);
      setTotalRoles(totalRoles);
      setTotalPermissions(totalPermissions);
      setRecentRoles(recentRoles);
    } catch (err) {
      console.error("Lỗi tải role:", err);
    }
  };

  useEffect(() => {
    fetchRoles();
  }, []);

  const handleDelete = async (id) => {
    if (!window.confirm("Bạn có chắc muốn xóa Role này không?")) return;
    try {
      await axios.delete(`http://localhost:2095/api/roles/${id}`);
      setRoles((prev) => prev.filter((r) => r._id !== id));
      setTotalRoles((prev) => prev - 1);
    } catch (err) {
      console.error("Lỗi xóa role:", err);
      alert("Xóa thất bại!");
    }
  };

  const handleEdit = (role) => {
    setSelectedRole(role);
    setIsModalOpen(true);
  };

  const handleAdd = () => {
    setSelectedRole(null); // Không chọn role → add
    setIsModalOpen(true);
  };

  return (
    <div className="min-h-screen bg-transparent text-white p-6">
      {/* ====== 3 Card Thống kê ====== */}
      <div className="grid grid-cols-3 gap-6 mb-10 animate-fade-in">
        <StatCard title="Tổng Số Role" value={totalRoles} color="purple" icon={<Shield size={18} />} />
        <StatCard title="Tổng Permission" value={totalPermissions} color="blue" icon={<ShieldCheck size={18} />} />
        <StatCard title="Role Mới Hôm Nay" value={recentRoles} color="green" icon={<ClockPlus size={18} />} />
      </div>

      {/* ====== Bảng danh sách Role ====== */}
      <div className="bg-white p-6 rounded-2xl shadow-lg shadow-black/10 animate-fade-in">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-gray-800">Danh sách Role</h2>
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
                <th className="py-3 px-4 rounded-tl-lg">Tên Role</th>
                <th className="py-3 px-4 w-[25%]">Mô Tả</th>
                <th className="py-3 px-4 w-[35%]">Quyền Hạn</th>
                <th className="py-3 px-4 w-[15%]">Ngày Tạo</th>
                <th className="py-3 px-4 text-center w-[15%] rounded-tr-lg">Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {roles.length === 0 ? (
                <tr>
                  <td colSpan="5" className="text-center text-gray-400 py-4">Chưa có Role nào!</td>
                </tr>
              ) : (
                roles.map((role, index) => {
                  const colorMap = {
                    Admin: "bg-red-500 text-white",
                    Customer: "bg-blue-500 text-white",
                    Staff: "bg-green-500 text-white",
                    Cashier: "bg-yellow-400 text-black",
                    Chef: "bg-orange-500 text-white",
                    Manager: "bg-purple-500 text-white",
                  };
                  const roleColor = colorMap[role.name] || "bg-gray-400 text-white";

                  return (
                    <tr
                      key={role._id || index}
                      className="border-b border-gray-200 hover:bg-gray-50 transition-all duration-200"
                    >
                      <td className="py-3 px-4">
                        <span className={`inline-block px-3 py-1 rounded-md font-semibold ${roleColor}`}>
                          {role.name}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-gray-600">{role.description || "—"}</td>
                      <td className="py-3 px-4 text-gray-600">
                        {role.permission?.length ? role.permission.join(", ") : "Không có"}
                      </td>
                      <td className="py-3 px-4 text-gray-500">{new Date(role.createdAt).toLocaleDateString("vi-VN")}</td>
                      <td className="py-3 px-4 text-center">
                        <div className="flex items-center justify-center gap-2">
                          <button
                            onClick={() => handleEdit(role)}
                            className="px-3 py-3 flex items-center gap-2 text-sm font-medium
                                 bg-yellow-400 rounded-md text-black shadow-md shadow-yellow-300/40
                                 hover:bg-yellow-300 hover:shadow-lg hover:shadow-yellow-400/50 transition transform hover:scale-105"
                          >
                            <Pen size={14} />
                          </button>
                          <button
                            onClick={() => handleDelete(role._id)}
                            className="px-3 py-3 flex items-center gap-2 text-sm font-medium
                                 bg-red-500 rounded-md text-white shadow-md shadow-red-300/40
                                 hover:bg-red-400 hover:shadow-lg hover:shadow-red-400/50 transition transform hover:scale-105"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal chung */}
      {isModalOpen && (
        <RoleModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onSuccess={fetchRoles}
          role={selectedRole} // null → add, có dữ liệu → edit
        />
      )}
    </div>
  );
};

// StatCard giống trước
const COLOR_CLASSES = {
  purple: { text: "text-purple-400", border: "border-purple-400", borderBg: "border-purple-500 opacity-40" },
  blue: { text: "text-blue-400", border: "border-blue-400", borderBg: "border-blue-500 opacity-40" },
  green: { text: "text-green-400", border: "border-green-400", borderBg: "border-green-500 opacity-40" },
  red: { text: "text-red-400", border: "border-red-400", borderBg: "border-red-500 opacity-40" },
};
const StatCard = ({ title, value, color, icon }) => {
  const c = COLOR_CLASSES[color] || COLOR_CLASSES.blue;
  return (
    <div className="bg-gradient-to-r from-white via-gray-50 to-white p-5 rounded-2xl flex items-center justify-between shadow-xl shadow-black/10 border border-gray-200">
      <div>
        <h3 className="text-xl font-bold text-gray-800">{title}</h3>
        <div className="flex items-center gap-x-2 mt-2">
          <p className="text-gray-700 font-bold text-[18px]">{value}</p>
          {React.cloneElement(icon, { className: `${c.text} w-5 h-5` })}
        </div>
      </div>
      <div className="relative w-20 h-20 flex items-center justify-center">
        <div className={`absolute inset-0 rounded-full border-4 ${c.borderBg} opacity-30`}></div>
        <div className={`absolute inset-0 rounded-full border-t-4 ${c.border} animate-spin-slow`}></div>
        <span className="absolute text-xl font-bold text-gray-800">{value}</span>
      </div>
    </div>
  );
};

export default AdminRoleManager;
