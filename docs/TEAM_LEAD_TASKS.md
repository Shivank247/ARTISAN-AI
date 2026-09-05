# ARTISAN AI — TEAM LEAD TASKS

Version: 1.0
Owner: Shivank

---

# 1. PRIMARY RESPONSIBILITY

Make six developers behave like one engineering team.

The Team Lead is responsible for:

Git
Architecture
Shared contracts
Integration
Testing
Deployment
Final demo

---

# 2. DAILY CHECKLIST

Every day:

[ ] Pull latest main

[ ] Check branches

[ ] Check PRs

[ ] Check blockers

[ ] Check contract changes

[ ] Check security

[ ] Test important integration

[ ] Review merged work

[ ] Keep documentation updated

[ ] Verify golden flow

---

# 3. DAILY TEAM QUESTIONS

Ask every developer:

1. What did you finish?
2. What are you working on today?
3. Are you blocked?
4. Did you change a shared contract?
5. Did you push your branch?

---

# 4. CONTRACT MANAGEMENT

Protect:

API_CONTRACT.md
DATABASE_SCHEMA.md
AI_CONTRACT.md

If a developer wants to change one:

STOP

↓

Understand reason

↓

Check impact

↓

Update contract

↓

Inform affected developers

↓

Implement

↓

Test

---

# 5. INTEGRATION ORDER

1. Repository
2. Documentation
3. Database
4. Backend
5. AI services
6. Frontend
7. Artisan flow
8. Customer marketplace
9. AI search
10. Orders
11. Admin
12. Deployment
13. Final testing

---

# 6. DATABASE CHECK

When Mayank finishes the initial database:

npx prisma validate

Then:

npx prisma studio

Verify:

Users
Artisans
Products
Orders
OrderItems
Reviews
AIGenerations

---

# 7. BACKEND CHECK

Test:

Authentication
Artisan profile
Products
AI endpoints
Orders
Admin

Use an API testing tool.

---

# 8. AI CHECK

Test independently:

Image
+
Text
↓
AI
↓
Structured JSON

Then:

Voice
↓
STT
↓
Text
↓
AI
↓
Structured JSON

Then:

Customer query
↓
AI search
↓
Structured filters
↓
Database
↓
Real products

---

# 9. FRONTEND CHECK

Verify:

Frontend request
↓
Correct endpoint
↓
Backend
↓
AI/database
↓
Correct response
↓
Frontend rendering

Do not rewrite multiple layers before identifying the failure boundary.

---

# 10. GOLDEN ARTISAN TEST

Personally verify:

1. App starts
2. Language selection
3. Artisan login
4. Artisan onboarding
5. Product photo
6. Voice recording
7. STT
8. AI understanding
9. Catalogue generation
10. AI questions
11. Artisan answers
12. Price recommendation
13. Location can be skipped
14. Listing editing
15. Artisan approval
16. Product publication

---

# 11. GOLDEN CUSTOMER TEST

Verify:

1. Marketplace opens
2. Products display
3. AI search works
4. Search uses actual database
5. Product details work
6. Meet the Artisan works
7. Demo order works

---

# 12. SECURITY CHECK

Before merge:

Search for:

API_KEY
SECRET
PASSWORD
TOKEN
DATABASE_URL

Ensure:

.env is not committed.

No provider credentials appear in frontend.

---

# 13. PR REVIEW

Check:

Architecture
Contracts
Security
Tests
Unrelated changes
Unnecessary packages
Breaking changes
Correct ownership

---

# 14. MERGE RULE

Developers:

feature branch
↓
Pull Request
↓
Shivank review
↓
main

main remains stable.

---

# 15. DAY 9 FREEZE

On Day 9:

Stop major architecture changes.

Focus on:

bugs
integration
AI failures
API failures
database failures
voice failures
search failures
UI failures

---

# 16. FINAL DEMO

Use:

fresh browser
demo account
real AI
seed data
stable environment

Have backup screenshots/video if necessary.

Primary demo should use the working application.

---

# 17. TEAM LEAD SUCCESS

Success means:

Namita builds frontend without guessing APIs.

Mayank builds backend without guessing database structure.

Suraj builds AI without guessing product requirements.

Shiva builds voice/language without creating duplicate AI architecture.

Shivani builds search/pricing without inventing products.

All five merge into one stable application.

---

# 18. GOLDEN RULE

Before every change ask:

"Will this affect another developer's code, API contract, database schema, AI contract, or final demo?"

If YES:

STOP
Understand
Discuss
Document
Implement

If NO:

Implement
Test
Review
Commit
Push
