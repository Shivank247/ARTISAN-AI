import prisma from "../utils/prisma.js";
import { httpError } from "../utils/httpError.js";
import { requiredString } from "../utils/validation.js";

export async function listReviews(productId) {
  return prisma.review.findMany({
    where: { productId },
    include: { user: { select: { id: true, name: true } } },
    orderBy: { createdAt: "desc" },
  });
}

export async function createReview(userId, productId, input) {
  const rating = Number(input.rating);
  if (!Number.isInteger(rating) || rating < 1 || rating > 5) {
    throw httpError(400, "VALIDATION_ERROR", "rating must be an integer between 1 and 5.");
  }

  const product = await prisma.product.findUnique({ where: { id: productId } });
  if (!product || product.status !== "PUBLISHED") {
    throw httpError(404, "PRODUCT_NOT_FOUND", "Published product not found.");
  }

  const existing = await prisma.review.findUnique({ where: { productId_userId: { productId, userId } } });
  if (existing) throw httpError(409, "REVIEW_ALREADY_EXISTS", "You have already reviewed this product.");

  return prisma.review.create({
    data: {
      productId,
      userId,
      rating,
      comment: input.comment === undefined || input.comment === null ? null : requiredString(input.comment, "comment"),
    },
    include: { user: { select: { id: true, name: true } } },
  });
}
