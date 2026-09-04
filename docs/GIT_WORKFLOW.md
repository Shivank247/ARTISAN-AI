# GIT WORKFLOW

Stable branch: `main`

Feature branches:
- feature/shivank-integration
- feature/namita-frontend
- feature/mayank-backend
- feature/suraj-ai
- feature/shiva-ai
- feature/shivani-ai

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
