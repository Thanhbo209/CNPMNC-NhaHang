import React, { useEffect, useState } from "react";
import axios from "axios";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
  LineChart,
  Line,
} from "recharts";

const COLORS = [
  "#0088FE",
  "#00C49F",
  "#FFBB28",
  "#FF8042",
  "#AA336A",
  "#9933FF",
];

const WaiterDashboard = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const res = await axios.get("http://localhost:2095/api/orders");
      setOrders(res.data || []);
      setError("");
    } catch (err) {
      console.error("❌ Error:", err.message);
      setError("Không thể tải dữ liệu.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  if (loading) return <p className="text-center mt-10">Đang tải...</p>;
  if (error) return <p className="text-center text-red-500 mt-10">{error}</p>;

  /* chuẩn bị dữ liệu */
  const totalRevenue = orders.reduce((sum, o) => sum + (o.totalAmount || 0), 0);

  const statusCount = orders.reduce((acc, o) => {
    const s = o.status || "pending";
    acc[s] = (acc[s] || 0) + 1;
    return acc;
  }, {});

  const statusLabelsVI = {
    pending: "Chờ xử lý",
    paid: "Đã thanh toán",
    completed: "Hoàn tất",
    cancelled: "Hủy",
    preparing: "Đang chuẩn bị",
    served: "Đã phục vụ",
  };

  const statusData = Object.entries(statusCount).map(([s, count]) => ({
    name: statusLabelsVI[s] || s,
    value: count,
  }));

  const foodCount = {};
  orders.forEach((o) => {
    [...(o.items || []), ...(o.addedItems || [])].forEach((item) => {
      const name = item.food?.name || "Món đã xóa";
      foodCount[name] = (foodCount[name] || 0) + (item.quantity || 0);
    });
  });

  const tableCount = {};
  orders.forEach((o) => {
    const table = o.table?.tableNumber || `Bàn ${o.tableId || "?"}`;
    tableCount[table] = (tableCount[table] || 0) + 1;
  });

  const topTables = Object.entries(tableCount)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10)
    .map(([name, count]) => ({ name, count }));

  return (
    <div className="p-8 bg-gray-50 min-h-screen">
      {/* Title */}
      <h1 className="text-center text-3xl font-bold text-gray-800 mb-10 tracking-wide">
        Dashboard Thống kê Orders & Bàn
      </h1>

      {/* Tổng quan */}
      <div className="grid md:grid-cols-2 gap-6 mb-10 max-w-5xl mx-auto">
        {/* Card */}
        <div className="bg-white p-6 rounded-2xl shadow-md hover:shadow-xl transition-all text-center">
          <h3 className="text-gray-500 mb-3 font-medium">Tổng số Order</h3>
          <p className="text-4xl font-bold text-blue-500">{orders.length}</p>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-md hover:shadow-xl transition-all text-center">
          <h3 className="text-gray-500 mb-3 font-medium">Tổng doanh thu</h3>
          <p className="text-4xl font-bold text-green-500">
            {totalRevenue.toLocaleString()}₫
          </p>
        </div>
      </div>

      {/* Charts */}
      <div className="grid lg:grid-cols-2 gap-8">
        {/* Pie Chart */}
        <div className="bg-white p-6 rounded-2xl shadow-md">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">
            Số lượng Orders theo trạng thái
          </h2>

          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={statusData}
                cx="50%"
                cy="50%"
                outerRadius={110}
                dataKey="value"
                nameKey="name"
                label
              >
                {statusData.map((entry, index) => (
                  <Cell key={index} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Line Chart */}
        <div className="bg-white p-6 rounded-2xl shadow-md">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">
            Top bàn phục vụ nhiều nhất
          </h2>

          <ResponsiveContainer width="100%" height={320}>
            <LineChart data={topTables} margin={{ top: 20, bottom: 20 }}>
              <CartesianGrid
                strokeDasharray="3 3"
                className="stroke-gray-300"
              />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line
                type="monotone"
                dataKey="count"
                stroke="#ff5411"
                strokeWidth={3}
                dot={{ r: 5 }}
                activeDot={{ r: 8 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default WaiterDashboard;
