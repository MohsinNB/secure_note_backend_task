import { Router } from "express";

import { userController } from "./user.controller";
import { userValidation } from "./user.validation";
import { authGuard } from "../../middleware/authGuard";
import { allowRole } from "../../middleware/allowRole";
import { validateRequest } from "../../middleware/validateRequest";

const router = Router();

router.use(authGuard, allowRole("admin"));

router.post(
  "/",
  validateRequest(userValidation.createUserSchema),
  userController.createUser,
);

router.get("/", userController.getAllUsers);
router.get("/grouped-by-interests", userController.getUsersGroupedByInterests);

router.get("/:id", userController.getSingleUser);

router.patch(
  "/:id",
  validateRequest(userValidation.updateUserSchema),
  userController.updateUser,
);

router.delete("/:id", userController.deleteUser);

export const userRoutes = router;
