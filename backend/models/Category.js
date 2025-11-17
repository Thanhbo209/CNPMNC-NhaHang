import mongoose from 'mongoose';

// Defining a Model
const Schema = mongoose.Schema;
const Category = new Schema({
    name: { type: String },
    description: { type: String },
    image: { type: String }
}, { timestamps: true })

export default mongoose.model('Category', Category); // Accessing a Model