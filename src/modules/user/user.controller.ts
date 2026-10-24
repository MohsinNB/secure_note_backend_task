import { catchAsync } from "../../utils/asyncHandler";
import { sendResponse } from "../../utils/sendResponse";
import { userService } from "./user.service";

const createUser = catchAsync(async (req, res) => {
  const result = await userService.createUser(req.body);

  sendResponse(res, {
    statusCode: 201,
    success: true,
    message: "User created successfully",
    data: result,
  });
});

const getAllUsers = catchAsync(async (req, res) => {
  const result = await userService.getAllUsers(req.query);

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Users retrieved successfully",
    data: result.data,
    meta: result.meta,
  });
});

const getSingleUser = catchAsync(async (req, res) => {
  const result = await userService.getSingleUser(req.params.id as string);

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "User retrieved successfully",
    data: result,
  });
});

const updateUser = catchAsync(async (req, res) => {
  const result = await userService.updateUser(
    req.params.id as string,
    req.body,
  );

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "User updated successfully",
    data: result,
  });
});

const deleteUser = catchAsync(async (req, res) => {
  const result = await userService.deleteUser(
    req.params.id as string,
    req.user!.userId as string,
  );

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "User deleted successfully",
    data: result,
  });
});

const getUsersGroupedByInterests = catchAsync(async (req, res) => {
  const result = await userService.getUsersGroupedByInterests(req.query);

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Users grouped by interests retrieved successfully",
    data: result.data,
    meta: result.meta,
  });
});

export const userController = {
  createUser,
  getAllUsers,
  getSingleUser,
  updateUser,
  deleteUser,
  getUsersGroupedByInterests,
};
