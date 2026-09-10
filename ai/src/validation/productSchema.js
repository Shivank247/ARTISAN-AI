const { z } = require("zod");

const priceRangeSchema = z.object({
  min: z.number().finite().nonnegative(),
  max: z.number().finite().nonnegative()
}).refine((range) => range.min <= range.max, {
  message: "Price range minimum cannot exceed maximum."
}).nullable();

const productSchema = z.object({
  title: z.string().min(1),
  description: z.string().min(1),
  category: z.string().nullable(),
  material: z.string().nullable(),
  tags: z.array(z.string()),
  suggestedPrice: z.number().finite().nonnegative().nullable(),
  priceRange: priceRangeSchema,
  confidence: z.number().min(0).max(1)
});

function validateProductOutput(data) {
  const result = productSchema.safeParse(data);
  if (!result.success) {
    return { valid: false, errors: result.error.issues };
  }
  return { valid: true, data: result.data };
}

module.exports = { productSchema, validateProductOutput };