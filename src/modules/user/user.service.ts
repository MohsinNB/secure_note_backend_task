import mongoose, { PipelineStage } from "mongoose";
import appError from "../../utils/appError";
import { buildMeta, getPagination } from "../../utils/pagination";
import { hashPassword } from "../../utils/password";
import Note from "../note/note.model";
import {
  ICreateUserPayload,
  IGroupedByInterest,
  TUpdateUserPayload,
} from "./user.interface";
import User from "./user.model";
import Post from "../post/post.model";

const createUser = async (payload: ICreateUserPayload) => {
  const user = await User.create({
    ...payload,
    password: await hashPassword(payload.password),
  });

  return {
    id: user._id,
    name: user.name,
    email: user.email,
    role: user.role,
    interests: user.interests,
    createdAt: user.createdAt,
  };
};

const getAllUsers = async (query: Record<string, unknown>) => {
  const { page, limit, skip } = getPagination(query);

  const [data, total] = await Promise.all([
    User.find().sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
    User.estimatedDocumentCount(),
  ]);

  return { data, meta: buildMeta(page, limit, total) };
};

const getSingleUser = async (userId: string) => {
  const user = await User.findById(userId).lean();

  if (!user) {
    throw new appError(404, "User not found");
  }

  return user;
};

const updateUser = async (userId: string, payload: TUpdateUserPayload) => {
  const data = { ...payload };

  if (data.password) {
    data.password = await hashPassword(data.password);
  }

  const user = await User.findByIdAndUpdate(userId, data, {
    new: true,
    runValidators: true,
  });

  if (!user) {
    throw new appError(404, "User not found");
  }

  return user;
};

const deleteUser = async (userId: string, currentUserId: string) => {
  if (userId === currentUserId) {
    throw new appError(400, "You can not delete your own account");
  }

  const session = await mongoose.startSession();

  try {
    await session.withTransaction(async () => {
      const user = await User.findByIdAndDelete(userId, { session });

      if (!user) {
        throw new appError(404, "User not found");
      }

      await Note.deleteMany({ userId }, { session });
      await Post.deleteMany({ userId }, { session });
    });
  } finally {
    await session.endSession();
  }

  return null;
};

const getUsersGroupedByInterests = async (query: Record<string, unknown>) => {
  const { page, limit, skip } = getPagination(query);
  const interest =
    typeof query.interest === "string"
      ? query.interest.trim().toLowerCase()
      : "";

  const pipeline: PipelineStage[] = [];

  if (interest) {
    pipeline.push({ $match: { interests: interest } });
  }

  pipeline.push({ $unwind: "$interests" });

  if (interest) {
    pipeline.push({ $match: { interests: interest } });
  }

  pipeline.push(
    {
      $group: {
        _id: "$interests",
        count: { $sum: 1 },
        users: { $push: { _id: "$_id", name: "$name", email: "$email" } },
      },
    },
    { $sort: { count: -1, _id: 1 } },
    {
      $facet: {
        data: [
          { $skip: skip },
          { $limit: limit },
          { $project: { _id: 0, interest: "$_id", count: 1, users: 1 } },
        ],
        meta: [{ $count: "total" }],
      },
    },
  );

  const [result] = await User.aggregate<IGroupedByInterest>(pipeline);
  const total = result.meta[0]?.total ?? 0;

  return { data: result.data, meta: buildMeta(page, limit, total) };
};

export const userService = {
  createUser,
  getAllUsers,
  getSingleUser,
  updateUser,
  deleteUser,
  getUsersGroupedByInterests,
};
