import Role from "../models/Role.js";

class RoleController {

    // [GET] /api/roles
    async getAllRoles (req, res) {
        try {
            const roles = await Role.find();
            // Tổng số role
            const totalRoles = roles.length;
            // Tổng số permission (đếm gộp tất cả role)
            const totalPermissions = roles.reduce(
                (acc, role) => acc + (role.permission?.length || 0),
                0
            );
            // Role mới tạo hôm nay
                const today = new Date();
                today.setHours(0, 0, 0, 0);
                const recentRoles = roles.filter(
                    (r) => new Date(r.createdAt) >= today
                ).length;


                res.json({ roles, totalRoles, totalPermissions, recentRoles });
        } catch (err) {
            res.status(500).json({ error: err.message });
        }
    }

    // [POST] /api/roles/create
    async createRole(req, res) {
    try {
        const { name, permission, description } = req.body;

        // Kiểm tra tên role có bị trùng không
        const existingRole = await Role.findOne({ name });
        if (existingRole) {
        return res.status(400).json({ message: "Role đã tồn tại!" });
        }

        // Tạo role mới
        const newRole = await Role.create({
        name,
        permission,
        description
        });

        res.status(201).json({
        message: "Tạo role thành công!",
        role: newRole
        });
        }   catch (err) {
        res.status(500).json({ error: err.message });
        }
    }

    // [PUT] /api/roles/:id
    async updateRole(req, res) {
        try {
        const { id } = req.params;
        const { name, permission, description } = req.body;

        const updatedRole = await Role.findByIdAndUpdate(
            id,
            { name, permission, description, updatedAt: new Date() },
            { new: true }
        );

        if (!updatedRole)
            return res.status(404).json({ message: "Không tìm thấy role!" });

        res.json({ message: "Cập nhật thành công!", role: updatedRole });
        } catch (err) {
        res.status(500).json({ error: err.message });
        }
    }

    // [DELETE] /api/roles/:id
    async deleteRole(req, res) {
        try {
        const { id } = req.params;
        const deletedRole = await Role.findByIdAndDelete(id);

        if (!deletedRole)
            return res.status(404).json({ message: "Không tìm thấy role!" });

        res.json({ message: "Xóa role thành công!" });
        } catch (err) {
        res.status(500).json({ error: err.message });
        }
    }

}

export default new RoleController();