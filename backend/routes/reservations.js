import express from "express";
import ReservationController from "../controllers/ReservationController.js";

const router = express.Router();

// Lấy danh sách đặt bàn theo id của bàn
router.patch("/byTable/:id/status", ReservationController.updateStatusByTable);
router.get("/byTable/:id", ReservationController.getByTable);
router.patch("/:id/status", ReservationController.updateStatus);
router.post("/create", ReservationController.createReservation);
router.get("/:id", ReservationController.getReservationById);
router.put("/:id", ReservationController.updateReservation);
router.delete("/:id", ReservationController.cancelReservation);
// route mới: cập nhật tất cả reservation theo bàn
router.get("/", ReservationController.getAllReservations);

export default router;
