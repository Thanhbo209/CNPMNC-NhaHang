import React, { useEffect, useState } from "react";
import axios from "axios";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import {
    ResponsiveContainer,
    PieChart,
    Pie,
    Cell,
    Tooltip as ReTooltip,
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Legend,
} from "recharts";
import { UtensilsCrossed } from "lucide-react";

// --- API Endpoints ---
const API = "http://localhost:2095/api/orders"; // Dùng để lấy Orders và tính Stats
const TOP_FOODS_API = "http://localhost:2095/api/orders/top-foods"; // Dùng để lấy Top Foods (cần API này trả về dữ liệu top món ăn)

// --- Constants ---
const COLORS = ["#f59e0b", "#3b82f6", "#10b981"]; // Vàng (Đang chờ), Xanh dương (Đang nấu), Xanh lá (Đã xong)

// --- Component phụ: AnimatedCard ---
const AnimatedCard = ({ children, color }) => (
    <div className="relative group">
        <div
            className={`absolute -inset-[2px] rounded-2xl bg-gradient-to-r ${color} opacity-80 blur-sm animate-border-spin`}
        />
        <div
            className={`relative rounded-2xl p-6 bg-gradient-to-br ${color} bg-opacity-20 backdrop-blur-sm`}
        >
            {children}
        </div>
    </div>
);

// --- Component phụ: StatCard ---
const StatCard = ({ title, value, color, icon: Icon }) => (
    <AnimatedCard color={color}>
        <div className="flex items-center justify-between">
            <div>
                <h3 className="text-white font-semibold">{title}</h3>
                <p className="text-2xl font-bold text-white mt-2">{value}</p>
            </div>
            <div className={`p-4 rounded-full bg-gradient-to-tr ${color} shadow-xl`}>
                <Icon className="text-white w-8 h-8" />
            </div>
        </div>
    </AnimatedCard>
);

