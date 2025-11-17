    // routes/admin.js
    import express from "express";
    import AdminController from "../controllers/AdminController.js";

    const router = express.Router();

    router.get("/stats", AdminController.getStats);
    router.get("/dashboard", AdminController.getDashboardStats);

    export default router;
