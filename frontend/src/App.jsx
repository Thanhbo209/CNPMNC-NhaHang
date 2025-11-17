import { Route, Routes, Navigate } from 'react-router-dom'
import './App.css'

// 🧑‍💼 Admin imports
import AdminLayout from './components/Admin/AdminLayout'
import AdminDashboardManager from './pages/Admin/AdminDashboardManager'
import AdminMenuManager from './pages/Admin/AdminMenuManager'
import AdminUserManager from './pages/Admin/AdminUserManager'
import AdminOrderManager from './pages/Admin/AdminOrderManager'
import AdminRoleManager from './pages/Admin/AdminRoleManager'
import AdminIngredientManager from './pages/Admin/AdminIngredientManager'
import AdminReservationManager from './pages/Admin/AdminReservationManager'
import AdminPaymentManager from './pages/Admin/AdminPaymentManager'
import AdminFeedbackManager from './pages/Admin/AdminFeedbackManager'

import WaiterLayout from './components/Waiter/WaiterLayout'
import WaiterDashboard from './pages/Waiter/WaiterDashboard'
import WaiterOrders from "./pages/Waiter/WaiterOrders";

import CashierLayout from "./components/Cashier/CashierLayout";
import CashierDashboard from "./pages/Cashier/CashierDashboard";
import CashierPayment from "./pages/Cashier/CashierPayment";
import CashierReservation from "./pages/Cashier/CashierReservation";
import ChefDashboard from "./pages/Chef/ChefDashboard";
import ChefStatus from "./pages/Chef/ChefStatus";
import ChefLayout from './components/Chef/ChefLayout'
function App() {
  return (
    <>
      <Routes>
        <Route path="/admin" element={<AdminLayout />}>
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

        <Route path="/waiter" element={<WaiterLayout />}>
          <Route path="dashboard" element={<WaiterDashboard />} />
          <Route path="order" element={<WaiterOrders />} />
        </Route>
        <Route path="/cashier" element={<CashierLayout />}>
          <Route path="dashboard" element={<CashierDashboard />} />
          <Route path="payments" element={<CashierPayment />} />
          <Route path="reservations" element={<CashierReservation />} />
        </Route>
        <Route path="/chef" element={<ChefLayout />}>
          <Route index element={<Navigate to="dashboard" replace />} />
          <Route path="dashboard" element={<ChefDashboard />} />
          <Route path="status" element={<ChefStatus />} />
          <Route path="orders" element={<Navigate to="/chef/status" replace />} />
          <Route path="order" element={<Navigate to="/chef/status" replace />} />
        </Route>
      </Routes>
    </>
  )
}

export default App
