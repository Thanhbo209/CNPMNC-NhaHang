import { Route, Routes, Navigate } from "react-router-dom";
import "./App.css";
import { AuthProvider } from "./login/AuthContext";
import ProtectedRoute from "./login/ProtectedRoute";

// 🧑‍💼 Admin imports
import AdminLayout from "./components/Admin/AdminLayout";
import AdminDashboardManager from "./pages/Admin/AdminDashboardManager";
import AdminMenuManager from "./pages/Admin/AdminMenuManager";
import AdminUserManager from "./pages/Admin/AdminUserManager";
import AdminOrderManager from "./pages/Admin/AdminOrderManager";
import AdminRoleManager from "./pages/Admin/AdminRoleManager";
import AdminIngredientManager from "./pages/Admin/AdminIngredientManager";
import AdminReservationManager from "./pages/Admin/AdminReservationManager";
import AdminPaymentManager from "./pages/Admin/AdminPaymentManager";
import AdminFeedbackManager from "./pages/Admin/AdminFeedbackManager";

// Waiter
import WaiterLayout from "./components/Waiter/WaiterLayout";
import WaiterDashboard from "./pages/Waiter/WaiterDashboard";
import WaiterOrders from "./pages/Waiter/WaiterOrders";

// Cashier
import CashierLayout from "./components/Cashier/CashierLayout";
import CashierDashboard from "./pages/Cashier/CashierDashboard";
import CashierPayment from "./pages/Cashier/CashierPayment";
import CashierReservation from "./pages/Cashier/CashierReservation";

// Chef
import ChefLayout from "./components/Chef/ChefLayout";
import ChefDashboard from "./pages/Chef/ChefDashboard";
import ChefStatus from "./pages/Chef/ChefStatus";

// Login
import Login from "./login/Login";
import ChefIngredient from "./pages/Chef/ChefIngredient";
import WaiterOrderHistory from "./pages/Waiter/WaiterOrderHistory";

function App() {
  return (
    <AuthProvider>
      <Routes>
        {/* Trang login */}
        <Route index element={<Login />} />

        {/* Admin routes */}
        <Route
          path="/admin"
          element={
            <ProtectedRoute allowedRoles={["Admin", "Manager"]}>
              <AdminLayout />
            </ProtectedRoute>
          }
        >
          <Route path="dashboard" element={<AdminDashboardManager />} />
          <Route path="menu" element={<AdminMenuManager />} />
          <Route path="user" element={<AdminUserManager />} />
          <Route path="order" element={<AdminOrderManager />} />
          <Route path="role" element={<AdminRoleManager />} />
          <Route path="ingredient" element={<AdminIngredientManager />} />
          <Route path="reservation" element={<AdminReservationManager />} />
          <Route path="payment" element={<AdminPaymentManager />} />
          <Route path="feedback" element={<AdminFeedbackManager />} />
        </Route>

        {/* Waiter routes */}
        <Route
          path="/waiter"
          element={
            <ProtectedRoute allowedRoles={["Staff"]}>
              <WaiterLayout />
            </ProtectedRoute>
          }
        >
          <Route path="dashboard" element={<WaiterDashboard />} />
          <Route path="order" element={<WaiterOrders />} />
          <Route path="order/history" element={<WaiterOrderHistory />} />
        </Route>

        {/* Cashier routes */}
        <Route
          path="/cashier"
          element={
            <ProtectedRoute allowedRoles={["Cashier"]}>
              <CashierLayout />
            </ProtectedRoute>
          }
        >
          <Route path="dashboard" element={<CashierDashboard />} />
          <Route path="payments" element={<CashierPayment />} />
          <Route path="reservations" element={<CashierReservation />} />
        </Route>

        {/* Chef routes */}
        <Route
          path="/chef"
          element={
            <ProtectedRoute allowedRoles={["Chef"]}>
              <ChefLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<Navigate to="dashboard" replace />} />
          <Route path="dashboard" element={<ChefDashboard />} />
          <Route path="status" element={<ChefStatus />} />
          <Route path="recipes" element={<ChefIngredient />} />
          <Route
            path="orders"
            element={<Navigate to="/chef/status" replace />}
          />
          <Route
            path="order"
            element={<Navigate to="/chef/status" replace />}
          />
        </Route>
      </Routes>
    </AuthProvider>
  );
}

export default App;
