import mongoose from 'mongoose';

// Defining a Model
const Schema = mongoose.Schema;
const Feedback = new Schema({
    user: { type: Schema.Types.ObjectId, ref: 'User' },
    food: { type: Schema.Types.ObjectId, ref: 'Food' }, 
    rating: Number,
    comment: String,

}, { timestamps: true });

export default mongoose.model('Feedback', Feedback); // Accessing a Model