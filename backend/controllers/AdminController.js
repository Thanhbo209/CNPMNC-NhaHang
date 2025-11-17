import Food from "../models/Food.js";
import Order from "../models/Order.js";
import User from "../models/User.js";

class AdminController {
  // [GET] /api/admin/stats
  async getStats(req, res) {
    try {
      const totalOrders = await Order.countDocuments();
      const totalUsers = await User.countDocuments();
      const totalFoods = await Food.countDocuments();

      const paidOrders = await Order.find({ status: "paid" });
      const totalRevenue = paidOrders.reduce(
        (sum, order) => sum + (order.totalAmount || 0),
        0
      );

      res.json({ totalOrders, totalUsers, totalRevenue, totalFoods});
    } catch (err) {
      console.error("❌ Lỗi trong AdminController.getStats:", err.message);
      res.status(500).json({ error: err.message });
    }
  }

  // [GET] /api/admin/dashboard?range=day|week|month
  async getDashboardStats(req, res) {
    try {
      const { range = "week" } = req.query;
      const today = new Date();
      let startDate = new Date();

      if (range === "day") {
        startDate.setHours(0, 0, 0, 0);
      } else if (range === "week") {
        startDate.setDate(today.getDate() - 6); // 7 ngày gần nhất
      } else if (range === "month") {
        startDate.setDate(today.getDate() - 29); // 30 ngày gần nhất
      }

      // --- USER STATS ---
      const userStats = await User.aggregate([
        { $match: { createdAt: { $gte: startDate } } },
        {
          $group: {
            _id:
              range === "day"
                ? { $hour: "$createdAt" } // thống kê theo giờ
                : {
                    $dateToString: { format: "%Y-%m-%d", date: "$createdAt" },
                  }, // thống kê theo ngày
            count: { $sum: 1 },
          },
        },
        { $sort: { _id: 1 } },
      ]);

      // --- ORDER STATS ---
      const orderStats = await Order.aggregate([
        { $match: { createdAt: { $gte: startDate } } },
        {
          $group: {
            _id:
              range === "day"
                ? { $hour: "$createdAt" }
                : {
                    $dateToString: { format: "%Y-%m-%d", date: "$createdAt" },
                  },
            count: { $sum: 1 },
            total: { $sum: "$totalAmount" },
          },
        },
        { $sort: { _id: 1 } },
      ]);

      // Tổng quan
      const totalUsers = await User.countDocuments();
      const totalOrders = await Order.countDocuments();
      const totalRevenueResult = await Order.aggregate([
        { $group: { _id: null, sum: { $sum: "$totalAmount" } } },
      ]);
      const totalRevenue = totalRevenueResult[0]?.sum || 0;

      res.json({
        userStats,
        orderStats,
        totals: {
          users: totalUsers,
          orders: totalOrders,
          revenue: totalRevenue,
        },
      });
    } catch (err) {
      console.error(
        "❌ Lỗi trong AdminController.getDashboardStats:",
        err.message
      );
      res.status(500).json({ error: err.message });
    }
  }
}

export default new AdminController();
