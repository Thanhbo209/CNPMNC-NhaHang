import express from "express";
import OrderController from "../controllers/OrderController.js";

const router = express.Router();

router.patch("/:id/add-items", OrderController.addItemsToOrder);
router.post("/merge", OrderController.mergeOrders);
router.patch("/:orderId/items/:itemId", OrderController.updateItemStatus);
router.get("/top-foods", OrderController.getTopFoods);
router.get("/:id", OrderController.getOrderById);
router.put("/:id", OrderController.updateOrder);
router.delete("/:id", OrderController.deleteOrder);
router.get("/byTable/:tableId", OrderController.getOrderByTable);
router.post("/create", OrderController.createOrder);
router.get("/", OrderController.getAllOrders);

export default router;
