# Wiki Team Onboarding Guide

Welcome to the **Build the Pyramid Wiki** team! You do not need coding experience or any local setup on your computer—everything runs in your browser using a cloud AI agent connected to GitHub.

---

## Step 1: Get Added to the Repo & Preview Access

1. Create a free account at [github.com](https://github.com) if you don't already have one.
2. Send your **GitHub username** (and the email address on your GitHub account) to **Suna (`@abran-labs`)** on Discord.
3. Accept the collaboration invite sent to your GitHub account (or check `https://github.com/abran-labs/build-the-pyramid-wiki/invitations`).

---

## Step 2: Connect Your Cloud AI Agent to GitHub

Pick whichever AI subscription you use in your browser:

### Option A: ChatGPT (Codex / Work Mode)

1. Open [chatgpt.com](https://chatgpt.com) (or the ChatGPT desktop app) and switch to **Codex / Work** mode.
2. Open **Plugins / Connectors** and connect **GitHub** (authorize write access when prompted).
3. Select the `abran-labs/build-the-pyramid-wiki` repository and choose the `dev` branch as your starting branch.

### Option B: Claude (Claude Code on the Web)

1. Open [claude.ai](https://claude.ai) and switch to **Code** (`claude.ai/code`).
2. Connect your **GitHub** account when prompted.
3. Select `abran-labs/build-the-pyramid-wiki` and start from the `dev` branch.

---

## Step 3: Make Edits & View Your Live Preview

1. Tell the AI what you want to add or change in plain English (for example: *"Update the Items page description"* or *"Add a guide section explaining how Luck passes work on the Pets page"*).
2. The AI automatically reads `AGENTS.md`, works on `dev` (or a `wiki/<topic>` branch), runs checks, and pushes the changes to GitHub.
3. After each push, the AI will give you a preview link:
   - **`dev` branch preview:** `https://dev.build-the-pyramid-wiki.pages.dev`
   - **Topic branch preview:** `https://wiki-<topic>.build-the-pyramid-wiki.pages.dev`
4. Open the preview link ~15–30 seconds after the AI pushes. Sign in through **Cloudflare Access** to see your changes live without affecting the public wiki (`https://build-the-pyramid.abran.dev`).

---

## Step 4: Need Game Numbers or Assets?

- **Never guess or make up pet odds, weights, or stats.** Those come directly from the game's code.
- If you need new pet stats, item stats, icons, or game mechanics that aren't in the wiki repo yet, message **Suna** on Discord and request them.
- Once your changes on `dev` look good on the preview site, let **Suna** know so they can be reviewed, merged into `master`, and published to the live wiki.
