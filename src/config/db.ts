import mongoose from "mongoose";


const connectDB = async () => {
  const mongoUri = process.env.MONGODB_URI;

  if (!mongoUri) {
    throw new Error("mongo uri not found in env");
  }

  await mongoose.connect(mongoUri);

  console.log("Database connected successfully");
};

export default connectDB;
