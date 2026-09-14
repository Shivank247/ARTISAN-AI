import { Router } from "express";

import { asyncHandler } from "../utils/asyncHandler.js";
import { successResponse } from "../utils/response.js";
import { loginUser, publicUser, registerUser } from "../services/authService.js";
import { requireAuth } from "../middleware/authMiddleware.js";

const router = Router();
router.post("/register", asyncHandler(async (req, res) => successResponse(res, await registerUser(req.body), 201)));
router.post("/login", asyncHandler(async (req, res) => successResponse(res, await loginUser(req.body))));
router.get("/me", requireAuth, (req, res) => successResponse(res, { user: publicUser(req.user) }));
export default router;
