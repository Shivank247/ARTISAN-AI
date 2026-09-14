import prisma from "../utils/prisma.js";
import { httpError } from "../utils/httpError.js";
import { optionalNumber, optionalString, positiveInteger, requiredString } from "../utils/validation.js";

const productFields = ["title", "description", "category", "material", "tags", "imageUrl", "city", "state", "productionTimeDays", "price"];

function optionalNonNegativeNumber(value, fieldName) {
  if (value === undefined || value === null || value === "") return null;
  const number = Number(value);
  if (!Number.isFinite(number) || number < 0) {
    throw httpError(400, "VALIDATION_ERROR", `${fieldName} must be a nonnegative number.`);
  }
  return number;
}

function productData(input, partial = false) {
  const data = {};
  for (const field of productFields) {
    if (partial && input[field] === undefined) continue;
    if (["title", "description", "category", "material"].includes(field)) data[field] = requiredString(input[field], field);
    else if (field === "tags") {
      if (input[field] === undefined || input[field] === null) {
        data[field] = [];
        continue;
      }
      if (!Array.isArray(input[field]) || input[field].some((tag) => typeof tag !== "string")) throw httpError(400, "VALIDATION_ERROR", "tags must be an array of strings.");
      data[field] = input[field].map((tag) => tag.trim()).filter(Boolean);
    }
    else if (field === "price") data[field] = positiveInteger(input[field], field);
    else if (field === "productionTimeDays") data[field] = input[field] === null ? null : positiveInteger(input[field], field);
    else data[field] = optionalString(input[field], field);
  }
  return data;
}

export async function createProduct(userId, input) {
  const artisan = await prisma.artisan.findUnique({ where: { userId } });
  if (!artisan) throw httpError(404, "ARTISAN_NOT_FOUND", "Create an artisan profile first.");
  const data = productData(input);
  if (input.status && input.status !== "DRAFT") throw httpError(400, "VALIDATION_ERROR", "New products must start as DRAFT.");
  return prisma.product.create({ data: { ...data, artisanId: artisan.id, status: "DRAFT" } });
}

export async function listProducts(query, userId = null) {
  const page = Math.max(1, Number(query.page) || 1);
  const limit = Math.min(100, Math.max(1, Number(query.limit) || 20));
  const minPrice = optionalNonNegativeNumber(query.minPrice, "minPrice");
  const maxPrice = optionalNonNegativeNumber(query.maxPrice, "maxPrice");
  if (minPrice !== null && maxPrice !== null && minPrice > maxPrice) {
    throw httpError(400, "VALIDATION_ERROR", "minPrice cannot be greater than maxPrice.");
  }
  const where = userId ? { artisan: { userId } } : { status: "PUBLISHED" };
  if (query.category) where.category = query.category;
  if (query.state) where.state = query.state;
  if (minPrice !== null) where.price = { ...(where.price || {}), gte: minPrice };
  if (maxPrice !== null) where.price = { ...(where.price || {}), lte: maxPrice };
  if (query.search) where.OR = [{ title: { contains: query.search, mode: "insensitive" } }, { description: { contains: query.search, mode: "insensitive" } }, { material: { contains: query.search, mode: "insensitive" } }];

  const [products, total] = await prisma.$transaction([
    prisma.product.findMany({ where, include: { artisan: true }, skip: (page - 1) * limit, take: limit, orderBy: { createdAt: "desc" } }),
    prisma.product.count({ where }),
  ]);
  return { products, pagination: { page, limit, total } };
}

export async function getProduct(id, userId = null) {
  const product = await prisma.product.findUnique({ where: { id }, include: { artisan: true } });
  if (!product || (product.status !== "PUBLISHED" && (!userId || product.artisan.userId !== userId))) throw httpError(404, "PRODUCT_NOT_FOUND", "Product not found.");
  return product;
}

async function ownedProduct(id, userId) {
  const product = await prisma.product.findUnique({ where: { id }, include: { artisan: true } });
  if (!product) throw httpError(404, "PRODUCT_NOT_FOUND", "Product not found.");
  if (product.artisan.userId !== userId) throw httpError(403, "FORBIDDEN", "You do not own this product.");
  return product;
}

export async function updateProduct(id, userId, input, isAdmin = false) {
  const product = isAdmin ? await prisma.product.findUnique({ where: { id } }) : await ownedProduct(id, userId);
  if (!product) throw httpError(404, "PRODUCT_NOT_FOUND", "Product not found.");
  const data = productData(input, true);
  if (input.status !== undefined) {
    if (input.status !== "DRAFT" && input.status !== "PUBLISHED") throw httpError(400, "VALIDATION_ERROR", "Invalid product status.");
    if (input.status === "PUBLISHED" && (!data.title && !product.title || !data.description && !product.description || !data.category && !product.category || !data.material && !product.material || (data.price ?? product.price) <= 0)) throw httpError(400, "PRODUCT_NOT_READY", "Required product fields must be complete before publishing.");
    data.status = input.status;
  }
  return prisma.product.update({ where: { id }, data });
}

export async function deleteProduct(id, userId, isAdmin = false) {
  if (!isAdmin) await ownedProduct(id, userId);
  await prisma.product.delete({ where: { id } });
  return { deleted: true };
}
