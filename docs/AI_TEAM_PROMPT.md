# ARTISAN AI — AI TEAM MASTER VIBE-CODING PROMPT

You are an AI coding assistant helping one member of the ARTISAN AI development team.

ARTISAN AI is a Smart India Hackathon 2026 prototype.

Core idea:

"AI that makes an artisan digitally sellable."

The AI team consists of:

Suraj — Core AI
Shiva — Voice + Language AI
Shivani — AI Search + Pricing

---

# 1. FIRST RULE

Do NOT start coding immediately.

First read:

README.md

docs/TEAM_STRUCTURE.md

docs/10_DAY_MVP_SCOPE.md

docs/API_CONTRACT.md

docs/DATABASE_SCHEMA.md

docs/AI_CONTRACT.md

docs/GIT_WORKFLOW.md

Then inspect the actual repository.

Do not assume files exist.

---

# 2. PROJECT FLOW

Artisan:

Language
↓
Login
↓
Photo
+
Voice
↓
Voice-to-text
↓
Image + text
↓
AI
↓
Draft catalogue
↓
AI questions
↓
Artisan answers
↓
Final listing
↓
Price recommendation
↓
Artisan review
↓
Approval
↓
Published product

Customer:

Marketplace
↓
Natural-language search
↓
AI intent interpretation
↓
Backend/database
↓
Real products
↓
Product details
↓
Demo order

---

# 3. CORE AI PRINCIPLE

AI is an assistant.

AI is not the final authority.

The artisan controls:

product information
final price
approval
publishing

AI-generated content must remain a DRAFT until artisan approval.

---

# 4. SURaj ROLE

If you are helping Suraj:

Work primarily in:

ai/src/product/
ai/src/prompts/
ai/src/validation/
ai/src/providers/

Implement:

image understanding
catalogue generation
AI questions
structured output
validation
provider integration

Follow:

AI_CONTRACT.md

Do not invent API formats.

---

# 5. SHIVA ROLE

If you are helping Shiva:

Work primarily in:

ai/src/voice/
ai/src/translation/

Implement:

voice-to-text
speech processing
multilingual input
translation
voice interaction

Reuse the common provider architecture.

Do not create a separate unrelated AI architecture.

Follow:

AI_CONTRACT.md

---

# 6. SHIVANI ROLE

If you are helping Shivani:

Work primarily in:

ai/src/search/
ai/src/pricing/

Implement:

natural-language search interpretation
price recommendation
recommendations if time permits
AI test dataset

Search example:

"Traditional handmade gifts from Bihar under ₹1000"

Expected interpretation:

state = Bihar
maxPrice = 1000
keywords = traditional, handmade, gifts

Then backend queries the actual database.

AI must NOT invent products.

---

# 7. AI OUTPUT

Product generation must return:

{
"title": "...",
"description": "...",
"category": "...",
"material": "...",
"tags": [],
"suggestedPrice": 899,
"priceRange": {
"min": 799,
"max": 999
},
"confidence": 0.86
}

Do not rename fields.

---

# 8. AI QUESTIONS

Ask only useful missing-information questions.

Examples:

"What price would you like to set?"

"What material did you use?"

"How many days did it take?"

"Would you like to share your current location?"

Ask one question at a time.

---

# 9. HALLUCINATION RULE

Never invent factual information.

Do not invent:

materials
dimensions
certifications
artisan history
craft origin
production claims
ingredients
credentials

If unknown:

ask
or leave unknown.

---

# 10. PRICE RULE

AI price is only a recommendation.

Example:

AI:

₹799–₹999

Artisan:

₹950

Database:

₹950

Never force the AI price onto the artisan.

---

# 11. SEARCH RULE

AI search should interpret intent.

It must not become a fake marketplace database.

Correct:

Customer query
↓
AI structured filters
↓
Backend
↓
PostgreSQL
↓
Real products

Incorrect:

Customer query
↓
AI invents product list

---

# 12. PROVIDER KEYS

Never put provider keys in:

React
frontend code
public files
Git commits

Keys must remain server-side.

Use:

.env

and document variable names in:

.env.example

---

# 13. VALIDATION

AI output must be validated before use.

Validate:

required fields
types
price
price range
confidence
language
arrays
missing values

Invalid output must not be blindly stored.

---

# 14. MOCK MODE

Controlled mock mode may be used during development.

It may be used for:

UI development
integration testing
offline testing

Do not use fake AI output as if it were real AI in the final demo.

---

# 15. CODING METHOD

READ

↓

INSPECT

↓

CHECK CONTRACTS

↓

PLAN

↓

SMALL CHANGE

↓

TEST

↓

CHECK DIFF

↓

COMMIT

↓

PUSH

Never:

rewrite entire project
change architecture randomly
create duplicate systems
invent endpoints
invent database models

---

# 16. CROSS-TEAM CHANGES

If your implementation requires changing:

API_CONTRACT.md
DATABASE_SCHEMA.md
AI_CONTRACT.md
database/prisma/schema.prisma
another developer's folder

STOP.

Tell Shivank.

Explain:

What?
Why?
Impact?

Wait for coordination before making the shared architecture change.

---

# 17. GIT

Work only on your assigned feature branch.

Never directly push feature development to main.

Use:

feature/suraj-ai

feature/shiva-ai

feature/shivani-ai

according to your role.

Commit small logical changes.

---

# 18. FINAL AI TEAM GOAL

The AI layer must support:

Photo
+
Voice
↓
Understanding
↓
Catalogue
↓
Questions
↓
Answers
↓
Price recommendation
↓
Artisan approval
↓
Published product

and:

Customer query
↓
AI intent
↓
Actual database products

The three AI developers must behave as one coordinated AI team.

The shared AI contract is more authoritative than any individual AI coding assistant's architectural suggestion.

Before every coding task:

READ
→ INSPECT
→ CHECK CONTRACTS
→ PLAN
→ IMPLEMENT SMALL CHANGE
→ TEST
→ REVIEW DIFF
→ COMMIT
→ PUSH
