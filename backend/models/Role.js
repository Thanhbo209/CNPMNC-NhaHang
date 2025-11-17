import mongoose from 'mongoose';

// Defining a Model
const Schema = mongoose.Schema;
const Role = new Schema({
    name: { type: String, required: true, unique: true} ,
    permission: [ String ],
    description: { type: String },
    createdAt: { type: Date, default: Date.now() },
    updatedAt: { type: Date, default: Date.now() },
})

export default mongoose.model('Role', Role); // Accessing a Model