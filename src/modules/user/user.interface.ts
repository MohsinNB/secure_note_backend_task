import { Document } from "mongoose";

export interface IUser extends Document {
  name: string;
  email: string;
  password: string;
  role: "user" | "admin";
  interest: string[];
  createdAt: Date;
  updatedAt: Date;
}
