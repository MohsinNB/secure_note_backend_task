import { Document, Types } from "mongoose";

export interface IUser extends Document {
  name: string;
  email: string;
  password: string;
  role: "user" | "admin";
  interests: string[];
  createdAt: Date;
  updatedAt: Date;
}

export interface ICreateUserPayload {
  name: string;
  email: string;
  password: string;
  role?: "user" | "admin";
  interests?: string[];
}
export interface IGroupedByInterest {
  data: {
    interest: string;
    count: number;
    users: { _id: Types.ObjectId; name: string; email: string }[];
  }[];
  meta: { total: number }[];
}
export type TUpdateUserPayload = Partial<ICreateUserPayload>;
