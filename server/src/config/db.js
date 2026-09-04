import dns from "node:dns";
dns.setServers(["8.8.8.8", "1.1.1.1"]); // Forces Node to bypass local laptop DNS restrictions

import mongoose from "mongoose";

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);

    console.log("MongoDB connected successfully");
  } catch (error) {
    console.error("MongoDB connection failed:", error.message);
    process.exit(1);
  }
};

export default connectDB;