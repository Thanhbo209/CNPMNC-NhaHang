import express from "express";
import CashierController from "../controllers/CashierController.js";

const router = express.Router();

router.get("/tables", CashierController.getAllTables); 
router.get("/active-orders", CashierController.getActiveOrders);
router.post("/create-order", CashierController.createOrder);
router.put("/update-item-status", CashierController.updateItemStatus);
router.put("/complete-order/:orderId", CashierController.completeOrder);
router.get("/stats", CashierController.getStats);

export default router;