// --- Component chính: ChefDashboard ---
const ChefDashboard = () => {
    // State cho Stats (Đang chờ, Đang nấu, Đã xong)
    const [stats, setStats] = useState({ pending: 0, preparing: 0, ready: 0 });
    // State cho Top Foods
    const [topFoods, setTopFoods] = useState([]);
    const [loading, setLoading] = useState(true);

    // Lọc ngày cho Stats
    const [startDate, setStartDate] = useState(null);
    const [endDate, setEndDate] = useState(null);

    // Lọc ngày RIÊNG cho Top Foods
    const [topStartDate, setTopStartDate] = useState(null);
    const [topEndDate, setTopEndDate] = useState(null);

    // --- Hàm Fetch Top Foods (Đã sửa lỗi) ---
    const fetchTopFoods = async (start = null, end = null) => {
        try {
            const params = {};
            if (start) params.start = start.toISOString();
            if (end) params.end = end.toISOString();

            const res = await axios.get(TOP_FOODS_API, { params });
            // API TOP_FOODS_API phải trả về mảng các món ăn { name, totalSold, price, image }
            setTopFoods(Array.isArray(res.data) ? res.data : []);
        } catch (err) {
            console.error("Lỗi khi lấy top foods:", err);
        }
    };

    // --- useEffect cho Stats và Top Foods (Lần tải đầu tiên) ---
    useEffect(() => {
        const fetchStats = async () => {
            try {
                setLoading(true);
                const params = {};
                // Thêm bộ lọc ngày vào tham số
                if (startDate) params.start = startDate.toISOString();
                if (endDate) params.end = endDate.toISOString();

                // 1. Lấy tất cả orders trong khoảng thời gian lọc (để tính stats)
                const res = await axios.get(API, { params });
                const orders = Array.isArray(res.data) ? res.data : [];
                // Gom tất cả món ăn từ tất cả orders
                const items = orders.flatMap((o) => [...(o.items || []), ...(o.addedItems || [])]);

                // Tính toán Stats
                const s = items.reduce(
                    (acc, it) => {
                        const st = it.status || "pending";
                        if (st === "pending") acc.pending++;
                        else if (st === "preparing") acc.preparing++;
                        else if (st === "ready") acc.ready++;
                        return acc;
                    },
                    { pending: 0, preparing: 0, ready: 0 }
                );
                setStats(s);

                // 2. Lấy Top Foods (Lưu ý: Bộ lọc của Stats và Top Foods hoạt động độc lập.
                // Nếu bạn muốn Top Foods KHÔNG thay đổi khi lọc Stats, hãy bỏ dòng này)
                if (!topStartDate && !topEndDate) {
                    // Chỉ gọi khi Top Foods chưa có bộ lọc riêng
                    await fetchTopFoods(startDate, endDate); 
                }

            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        fetchStats();
    }, [startDate, endDate]); // Chạy lại khi bộ lọc Stats thay đổi

    // --- Dữ liệu cho Biểu đồ ---
    const pieData = [
        { name: "Đang chờ", value: stats.pending },
        { name: "Đang nấu", value: stats.preparing },
        { name: "Đã xong", value: stats.ready },
    ];

    const barData = topFoods.map((f) => ({ name: f.name, sold: f.totalSold || 0 }));

    if (loading && topFoods.length === 0) {
        return <div className="max-w-7xl mx-auto py-8 text-center text-xl">Đang tải dữ liệu...</div>
    }

    // --- Render ---
    return (
        <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
            <h1 className="text-3xl font-bold mb-8 text-gray-800">Bếp - Thống kê</h1>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                <StatCard
                    title="Đang chờ"
                    value={stats.pending}
                    color="from-yellow-400 via-orange-400 to-red-400"
                    icon={UtensilsCrossed}
                />
                <StatCard
                    title="Đang nấu"
                    value={stats.preparing}
                    color="from-sky-400 via-blue-500 to-indigo-500"
                    icon={UtensilsCrossed}
                />
                <StatCard
                    title="Đã xong"
                    value={stats.ready}
                    color="from-emerald-400 via-green-500 to-teal-500"
                    icon={UtensilsCrossed}
                />
            </div>

            {/* Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Pie Chart */}
                <div className="relative group rounded-2xl p-[2px] hover:shadow-xl transition-all duration-300">
                    <div className="bg-white p-6 rounded-2xl shadow-lg h-full">
                        <h3 className="text-xl font-semibold mb-4">Tỉ lệ trạng thái món</h3>
                        <ResponsiveContainer width="100%" height={280}>
                            <PieChart>
                                <Pie
                                    data={pieData}
                                    dataKey="value"
                                    nameKey="name"
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={60}
                                    outerRadius={100}
                                    paddingAngle={4}
                                    label={({ name, percent }) =>
                                        `${name} ${(percent * 100).toFixed(0)}%`
                                    }
                                >
                                    {pieData.map((entry, index) => (
                                        <Cell
                                            key={`cell-${index}`}
                                            fill={COLORS[index % COLORS.length]}
                                            stroke="#fff"
                                            strokeWidth={2}
                                            className="transition-transform duration-300 hover:scale-105 cursor-pointer"
                                        />
                                    ))}
                                </Pie>
                                <ReTooltip 
                                    formatter={(value, name, props) => [`${value} món`, props.payload.name]}
                                />
                                <Legend
                                    verticalAlign="bottom"
                                    height={36}
                                    wrapperStyle={{ color: "#1e293b", fontSize: "14px" }}
                                    iconType="circle"
                                />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Bar Chart Top Foods */}
                <div className="relative group rounded-2xl p-[2px] hover:shadow-xl transition-all duration-300 mt-6 lg:mt-0">
                    <div className="bg-white p-6 rounded-2xl shadow-lg h-full">
                        <h3 className="text-xl font-semibold mb-4">Top món bán chạy</h3>

                        {/* Bộ lọc ngày ĐÃ SỬA LỖI */}
                        <div className="flex flex-wrap items-end gap-2 mb-4">
                            <div className="flex items-center gap-2">
                                <div className="text-xs text-gray-500">Từ</div>
                                <DatePicker
                                    selected={topStartDate}
                                    onChange={(d) => {
                                        setTopStartDate(d);
                                        // Đảm bảo ngày bắt đầu không lớn hơn ngày kết thúc
                                        if (topEndDate && d && d > topEndDate) {
                                            setTopEndDate(d);
                                        }
                                    }}
                                    selectsStart
                                    startDate={topStartDate}
                                    endDate={topEndDate}
                                    maxDate={topEndDate || new Date()}
                                    dateFormat="dd/MM/yyyy"
                                    className="border p-1 rounded text-sm w-28"
                                />
                            </div>
                            <div className="flex items-center gap-2">
                                <div className="text-xs text-gray-500">Đến</div>
                                <DatePicker
                                    selected={topEndDate}
                                    onChange={(d) => setTopEndDate(d)}
                                    selectsEnd
                                    startDate={topStartDate}
                                    endDate={topEndDate}
                                    minDate={topStartDate}
                                    maxDate={new Date()}
                                    dateFormat="dd/MM/yyyy"
                                    className="border p-1 rounded text-sm w-28"
                                />
                            </div>
                            
                            {/* NÚT ÁP DỤNG ĐÃ SỬA LỖI */}
                            <button
                                onClick={() => {
                                    if (topStartDate && topEndDate && topStartDate > topEndDate) {
                                        alert("Ngày bắt đầu không được vượt quá ngày kết thúc!");
                                        return;
                                    }
                                    // GỌI HÀM FETCH VỚI THAM SỐ LỌC
                                    fetchTopFoods(topStartDate, topEndDate); 
                                }}
                                className="px-3 py-1 bg-blue-600 text-white rounded text-sm hover:bg-blue-700 transition"
                            >
                                Áp dụng
                            </button>
                            <button
                                onClick={() => {
                                    setTopStartDate(null);
                                    setTopEndDate(null);
                                    // GỌI HÀM FETCH ĐỂ RESET VỀ TOÀN BỘ HOẶC DÙNG LỌC STATS
                                    fetchTopFoods(startDate, endDate);
                                }}
                                className="px-3 py-1 bg-gray-200 text-gray-700 rounded text-sm hover:bg-gray-300 transition"
                            >
                                Reset
                            </button>
                        </div>

                        <ResponsiveContainer width="100%" height={300}>
                            <BarChart
                                data={barData
                                    .filter((f) => f.sold > 0)
                                    .sort((a, b) => b.sold - a.sold)
                                    .slice(0, 10) // Chỉ hiển thị 10 món top
                                }
                                margin={{ top: 5, right: 10, left: 10, bottom: 5 }}
                            >
                                <CartesianGrid vertical={false} stroke="#e5e7eb" />
                                <XAxis
                                    dataKey="name"
                                    tick={{ fill: "#111827", fontSize: 12 }}
                                    axisLine={false}
                                    tickLine={false}
                                    angle={-15} // Xoay chữ cho dễ đọc
                                    textAnchor="end"
                                    height={50}
                                />
                                <YAxis
                                    tick={{ fill: "#111827", fontSize: 12 }}
                                    axisLine={false}
                                    tickLine={false}
                                    domain={[0, 'auto']}
                                />
                                <ReTooltip formatter={(v) => `${v} món`} />
                                <defs>
                                    <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.9} />
                                        <stop offset="95%" stopColor="#1e40af" stopOpacity={0.3} />
                                    </linearGradient>
                                </defs>
                                <Bar dataKey="sold" fill="url(#barGradient)" radius={[6, 6, 0, 0]} barSize={30} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>

            {/* List top foods */}
            <div className="mt-8 bg-white p-6 rounded-2xl shadow-lg">
                <h3 className="text-xl font-semibold mb-4 border-b pb-2">Chi tiết món ăn bán chạy </h3>
                <ul className="divide-y divide-gray-200">
                    {topFoods
                        .filter((food) => (food.totalSold || 0) >= 5)
                        .sort((a, b) => b.totalSold - a.totalSold) // Sắp xếp lại
                        .map((food, index) => (
                            <li key={index} className="flex items-center justify-between py-3">
                                <div className="flex items-center gap-3">
                                    <img
                                        src={food.image || 'https://via.placeholder.com/60?text=Food'}
                                        alt={food.name}
                                        className="w-14 h-14 rounded-lg object-cover border"
                                    />
                                    <div>
                                        <p className="font-medium text-gray-800">{food.name}</p>
                                        <p className="text-gray-500 text-sm">
                                            Giá: {Number(food.price || 0).toLocaleString("vi-VN")} ₫
                                        </p>
                                    </div>
                                </div>
                                <span className="text-lg text-red-600 font-bold flex items-center gap-1">
                                    <span className="text-xl">🛒</span> {food.totalSold} món
                                </span>
                            </li>
                        ))}
                    {topFoods.filter((food) => (food.totalSold || 0) >= 5).length === 0 && (
                        <li className="py-3 text-center text-gray-500">
                            Không có món ăn nào đạt tiêu chí bán chạy trong khoảng thời gian này.
                        </li>
                    )}
                </ul>
            </div>
        </div>
    );
};

export default ChefDashboard;