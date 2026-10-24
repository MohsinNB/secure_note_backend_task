import { Note } from './note.model';
import { INote } from './note.interface';

const createNoteIntoDB = async (payload: INote) => {
  const result = await Note.create(payload);
  return result;
};

export const NoteServices = {
  createNoteIntoDB,
};
