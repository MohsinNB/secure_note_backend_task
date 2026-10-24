import { catchAsync } from "../../utils/asyncHandler";
import { sendResponse } from "../../utils/sendResponse";
import { IAuthUser } from "../auth/auth.interface";
import { noteService } from "./note.service";

const createNote = catchAsync(async (req, res) => {
  const result = await noteService.createNote(
    req.user!.userId as string,
    req.body,
  );

  sendResponse(res, {
    statusCode: 201,
    success: true,
    message: "Note created successfully",
    data: result,
  });
});

const getMyNotes = catchAsync(async (req, res) => {
  const result = await noteService.getMyNotes(
    req.user!.userId as string,
    req.query,
  );

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Notes retrieved successfully",
    data: result.data,
    meta: result.meta,
  });
});

const getAllNotes = catchAsync(async (req, res) => {
  const result = await noteService.getAllNotes(req.query);

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "All notes retrieved successfully",
    data: result.data,
    meta: result.meta,
  });
});

const getSingleNote = catchAsync(async (req, res) => {
  const result = await noteService.getSingleNote(
    req.params.id as string,
    req.user! as IAuthUser,
  );

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Note retrieved successfully",
    data: result,
  });
});

const updateNote = catchAsync(async (req, res) => {
  const result = await noteService.updateNote(
    req.params.id as string,
    req.user!.userId as string,
    req.body,
  );

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Note updated successfully",
    data: result,
  });
});

const deleteNote = catchAsync(async (req, res) => {
  const result = await noteService.deleteNote(
    req.params.id as string,
    req.user!.userId as string,
  );

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Note deleted successfully",
    data: result,
  });
});

export const noteController = {
  createNote,
  getMyNotes,
  getAllNotes,
  getSingleNote,
  updateNote,
  deleteNote,
};
