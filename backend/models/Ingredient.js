import mongoose from 'mongoose';

// Defining a Model
const Schema = mongoose.Schema;
const Ingredient = new Schema({
    name: { type: String, required: true },
    quantity: { type: Number, default: 0 },
    unit: { type: String, default: 'kg' },
    alertLevel: { type: Number, default: 0 }, // Mức cảnh báo tồn kho
    image: { type: String, default: '' }, // URL hoặc path ảnh
}, {
    timestamps: true
});

export default mongoose.model('Ingredient', Ingredient); // Accessing a Model