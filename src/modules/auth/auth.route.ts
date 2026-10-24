import { Router } from "express";

import { authController } from "./auth.controller";
import { authGuard } from "../../middleware/authGuard";

const router = Router();

router.post("/register", authController.register);
router.post("/login", authController.login);
router.get("/me", authGuard, authController.getMe);

export const authRoutes = router;
