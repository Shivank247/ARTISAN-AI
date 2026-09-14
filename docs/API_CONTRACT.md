# ARTISAN AI — API CONTRACT

Version: 1.0
Status: LOCKED FOR MVP
Project: ARTISAN AI
Purpose: Shared API contract between Frontend, Backend, Database, and AI services.

---

## 1. CONTRACT RULE

This document is the shared source of truth for the ARTISAN AI API.

Frontend must NOT invent endpoints.

Backend must NOT silently rename endpoints or response fields.

AI services must return the structures defined by this contract.

If a developer needs to change this contract:

1. Explain why the change is required.
2. Inform Shivank.
3. Check impact on Frontend, Backend, Database, and AI.
4. Update this document.
5. Inform affected developers.
6. Implement the change.
7. Test the affected integration.

Never silently change a shared API.

---

# 2. BASE URL

Development:

http://localhost:5000/api

Production URL will be configured during deployment.

All API endpoints below are relative to `/api`.

Example:

POST /api/auth/login

---

# 3. GENERAL RESPONSE FORMAT

Successful response:

{
"success": true,
"data": {}
}

Error response:

{
"success": false,
"error": {
"code": "ERROR_CODE",
"message": "Human-readable error message"
}
}

Do not return different response formats for different endpoints unless explicitly documented.

---

# 4. AUTHENTICATION

Authentication uses token-based authentication.

Protected endpoints receive:

Authorization: Bearer <token>

The frontend must store the authenticated token securely according to the selected frontend architecture.

Never place secret API provider keys in the frontend.

---

# 5. AUTH ENDPOINTS

## POST /auth/register

Creates a user account.

Request:

{
"name": "Rahul Kumar",
"phone": "9876543210",
"password": "secure-password",
"role": "ARTISAN",
"language": "hi"
}

Allowed roles:

ARTISAN
CUSTOMER
ADMIN

Response:

{
"success": true,
"data": {
"user": {
"id": "user-id",
"name": "Rahul Kumar",
"phone": "9876543210",
"role": "ARTISAN",
"language": "hi"
},
"token": "..."
}
}

---

## POST /auth/login

Request:

{
"phone": "9876543210",
"password": "secure-password"
}

Response:

{
"success": true,
"data": {
"user": {
"id": "user-id",
"name": "Rahul Kumar",
"phone": "9876543210",
"role": "ARTISAN",
"language": "hi"
},
"token": "..."
}
}

---

## GET /auth/me

Authentication required.

Response:

{
"success": true,
"data": {
"user": {
"id": "user-id",
"name": "Rahul Kumar",
"phone": "9876543210",
"role": "ARTISAN",
"language": "hi"
}
}
}

---

# 6. ARTISAN PROFILE

## GET /artisans/me

Authentication required.

ARTISAN role required.

Response:

{
"success": true,
"data": {
"id": "artisan-id",
"userId": "user-id",
"craftType": "Madhubani Painting",
"city": "Madhubani",
"state": "Bihar",
"latitude": 26.35,
"longitude": 86.07,
"story": "Traditional artisan story"
}
}

Location may be null.

Location is OPTIONAL.

---

## PUT /artisans/me

Authentication required.

Request:

{
"craftType": "Madhubani Painting",
"city": "Madhubani",
"state": "Bihar",
"latitude": 26.35,
"longitude": 86.07,
"story": "I create traditional Madhubani paintings..."
}

Latitude and longitude may be null.

The user must be allowed to skip location.

Response:

{
"success": true,
"data": {
"id": "artisan-id",
"craftType": "Madhubani Painting",
"city": "Madhubani",
"state": "Bihar",
"latitude": 26.35,
"longitude": 86.07,
"story": "I create traditional Madhubani paintings..."
}
}

---

# 7. PRODUCTS

## POST /products

Authentication required.

ARTISAN role required.

Creates a product.

Products created through the AI catalogue flow must initially be DRAFT.

Request:

{
"title": "Hand Painted Madhubani Peacock",
"description": "Traditional handmade Madhubani painting...",
"category": "Painting",
"material": "Natural colors on handmade paper",
"price": 950,
"imageUrl": "https://example.com/image.jpg",
"city": "Madhubani",
"state": "Bihar",
"productionTimeDays": 5,
"status": "DRAFT"
}

