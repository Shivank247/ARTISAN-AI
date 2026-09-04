# API CONTRACT

Base URL: `/api`

## Auth
POST /auth/register
POST /auth/login
GET /auth/me

## Artisan
GET /artisans/me
PUT /artisans/me

## Products
POST /products
GET /products?search=&category=&minPrice=&maxPrice=&state=
GET /products/:id
PUT /products/:id
DELETE /products/:id

## AI
POST /ai/voice-to-text
POST /ai/generate-product
POST /ai/translate
POST /ai/search

## Orders
POST /orders
GET /orders/:id

Do not silently change endpoint names, fields, response formats, or authentication.
