import express from "express";
import PaymentController from "../controllers/PaymentController.js";

const router = express.Router();

router.get("/:id", PaymentController.getPaymentById);
router.post("/", PaymentController.createPayment);
router.put("/:id", PaymentController.updatePayment);
router.delete("/:id", PaymentController.deletePayment);
router.get("/", PaymentController.getAllPayments);

export default router;
