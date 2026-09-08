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
  "confidence": 0.86# DATABASE SCHEMA

Target: PostgreSQL + Prisma.

Core models:
User, Artisan, Product, Order, OrderItem, Review, AIGeneration.

Roles: ARTISAN, CUSTOMER, ADMIN.
Product status: DRAFT, PUBLISHED.
Location is optional.
Database price is the artisan's final price, not the AI suggestion.

Schema changes must be coordinated with Shivank and reflected in `database/prisma/schema.prisma`.

}# DATABASE SCHEMA

Target: PostgreSQL + Prisma.

Core models:
User, Artisan, Product, Order, OrderItem, Review, AIGeneration.

Roles: ARTISAN, CUSTOMER, ADMIN.
Product status: DRAFT, PUBLISHED.
Location is optional.
Database price is the artisan's final price, not the AI suggestion.

Schema changes must be coordinated with Shivank and reflected in `database/prisma/schema.prisma`.

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
