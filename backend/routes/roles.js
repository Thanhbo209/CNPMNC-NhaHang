import express from "express";
import RoleController from "../controllers/RoleController.js";

const router = express.Router();

router.post("/create", RoleController.createRole);
router.put("/:id", RoleController.updateRole);
router.delete("/:id", RoleController.deleteRole);
router.get("/", RoleController.getAllRoles);

export default router;
