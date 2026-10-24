import { Router } from "express";

import { authRoutes } from "../modules/auth/auth.route";
import { userRoutes } from "../modules/user/user.route";
import { NoteRoutes } from "../modules/note/note.route";
import { postRoutes } from "../modules/post/post.route";

const router = Router();

router.use("/auth", authRoutes);
router.use("/users", userRoutes);
router.use("/notes", NoteRoutes);
router.use("/posts", postRoutes);

export default router;
