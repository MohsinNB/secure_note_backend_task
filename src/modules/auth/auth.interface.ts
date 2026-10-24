import { Types } from "mongoose";

export interface IRegisterPayload {
  name: string;
  email: string;
  password: string;
  interests?: string[];
}

export interface IAuthUser {
  userId: string | Types.ObjectId;
  role: "user" | "admin";
}
export interface ILoginPayload {
  email: string;
  password: string;
}

export interface IJwtPayload {
  userId: string;
  role: "user" | "admin";
}
