    import express from 'express';
    import TableController from '../controllers/TableController.js';

    const router = express.Router();

    router.get("/:id", TableController.getTableById);
    router.post("/create", TableController.createTable);
    router.put("/:id", TableController.updateTable);
    router.delete("/:id", TableController.deleteTable);
    router.patch("/:id/status", TableController.updateStatus);
    router.get("/", TableController.getAllTables);

    export default router;

  