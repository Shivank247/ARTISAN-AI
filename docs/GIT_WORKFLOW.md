# ARTISAN AI — GIT WORKFLOW

Version: 1.0
Status: LOCKED

---

# 1. REPOSITORY

One shared private GitHub repository:

ARTISAN-AI

The repository contains:

frontend
backend
database
ai
docs
tests
scripts

---

# 2. MAIN BRANCH

main = stable integrated project.

Never use main as a personal development branch.

Developers must not directly push feature work to main.

---

# 3. TEAM BRANCHES

Shivank:

feature/shivank-integration

Namita:

feature/namita-frontend

Mayank:

feature/mayank-backend

Suraj:

feature/suraj-ai

Shiva:

feature/shiva-ai

Shivani:

feature/shivani-ai

---

# 4. OWNERSHIP

Namita → frontend

Mayank → backend + database

Suraj → core AI

Shiva → voice + translation

Shivani → search + pricing

Shivank → integration + Git + architecture

---

# 5. START-OF-DAY WORKFLOW

Before starting:

git checkout main
git pull origin main

Then:

git checkout feature/<your-branch>

Then:

git merge main

Resolve any conflict before starting new work.

---

# 6. DEVELOPMENT WORKFLOW

READ

↓

INSPECT

↓

CHECK CONTRACTS

↓

PLAN

↓

MAKE SMALL CHANGE

↓

TEST

↓

CHECK git diff

↓

COMMIT

↓

PUSH

---

# 7. COMMIT

Use clear commits.

Example:

git add .

git commit -m "feat: add artisan product form"

Good commit prefixes:

feat:
fix:
docs:
chore:
refactor:
test:

---

# 8. PUSH

Push to your feature branch.

Example:

git push

First push:

git push -u origin feature/namita-frontend

---

# 9. PULL REQUEST

Developer:

feature branch
↓
push
↓
Pull Request
↓
Shivank review
↓
main

Only Shivank should normally merge feature PRs into main.

---

# 10. BEFORE PR

Check:

git status

git diff

Run relevant tests.

Check:

No secrets
No unrelated changes
No accidental files
No broken imports
No contract violations

---

# 11. CONTRACT CHANGES

If changing:

API_CONTRACT.md
AI_CONTRACT.md
DATABASE_SCHEMA.md

STOP.

Tell Shivank.

Explain:

What changed?
Why?
Who is affected?

Then update the contract and notify affected developers.

---

# 12. MERGE CONFLICT

If conflict occurs:

STOP.

Do not blindly choose:

ours

or:

theirs

Inspect both changes.

Especially for:

API_CONTRACT.md
AI_CONTRACT.md
DATABASE_SCHEMA.md
schema.prisma

Coordinate with affected developer and Shivank.

---

# 13. SECURITY

Never commit:

.env
API keys
passwords
tokens
DATABASE_URL
JWT secrets

Use:

.env.example

for variable names only.

---

# 14. DANGEROUS COMMANDS

Do not casually run:

git reset --hard

git clean -fd

npx prisma migrate reset

If an AI coding assistant recommends a destructive command:

STOP and review it.

---

# 15. DAILY TEAM REPORT

Every developer reports:

1. What did you finish?
2. What are you working on today?
3. Are you blocked?
4. Did you change a shared contract?
5. Did you push your branch?

---

# 16. RULE

One repository.

One main branch.

Separate feature branches.

Pull requests.

Team Lead integration.

Stable main.
