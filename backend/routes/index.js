import foodRouter from "./foods.js";
import categoryRouter from "./categories.js";
import feedBackRouter from "./feedbacks.js";
import ingredientRouter from "./ingredients.js";
import orderRouter from "./orders.js";
import paymentRouter from "./payments.js";
import tableRouter from "./tables.js";
import roleRouter from "./roles.js";
import userRouter from "./users.js";
import reservationRouter from "./reservations.js";
import adminRouter from "./admins.js";
import waiterRoutes from "./waiter.js";
import authRoutes from "./auths.js";
function route(app) {
  app.use("/api/foods", foodRouter);
  app.use("/api/categories", categoryRouter);
  app.use("/api/feedbacks", feedBackRouter);
  app.use("/api/ingredients", ingredientRouter);
  app.use("/api/orders", orderRouter);
  app.use("/api/payments", paymentRouter);
  app.use("/api/tables", tableRouter);
  app.use("/api/roles", roleRouter);
  app.use("/api/users", userRouter);
  app.use("/api/reservations", reservationRouter);
  app.use("/api/admin", adminRouter);
  app.use("/api/waiter", waiterRoutes);
  app.use("/api/auth", authRoutes);
}

export default route;
