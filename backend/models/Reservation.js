import mongoose from 'mongoose';

// Defining a Model
const Schema = mongoose.Schema;
const Reservation = mongoose.Schema({
    table: { type: Schema.Types.ObjectId, ref: 'Table' },
    user: { type: Schema.Types.ObjectId, ref: 'User' },
    reservationTime: { type: Date },
    status: { type: String, enum: ['pending','confirmed','cancelled'], default: 'pending' },
    guests: { type: Number, default: 1 },
    note: String,
    order: { type: Schema.Types.ObjectId, ref: 'Order' }, // Đặt bàn kèm order trước,
    cancelledAt: Date, // Thời gian hủy
    createdAt: { type: Date }
})

export default mongoose.model('Reservation', Reservation); // Accessing a Model