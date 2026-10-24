import { Router } from "express";
import { noteController } from "./note.controller";
import { noteValidation } from "./note.validation";
import { authGuard } from "../../middleware/authGuard";
import { allowRole } from "../../middleware/allowRole";
import { validateRequest } from "../../middleware/validateRequest";

const router = Router();

// Create note (authenticated user)
router.post(
  "/",
  authGuard,
  validateRequest(noteValidation.createNoteSchema),
  noteController.createNote,
);

// Backward compatibility alias for create-note
router.post(
  "/create-note",
  authGuard,
  validateRequest(noteValidation.createNoteSchema),
  noteController.createNote,
);

// Get my notes (logged in user)
router.get("/my-notes", authGuard, noteController.getMyNotes);

// Get all notes (admin only)
router.get(
  "/all",
  authGuard,
  allowRole("admin"),
  noteController.getAllNotes,
);

// Get all notes root alias (admin only)
router.get("/", authGuard, allowRole("admin"), noteController.getAllNotes);

// Get single note (owner or admin)
router.get("/:id", authGuard, noteController.getSingleNote);

// Update note (owner only)
router.patch(
  "/:id",
  authGuard,
  validateRequest(noteValidation.updateNoteSchema),
  noteController.updateNote,
);

// Delete note (owner only)
router.delete("/:id", authGuard, noteController.deleteNote);

export const NoteRoutes = router;
