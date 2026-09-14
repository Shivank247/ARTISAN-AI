import { Router } from "express";

import { requireAuth, requireRole } from "../middleware/authMiddleware.js";
import { generateProduct, recommendPrice, searchProducts, transcribeAudio, translateText } from "../services/aiService.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { successResponse } from "../utils/response.js";

const router = Router();
router.post("/voice-to-text", requireAuth, requireRole("ARTISAN"), asyncHandler(async (req, res) => successResponse(res, await transcribeAudio(req.body))));
router.post("/generate-product", requireAuth, requireRole("ARTISAN"), asyncHandler(async (req, res) => successResponse(res, await generateProduct(req.user.id, req.body))));
router.post("/recommend-price", requireAuth, requireRole("ARTISAN"), asyncHandler(async (req, res) => successResponse(res, await recommendPrice(req.body))));
router.post("/translate", asyncHandler(async (req, res) => successResponse(res, await translateText(req.body))));
router.post("/search", asyncHandler(async (req, res) => successResponse(res, await searchProducts(req.body))));
export default router;
