# Anurag Gautam — Personal Portfolio

A complete, responsive personal portfolio built with React, TypeScript, and Vite. It presents Anurag's journey through farming, professional cricket, and software engineering, with a Markdown-powered technical writing archive. The site supports light/dark themes and is configured for GitHub Pages.

## Pages and content

- **Home** — personal positioning, selected writing, the farming/cricket/software mindset, and direct contact links.
- **Must Read** — the single archive for all technical and personal essays, with search and category filters. Each article has its own route.
- **Passions** — farming, professional cricket, technology, travel, sport, and deep technical learning.
- **My Story** — the journey from professional cricket into software engineering, selected experience across Cisco and Microsoft projects, engineering principles, and contact details.

The content is populated. There are no biography prompts or starter-post placeholders. The articles are original portfolio essays based on the experiences and technical interests shared by Anurag; review them for personal voice and factual accuracy before publishing.

## Run locally

Requires Node.js 20 or later and npm.

```bash
npm install
npm run dev
```

Create a production build and preview it locally:

```bash
npm run build
npm run preview
```

## Add or edit a writing post

Create a Markdown file inside `src/posts/`. Example:

```md
---
title: "A useful title"
date: "2026-10-20"
category: "Engineering"
excerpt: "A concise description shown in the archive."
---

Write the article in Markdown.
```

Supported frontmatter fields are `title`, `date`, `category`, and `excerpt`. Use `YYYY-MM-DD` for dates. All Markdown files in `src/posts/` are included automatically at build time and appear in the same Must Read archive.

## Contact details

- Email: `note2anurag@outlook.com`
- Phone: `+91 92627 48948`

These details are intentionally public in the site because they were explicitly provided for this purpose. Remove or change them in `src/App.tsx` if that changes.

## Deploy to GitHub Pages

1. Create an empty GitHub repository, for example `anurag-portfolio`.
2. Extract this project folder and push its contents (not an extra enclosing ZIP folder) to the repository's `main` branch.
3. In GitHub, open **Settings → Pages** and select **GitHub Actions** as the deployment source.
4. The workflow at `.github/workflows/deploy.yml` installs dependencies, builds the Vite app, and deploys `dist/` whenever you push to `main`. You can also start it manually from **Actions** using **Run workflow**.
5. Wait for the workflow to finish. The published URL will appear in the deployment job and under **Settings → Pages**.

The Vite configuration sets the base path to `/<repository-name>/` during GitHub Actions builds, which suits a normal project repository. For a user/organisation site whose repository is named `USERNAME.github.io`, change `vite.config.ts` to `base: "/"` before deploying. The included `public/404.html` supports client-side routes on GitHub Pages.

## Repository map

```text
src/
  App.tsx                 Pages, navigation, and portfolio content
  styles.css              Responsive styling and themes
  posts/*.md              All articles in the Must Read archive
  main.tsx                React entry point
public/
  404.html                GitHub Pages client-side route fallback
  .nojekyll               Prevents Jekyll processing
.github/workflows/
  deploy.yml              Build and GitHub Pages deployment
index.html                Page title and search/social metadata
vite.config.ts            Vite configuration and Pages base path
```

## Before publishing

- Review the wording and ensure each statement reflects your preferred public story.
- Confirm the GitHub repository name and, for a `USERNAME.github.io` repository, set the Vite base path to `/`.
- Consider adding a GitHub profile URL or professional network profile if you want one displayed. No social profile URL has been invented.

This is a static site: it does not require a backend, database, API keys, or environment secrets. Theme preference is stored in the visitor's browser.
