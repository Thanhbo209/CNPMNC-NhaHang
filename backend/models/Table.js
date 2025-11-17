import mongoose from 'mongoose';

// Defining a Model
const Schema = mongoose.Schema;
const Table = new Schema({
    tableNumber: { type: Number },
    location: String,
    floor: Number,
    seats: { type: Number },
    status: { type: String, enum: ['available','occupied','reserved'], default: 'available' }, 
    reservation: { type: Schema.Types.ObjectId, ref: 'Reservation' }, 
    currentOrder: { type: Schema.Types.ObjectId, ref: 'Order' },
    isVIP: { type: Boolean, default: false },
    totalServed: { type: Number, default: 0 }
})

export default mongoose.model('Table', Table); // Accessing a Model