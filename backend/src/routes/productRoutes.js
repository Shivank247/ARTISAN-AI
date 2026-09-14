import { Router } from "express";

import { requireAuth, requireRole } from "../middleware/authMiddleware.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { successResponse } from "../utils/response.js";
import { createReview, listReviews } from "../services/reviewService.js";
import { createProduct, deleteProduct, getProduct, listProducts, updateProduct } from "../services/productService.js";

const router = Router();
router.get("/", asyncHandler(async (req, res) => successResponse(res, await listProducts(req.query))));
router.get("/:id", asyncHandler(async (req, res) => successResponse(res, await getProduct(req.params.id, null))));
router.get("/:id/reviews", asyncHandler(async (req, res) => successResponse(res, await listReviews(req.params.id))));
router.post("/:id/reviews", requireAuth, requireRole("CUSTOMER"), asyncHandler(async (req, res) => successResponse(res, await createReview(req.user.id, req.params.id, req.body), 201)));
router.post("/", requireAuth, requireRole("ARTISAN"), asyncHandler(async (req, res) => successResponse(res, await createProduct(req.user.id, req.body), 201)));
router.put("/:id", requireAuth, requireRole("ARTISAN", "ADMIN"), asyncHandler(async (req, res) => successResponse(res, await updateProduct(req.params.id, req.user.id, req.body, req.user.role === "ADMIN"))));
router.delete("/:id", requireAuth, requireRole("ARTISAN", "ADMIN"), asyncHandler(async (req, res) => successResponse(res, await deleteProduct(req.params.id, req.user.id, req.user.role === "ADMIN"))));
export default router;
