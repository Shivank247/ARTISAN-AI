import { Router } from "express";

import { requireAuth, requireRole } from "../middleware/authMiddleware.js";
import prisma from "../utils/prisma.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { successResponse } from "../utils/response.js";

const router = Router();
router.use(requireAuth, requireRole("ADMIN"));

router.get("/dashboard", asyncHandler(async (req, res) => {
  const [artisans, products, publishedProducts, orders] = await Promise.all([
    prisma.artisan.count(),
    prisma.product.count(),
    prisma.product.count({ where: { status: "PUBLISHED" } }),
    prisma.order.count(),
  ]);
  return successResponse(res, { artisans, products, publishedProducts, orders });
}));

router.get("/artisans", asyncHandler(async (req, res) => successResponse(res, await prisma.artisan.findMany({ include: { user: { select: { id: true, name: true, phone: true, role: true, language: true } }, products: true }, orderBy: { createdAt: "desc" } }))));
router.get("/products", asyncHandler(async (req, res) => successResponse(res, await prisma.product.findMany({ include: { artisan: true }, orderBy: { createdAt: "desc" } }))));
router.get("/orders", asyncHandler(async (req, res) => successResponse(res, await prisma.order.findMany({ include: { items: true }, orderBy: { createdAt: "desc" } }))));

export default router;