Response:

{
"success": true,
"data": {
"id": "product-id",
"title": "Hand Painted Madhubani Peacock",
"description": "Traditional handmade Madhubani painting...",
"category": "Painting",
"material": "Natural colors on handmade paper",
"price": 950,
"currency": "INR",
"imageUrl": "https://example.com/image.jpg",
"city": "Madhubani",
"state": "Bihar",
"productionTimeDays": 5,
"status": "DRAFT"
}
}

---

## GET /products

Public endpoint.

Customers can browse published products without mandatory login.

Query parameters:

search=
category=
minPrice=
maxPrice=
state=

Example:

GET /api/products?category=Painting&maxPrice=1000&state=Bihar

Only PUBLISHED products should be returned to public customers.

Response:

{
"success": true,
"data": {
"products": [],
"pagination": {
"page": 1,
"limit": 20,
"total": 0
}
}
}

---

## GET /products/:id

Public endpoint.

Returns product details.

Only published products should be publicly accessible.

Response:

{
"success": true,
"data": {
"id": "product-id",
"title": "Hand Painted Madhubani Peacock",
"description": "Traditional handmade Madhubani painting...",
"category": "Painting",
"material": "Natural colors on handmade paper",
"price": 950,
"currency": "INR",
"imageUrl": "https://example.com/image.jpg",
"city": "Madhubani",
"state": "Bihar",
"productionTimeDays": 5,
"status": "PUBLISHED",
"artisan": {
"id": "artisan-id",
"craftType": "Madhubani Painting",
"city": "Madhubani",
"state": "Bihar",
"story": "Traditional artisan story"
}
}
}

---

## PUT /products/:id

Authentication required.

ARTISAN owner or authorized ADMIN.

Used for editing a draft or existing product.

Request may contain only fields being changed.

Example:

{
"price": 1000,
"description": "Updated shorter description"
}

Response:

{
"success": true,
"data": {
"id": "product-id",
"price": 1000,
"description": "Updated shorter description"
}
}

---

## DELETE /products/:id

Authentication required.

ARTISAN owner or authorized ADMIN.

Response:

{
"success": true,
"data": {
"deleted": true
}
}

---

# 8. PRODUCT APPROVAL / PUBLISHING

AI-generated products MUST NOT automatically become public.

Required flow:

AI generation
→ DRAFT
→ Artisan review
→ Artisan approval
→ PUBLISHED

The backend must enforce this rule.

An AI service must never directly publish a product.

The exact approval implementation may be handled through the product update/publish workflow while preserving this rule.

---

# 9. AI ENDPOINTS

AI provider keys remain on the backend.

Frontend communicates with the backend.

Frontend must NOT directly call external AI providers.

---

## POST /ai/voice-to-text

Request:

{
"audioUrl": "https://example.com/audio.webm",
"language": "hi"
}

Response:

{
"success": true,
"data": {
"text": "यह मधुबनी पेंटिंग है",
"language": "hi",
"confidence": 0.94
}
}

---

## POST /ai/generate-product

Request:

{
"imageUrl": "https://example.com/image.jpg",
"inputText": "यह मधुबनी पेंटिंग है। इसे बनाने में पांच दिन लगे।",
"language": "hi"
}

Response:

{
"success": true,
"data": {
"title": "Traditional Madhubani Painting",
"description": "A traditional handmade Madhubani painting...",
"category": "Painting",
"material": "Handmade paper and natural colors",
"tags": [
"Madhubani",
"handmade",
"traditional art"
],
"suggestedPrice": 899,
"priceRange": {
"min": 799,
"max": 999
},
"confidence": 0.86
}
}

Important:

suggestedPrice is the exact field name.

Do NOT change it to recommendedPrice without a documented contract change.

AI output is a recommendation.

The final artisan-selected price is authoritative.

---

# 10. AI TRANSLATION

## POST /ai/translate

Request:

{
"text": "Traditional handmade Madhubani painting",
"sourceLanguage": "en",
"targetLanguage": "hi"
}

