import User from "../models/User.js";
import bcrypt from "bcryptjs"; // nhớ import
class UserController {
  // [GET] /api/users
  async getAllUsers(req, res) {
    try {
      const users = await User.find().populate("role");
      const adminCount = users.filter((u) => u.role?.name === "Admin").length;

      // Người dùng đăng ký trong 7 ngày gần đây
      const today = new Date();
      today.setHours(0, 0, 0, 0); // 0h00 sáng hôm nay
      const recentUsers = users.filter(
        (u) => new Date(u.createdAt) >= today
      ).length;

      res.json({ users, adminCount, recentUsers });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  }

  // [POST] /api/users/create
  async createUser(req, res) {
    try {
      const { name, email, password, avatar, role } = req.body;

      const existingUser = await User.findOne({ email });
      if (existingUser) {
        return res
          .status(400)
          .json({ message: "Email đã tồn tại trong hệ thống." });
      }

      const defaultAvatar =
        avatar && avatar.trim() !== ""
          ? avatar
          : "https://icons.veryicon.com/png/o/miscellaneous/user-avatar/user-avatar-male-5.png";

      // 🔑 Hash password trước khi lưu
      const hashedPassword = await bcrypt.hash(password, 10);

      const newUser = await User.create({
        name,
        email,
        password: hashedPassword,
        avatar: defaultAvatar,
        role,
      });

      res.status(201).json({
        message: "Tạo người dùng thành công!",
        data: newUser,
      });
    } catch (err) {
      console.error("Lỗi tạo user:", err);
      res.status(500).json({ error: err.message });
    }
  }

  // [PUT] /api/users/:id
  async updateUser(req, res) {
    try {
      const { id } = req.params;
      const { name, email, password, avatar, role } = req.body;

      const updateData = { name, email, avatar, role };
      if (password) {
        updateData.password = await bcrypt.hash(password, 10);
      }

      const updatedUser = await User.findByIdAndUpdate(id, updateData, {
        new: true,
      }).populate("role");

      if (!updatedUser) {
        return res.status(404).json({ message: "Không tìm thấy người dùng" });
      }

      res.json({
        message: "Cập nhật thông tin người dùng thành công!",
        data: updatedUser,
      });
    } catch (err) {
      console.error("Lỗi cập nhật user:", err);
      res.status(500).json({ error: err.message });
    }
  }

  // [DELETE] /api/users/:id
  async deleteUser(req, res) {
    try {
      const { id } = req.params;
      const deletedUser = await User.findByIdAndDelete(id);

      if (!deletedUser) {
        return res.status(404).json({ message: "Không tìm thấy người dùng" });
      }

      res.json({
        message: "Đã xóa người dùng thành công!",
        data: deletedUser,
      });
    } catch (err) {
      console.error("Lỗi xóa user:", err);
      res.status(500).json({ error: err.message });
    }
  }
}

export default new UserController();
