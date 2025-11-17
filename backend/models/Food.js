import mongoose from 'mongoose';

// Defining a Model
const Schema = mongoose.Schema;
const Food = new Schema({
    name: { type: String },
    description: { type: String },
    price: { type: Number },
    image: { type: String },
    available: { type: Boolean, default: true },
    tags: { type: String },
    rating: { type: Number, default: 0 },
    featured: { type: Boolean, default: false },
    ingredients: [{ 
        ingredient: { type: Schema.Types.ObjectId, ref: 'Ingredient' }, 
        quantity: Number,    // lượng cần cho món này
        unit: String
    }],
    category: { type: Schema.Types.ObjectId, ref: 'Category' }
}, {
    timestamps: true 
})

export default mongoose.model('Food', Food); // Accessing a Model