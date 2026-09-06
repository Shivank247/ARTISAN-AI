# ARTISAN AI — FILE ORDER BEFORE VIBE CODING

Version: 1.0
Status: LOCKED

---

# 1. PURPOSE

Every developer may use a different AI coding tool.

Therefore every AI coding assistant must follow the same reading order.

Do not immediately ask the AI:

"Build the whole application."

The AI must first understand the project.

---

# 2. REQUIRED READING ORDER

STEP 1

Read:

README.md

Understand:

project
problem
solution
architecture
technology

---

STEP 2

Read:

docs/TEAM_STRUCTURE.md

Understand:

who owns what
which folders belong to the developer
which files are shared

---

STEP 3

Read:

docs/10_DAY_MVP_SCOPE.md

Understand:

what must be built
what should be built
what is optional
what must not be built

---

STEP 4

Read:

docs/API_CONTRACT.md

Understand:

endpoints
methods
requests
responses
authentication
errors

---

STEP 5

Read:

docs/DATABASE_SCHEMA.md

Understand:

models
fields
relationships
status values

---

STEP 6

Read:

docs/AI_CONTRACT.md

Understand:

AI inputs
AI outputs
questions
translation
search
pricing
validation
confidence

---

STEP 7

Read:

docs/GIT_WORKFLOW.md

Understand:

branch
commit
push
PR
merge
security

---

STEP 8

Inspect the repository.

Do not assume files exist.

Check the actual current project structure.

---

STEP 9

Inspect the developer's assigned folder.

Only then plan implementation.

---

# 3. DEVELOPMENT METHOD

READ

↓

INSPECT

↓

UNDERSTAND

↓

CHECK CONTRACTS

↓

PLAN

↓

MAKE SMALL CHANGE

↓

TEST

↓

REVIEW DIFF

↓

COMMIT

↓

PUSH

---

# 4. AI CODING RULE

The AI coding assistant must NOT:

* rewrite the whole project
* create unnecessary architecture
* create duplicate services
* invent API endpoints
* invent database fields
* rename shared contract fields
* move another developer's files without coordination
* add unnecessary packages
* expose API keys
* change architecture without approval

---

# 5. BEFORE MODIFYING A SHARED FILE

If the AI wants to modify:

docs/API_CONTRACT.md
docs/DATABASE_SCHEMA.md
docs/AI_CONTRACT.md
database/prisma/schema.prisma
shared provider architecture

STOP.

Ask Shivank for coordination.

---

# 6. ROLE-SPECIFIC READING

## Namita

Primary:

README.md
TEAM_STRUCTURE.md
10_DAY_MVP_SCOPE.md
API_CONTRACT.md
GIT_WORKFLOW.md

Then inspect:

frontend/

---

## Mayank

Primary:

README.md
TEAM_STRUCTURE.md
10_DAY_MVP_SCOPE.md
API_CONTRACT.md
DATABASE_SCHEMA.md
GIT_WORKFLOW.md

Then inspect:

backend/
database/

---

## Suraj

Primary:

README.md
TEAM_STRUCTURE.md
10_DAY_MVP_SCOPE.md
API_CONTRACT.md
DATABASE_SCHEMA.md
AI_CONTRACT.md
GIT_WORKFLOW.md

Then inspect:

ai/src/product/
ai/src/prompts/
ai/src/validation/
ai/src/providers/

---

## Shiva

Primary:

README.md
TEAM_STRUCTURE.md
10_DAY_MVP_SCOPE.md
API_CONTRACT.md
AI_CONTRACT.md
GIT_WORKFLOW.md

Then inspect:

ai/src/voice/
ai/src/translation/

---

## Shivani

Primary:

README.md
TEAM_STRUCTURE.md
10_DAY_MVP_SCOPE.md
API_CONTRACT.md
DATABASE_SCHEMA.md
AI_CONTRACT.md
GIT_WORKFLOW.md

Then inspect:

ai/src/search/
ai/src/pricing/

---

## Shivank

Primary:

All shared documentation.

Especially:

API_CONTRACT.md
DATABASE_SCHEMA.md
AI_CONTRACT.md
GIT_WORKFLOW.md
10_DAY_MVP_SCOPE.md

Then inspect all project layers when integrating.

---

# 7. FINAL RULE

The AI assistant is an implementation assistant.

It is NOT the architecture authority.

The shared contracts and Team Lead decisions are authoritative.

If an AI suggests a better architecture:

Do not automatically implement it.

First check its impact.

If it affects another developer:

STOP.

Coordinate.

Document.

Then implement.
