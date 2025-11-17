import mongoose from 'mongoose';
import dotenv from 'dotenv';

// Load .env
dotenv.config();

// Import tất cả model
import '../models/User.js';
import '../models/Role.js';
import '../models/Food.js';
import '../models/Feedback.js';
import '../models/Category.js';
import '../models/Ingredient.js';
import '../models/Reservation.js';
import '../models/Table.js';
import '../models/Order.js';
import '../models/Payment.js';

// Lấy danh sách tên collection từ model
const collectionNames = [
    'users',
    'roles',
    'foods',
    'feedbacks',
    'categories',
    'ingredients',
    'reservations',
    'tables',
    'orders',
    'payments'
];

async function createCollections() {
    try {
        for (const name of collectionNames) {
            const exists = await mongoose.connection.db.listCollections({ name }).hasNext();
            if (!exists) {
                await mongoose.connection.db.createCollection(name);
                console.log(`Collection '${name}' created`);
            } else {
                console.log(`Collection '${name}' already exists`);
            }
        }

        await mongoose.connection.close();
        console.log("All done, connection closed!");
    } catch (err) {
        console.error(err);
    }
}

export default createCollections;
