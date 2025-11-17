import Table from "../models/Table.js";

class TableController {

    // [GET] /api/tables
    async getAllTables (req, res) {
        try {
            const tables = await Table.find();
            res.json(tables);
        } catch (err) {
            res.status(500).json({ error: err.message });
        }
    }

    // [GET] /api/tables/:id
    async getTableById(req, res) {
        try {
            const table = await Table.findById(req.params.id).populate("reservation currentOrder");
            if (!table) return res.status(404).json({ message: "Table not found" });
            res.json(table);
        } catch (err) {
            res.status(500).json({ error: err.message });
        }
    }

    // [POST] /api/tables/create
    async createTable(req, res) {
        try {
            const newTable = new Table(req.body);
            await newTable.save();
            res.status(201).json(newTable);
        } catch (err) {
            res.status(500).json({ error: err.message });
        }
    }

     // [PUT] /api/tables/:id
    async updateTable(req, res) {
        try {
            const updated = await Table.findByIdAndUpdate(req.params.id, req.body, { new: true });
            if (!updated) return res.status(404).json({ message: "Table not found" });
            res.json(updated);
        } catch (err) {
            res.status(500).json({ error: err.message });
        }
    }

    // [DELETE] /api/tables/:id
    async deleteTable(req, res) {
        try {
            const deleted = await Table.findByIdAndDelete(req.params.id);
            if (!deleted) return res.status(404).json({ message: "Table not found" });
            res.json({ message: "Table deleted successfully" });
        } catch (err) {
            res.status(500).json({ error: err.message });
        }
    }

     // [PATCH] /api/tables/:id/status — cập nhật trạng thái bàn (available, reserved, occupied)
    async updateStatus(req, res) {
        try {
            const { status } = req.body;
            const table = await Table.findById(req.params.id);
            if (!table) return res.status(404).json({ message: "Table not found" });

            table.status = status;
            await table.save();

            res.json({ message: "Status updated", table });
        } catch (err) {
            res.status(500).json({ error: err.message });
        }
    }
}

export default new TableController();