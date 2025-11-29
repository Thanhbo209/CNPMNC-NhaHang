import express from "express";
import WaiterController from "../controllers/WaiterController.js";

const router = express.Router();

router.get("/tables", WaiterController.getAllTables);
router.get("/active-orders", WaiterController.getActiveOrders);
router.post("/create-order", WaiterController.createOrder);
router.put("/update-item-status", WaiterController.updateItemStatus);
router.put("/complete-order/:orderId", WaiterController.completeOrder);
router.get("/stats", WaiterController.getStats);

export default router;
