import User from "../models/User.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Kiểm tra email tồn tại
    const user = await User.findOne({ email }).populate("role");
    if (!user) return res.status(400).json({ message: "Email không tồn tại!" });

    // So sánh mật khẩu
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch)
      return res.status(400).json({ message: "Mật khẩu không đúng!" });

    // Tạo access token
    const token = jwt.sign(
      {
        id: user._id,
        role: user.role.name, // ví dụ: admin, manager, user
        permission: user.role.permission, // lấy toàn bộ permission từ role
      },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );

    res.json({
      message: "Đăng nhập thành công!",
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        avatar: user.avatar,
        role: user.role.name,
        permission: user.role.permission,
      },
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