Response:

{
"success": true,
"data": {
"translatedText": "पारंपरिक हस्तनिर्मित मधुबनी पेंटिंग",
"sourceLanguage": "en",
"targetLanguage": "hi"
}
}

---

# 11. AI PRICE RECOMMENDATION

## POST /ai/recommend-price

Authentication required. ARTISAN role required.

Request:

{
"category": "pottery",
"material": "clay",
"productionTimeDays": 5,
"location": "Bihar"
}

The response contains `suggestedPrice`, `priceRange`, `reason`, and `confidence`.
The artisan's final product price remains authoritative.

---

# 12. REVIEWS

## GET /products/:id/reviews

Public endpoint. Returns reviews for a published product.

## POST /products/:id/reviews

Authentication required. CUSTOMER role required.

Request:

{
"rating": 5,
"comment": "Beautiful handmade work."
}

Each customer may review a product once. Ratings must be integers from 1 to 5.

---

# 13. ADMIN ORDER STATUS

## PATCH /orders/:id/status

Authentication required. ADMIN role required.

Request:

{
"status": "CONFIRMED"
}

---

# 14. AI NATURAL-LANGUAGE SEARCH

## POST /ai/search

Request:

{
"query": "traditional handmade gifts from Bihar under 1000",
"language": "en"
}

Response:

{
"success": true,
"data": {
"interpretedFilters": {
"state": "Bihar",
"maxPrice": 1000,
"keywords": [
"traditional",
"handmade",
"gifts"
],
"category": null
},
"productIds": [
"product-id-1",
"product-id-2"
]
}
}

Important:

AI search must NOT invent products.

The returned product IDs must correspond to real products in the database.

Recommended integration:

Customer query
→ AI search parser
→ structured filters
→ backend/database query
→ actual products
→ frontend

---

# 15. ORDERS

## POST /orders

Customer login is optional for the MVP.

Request:

{
"customerName": "Ananya Singh",
"phone": "9876543210",
"address": "Delhi, India",
"items": [
{
"productId": "product-id",
"quantity": 1
}
]
}

Response:

{
"success": true,
"data": {
"id": "order-id",
"status": "PLACED",
"totalAmount": 950,
"items": [
{
"productId": "product-id",
"quantity": 1,
"unitPrice": 950
}
]
}
}

The backend must calculate the order total using actual database product prices.

Do not trust a total supplied by the frontend.

---

## GET /orders/:id

Authentication or appropriate order access required.

Response:

{
"success": true,
"data": {
"id": "order-id",
"status": "PLACED",
"totalAmount": 950,
"items": []
}
}

---

# 13. ORDER STATUS

Allowed statuses:

PLACED
CONFIRMED
SHIPPED
DELIVERED
CANCELLED

---

# 14. ERROR CODES

Recommended standard codes:

VALIDATION_ERROR
UNAUTHORIZED
FORBIDDEN
NOT_FOUND
CONFLICT
AI_ERROR
AI_VALIDATION_ERROR
STT_ERROR
TRANSLATION_ERROR
SEARCH_ERROR
DATABASE_ERROR
INTERNAL_ERROR

Example:

{
"success": false,
"error": {
"code": "VALIDATION_ERROR",
"message": "Price must be positive"
}
}

---

# 15. SECURITY RULES

Never expose:

AI API keys
STT API keys
JWT secrets
DATABASE credentials

Frontend must not connect directly to PostgreSQL.

Frontend must not directly call AI providers.

Backend validates all important inputs.

AI output must be validated before database persistence.

---

# 16. GOLDEN API FLOW

Artisan:

Photo + Voice
→ voice-to-text
→ generate-product
→ AI questions
→ final information
→ price recommendation
→ draft product
→ artisan review
→ publish

Customer:

Natural language query
→ AI search
→ structured filters
→ database
→ real products
→ product details
→ demo order

---

# 17. CONTRACT STATUS

This API contract is LOCKED for MVP development.

Changes require Team Lead coordination.

Owner:

Shivank — API integration coordinator

Backend implementation:

Mayank

Frontend implementation:

Namita

AI implementation:

Suraj / Shiva / Shivani
