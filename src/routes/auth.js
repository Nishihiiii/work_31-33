import { validate, registerSchema, loginSchema } from "../validators/auth.js";
import { register, login, refresh, logout } from "../controllers/authController.js";
import authenticate from "../middleware/authenticate.js";
import { Router } from "express";

const router = Router();

router.post("/register", validate(registerSchema), register);
router.post("/login", validate(loginSchema), login);
router.post("/refresh", refresh);
router.post("/logout", authenticate, logout);

export default router;
