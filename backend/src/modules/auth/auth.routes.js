import { Router } from "express";
import validate from "../../middleware/validate.middleware.js";
import { authenticate } from "../../middleware/auth.middleware.js";
import { loginSchema, registerSchema } from "../../validators/auth.validators.js";
import * as authController from "./auth.controller.js";

const router = Router();

router.post("/register", validate(registerSchema), authController.register);
router.post("/login", validate(loginSchema), authController.login);
router.post("/guest", authController.guest);
router.get("/me", authenticate, authController.me);

export default router;
