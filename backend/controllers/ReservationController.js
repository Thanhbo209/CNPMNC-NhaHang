import Reservation from "../models/Reservation.js";
import Table from "../models/Table.js";

class ReservationController {
  // [GET] /api/reservations
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

  // [GET] /api/reservations/:id
  async getReservationById(req, res) {
    try {
      const reservation = await Reservation.findById(req.params.id).populate(
        "table user order"
      );
      if (!reservation)
        return res.status(404).json({ message: "Reservation not found" });
      res.json(reservation);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  }

  // [POST] /api/reservations/create
  async createReservation(req, res) {
    try {
      const { table, user, reservationTime, guests, note } = req.body;

      // Kiểm tra bàn tồn tại và trống
      const tableDoc = await Table.findById(table);
      if (!tableDoc)
        return res.status(404).json({ message: "Table not found" });
      if (tableDoc.status !== "available") {
        return res.status(400).json({ message: "Table is not available" });
      }

      // Tạo reservation mới
      const newRes = new Reservation({
        table,
        user,
        reservationTime: reservationTime,
        guests,
        note,
        createdAt: new Date(),
        status: "pending",
      });
      await newRes.save();

      // Cập nhật trạng thái bàn
      tableDoc.status = "reserved";
      tableDoc.reservation = newRes._id;
      await tableDoc.save();

      res.status(201).json({
        message: "Reservation created successfully",
        reservation: newRes,
      });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  }

  // [PUT] /api/reservations/:id
  async updateReservation(req, res) {
    try {
      const updated = await Reservation.findByIdAndUpdate(
        req.params.id,
        req.body,
        { new: true }
      );
      if (!updated)
        return res.status(404).json({ message: "Reservation not found" });
      res.json({
        message: "Reservation updated successfully",
        reservation: updated,
      });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  }

  // [DELETE] /api/reservations/:id (hủy bàn)
  async cancelReservation(req, res) {
    try {
      const reservation = await Reservation.findById(req.params.id);
      if (!reservation)
        return res.status(404).json({ message: "Reservation not found" });

      // Cập nhật trạng thái reservation
      reservation.status = "cancelled";
      reservation.cancelledAt = new Date();
      await reservation.save();

      // Cập nhật lại bàn về "available"
      const table = await Table.findById(reservation.table);
      if (table) {
        table.status = "available";
        table.reservation = null;
        await table.save();
      }

      res.json({
        message: "Reservation cancelled successfully",
        reservation,
      });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  }

  // [PATCH] /api/reservations/:id/status (xác nhận / cập nhật trạng thái)
  async updateStatus(req, res) {
    try {
      const { status } = req.body;
      const reservation = await Reservation.findById(req.params.id);
      if (!reservation)
        return res.status(404).json({ message: "Reservation not found" });

      reservation.status = status;
      await reservation.save();

      // Nếu chuyển sang "confirmed" thì cập nhật bàn -> occupied
      const table = await Table.findById(reservation.table);
      if (table) {
        if (status === "confirmed") table.status = "occupied";
        if (status === "cancelled") table.status = "available";
        await table.save();
      }

      res.json({
        message: "Status updated successfully",
        reservation,
      });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  }

  // [GET] /api/reservations/byTable/:id
  async getByTable(req, res) {
    try {
      const { id } = req.params;
      const reservations = await Reservation.find({ table: id }).populate(
        "table user order"
      );

      if (!reservations || reservations.length === 0) {
        return res
          .status(404)
          .json({ message: "Không có đặt bàn nào cho bàn này." });
      }

      res.status(200).json(reservations);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  }

  // [PATCH] /api/reservations/byTable/:id/status
async updateStatusByTable(req, res) {
  try {
    const { id } = req.params;

    // Lấy tất cả reservation pending cho bàn này
    const reservations = await Reservation.find({ table: id, status: "pending" });

    if (reservations.length === 0) {
      return res.status(404).json({ message: "Không có reservation pending nào." });
    }

    // Cập nhật tất cả sang "confirmed"
    for (const r of reservations) {
      r.status = "confirmed";
      await r.save();
    }

    // Cập nhật trạng thái bàn sang occupied
    const table = await Table.findById(id);
    if (table) {
      table.status = "occupied";
      await table.save();
    }

    res.json({
      message: "Đã xác nhận khách tới thành công",
      reservations,
      table,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

}

export default new ReservationController();
