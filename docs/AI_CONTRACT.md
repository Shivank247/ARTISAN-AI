# AI CONTRACT

## Product generation output
```json
{
  "title": "...",
  "description": "...",
  "category": "...",
  "material": "...",
  "tags": [],
  "suggestedPrice": 899,
  "priceRange": {"min": 799, "max": 999},
  "confidence": 0.86
}
```

## Rules
- Validate every AI response.
- Never invent unsupported material, certification, origin, awards, dimensions, or other facts.
- AI output is a DRAFT until artisan approval.
- Price is a recommendation, not truth.
- AI search interprets intent; the database returns actual products.
- Provider keys stay server-side.
- Mock AI is allowed only as an isolated development fallback.
- Do not silently change this contract.
