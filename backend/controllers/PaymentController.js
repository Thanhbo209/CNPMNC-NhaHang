import Payment from "../models/Payment.js";
import Order from "../models/Order.js";

class PaymentController {
  // [GET] /api/payments
  async getAllPayments(req, res) {
    try {
      // support pagination: ?page=1&limit=10
      const page = Math.max(1, parseInt(req.query.page)) || 1;
      const limit = Math.max(1, parseInt(req.query.limit)) || 10;
      const skip = (page - 1) * limit;

      const [total, payments] = await Promise.all([
        Payment.countDocuments(),
        Payment.find()
          .populate("order")
          .sort({ paidAt: -1 })
          .skip(skip)
          .limit(limit),
      ]);

      const pages = Math.ceil(total / limit) || 1;

      res.json({ payments, total, page, pages, limit });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  }

  // [POST] /api/payments
  async createPayment(req, res) {
    try {
      const { order, method, amount: clientAmount, status } = req.body;

      // Kiểm tra order tồn tại và đã được phục vụ (tức tất cả món đã sẵn sàng)
      const foundOrder = await Order.findById(order);
      if (!foundOrder)
        return res.status(404).json({ message: "Order not found" });

      if (foundOrder.status !== "served") {
        return res.status(400).json({
          message:
            "Order chưa hoàn tất. Chỉ có thể thanh toán khi tất cả món đã được chế biến xong.",
        });
      }

      // Compute tax (8%) and expected totals server-side
      const subtotal = Number(foundOrder.totalAmount || 0);
      const taxPercent = 8; // 8%
      const taxAmount = Math.round((subtotal * taxPercent) / 100);
      const expectedTotal = subtotal + taxAmount;

      // If client provided an amount but it doesn't match expected, override with server value
      const finalAmount =
        Number(clientAmount) && Number(clientAmount) === expectedTotal
          ? Number(clientAmount)
          : expectedTotal;

      const payment = new Payment({
        order,
        method,
        subtotal,
        taxPercent,
        taxAmount,
        amount: finalAmount,
        status,
        paidAt: new Date(), // đảm bảo luôn có thời gian thanh toán
      });

      const savedPayment = await payment.save();
      res.status(201).json(savedPayment);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  }

  // [PUT] /api/payments/:id
  async updatePayment(req, res) {
    try {
      const { status } = req.body;

      // Lấy payment hiện tại
      const payment = await Payment.findById(req.params.id);
      if (!payment)
        return res.status(404).json({ message: "Payment not found" });

      // Nếu status chuyển thành completed và chưa có paidAt → set giờ hiện tại
      if (status === "completed" && !payment.paidAt) {
        req.body.paidAt = new Date();
      }

      const updatedPayment = await Payment.findByIdAndUpdate(
        req.params.id,
        req.body,
        { new: true }
      );

      res.json(updatedPayment);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  }

  // [DELETE] /api/payments/:id
  async deletePayment(req, res) {
    try {
      // Deleting payments is not allowed for audit reasons
      return res
        .status(403)
        .json({ message: "Deleting payments is not allowed." });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  }

  // [GET] /api/payments/:id
  async getPaymentById(req, res) {
    try {
      const payment = await Payment.findById(req.params.id).populate("order");
      if (!payment)
        return res.status(404).json({ message: "Payment not found" });
      res.json(payment);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  }
}

export default new PaymentController();
