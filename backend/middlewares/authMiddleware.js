import jwt from "jsonwebtoken";

export const verifyToken = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) return res.status(401).json({ message: "Không có token!" });

  const token = authHeader.split(" ")[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded; // { id, role, permission }
    next();
  } catch (err) {
    return res
      .status(401)
      .json({ message: "Token không hợp lệ hoặc hết hạn!" });
  }
};

export const requireRole = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user)
      return res.status(401).json({ message: "Chưa xác thực người dùng!" });

    const currentRole = req.user.role;

    if (!allowedRoles.includes(currentRole)) {
      return res.status(403).json({ message: "Bạn không có quyền truy cập!" });
    }

    next();
  };
};
