import React, { useEffect, useState } from "react";
import axios from "axios";
import { Plus, Pen } from "lucide-react";
import OrderModal from "../../components/Admin/modal/OrderModal";
import ReservedTableModal from "../../components/Admin/modal/ReservedTableModal";
import StatCard from "../../components/common/StatCard";

const WaiterOrders = () => {
  const [tables, setTables] = useState([]);
  const [orders, setOrders] = useState([]);
  const [selectedTable, setSelectedTable] = useState(null);
  const [openOrderModal, setOpenOrderModal] = useState(false);
  const [editOrder, setEditOrder] = useState(null);
  const [showReservedModal, setShowReservedModal] = useState(false);

  // --- THỐNG KÊ ---
  const totalOrders = orders.length;
  const pendingOrders = orders.filter((o) => o.status === "pending").length;
  const preparingOrders = orders.filter((o) => o.status === "preparing").length;
  const paidOrders = orders.filter((o) => o.status === "paid").length;

  const fetchTables = async () => {
    try {
      const res = await axios.get("http://localhost:2095/api/tables");
      setTables(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchOrders = async (tableId) => {
    try {
      const res = await axios.get(
        `http://localhost:2095/api/orders/byTable/${tableId}`
      );
      const orderList = res.data;
      setOrders(orderList);

      const table = tables.find((t) => t._id === tableId);
      if (!table || table.status === "reserved") return;

      const hasActiveOrder = orderList.some((o) =>
        ["pending", "preparing", "served"].includes(o.status)
      );
      const newStatus = hasActiveOrder ? "occupied" : "available";

      await axios.put(`http://localhost:2095/api/tables/${tableId}`, {
        status: newStatus,
      });
      setTables((prev) =>
        prev.map((t) => (t._id === tableId ? { ...t, status: newStatus } : t))
      );
    } catch (err) {
      console.error(err);
    }
  };

  const handleSelectTable = async (table) => {
    setSelectedTable(table);
    await fetchOrders(table._id);
    if (table.status === "reserved") setShowReservedModal(true);
  };

  const handleOpenOrderModal = (order = null) => {
    if (!selectedTable) return;
    if (selectedTable.status === "reserved") return setShowReservedModal(true);

    setEditOrder(order || null);
    setOpenOrderModal(true);
  };

  const handleOrderSaved = (savedOrder) => {
    setOrders((prev) => {
      const idx = prev.findIndex((o) => o._id === savedOrder._id);
      if (idx !== -1) return prev.map((o, i) => (i === idx ? savedOrder : o));
      return [savedOrder, ...prev];
    });

    setTables((prev) =>
      prev.map((t) =>
        t._id === selectedTable._id ? { ...t, status: "occupied" } : t
      )
    );
  };

  useEffect(() => {
    fetchTables();
  }, []);

  const statusStyles = {
    available: {
      color:
        "from-green-500 to-green-600 border-green-400 hover:shadow-[0_0_15px_#22c55e]",
      label: "Trống",
      dot: "bg-green-400 shadow-[0_0_8px_#22c55e]",
    },
    occupied: {
      color:
        "from-orange-500 to-orange-600 border-orange-400 hover:shadow-[0_0_15px_#f59e0b]",
      label: "Đang dùng",
      dot: "bg-yellow-400 shadow-[0_0_8px_#facc15]",
    },
    reserved: {
      color:
        "from-purple-500 to-purple-600 border-purple-400 hover:shadow-[0_0_15px_#a855f7]",
      label: "Đã đặt trước",
      dot: "bg-purple-400 shadow-[0_0_8px_#a855f7]",
    },
  };

  return (
    <div className="p-6 flex flex-col gap-6 min-h-screen text-white">
      {/* --- Danh sách bàn & thống kê --- */}
      <div className="flex flex-col lg:flex-row gap-6">
        {/* Danh sách bàn */}
        <div className="bg-white p-6 rounded-2xl shadow-lg shadow-black/10 flex-1 animate-fade-in">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-3xl font-semibold text-gray-800 flex items-center gap-2">
              <span className="w-1.5 h-6 bg-sky-500 rounded-full inline-block"></span>{" "}
              Danh sách bàn
            </h2>
            <img
              className="w-26"
              src="https://www.pngall.com/wp-content/uploads/8/Restaurant-Chef-PNG-Free-Download.png"
              alt="chef"
            />
          </div>

          <div className="flex flex-col items-start gap-4 mb-6">
            {[
              { label: "Trống", color: "bg-green-400" },
              { label: "Đang dùng", color: "bg-yellow-400" },
              { label: "Đã đặt trước", color: "bg-purple-400" },
            ].map((s) => (
              <div key={s.label} className="flex items-center gap-2">
                <span className={`w-10 h-4 rounded-full ${s.color}`}></span>
                <span className="text-gray-700 text-sm">{s.label}</span>
              </div>
            ))}
          </div>

          {tables.length === 0 ? (
            <p className="text-gray-400 italic text-center py-10">
              — Chưa có bàn nào —
            </p>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-3 gap-5">
              {tables.map((table) => {
                const isSelected = selectedTable?._id === table._id;
                const status =
                  statusStyles[table.status] || statusStyles.available;

                return (
                  <div
                    key={table._id}
                    onClick={() => handleSelectTable(table)}
                    className={`group relative p-5 rounded-2xl cursor-pointer border flex flex-col justify-between h-[140px] transition-all
                      ${
                        isSelected
                          ? `bg-gradient-to-br ${status.color} scale-[1.04]`
                          : `bg-white border-gray-200 hover:bg-gradient-to-br ${status.color}`
                      }
                    `}
                  >
                    <div className="flex justify-between items-center">
                      <h3 className="text-xl font-bold text-gray-800">
                        Bàn {table.tableNumber}
                      </h3>
                      <div
                        className={`w-3 h-3 rounded-full ${status.dot}`}
                      ></div>
                    </div>

                    <div className="mt-3 text-sm text-gray-600 space-y-1">
                      <p className="flex items-center gap-2">
                        ☕️ {table.seats} chỗ
                      </p>
                      <p className="flex items-center gap-2">
                        🏢 Tầng {table.floor}
                      </p>
                    </div>

                    <span
                      className="absolute bottom-4 right-2 text-xs font-medium text-gray-800 bg-gray-100/70 px-2 py-1 rounded-md backdrop-blur-sm"
                      style={{ textShadow: "0 0 6px rgba(0,0,0,0.2)" }}
                    >
                      {status.label}
                    </span>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Thống kê */}
        <div className="flex flex-col gap-4 w-full lg:w-[280px]">
          <StatCard title="Tổng số Order" value={totalOrders} color="purple" />
          <StatCard
            title="Đang chờ xử lý"
            value={pendingOrders}
            color="yellow"
          />
          <StatCard title="Đang chế biến" value={preparingOrders} color="red" />
          <StatCard title="Đã thanh toán" value={paidOrders} color="green" />
        </div>
      </div>

      {/* --- Danh sách Order --- */}
      {selectedTable && (
        <div className="bg-white p-6 rounded-2xl shadow-lg animate-fade-in mt-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-semibold text-gray-800 flex items-center gap-2">
              <span className="w-2 h-8 bg-gradient-to-b from-green-400 to-emerald-600 rounded-full shadow-md inline-block"></span>
              Quản lý hóa đơn —{" "}
              <span className="text-blue-500 font-bold">
                Bàn {selectedTable.name || selectedTable.tableNumber}
              </span>
            </h2>

            <button
              onClick={() => handleOpenOrderModal()}
              className="flex items-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 px-5 py-2.5 rounded-xl text-white shadow-md hover:shadow-lg hover:scale-[1.03] transition"
            >
              <Plus size={18} /> Tạo Order mới
            </button>
          </div>

          {orders.length === 0 ? (
            <p className="text-gray-400 italic text-center py-10">
              — Chưa có order nào cho bàn này —
            </p>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {[
                {
                  key: "processing",
                  title: "Đang xử lý",
                  filter: (o) => o.status !== "paid",
                  statusColors: {
                    pending: "text-yellow-500 border-yellow-300 bg-yellow-100",
                    preparing: "text-blue-500 border-blue-300 bg-blue-100",
                    served: "text-green-500 border-green-300 bg-green-100",
                  },
                  btnColors: {
                    pending: "bg-blue-600 text-white hover:bg-blue-700",
                    preparing: "bg-blue-600 text-white hover:bg-blue-700",
                    served: "bg-yellow-500 text-black hover:bg-yellow-400",
                  },
                },
                {
                  key: "paid",
                  title: "Đã thanh toán",
                  filter: (o) => o.status === "paid",
                  statusColors: {
                    paid: "text-green-500 border-green-300 bg-green-100",
                  },
                  btnColors: {},
                },
              ].map((section) => {
                const sectionOrders = orders.filter(section.filter);
                return (
                  <div
                    key={section.key}
                    className="flex flex-col bg-gray-50 p-5 rounded-2xl shadow-sm"
                  >
                    <h3
                      className={`text-xl font-semibold mb-4 flex items-center gap-2 ${
                        section.key === "processing"
                          ? "text-yellow-500"
                          : "text-green-500"
                      }`}
                    >
                      {section.title}
                    </h3>

                    <div
                      className="grid grid-cols-1 md:grid-cols-2 gap-4 overflow-y-auto pr-2"
                      style={{ maxHeight: "600px" }}
                    >
                      {sectionOrders.length === 0 ? (
                        <p className="text-gray-400 italic text-center py-10 col-span-2">
                          — Không có order {section.title.toLowerCase()} —
                        </p>
                      ) : (
                        sectionOrders.map((order) => (
                          <div
                            key={order._id}
                            className="bg-white rounded-2xl p-4 border border-gray-200 shadow-sm hover:shadow-md transition flex flex-col justify-between"
                          >
                            {/* Header */}
                            <div className="flex justify-between items-center mb-2">
                              <p className="text-sm text-gray-500">
                                Mã:{" "}
                                <span className="text-gray-800 font-semibold">
                                  {order._id.slice(-6)}
                                </span>
                              </p>
                              <span
                                className={`capitalize text-xs font-medium px-2 py-1 rounded-md border ${
                                  section.key === "processing"
                                    ? section.statusColors[order.status]
                                    : section.statusColors.paid
                                }`}
                              >
                                {order.status}
                              </span>
                            </div>

                            {/* Món ăn */}
                            <div className="border-t border-gray-200 pt-2 pb-2 space-y-1 text-sm">
                              <p className="text-gray-500 font-medium">Món:</p>
                              {order.items?.map((item, i) => (
                                <p key={i} className="ml-2 text-gray-700">
                                  - {item.food?.name || "Món đã xóa"} x{" "}
                                  {item.quantity}
                                </p>
                              ))}
                              {order.addedItems?.length > 0 && (
                                <div className="mt-2 text-sm text-blue-500">
                                  <p className="font-medium">Món thêm:</p>
                                  {order.addedItems.map((item, i) => (
                                    <p key={i} className="ml-3">
                                      - {item.food?.name || "Món đã xóa"} x{" "}
                                      {item.quantity}
                                    </p>
                                  ))}
                                </div>
                              )}
                            </div>

                            {/* Tổng */}
                            <div className="border-t border-gray-200 pt-2 flex justify-between items-center mt-2">
                              <p className="font-semibold text-gray-600 text-sm">
                                Tổng:
                              </p>
                              <p className="text-green-500 font-bold text-base">
                                {(
                                  (order.items?.reduce(
                                    (sum, i) =>
                                      sum + (i.food?.price || 0) * i.quantity,
                                    0
                                  ) || 0) +
                                  (order.addedItems?.reduce(
                                    (sum, i) =>
                                      sum + (i.food?.price || 0) * i.quantity,
                                    0
                                  ) || 0)
                                ).toLocaleString()}{" "}
                                ₫
                              </p>
                            </div>

                            {/* Nút chỉnh sửa / thêm món */}
                            {section.key === "processing" && (
                              <button
                                onClick={() => handleOpenOrderModal(order)}
                                className={`${
                                  section.btnColors[order.status]
                                } mt-3 flex items-center justify-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium transition duration-300`}
                              >
                                {order.status === "served" ? (
                                  "Thêm món"
                                ) : (
                                  <>
                                    <Pen size={14} /> Chỉnh sửa
                                  </>
                                )}
                              </button>
                            )}
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* --- Modals --- */}
      {openOrderModal && (
        <OrderModal
          open={openOrderModal}
          onClose={() => setOpenOrderModal(false)}
          order={editOrder}
          table={selectedTable}
          onSaved={handleOrderSaved}
        />
      )}

      {showReservedModal && selectedTable && (
        <ReservedTableModal
          onClose={() => setShowReservedModal(false)}
          onArrived={async () => {
            try {
              await axios.patch(
                `http://localhost:2095/api/reservations/byTable/${selectedTable._id}/status`
              );
              await fetchTables();
              setShowReservedModal(false);
              setSelectedTable((prev) => ({ ...prev, status: "occupied" }));
            } catch (err) {
              console.error(err);
            }
          }}
          onCancel={async () => {
            try {
              await axios.put(
                `http://localhost:2095/api/tables/${selectedTable._id}`,
                { status: "available" }
              );
              await fetchTables();
              setShowReservedModal(false);
              setSelectedTable((prev) => ({ ...prev, status: "available" }));
            } catch (err) {
              console.error(err);
            }
          }}
        />
      )}
    </div>
  );
};

export default WaiterOrders;
