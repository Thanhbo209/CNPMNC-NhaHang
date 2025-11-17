import React, { useEffect, useState } from "react";
import axios from "axios";
import {
  PieChart, Pie, Cell, Tooltip, Legend,
  BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer,
  LineChart, Line
} from "recharts";


const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#AA336A", "#9933FF"];

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
      console.error("❌ Lỗi khi tải dữ liệu:", err.message);
      setError("Không thể tải dữ liệu. Vui lòng thử lại sau.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  if (loading) return <p style={{ textAlign: "center", marginTop: "2rem" }}>Đang tải dữ liệu...</p>;
  if (error) return <p style={{ textAlign: "center", color: "red", marginTop: "2rem" }}>{error}</p>;

  const totalRevenue = orders.reduce((sum, o) => sum + (o.totalAmount || 0), 0);

  const statusCount = orders.reduce((acc, o) => {
    const s = o.status || "pending";
    acc[s] = (acc[s] || 0) + 1;
    return acc;
  }, {});

  // Map trạng thái sang tiếng Việt
  const statusLabelsVI = {
    pending: "Chờ xử lý",
    paid: "Đã thanh toán",
    completed: "Hoàn tất",
    cancelled: "Hủy",
    preparing: "Đang chuẩn bị",
    served: "Đã phục vụ"
  };

 const statusData = Object.entries(statusCount).map(([status, count]) => ({
    name: statusLabelsVI[status] || status,
    value: count
  }));

  const foodCount = {};
  orders.forEach(o => {
    [...(o.items || []), ...(o.addedItems || [])].forEach(item => {
      const name = item.food?.name || "Món đã xóa";
      foodCount[name] = (foodCount[name] || 0) + (item.quantity || 0);
    });
  });
  const topFoods = Object.entries(foodCount)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10)
    .map(([name, qty]) => ({ name, qty }));

  const tableCount = {};
  orders.forEach(o => {
    const tableNumber = o.table?.tableNumber || `Bàn ${o.tableId || "?"}`;
    tableCount[tableNumber] = (tableCount[tableNumber] || 0) + 1;
  });
  const topTables = Object.entries(tableCount)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10)
    .map(([name, count]) => ({ name, count }));

  return (
    <div style={{ padding: "2rem", fontFamily: "'Inter', sans-serif", background: "#f9f9f9" }}>
      <h1
  style={{
    textAlign: "center",
    marginBottom: "2rem",
    color: "#333",
    fontWeight: 700,
    fontSize: "2rem",
    letterSpacing: "1px",
    lineHeight: "1.2"
  }}
>
  Dashboard Thống kê Orders & Bàn
</h1>


      {/* Tổng quan */}
      <div style={{
        display: "flex",
        flexWrap: "wrap",
        gap: "1.5rem",
        justifyContent: "center",
        marginBottom: "3rem"
      }}>
        {[
          { label: "Tổng số order", value: orders.length, color: "#0088FE" },
          { label: "Tổng doanh thu", value: `${totalRevenue.toLocaleString()} VNĐ`, color: "#00C49F" }
        ].map((card, idx) => (
          <div
            key={idx}
            style={{
              flex: "1 1 250px",
              background: "#fff",
              padding: "1.8rem 1.5rem",
              borderRadius: "15px",
              boxShadow: "0 6px 15px rgba(0,0,0,0.1)",
              textAlign: "center",
              transition: "transform 0.2s, box-shadow 0.2s",
              cursor: "default"
            }}
            onMouseEnter={e => e.currentTarget.style.transform = "translateY(-5px)"}
            onMouseLeave={e => e.currentTarget.style.transform = "translateY(0)"}
          >
            <h3 style={{ marginBottom: "1rem", color: "#555", fontWeight: 500 }}>{card.label}</h3>
            <p style={{ fontSize: "2rem", fontWeight: "700", color: card.color }}>{card.value}</p>
          </div>
        ))}
      </div>

       {/* Biểu đồ */}
      <div style={{ display: "flex", flexWrap: "wrap", gap: "2rem", justifyContent: "center" }}>
        {/* Pie chart trạng thái */}
        <div style={{ flex: "1 1 400px", background: "#fff", padding: "1.5rem", borderRadius: "15px", boxShadow: "0 6px 15px rgba(0,0,0,0.1)" }}>
          <h2 style={{ marginBottom: "1rem", color: "#333", fontWeight: 600, fontSize: "1.25rem" }}>Số order theo trạng thái</h2>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={statusData}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                outerRadius={100}
                label
              >
                {statusData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
              <Legend verticalAlign="bottom" height={36} />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Top bàn - LineChart */}
        <div style={{
          flex: "1 1 500px",
          background: "#fff",
          padding: "1.8rem",
          borderRadius: "18px",
          boxShadow: "0 8px 20px rgba(0,0,0,0.1)",
          transition: "transform 0.3s, box-shadow 0.3s",
          cursor: "default"
        }}
          onMouseEnter={e => {
            e.currentTarget.style.transform = "translateY(-5px)";
            e.currentTarget.style.boxShadow = "0 12px 25px rgba(0,0,0,0.15)";
          }}
          onMouseLeave={e => {
            e.currentTarget.style.transform = "translateY(0)";
            e.currentTarget.style.boxShadow = "0 8px 20px rgba(0,0,0,0.1)";
          }}
        >
          <h2 style={{ marginBottom: "1.2rem", color: "#ff5411ff", fontWeight: 600, fontSize: "1.3rem" }}>
            Top bàn phục vụ nhiều nhất
          </h2>
          <ResponsiveContainer width="100%" height={350}>
            <LineChart
              data={topTables}
              margin={{ top: 20, right: 20, left: 10, bottom: 20 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
              <XAxis dataKey="name" tick={{ fontSize: 12, fill: "#555" }} />
              <YAxis tick={{ fontSize: 12, fill: "#555" }} />
              <Tooltip
                contentStyle={{ backgroundColor: "#fff", borderRadius: "8px", border: "1px solid #ddd" }}
              />
              <Legend verticalAlign="top" height={36} />
              <Line
                type="monotone"
                dataKey="count"
                stroke="#ff5411ff"
                strokeWidth={3}
                dot={{ r: 6, fill: "#ff5411ff", stroke: "#fc7c19ff", strokeWidth: 2 }}
                activeDot={{ r: 8, fill: "#fc7c19ff", stroke: "#ff5411ff", strokeWidth: 2 }}
                animationDuration={1500}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>



      </div>
    </div>
  );
};

export default WaiterDashboard;
