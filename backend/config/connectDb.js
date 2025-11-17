import mongoose from 'mongoose';


// Export dbConnect function
export default async function dbConnect(connectionString) {
    try {
        await mongoose.connect(connectionString);
        console.log("Connect Successfully!")

    } catch (err) {
        console.log("Failed to connect!")
    }
}