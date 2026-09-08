# GIT WORKFLOW

Stable branch: `main`

Feature branches:
- feature/shivank-integration
- feature/namita-frontend
- feature/mayank-backend
- feature/suraj-ai
- feature/shiva-ai
- feature/shivani-ai# FILE ORDER BEFORE VIBE-CODING

Before asking an AI coding assistant to modify code:
1. README.md
2. docs/API_CONTRACT.md
3. docs/AI_CONTRACT.md
4. docs/DATABASE_SCHEMA.md
5. docs/10_DAY_MVP_SCOPE.md
6. docs/GIT_WORKFLOW.md
7. Relevant source files/folders

If the tool can inspect the whole repository, let it inspect it.
Do not start by asking the AI to build the whole application.
First inspect → understand → plan → make a small change → test.

This project intentionally does NOT use AGENTS.md.


Before work:
```bash
git checkout main
git pull origin main
git checkout feature/<your-branch>
git merge main
```

Commit:
```bash
git status
git add .
git commit -m "feat: clear description"
git push
```

First push:
```bash
git push -u origin feature/<your-branch>
```

Merge: Feature branch → Pull Request → main.

Never directly push feature work to main.
If a conflict affects shared contracts/schema, stop and ask Shivank.
