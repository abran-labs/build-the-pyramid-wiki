---
name: git-workflow
description: >
  Branch, commit, push, preview, and open pull requests for Build the Pyramid
  Wiki. Use for any git operation, wiki edit workflow, branch selection, preview
  URL sharing, or pull request in this repository. Skip for owner-only live
  production publishing.
---

# Git Workflow

## Branches

| Branch | Role | Who merges |
|---|---|---|
| `master` | Production release branch | `@abran-labs` only (via PR + code-owner approval) |
| `dev` | Shared wiki staging branch | Wiki team (direct push for small edits, or PR from `wiki/<topic>`) |
| `wiki/<topic>` | Topic branch off `dev` | Wiki team opens PR into `dev` |

Never commit or push directly to `master`.

## Choose branch

1. Fetch latest refs:
   ```bash
   git fetch origin
   ```
2. Small isolated edit and nobody else is mid-edit on `dev` → work on `dev`:
   ```bash
   git switch dev
   git pull --ff-only origin dev
   ```
3. Multi-step page, new section, or concurrent team work → branch off `dev`:
   ```bash
   git switch -c wiki/<topic> origin/dev
   ```

## Verify + commit + push

Run checks before pushing code or markup changes:

```bash
bun test
bun run check
bun run build
```

Stage specific files (never `git add -A` or `git add .`) and use Conventional Commits (`feat(pets): ...`, `docs(items): ...`, `fix(home): ...`):

```bash
git add <paths>
git commit -m "feat(wiki): <summary>"
git push -u origin HEAD
```

## Live preview URL

Every push to `dev` or `wiki/<topic>` automatically builds and deploys a Cloudflare Pages preview (~15–30s after push), gated behind Cloudflare Access (GitHub login).

| Branch | Preview URL |
|---|---|
| `dev` | `https://dev.build-the-pyramid-wiki.pages.dev` |
| `wiki/<topic>` | `https://wiki-<topic>.build-the-pyramid-wiki.pages.dev` (slashes/underscores become `-`, lowercase) |

After every pushed batch of changes:
1. Give the contributor the exact preview URL for the current branch.
2. If your environment has a tool to open URLs in the user's browser, open the preview URL for them.
3. Tell them to wait ~15–30 seconds for the build action to finish and sign in with their GitHub account if prompted.

## Pull requests

- Topic branch ready → open PR into `dev` (never `master` unless `@abran-labs` asks for a release PR):
  ```bash
  gh pr create --base dev --head "wiki/<topic>" --title "<type>(<scope>): <summary>" --body "<summary and preview URL>"
  ```
- Only `@abran-labs` merges `dev` → `master` and publishes to the live site. Never run `bun run publish`.
