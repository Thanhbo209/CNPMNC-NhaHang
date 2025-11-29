import React, { createContext, useState, useEffect } from "react";
import axios from "axios";

// Tạo context
export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null); // Thông tin user
  const [token, setToken] = useState(null); // JWT token
  const [loading, setLoading] = useState(true);

  // Lưu token vào localStorage để duy trì đăng nhập
  useEffect(() => {
    const storedToken = localStorage.getItem("token");
    const storedUser = localStorage.getItem("user");
    if (storedToken && storedUser) {
      setToken(storedToken);
      setUser(JSON.parse(storedUser));
    }
    setLoading(false);
  }, []);

  // Hàm login
  const login = async (email, password) => {
    try {
      const res = await axios.post("http://localhost:2095/api/auth/login", {
        email,
        password,
      });
      const { token, user } = res.data;

      setToken(token);
      setUser(user);

      localStorage.setItem("token", token);
      localStorage.setItem("user", JSON.stringify(user));

      return { success: true, user }; // ✅ Trả về user luôn
    } catch (err) {
      return {
        success: false,
        message: err.response?.data?.message || err.message,
      };
    }
  };

  // Hàm logout
  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem("token");
    localStorage.removeItem("user");
  };

  return (
    <AuthContext.Provider value={{ user, token, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};
