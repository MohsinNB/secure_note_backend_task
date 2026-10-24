import { Router } from "express";

import { postController } from "./post.controller";
import { postValidation } from "./post.validation";
import { authGuard } from "../../middleware/authGuard";
import { validateRequest } from "../../middleware/validateRequest";

const router = Router();

router.post(
  "/",
  authGuard,
  validateRequest(postValidation.createPostSchema),
  postController.createPost,
);

router.get("/user/:userId", postController.getPostsByUser);

export const postRoutes = router;
