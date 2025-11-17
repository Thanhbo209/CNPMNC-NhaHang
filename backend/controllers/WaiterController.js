import Order from "../models/Order.js";
import Table from "../models/Table.js";
import Food from "../models/Food.js";

class WaiterController {
  
  // [GET] /api/waiter/tables
  async getAllTables(req, res) {
    try {
      const tables = await Table.find().populate("currentOrder");
      res.json(tables);
    } catch (err) {
      console.error("❌ Lỗi lấy danh sách bàn:", err.message);
      res.status(500).json({ error: err.message });
    }
  }

  // [GET] /api/waiter/active-orders
  async getActiveOrders(req, res) {
    try {
      const orders = await Order.find({
        status: { $in: ["pending", "preparing", "served"] },
      })
        .populate("table", "tableNumber status")
        .populate("user", "fullName email")
        .populate("items.food", "name price image");
        // Normalize item statuses so waiter sees item-level status
        const normalized = orders.map(o => {
          const obj = o.toObject ? o.toObject() : o;
          obj.items = (obj.items || []).map(it => ({ ...it, status: it.status || 'pending' }));
          obj.addedItems = (obj.addedItems || []).map(it => ({ ...it, status: it.status || 'pending' }));
          return obj;
        });

        const translatedOrders = normalized.map((order) => {
        let statusVi = "";
        switch (order.status) {
          case "pending":
            statusVi = "Đang chờ";
            break;
          case "preparing":
            statusVi = "Đang chuẩn bị";
            break;
          case "served":
            statusVi = "Đã phục vụ";
            break;
          default:
            statusVi = "Không xác định";
        }
          return {
        ...order.toObject(),
        statusVi, // thêm trường tiếng Việt
      };
    });
      res.json(translatedOrders);
    } catch (err) {
      console.error("❌ Lỗi trong getActiveOrders:", err.message);
      res.status(500).json({ error: err.message });
    }
  }

  // [POST] /api/waiter/create-order
  async createOrder(req, res) {
    try {
      const { table, waiterId, items, orderNote } = req.body;
      if (!table || !items || items.length === 0)
        return res.status(400).json({ error: "Thiếu thông tin bàn hoặc món ăn" });

      const tableDoc = await Table.findById(table);
      if (!tableDoc) return res.status(404).json({ error: "Không tìm thấy bàn" });
      if (tableDoc.status === "occupied")
        return res.status(400).json({ error: "Bàn này đang được phục vụ" });

      // Tính tổng tiền
      let totalAmount = 0;
      for (const item of items) {
        const food = await Food.findById(item.food);
        if (food) totalAmount += food.price * (item.quantity || 1);
      }

      const newOrder = new Order({
        table,
        waiterId,
        items,
        orderNote: orderNote || "",
        totalAmount,
        status: "pending",
        createdAt: new Date(),
      });
      await newOrder.save();

      // Cập nhật bàn
      tableDoc.status = "occupied";
      tableDoc.currentOrder = newOrder._id;
      await tableDoc.save();

      const populatedOrder = await Order.findById(newOrder._id)
        .populate("table", "tableNumber status")
        .populate("items.food", "name price image");

      res.json({
        message: "🧾 Tạo order thành công & bàn đã chuyển sang occupied",
        order: populatedOrder,
      });
    } catch (err) {
      console.error("❌ Lỗi trong createOrder:", err.message);
      res.status(500).json({ error: err.message });
    }
  }

  // [PUT] /api/waiter/complete-order/:orderId
  async completeOrder(req, res) {
    try {
      const { orderId } = req.params;
      const order = await Order.findById(orderId).populate("table");
      if (!order) return res.status(404).json({ error: "Không tìm thấy order" });

      order.status = "completed";
      await order.save();

      // Cập nhật bàn lại available
      if (order.table) {
        const table = await Table.findById(order.table._id);
        if (table) {
          table.status = "available";
          table.currentOrder = null;
          await table.save();
        }
      }

      res.json({
        message: "🍽️ Order hoàn tất và bàn đã sẵn sàng phục vụ mới",
        order,
      });
    } catch (err) {
      console.error("❌ Lỗi trong completeOrder:", err.message);
      res.status(500).json({ error: err.message });
    }
  }

  // [GET] /api/waiter/stats
  async getStats(req, res) {
    try {
      const totalOrders = await Order.countDocuments();
      const activeOrders = await Order.countDocuments({
        status: { $in: ["pending", "preparing", "served"] },
      });
      const completedOrders = await Order.countDocuments({ status: "completed" });

      const revenueResult = await Order.aggregate([
        { $match: { status: "paid" } },
        { $group: { _id: null, totalRevenue: { $sum: "$totalAmount" } } },
      ]);
      const totalRevenue = revenueResult[0]?.totalRevenue || 0;

      res.json({ totalOrders, activeOrders, completedOrders, totalRevenue });
    } catch (err) {
      console.error("❌ Lỗi trong getStats:", err.message);
      res.status(500).json({ error: err.message });
    }
  }

  // ✅ để tránh lỗi route undefined
  async updateItemStatus(req, res) {
    res.json({ message: "updateItemStatus API đang được phát triển" });
  }
}

export default new WaiterController();
