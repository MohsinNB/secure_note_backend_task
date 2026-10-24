import "dotenv/config";
import mongoose from "mongoose";
import User from "../modules/user/user.model";
import { hashPassword } from "../utils/password";

const run = async () => {
  const uri = process.env.MONGODB_URI;
  const password = process.env.ADMIN_PASSWORD;

  if (!uri || !password) {
    throw new Error("MONGODB_URI and ADMIN_PASSWORD are required");
  }

  const email = (process.env.ADMIN_EMAIL ?? "admin@example.com")
    .toLowerCase()
    .trim();

  await mongoose.connect(uri);

  const existing = await User.findOne({ email });

  if (existing) {
    console.log("Admin already exists");
  } else {
    await User.create({
      name: "Admin",
      email,
      password: await hashPassword(password),
      role: "admin",
    });
    console.log("Admin created:", email);
  }

  await mongoose.disconnect();
};

run().catch((error) => {
  console.error(error);
  process.exit(1);
});
