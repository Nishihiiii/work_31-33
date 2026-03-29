import { Router } from "express";
import { getAllUsers, getUserById } from "../controllers/userController.js";
import authenticate from "../middleware/authenticate.js";
import authorize from "../middleware/authorize.js";

const router = Router();

router.use(authenticate, authorize("admin"));

router.get("/", getAllUsers);
router.get("/:id", getUserById);

export default router;
