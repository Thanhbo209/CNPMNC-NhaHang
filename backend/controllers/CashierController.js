import Table from "../models/Table.js";
import Reservation from "../models/Reservation.js";
import Payment from "../models/Payment.js";

class CashierController {
  // [GET] /api/cashier/tables — danh sách bàn
  async getAllTables(req, res) {
    try {
      const tables = await Table.find().populate("reservation currentOrder");
      res.json(tables);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  }

  // [GET] /api/cashier/reservations — danh sách đặt bàn
  async getAllReservations(req, res) {
    try {
      const reservations = await Reservation.find().populate(
        "table user order"
      );
      res.json(reservations);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  }

  // [PATCH] /api/cashier/reservations/:id/confirm — xác nhận khách đến
  async confirmReservation(req, res) {
    try {
      const reservation = await Reservation.findById(req.params.id);
      if (!reservation)
        return res.status(404).json({ message: "Reservation not found" });

      reservation.status = "confirmed";
      await reservation.save();

      const table = await Table.findById(reservation.table);
      if (table) {
        table.status = "occupied";
        await table.save();
      }

      res.json({ message: "Reservation confirmed", reservation, table });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  }

  // [GET] /api/cashier/payments — danh sách thanh toán
  async getAllPayments(req, res) {
    try {
      const payments = await Payment.find().populate("order");
      res.json(payments);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  }

  // [POST] /api/cashier/payments — tạo thanh toán mới
  async createPayment(req, res) {
    try {
      const { order, method, amount, status } = req.body;
      const payment = new Payment({
        order,
        method,
        amount,
        status,
        paidAt: new Date(),
      });
      const savedPayment = await payment.save();
      res.status(201).json(savedPayment);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  }

  // [PUT] /api/cashier/payments/:id — cập nhật thanh toán
  async updatePayment(req, res) {
    try {
      const payment = await Payment.findById(req.params.id);
      if (!payment)
        return res.status(404).json({ message: "Payment not found" });

      if (req.body.status === "completed" && !payment.paidAt) {
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

  // [GET] /api/cashier/tables/:id — xem chi tiết bàn và đặt bàn liên quan
  async getTableDetails(req, res) {
    try {
      const table = await Table.findById(req.params.id).populate(
        "reservation currentOrder"
      );
      if (!table) return res.status(404).json({ message: "Table not found" });
      res.json(table);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  }
}

export default new CashierController();
