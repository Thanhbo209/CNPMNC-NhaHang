import express from "express";
import dbConnect from "./config/connectDb.js";
import dotenv from "dotenv";
import route from "./routes/index.js";
import cors from "cors";

// Kết nối database
dotenv.config(); // load biến từ .env
dbConnect(process.env.MONGO_URI);

const app = express();
const port = process.env.PORT;
app.use(express.json());
// ✅ Cho (port 5173) truy cập
app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
  })
);

// Middleware để parse JSON
app.use(express.json());

// Test route
app.get("/", (req, res) => {
  res.send("Server is running");
});

// Route
route(app);

app.listen(port, () => console.log(`Example app listening on port ${port}`));
