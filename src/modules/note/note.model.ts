import mongoose, { Schema } from "mongoose";
import { INote } from "./note.interface";

const noteSchema = new Schema<INote>(
  {
    title: {
      type: String,
      required: true,
      minlength: 3,
      maxlength: 100,
      trim: true,
    },
    content: {
      type: String,
      required: true,
    },
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  {
    timestamps: true,
  },
);

// user nijer notes list: filter userId, sort newest first
noteSchema.index({ userId: 1, createdAt: -1 });
// admin sob notes list: sort newest first
noteSchema.index({ createdAt: -1 });

const Note = mongoose.model<INote>("Note", noteSchema);
export default Note;
