import { Types } from "mongoose";
import appError from "../../utils/appError";
import { buildMeta, getPagination } from "../../utils/pagination";
import Note from "./note.model";
import { IAuthUser } from "../auth/auth.interface";

const createNote = async (
  userId: string,
  payload: { title: string; content: string },
) => {
  return Note.create({ ...payload, userId: new Types.ObjectId(userId) });
};

const getMyNotes = async (userId: string, query: Record<string, unknown>) => {
  const { page, limit, skip } = getPagination(query);
  const filter = { userId: new Types.ObjectId(userId) };

  const [data, total] = await Promise.all([
    Note.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
    Note.countDocuments(filter),
  ]);

  return { data, meta: buildMeta(page, limit, total) };
};

const getAllNotes = async (query: Record<string, unknown>) => {
  const { page, limit, skip } = getPagination(query);

  const [data, total] = await Promise.all([
    Note.find()
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate("userId", "name email") // kar note bujhar jonno
      .lean(),
    // filter nai, tai full count na kore collection metadata theke nei
    Note.estimatedDocumentCount(),
  ]);

  return { data, meta: buildMeta(page, limit, total) };
};

const getSingleNote = async (noteId: string, user: IAuthUser) => {
  const note = await Note.findById(noteId).lean();

  if (!note) {
    throw new appError(404, "Note not found");
  }

  if (user.role !== "admin" && note.userId.toString() !== user.userId) {
    throw new appError(403, "You can not access this note");
  }

  return note;
};

const updateNote = async (
  noteId: string,
  userId: string,
  payload: { title?: string; content?: string },
) => {
  const note = await Note.findOneAndUpdate(
    { _id: noteId, userId: new Types.ObjectId(userId) },
    payload,
    { new: true, runValidators: true },
  );

  if (!note) {
    throw new appError(404, "Note not found");
  }

  return note;
};

const deleteNote = async (noteId: string, userId: string) => {
  const note = await Note.findOneAndDelete({
    _id: noteId,
    userId: new Types.ObjectId(userId),
  });

  if (!note) {
    throw new appError(404, "Note not found");
  }

  return null;
};

export const noteService = {
  createNote,
  getMyNotes,
  getAllNotes,
  getSingleNote,
  updateNote,
  deleteNote,
};
