import { Types } from "mongoose";
import appError from "../../utils/appError";
import { buildMeta, getPagination } from "../../utils/pagination";
import User from "../user/user.model";
import Post from "./post.model";

const createPost = async (
  userId: string,
  payload: { title: string; content: string },
) => {
  return Post.create({ ...payload, userId: new Types.ObjectId(userId) });
};

const getPostsByUser = async (
  userId: string,
  query: Record<string, unknown>,
) => {
  if (!Types.ObjectId.isValid(userId)) {
    throw new appError(400, "Invalid user id");
  }

  const objectId = new Types.ObjectId(userId);
  const { page, limit, skip } = getPagination(query);

  const [result, total] = await Promise.all([
    User.aggregate([
      { $match: { _id: objectId } },
      {
        $lookup: {
          from: Post.collection.name,
          localField: "_id",
          foreignField: "userId",
          pipeline: [
            { $sort: { createdAt: -1 } },
            { $skip: skip },
            { $limit: limit },
            { $project: { title: 1, content: 1, createdAt: 1 } },
          ],
          as: "posts",
        },
      },
      { $project: { name: 1, posts: 1 } },
    ]),
    Post.countDocuments({ userId: objectId }),
  ]);

  if (result.length === 0) {
    throw new appError(404, "User not found");
  }

  return { data: result[0], meta: buildMeta(page, limit, total) };
};

export const postService = {
  createPost,
  getPostsByUser,
};
