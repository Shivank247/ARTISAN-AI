import { Router } from "express";

import { createOrder, getOrder, updateOrderStatus } from "../services/orderService.js";
import { optionalAuth, requireAuth, requireRole } from "../middleware/authMiddleware.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { successResponse } from "../utils/response.js";

const router = Router();
router.post("/", optionalAuth, asyncHandler(async (req, res) => successResponse(res, await createOrder(req.user?.id || null, req.body), 201)));
router.get("/:id", requireAuth, asyncHandler(async (req, res) => successResponse(res, await getOrder(req.params.id, req.user.id, req.user.role === "ADMIN"))));
router.patch("/:id/status", requireAuth, requireRole("ADMIN"), asyncHandler(async (req, res) => successResponse(res, await updateOrderStatus(req.params.id, req.body.status))));
export default router;
