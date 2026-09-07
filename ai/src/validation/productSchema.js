const { z } = require("zod");

const priceRangeSchema = z.object({
  min: z.number(),
  max: z.number()
}).nullable();

const productSchema = z.object({
  title: z.string().min(1),
  description: z.string().min(1),
  category: z.string().nullable(),
  material: z.string().nullable(),
  tags: z.array(z.string()),
  suggestedPrice: z.number().nullable(),
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