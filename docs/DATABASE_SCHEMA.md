# DATABASE SCHEMA

Target: PostgreSQL + Prisma.

Core models:
User, Artisan, Product, Order, OrderItem, Review, AIGeneration.

Roles: ARTISAN, CUSTOMER, ADMIN.
Product status: DRAFT, PUBLISHED.
Location is optional.
Database price is the artisan's final price, not the AI suggestion.

Schema changes must be coordinated with Shivank and reflected in `database/prisma/schema.prisma`.
