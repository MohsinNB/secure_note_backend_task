import { Request, Response } from 'express';
import { NoteServices } from './note.service';

const createNote = async (req: Request, res: Response) => {
  try {
    const result = await NoteServices.createNoteIntoDB(req.body);
    res.status(201).json({
      success: true,
      message: 'Note created successfully!',
      data: result,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to create note',
      error,
    });
  }
};

export const NoteControllers = {
  createNote,
};
,
