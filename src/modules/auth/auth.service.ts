import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

import { ILoginPayload, IRegisterPayload, IJwtPayload } from "./auth.interface";
import User from "../user/user.model";
import appError from "../../utils/appError";

const register = async (payload: IRegisterPayload) => {
  const { name, email, password, interests } = payload;

  const normalizedEmail = email.toLowerCase().trim();

  const existingUser = await User.findOne({
    email: normalizedEmail,
  });

  if (existingUser) {
    throw new appError(409, "Email already exists");
  }

  const hashedPassword = await bcrypt.hash(password, 12);

  try {
    const user = await User.create({
      name,
      email: normalizedEmail,
      password: hashedPassword,
      interests: interests ?? [],
      role: "user",
    });

    return {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      interests: user.interests,
      createdAt: user.createdAt,
    };
  } catch (error: unknown) {
    // Concurrent registration can bypass the initial existence check.
    if (
      typeof error === "object" &&
      error !== null &&
      "code" in error &&
      error.code === 11000
    ) {
      throw new appError(409, "Email already exists");
    }

    throw error;
  }
};

const login = async (payload: ILoginPayload) => {
  const normalizedEmail = payload.email.toLowerCase().trim();

  const user = await User.findOne({
    email: normalizedEmail,
  }).select("+password");

  if (!user) {
    throw new appError(401, "Invalid email or password");
  }

  const isPasswordMatched = await bcrypt.compare(
    payload.password,
    user.password,
  );

  if (!isPasswordMatched) {
    throw new appError(401, "Invalid email or password");
  }

  const secret = process.env.JWT_SECRET;

  if (!secret) {
    throw new Error("JWT_SECRET is not configured");
  }

  const expiresIn = process.env.JWT_EXPIRES_IN || "1d";

  const jwtPayload: IJwtPayload = {
    userId: user._id.toString(),
    role: user.role,
  };

  const token = jwt.sign(jwtPayload, secret, {
    expiresIn: expiresIn as jwt.SignOptions["expiresIn"],
  });

  return {
    token,
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      interests: user.interests,
    },
  };
};

const getMe = async (userId: string) => {
  const user = await User.findById(userId).select("-password");

  if (!user) {
    throw new appError(404, "User not found");
  }

  return user;
};

export const authService = {
  register,
  login,
  getMe,
};
