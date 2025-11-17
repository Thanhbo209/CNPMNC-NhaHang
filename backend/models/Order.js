import mongoose from "mongoose";

// Defining a Model
const Schema = mongoose.Schema;
const Order = new Schema({
  table: { type: Schema.Types.ObjectId, ref: "Table" },
  user: { type: Schema.Types.ObjectId, ref: "User" },
  items: [
    {
      food: { type: Schema.Types.ObjectId, ref: "Food" }, // Liên kết với bảng Food
      quantity: Number,
      note: String, // Ghi chú riêng cho từng món ăn
      status: { type: String, enum: ["pending", "preparing", "ready", "canceled"], default: "pending" },
    },
  ],
  addedItems: [
    {
      food: { type: Schema.Types.ObjectId, ref: "Food" },
      quantity: Number,
      note: String,
      status: { type: String, enum: ["pending", "preparing", "ready", "canceled"], default: "pending" },
    },
  ],
  orderNote: String, // Ghi chú chung cho toàn bộ order
  totalAmount: { type: Number },
  status: {
    type: String,
    enum: ["pending", "preparing", "served", "paid"],
    default: "pending",
  },
  createdAt: { type: Date, default: Date.now },
});

// ✅ Middleware tự động tính lại totalAmount
// Normalize item statuses before validation/save
Order.pre('validate', function (next) {
  try {
    const normalize = (s) => {
      if (!s) return 'pending';
      const v = String(s).toLowerCase();
      if (v === 'completed') return 'ready';
      if (v === 'cooking' || v === 'cook' || v === 'preparing') return 'preparing';
      if (v === 'cancel' || v === 'canceled' || v === 'cancelled') return 'canceled';
      if (v === 'ready') return 'ready';
      if (v === 'pending') return 'pending';
      return v; // leave as-is for unknowns (will be caught by enum if invalid)
    };

    (this.items || []).forEach(it => {
      it.status = normalize(it.status);
    });
    (this.addedItems || []).forEach(it => {
      it.status = normalize(it.status);
    });

    next();
  } catch (err) {
    next(err);
  }
});

// ✅ Middleware tự động tính lại totalAmount (ignore canceled items)
Order.pre("save", async function (next) {
  try {
    const allItems = [...(this.items || []), ...(this.addedItems || [])].filter(it => {
      const s = (it.status || '').toString().toLowerCase();
      return s !== 'canceled' && s !== 'cancel' && s !== 'cancelled';
    });

    const populated = await Promise.all(
      allItems.map(async (item) => {
        // item.food might already be populated as an object
        const foodId = item.food && item.food._id ? item.food._id : item.food;
        const food = await mongoose.model("Food").findById(foodId);
        return food ? (food.price || 0) * (item.quantity || 0) : 0;
      })
    );

    this.totalAmount = populated.reduce((sum, price) => sum + price, 0);
    next();
  } catch (err) {
    console.error("❌ Lỗi tính tổng tiền:", err.message);
    next(err);
  }
});


export default mongoose.model("Order", Order); // Accessing a Model
