import express from 'express';
import { NoteControllers } from './note.controller';

const router = express.Router();

router.post('/create-note', NoteControllers.createNote);

export const NoteRoutes = router;
