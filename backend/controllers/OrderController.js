import Order from "../models/Order.js";

class OrderController {
  // [GET] /api/orders
  async getAllOrders(req, res) {
    try {
      const orders = await Order.find()
        .populate("table")
        .populate("user", "name email")
        .populate("items.food")
        .populate("addedItems.food");
      // Ensure each item has a status for backward compatibility
      const norm = orders.map(o => {
        const obj = o.toObject ? o.toObject() : o;
        obj.items = (obj.items || []).map(it => ({ ...it, status: it.status || 'pending' }));
        obj.addedItems = (obj.addedItems || []).map(it => ({ ...it, status: it.status || 'pending' }));
        return obj;
      });
      res.json(norm);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  }

  // [GET] /api/orders/:id
  async getOrderById(req, res) {
    try {
      const order = await Order.findById(req.params.id)
        .populate("items.food")
        .populate("addedItems.food")
        .populate("user", "name email")
        .populate("table");

      if (!order)
        return res.status(404).json({ error: "Không tìm thấy đơn hàng" });

      const obj = order.toObject ? order.toObject() : order;
      obj.items = (obj.items || []).map(it => ({ ...it, status: it.status || 'pending' }));
      obj.addedItems = (obj.addedItems || []).map(it => ({ ...it, status: it.status || 'pending' }));
      res.json(obj);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  }

  // [GET] /api/orders/byTable/:tableId
  async getOrderByTable(req, res) {
    try {
      const orders = await Order.find({ table: req.params.tableId })
        .populate("items.food")
        .populate("addedItems.food")
        .populate("user", "name email")
        .populate("table", "tableNumber");
      // Normalize item status for backward compatibility
      const norm = orders.map(o => {
        const obj = o.toObject ? o.toObject() : o;
        obj.items = (obj.items || []).map(it => ({ ...it, status: it.status || 'pending' }));
        obj.addedItems = (obj.addedItems || []).map(it => ({ ...it, status: it.status || 'pending' }));
        return obj;
      });
      res.json(norm);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  }

  // [POST] /api/orders
  async createOrder(req, res) {
    try {
      const { table, user, items, addedItems, orderNote } = req.body;

      // Kiểm tra các trường bắt buộc
      if (!table) return res.status(400).json({ error: "Thiếu thông tin bàn" });
      if (!items || items.length === 0)
        return res
          .status(400)
          .json({ error: "Đơn hàng phải có ít nhất 1 món" });

      const order = new Order({
        table,
        user: user || null, // nếu chưa đăng nhập
        items,
        addedItems: addedItems || [],
        orderNote: orderNote || "",
        status: "pending", // mặc định là chưa thanh toán
      });

      await order.save();

      const populatedOrder = await Order.findById(order._id)
        .populate("table", "tableNumber")
        .populate("items.food")
        .populate("addedItems.food")
        .populate("user", "name email");

      const obj = populatedOrder.toObject ? populatedOrder.toObject() : populatedOrder;
      obj.items = (obj.items || []).map(it => ({ ...it, status: it.status || 'pending' }));
      obj.addedItems = (obj.addedItems || []).map(it => ({ ...it, status: it.status || 'pending' }));

      res.json(obj);
    } catch (err) {
      console.error("❌ Lỗi tạo order:", err.message);
      res.status(500).json({ error: err.message });
    }
  }

  // [PUT] /api/orders/:id
  async updateOrder(req, res) {
    try {
      const order = await Order.findById(req.params.id);
      if (!order) return res.status(404).json({ error: "Order không tồn tại" });

      // Prevent removing items that are currently preparing/ready
      const incomingItems = Array.isArray(req.body.items) ? req.body.items : null;
      if (incomingItems) {
        // Build sets for incoming identifiers (try _id, fallback to food id)
        const incomingIds = new Set();
        const incomingFoodIds = new Set();
        for (const it of incomingItems) {
          if (it._id) incomingIds.add(String(it._id));
          if (it.food) incomingFoodIds.add(String(it.food));
        }

        for (const orig of order.items || []) {
          const status = (orig.status || '').toString().toLowerCase();
          if (status === 'preparing' || status === 'ready') {
            const origId = String(orig._id);
            const origFood = orig.food && orig.food._id ? String(orig.food._id) : String(orig.food);
            const keptById = incomingIds.has(origId);
            const keptByFood = origFood ? incomingFoodIds.has(origFood) : false;
            if (!keptById && !keptByFood) {
              return res.status(400).json({ error: `Không thể xóa món đang chế biến/đã sẵn sàng: ${orig.food?.toString() || origId}` });
            }
          }
        }
      }

      // Similar check for addedItems
      const incomingAdded = Array.isArray(req.body.addedItems) ? req.body.addedItems : null;
      if (incomingAdded) {
        const incomingAddedIds = new Set();
        const incomingAddedFoodIds = new Set();
        for (const it of incomingAdded) {
          if (it._id) incomingAddedIds.add(String(it._id));
          if (it.food) incomingAddedFoodIds.add(String(it.food));
        }

        for (const orig of order.addedItems || []) {
          const status = (orig.status || '').toString().toLowerCase();
          if (status === 'preparing' || status === 'ready') {
            const origId = String(orig._id);
            const origFood = orig.food && orig.food._id ? String(orig.food._id) : String(orig.food);
            const keptById = incomingAddedIds.has(origId);
            const keptByFood = origFood ? incomingAddedFoodIds.has(origFood) : false;
            if (!keptById && !keptByFood) {
              return res.status(400).json({ error: `Không thể xóa món thêm đang chế biến/đã sẵn sàng: ${orig.food?.toString() || origId}` });
            }
          }
        }
      }

      order.items = req.body.items || order.items;
      order.addedItems = req.body.addedItems || order.addedItems;
      order.status = req.body.status || order.status;
      order.orderNote = req.body.orderNote || order.orderNote;

      await order.save(); // ✅ middleware pre("save") chạy ở đây

      res.json(order);
    } catch (err) {
      console.error("❌ Lỗi update order:", err.message);
      res.status(500).json({ error: err.message });
    }
  }

  // [PATCH] /api/orders/:orderId/items/:itemId
  async updateItemStatus(req, res) {
    try {
      const { orderId, itemId } = req.params;
      const { status } = req.body;

      const order = await Order.findById(orderId);
      if (!order) return res.status(404).json({ error: "Order không tồn tại" });

      // Try find in items
      let found = order.items.id(itemId);
      let listName = 'items';
      if (!found) {
        found = order.addedItems.id(itemId);
        listName = 'addedItems';
      }

      if (!found) {
        return res.status(404).json({ error: "Item không tìm thấy trong order" });
      }

      // validate status if provided
      const allowed = ["pending", "preparing", "ready", "canceled"];
      if (status && !allowed.includes(status)) {
        return res.status(400).json({ error: "Trạng thái không hợp lệ" });
      }

      found.status = status || found.status;

      // If all non-canceled items are ready, mark order as served so waiter can add items
      const allItems = [ ...(order.items || []), ...(order.addedItems || []) ];
      const actionable = allItems.filter(it => {
        const s = (it.status || '').toString().toLowerCase();
        return s !== 'canceled' && s !== 'cancel';
      });

      const allReady = actionable.length > 0 && actionable.every(it => (it.status || '').toString().toLowerCase() === 'ready');
      if (allReady) {
        order.status = 'served';
      }

      await order.save();

      const populated = await Order.findById(order._id)
        .populate("table")
        .populate("user", "name email")
        .populate("items.food")
        .populate("addedItems.food");

      res.json(populated);
    } catch (err) {
      console.error("❌ Lỗi update item status:", err.message);
      res.status(500).json({ error: err.message });
    }
  }

  // [DELETE] /api/orders/:id
  async deleteOrder(req, res) {
    try {
      await Order.findByIdAndDelete(req.params.id);
      res.json({ message: "Order deleted" });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  }

  // [GET] /api/orders/top-foods
  async getTopFoods(req, res) {
    try {
      const topFoods = await Order.aggregate([
        { $match: { status: "paid" } }, // chỉ tính các order đã thanh toán
        { $unwind: "$items" },
        {
          $group: {
            _id: "$items.food",
            totalSold: { $sum: "$items.quantity" },
            totalRevenue: {
              $sum: { $multiply: ["$items.quantity", "$items.price"] },
            },
          },
        },
        { $sort: { totalSold: -1 } },
        { $limit: 10 },
        {
          $lookup: {
            from: "foods",
            localField: "_id",
            foreignField: "_id",
            as: "food",
          },
        },
        { $unwind: "$food" },
        {
          $project: {
            _id: 0,
            foodId: "$food._id",
            price: "$food.price",
            name: "$food.name",
            totalSold: 1,
            totalRevenue: 1,
            image: "$food.image",
          },
        },
      ]);

      res.json(topFoods);
    } catch (err) {
      console.error("❌ Lỗi lấy top foods:", err.message);
      res.status(500).json({ error: err.message });
    }
  }

  // [PATCH] /api/orders/:id/add-items
  async addItemsToOrder(req, res) {
    try {
      const { addedItems } = req.body; // [{ food, quantity, note }, ...]
      if (
        !addedItems ||
        !Array.isArray(addedItems) ||
        addedItems.length === 0
      ) {
        return res.status(400).json({ error: "Vui lòng cung cấp món thêm" });
      }

      const order = await Order.findById(req.params.id);
      if (!order) return res.status(404).json({ error: "Order không tồn tại" });

      // Only allow adding items when order is currently served (business rule)
      if (order.status !== "served") {
        return res
          .status(400)
          .json({ error: "Chỉ có thể thêm món cho order đã served" });
      }

      // Append added items and mark order as pending so it can't be paid
      order.addedItems = [...(order.addedItems || []), ...addedItems];
      order.status = "pending"; // new items require chef to prepare -> block payment until chef accepts

      await order.save(); // middleware pre("save") tự tính totalAmount

      const populated = await Order.findById(order._id)
        .populate("table")
        .populate("user", "name email")
        .populate("items.food")
        .populate("addedItems.food");

      res.json(populated);
    } catch (err) {
      console.error("❌ Lỗi thêm món cho order:", err.message);
      res.status(500).json({ error: err.message });
    }
  }

  // [POST] /api/orders/merge
  async mergeOrders(req, res) {
    try {
      const { orderIds } = req.body; // expect array
      if (!orderIds || !Array.isArray(orderIds) || orderIds.length < 2) {
        return res.status(400).json({ error: "Cần ít nhất 2 đơn để gộp." });
      }

      // Load orders
      const orders = await Order.find({ _id: { $in: orderIds } })
        .populate("table")
        .populate("user", "name email")
        .populate("items.food")
        .populate("addedItems.food");

      if (!orders || orders.length !== orderIds.length) {
        return res.status(404).json({ error: "Một hoặc nhiều đơn không tồn tại." });
      }

      // Ensure all orders are in 'served' state (chờ thanh toán)
      const notServed = orders.filter(o => (o.status || '').toString().toLowerCase() !== 'served');
      if (notServed.length > 0) {
        return res.status(400).json({ error: "Chỉ có thể gộp các đơn đang chờ thanh toán (served)." });
      }

      // Combine items and addedItems
      const combinedItems = [];
      const combinedAdded = [];
      let table = orders[0].table || orders[0].table; // use first order's table
      let user = orders[0].user || null;
      let orderNote = `Gộp từ: ${orderIds.join(', ')}`;

      for (const o of orders) {
        if (Array.isArray(o.items)) combinedItems.push(...o.items.map(it => ({ food: it.food?._id || it.food, quantity: it.quantity, note: it.note || '', status: it.status || 'pending' })));
        if (Array.isArray(o.addedItems)) combinedAdded.push(...o.addedItems.map(it => ({ food: it.food?._id || it.food, quantity: it.quantity, note: it.note || '', status: it.status || 'pending' })));
      }

      // Create merged order
      const merged = new Order({
        table: table?._id || table || null,
        user: user?._id || user || null,
        items: combinedItems,
        addedItems: combinedAdded,
        orderNote,
        status: 'served',
      });

      await merged.save();

      // Mark source orders as cancelled/merged to avoid double-pay
      await Promise.all(orders.map(async (o) => {
        o.status = 'canceled';
        o.orderNote = `${o.orderNote || ''} \n Gộp vào đơn ${merged._id}`;
        await o.save();
      }));

      const populated = await Order.findById(merged._id)
        .populate('table')
        .populate('user', 'name email')
        .populate('items.food')
        .populate('addedItems.food');

      res.status(201).json(populated);
    } catch (err) {
      console.error('❌ Lỗi gộp đơn:', err.message);
      res.status(500).json({ error: err.message });
    }
  }
}

export default new OrderController();
