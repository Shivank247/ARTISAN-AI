# ARTISAN AI — DATABASE SCHEMA

Version: 1.0
Status: LOCKED FOR MVP
Database: PostgreSQL
ORM: Prisma

---

# 1. PURPOSE

This document defines the database structure required by the ARTISAN AI MVP.

The database must support:

* Artisan accounts
* Customer accounts
* Admin accounts
* Artisan profiles
* Products
* AI generation records
* Orders
* Order items
* Reviews

Do not add unnecessary tables or relationships during MVP development.

---

# 2. DATABASE ARCHITECTURE

Application:

React/PWA
↓
Express Backend
↓
Prisma ORM
↓
PostgreSQL

Frontend must never directly access PostgreSQL.

AI services must not directly access PostgreSQL.

The backend is responsible for database operations.

---

# 3. USER

Model:

User

Fields:

id
name
phone
passwordHash
role
language
createdAt
updatedAt

Role:

ARTISAN
CUSTOMER
ADMIN

Relationships:

User 1 — 1 Artisan

A customer may exist without an Artisan record.

---

# 4. ARTISAN

Model:

Artisan

Fields:

id
userId
craftType
city
state
latitude
longitude
story
createdAt
updatedAt

Relationship:

User 1 — 1 Artisan

Artisan 1 — many Product

Artisan 1 — many AIGeneration

Location is optional.

latitude may be null.

longitude may be null.

An artisan must be able to continue without granting location permission.

---

# 5. PRODUCT

Model:

Product

Fields:

id
artisanId
title
description
category
material
tags
price
currency
imageUrl
city
state
productionTimeDays
status
createdAt
updatedAt

Relationship:

Artisan 1 — many Product

Product 1 — many OrderItem

Product 1 — many Review

Recommended tags representation:

String array if supported by the selected PostgreSQL/Prisma implementation.

The current Prisma implementation uses `String[]` with an empty-array default.

If implementation constraints require another representation, coordinate the change before implementation.

inputLanguage
---

# 6. PRODUCT STATUS

Allowed values:

DRAFT
PUBLISHED

Important business rule:

AI-generated product = DRAFT

Artisan review = DRAFT

Artisan approval = PUBLISHED

AI must never automatically publish a product.

---

# 7. ORDER

Model:

Order

Fields:

id
customerId
customerName
phone
address
status
totalAmount
createdAt
updatedAt

customerId is optional because the MVP allows demo/customer checkout without mandatory customer login.

Relationship:

Order 1 — many OrderItem

---

# 8. ORDER STATUS

Allowed values:

PLACED
CONFIRMED
SHIPPED
DELIVERED
CANCELLED

---

# 9. ORDER ITEM

Model:

OrderItem

Fields:

id
orderId
productId
quantity
unitPrice

Relationships:

Order 1 — many OrderItem

Product 1 — many OrderItem

Important:

unitPrice must be captured when the order is created.

Order total must be calculated by the backend.

Never trust a total calculated by the frontend.

---

# 10. REVIEW

Model:

Review

Fields:

id
productId
customerId
customerName
rating
comment
createdAt

Relationship:

Product 1 — many Review

customerId may be optional for demo usage.

Rating should be validated.

Recommended rating range:

1–5

---

# 11. AI GENERATION

Model:

AIGeneration

Fields:

id
artisanId
productId
inputLanguage
inputText
outputJson
model
createdAt

Relationships:

Artisan 1 — many AIGeneration

Product may be optional because an AI generation can occur before a product is created.

outputJson stores the structured AI output for traceability/debugging.

---

# 12. RELATIONSHIP OVERVIEW

User
│
└── Artisan
│
├── Product
│   ├── Review
│   └── OrderItem
│
└── AIGeneration

Order
│
└── OrderItem
│
└── Product

---

# 13. REQUIRED INDEXES

Product should have indexes useful for:

category
state
price

These support the marketplace filters.

Additional indexes should only be added when justified.

---

# 14. PRODUCT SEARCH

Normal search filters:

search
category
minPrice
maxPrice
state

AI search produces structured filters.

Example:

User:

"Traditional handmade gifts from Bihar under ₹1000"

AI:

{
"state": "Bihar",
"maxPrice": 1000,
"keywords": [
"traditional",
"handmade",
"gifts"
]
}

Backend:

AI structured filters
→ PostgreSQL query
→ real Product records

AI must never create fake Product records.

---

# 15. PRICE RULE

AI price recommendation is NOT the final price.

Example:

AI:

{
"suggestedPrice": 899,
"priceRange": {
"min": 799,
"max": 999
}
}

Artisan:

₹950

Database:

price = 950

The database stores the artisan-approved/final price.

---

# 16. LOCATION RULE

Location is optional.

Possible states:

latitude = value
longitude = value

OR:

latitude = null
longitude = null

Do not require location to publish a product.

---

# 17. DEMO DATA

For the SIH prototype:

5–10 fictional/demo artisans

20–30 fictional/demo products

Multiple:

categories
states
price ranges
craft types

Use realistic fictional names.

Do not use sensitive real-person information.

---

# 18. DATABASE CHANGE POLICY

Mayank owns:

database/prisma/schema.prisma

However, shared schema changes must be coordinated with Shivank.

Before adding:

new model
new field
new relation
new enum
new required column

Mayank must explain:

1. Why it is needed.
2. Which feature requires it.
3. Which API is affected.
4. Which frontend/AI components are affected.
5. Whether it is required for the MVP.

Avoid unnecessary schema expansion.

---

# 19. MIGRATION SAFETY

Never casually run:

npx prisma migrate reset

on a shared or important database.

Before destructive migration:

1. Determine database environment.
2. Determine whether data is disposable.
3. Back up important data if required.
4. Inform Shivank.
5. Test migration safely.

---

# 20. DATABASE VALIDATION

Before integration:

npx prisma validate

Then inspect the database using:

npx prisma studio

Verify:

Users
Artisans
Products
Orders
OrderItems
Reviews
AIGenerations

and their relationships.

---

# 21. SOURCE OF TRUTH

This document defines the conceptual database contract.

Actual implementation:

database/prisma/schema.prisma

Owner:

Mayank

Coordinator:

Shivank

Database:

PostgreSQL

ORM:

Prisma

Status:

LOCKED FOR MVP
