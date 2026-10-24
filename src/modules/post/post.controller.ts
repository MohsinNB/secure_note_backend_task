import { catchAsync } from "../../utils/asyncHandler";
import { sendResponse } from "../../utils/sendResponse";
import { postService } from "./post.service";

const createPost = catchAsync(async (req, res) => {
  const result = await postService.createPost(
    req.user!.userId as string,
    req.body,
  );

  sendResponse(res, {
    statusCode: 201,
    success: true,
    message: "Post created successfully",
    data: result,
  });
});

const getPostsByUser = catchAsync(async (req, res) => {
  const result = await postService.getPostsByUser(
    req.params.userId as string,
    req.query,
  );

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Posts retrieved successfully",
    data: result.data,
    meta: result.meta,
  });
});

export const postController = {
  createPost,
  getPostsByUser,
};
