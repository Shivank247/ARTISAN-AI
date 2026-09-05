# ARTISAN AI — TEAM STRUCTURE

Version: 1.0
Status: LOCKED

---

# 1. TEAM

Six members:

1. Shivank — Team Lead + Integration
2. Namita — Frontend
3. Mayank — Backend + Database
4. Suraj — Core AI
5. Shiva — Voice + Language AI
6. Shivani — AI Search + Pricing

---

# 2. SHIVANK

Role:

Team Lead
Git Manager
Architecture Coordinator
Integration Developer
Testing Coordinator
Deployment Coordinator

Branch:

feature/shivank-integration

Owns:

docs/
tests/
scripts/
README.md
.gitignore
.env.example
project configuration
deployment configuration
integration work

Does NOT normally own:

frontend/src/
backend/src/
ai/src/
database/prisma/

---

# 3. NAMITA

Role:

Frontend Developer

Branch:

feature/namita-frontend

Owns:

frontend/

Responsibilities:

React
Vite
UI/UX
Responsive design
Artisan UI
Customer marketplace UI
Admin UI
Frontend API integration
Frontend validation

Must follow:

API_CONTRACT.md

Must not:

call AI providers directly
access database directly
expose API keys

---

# 4. MAYANK

Role:

Backend + Database Developer

Branch:

feature/mayank-backend

Owns:

backend/
database/

Responsibilities:

Node.js
Express
API
Authentication
Authorization
Prisma
PostgreSQL
Product APIs
Artisan APIs
Orders
Backend validation
Database migrations
Seed data

Must follow:

API_CONTRACT.md
DATABASE_SCHEMA.md

---

# 5. SURAJ

Role:

Core AI Developer

Branch:

feature/suraj-ai

Owns:

ai/src/product/
ai/src/prompts/
ai/src/validation/
ai/src/providers/

Responsibilities:

Image understanding
Product catalogue generation
AI questions
AI prompts
AI output validation
AI provider integration

Must follow:

AI_CONTRACT.md
API_CONTRACT.md

---

# 6. SHIVA

Role:

Voice + Language AI Developer

Branch:

feature/shiva-ai

Owns:

ai/src/voice/
ai/src/translation/

Responsibilities:

Voice-to-text
Speech processing
Multilingual input
Translation
Voice interaction logic

Works with Suraj to reuse the common AI provider architecture.

Must follow:

AI_CONTRACT.md

---

# 7. SHIVANI

Role:

AI Search + Pricing Developer

Branch:

feature/shivani-ai

Owns:

ai/src/search/
ai/src/pricing/

Responsibilities:

Natural-language search interpretation
Price recommendation
Recommendations if time permits
AI testing dataset
Search testing

Must follow:

AI_CONTRACT.md
API_CONTRACT.md
DATABASE_SCHEMA.md

AI search must return structured intent or real product IDs.

It must not invent products.

---

# 8. SHARED PROVIDER LAYER

Location:

ai/src/providers/

Primary coordination:

Suraj

Used by:

Suraj
Shiva
Shivani

Do not create multiple unrelated provider architectures.

---

# 9. SHARED CONTRACTS

Location:

docs/

Coordinator:

Shivank

Critical contracts:

API_CONTRACT.md
DATABASE_SCHEMA.md
AI_CONTRACT.md

---

# 10. OWNERSHIP RULE

Do not let everyone work on everything.

If a developer needs to cross into another developer's area:

1. Explain why.
2. Coordinate with owner.
3. Check impact.
4. Make the smallest necessary change.
5. Test.
6. Document if required.

---

# 11. INTEGRATION MODEL

Namita
+
Mayank
+
Suraj
+
Shiva
+
Shivani

↓

Shivank

↓

Integrated application

---

# 12. TEAM PRINCIPLE

The goal is not five independent features.

The goal is one working application.

Every developer is responsible for their layer.

Shivank is responsible for making those layers work together.
