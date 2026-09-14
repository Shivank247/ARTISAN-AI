import { Router } from "express";

import { requireAuth, requireRole } from "../middleware/authMiddleware.js";
import { getMyArtisan, updateMyArtisan } from "../services/artisanService.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { successResponse } from "../utils/response.js";

const router = Router();
router.use(requireAuth, requireRole("ARTISAN"));
router.get("/me", asyncHandler(async (req, res) => successResponse(res, await getMyArtisan(req.user.id))));
router.put("/me", asyncHandler(async (req, res) => successResponse(res, await updateMyArtisan(req.user.id, req.body))));
export default router;
