import mongoose from 'mongoose';

// Defining a Model
const Schema = mongoose.Schema;
const Payment = new Schema({
    order: { type: Schema.Types.ObjectId, ref: 'Order' },
    method: { type: String, enum: ['cash','card','transfer'] },
    subtotal: { type: Number },
    taxPercent: { type: Number, default: 0 },
    taxAmount: { type: Number, default: 0 },
    amount: Number,
    status: { type: String, enum: ['pending','completed','failed'] },
    paidAt: Date
})

export default mongoose.model('Payment', Payment); // Accessing a Model