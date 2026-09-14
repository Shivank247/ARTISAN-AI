import { Router } from "express";

import {
  createOrder,
  getOrder,
  listOrders,
  updateOrderStatus,
} from "../services/orderService.js";

import {
  optionalAuth,
  requireAuth,
  requireRole,
} from "../middleware/authMiddleware.js";

import {
  asyncHandler,
} from "../utils/asyncHandler.js";

import {
  successResponse,
} from "../utils/response.js";

const router = Router();

/*
 * Create order.
 *
 * Customer login remains optional,
 * as required by the MVP contract.
 */
router.post(
  "/",
  optionalAuth,
  asyncHandler(
    async (req, res) =>
      successResponse(
        res,
        await createOrder(
          req.user?.id || null,
          req.body
        ),
        201
      )
  )
);

/*
 * Get all orders for the
 * currently logged-in customer.
 */
router.get(
  "/",
  requireAuth,
  asyncHandler(
    async (req, res) =>
      successResponse(
        res,
        await listOrders(
          req.user.id
        )
      )
  )
);

/*
 * Get one specific order.
 */
router.get(
  "/:id",
  requireAuth,
  asyncHandler(
    async (req, res) =>
      successResponse(
        res,
        await getOrder(
          req.params.id,
          req.user.id,
          req.user.role ===
            "ADMIN"
        )
      )
  )
);

/*
 * Admin-only order status update.
 */
router.patch(
  "/:id/status",
  requireAuth,
  requireRole("ADMIN"),
  asyncHandler(
    async (req, res) =>
      successResponse(
        res,
        await updateOrderStatus(
          req.params.id,
          req.body.status
        )
      )
  )
);

export default router;