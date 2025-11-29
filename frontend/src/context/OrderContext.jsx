import React, { createContext, useContext, useState, useEffect } from "react";
import axios from "axios";
import { toast } from "react-toastify";

const OrderContext = createContext();

export const useOrder = () => useContext(OrderContext);

export const OrderProvider = ({ children }) => {
  const [orders, setOrders] = useState([]);
  const [tables, setTables] = useState([]);
  const [allFoods, setAllFoods] = useState([]);

  // Lấy danh sách foods
  const fetchAllFoods = async () => {
    try {
      const res = await axios.get("http://localhost:2095/api/foods");
      setAllFoods(res.data);
    } catch (err) {
      console.error(err);
      toast.error("Không thể tải danh sách món ăn!");
    }
  };

  const fetchTables = async () => {
    try {
      const res = await axios.get("http://localhost:2095/api/tables");
      setTables(res.data);
    } catch (err) {
      console.error(err);
      toast.error("Không thể tải danh sách bàn!");
    }
  };

  const fetchOrdersByTable = async (tableId) => {
    try {
      const res = await axios.get(
        `http://localhost:2095/api/orders/byTable/${tableId}`
      );
      setOrders(res.data);
      return res.data;
    } catch (err) {
      console.error(err);
      toast.error("Không thể tải danh sách order!");
    }
  };

  // Cập nhật order trong context
  // OrderContext.js
  const updateOrder = (updatedOrder) => {
    setOrders((prev) => {
      const idx = prev.findIndex((o) => o._id === updatedOrder._id);
      if (idx !== -1) {
        const newOrders = [...prev];
        newOrders[idx] = updatedOrder;
        return newOrders;
      }
      // Nếu chưa có trong list (ví dụ order mới), thêm vào đầu
      return [updatedOrder, ...prev];
    });
  };

  useEffect(() => {
    fetchAllFoods();
    fetchTables();
  }, []);

  return (
    <OrderContext.Provider
      value={{
        orders,
        setOrders,
        tables,
        setTables,
        allFoods,
        fetchOrdersByTable,
        updateOrder,
      }}
    >
      {children}
    </OrderContext.Provider>
  );
};
