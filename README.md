Anurag Gautam — Personal Portfolio

A responsive personal portfolio and technical writing archive built with React, TypeScript, and Vite. The site presents Anurag's engineering approach, personal journey, interests, and technical writing, with light/dark themes and GitHub Pages deployment.

Live site: https://note2anurag.github.io/anurag-portfolio/

About this portfolio

The portfolio is built around three ideas:

- Engineering: Application architecture, frontend development, enterprise workflows, integrations, testing, reliability, and AI-enabled capabilities.
- The person behind the work: A personal journey shaped by family responsibilities, education, competitive cricket, self-directed learning, and a transition into software engineering.
- Technical writing: A single archive for articles and explanations about engineering decisions, debugging, architecture, and technology.

Pages

- Home — Engineering positioning, a short introduction, recent writing, and contact details.
- Must Read — A searchable, category-filtered archive of Markdown articles. Each article has its own route.
- Passions — Cricket, technology, travel, sport, technical learning, and an interest in exploring AI applications in agriculture.
- My Story — Personal background, the transition into software, engineering interests, working principles, and future learning directions.

Technology stack

- React
- TypeScript
- Vite
- Lucide React icons
- Marked for Markdown rendering
- Mermaid for diagrams embedded in articles
- CSS custom properties for light and dark themes
- GitHub Actions and GitHub Pages for deployment

Run locally

Requirements: Node.js 20 or later and npm.

Clone the repository:

git clone https://github.com/note2anurag/anurag-portfolio.git
cd anurag-portfolio

Install dependencies:

npm install

Start the development server:

npm run dev

Create a production build:

npm run build

Preview the production build:

npm run preview

Add or edit a writing article

Create a Markdown file inside "src/posts/", for example "src/posts/my-engineering-notes.md".

Use this frontmatter format:

---
title: "A useful engineering lesson"
date: "2026-10-20"
category: "Engineering"
excerpt: "A concise description shown in the writing archive."
---

Write the article in Markdown.

You can include headings, lists, links, code blocks, and Mermaid diagrams.

Supported frontmatter fields are "title", "date", "category", and "excerpt".

Use "YYYY-MM-DD" for dates. The application loads Markdown files from "src/posts/" at build time and includes them in the Must Read archive.

Keep articles grounded in actual experience, explain technical trade-offs where useful, and distinguish completed work from experiments or future interests.

Project structure

anurag-portfolio/
├── .github/
│   └── workflows/
│       └── deploy.yml
├── public/
│   ├── 404.html
│   └── .nojekyll
├── src/
│   ├── posts/
│   │   └── *.md
│   ├── App.tsx
│   ├── main.tsx
│   └── styles.css
├── index.html
├── package.json
├── tsconfig.app.json
├── tsconfig.json
├── tsconfig.node.json
└── vite.config.ts

Deployment to GitHub Pages

The repository includes a GitHub Actions workflow at ".github/workflows/deploy.yml".

When code is pushed to "main", the workflow:

1. Checks out the repository.
2. Sets up Node.js.
3. Installs npm dependencies.
4. Builds the Vite application.
5. Uploads the "dist/" directory.
6. Deploys the build to GitHub Pages.

The workflow can also be started manually from the GitHub Actions tab.

In repository settings, ensure Settings → Pages → Build and deployment → Source is set to GitHub Actions.

The existing "vite.config.ts" derives the base path from the GitHub Actions repository name. For this repository, the project site is published under "/anurag-portfolio/". Preserve this configuration when deploying to the current URL.

Contact

- Email: note2anurag@outlook.com
- Phone: +91 92627 48948

These details are displayed publicly by design. Remove or update them if you no longer want them published.

Editorial principles

- Represent personal history accurately.
- Distinguish professional experience from personal interests.
- Present future ambitions as interests, not completed achievements.
- Describe engineering work in terms of problems, decisions, trade-offs, and outcomes.
- Prefer useful technical explanations over publishing for volume alone.

---

Built thoughtfully with React, TypeScript, and Vite.
