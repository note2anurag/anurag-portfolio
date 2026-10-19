Technical Publishing Guidelines

1. Purpose

This document defines the publishing standards for technical case studies in this portfolio.

The goal is to demonstrate engineering judgment through real problems, architecture, implementation, trade-offs, testing, and verified outcomes.

These guidelines are the source of truth for creating and reviewing future posts.

2. Repository Organization

- "docs/engineering-case-study-template.md" — canonical article template.
- "docs/publishing-guidelines.md" — canonical editorial rules.
- "src/posts/" — published Markdown articles.

Keep templates and editorial documentation outside "src/posts/" so they are not accidentally published as articles.

3. Non-Negotiable Rules

Every article must:

1. Explain a specific engineering problem.
2. Describe the relevant context and constraints.
3. Explain the chosen approach and the reasoning behind it.
4. Distinguish implemented behavior from proposals and future work.
5. Support technical claims with code, architecture, tests, observations, or clearly stated reasoning where appropriate.
6. Disclose important limitations and unverified assumptions.
7. Avoid invented metrics, fabricated test results, and unsupported impact claims.
8. Remove confidential company information, credentials, tokens, private URLs, customer data, and sensitive internal details.
9. Use the existing Markdown conventions supported by the portfolio.
10. Include accurate metadata consistent with the existing published posts.

4. Standard Article Structure

Use "docs/engineering-case-study-template.md" as the starting point.

The core narrative should cover:

- Problem
- Context and constraints
- Design and engineering decisions
- Implementation
- Testing and validation
- Results and limitations

Architecture diagrams, failure-mode tables, lessons learned, related articles, and future improvements should be included when they add value.

Do not add sections solely to make an article longer.

Do not remove a core section merely to shorten the article. If a section is not applicable, explain the relevant constraint elsewhere or omit it only when the article remains technically complete.

5. Evidence and Accuracy

Use these distinctions consistently:

- Implemented: The behavior exists in the described codebase.
- Verified: A test, inspection, or reproducible observation supports the claim.
- Measured: A result was obtained using a stated measurement method.
- Proposed: The design has been recommended but is not implemented.
- Planned: The improvement is intended but has not been completed.
- Unknown: Available evidence does not establish the answer.

Do not describe a proposed design as implemented.

Do not describe a test as passing unless it was actually run and passed.

When discussing limitations, explain what the current solution does not guarantee.

6. Code and Diagrams

- Prefer short, relevant code excerpts over large code dumps.
- Explain why the code matters, not just what each line does.
- Label simplified examples and pseudocode clearly.
- Never include credentials, real access tokens, private keys, or sensitive production configuration.
- Use Mermaid diagrams when they clarify architecture, data flow, or sequence.
- Ensure diagrams reflect the described implementation rather than an idealized future design.
- Keep diagrams readable on mobile screens.

7. Writing Style

- Use clear, direct technical language.
- Prefer specific titles over vague titles.
- Explain acronyms on first use when readers may not know them.
- Avoid generic introductions and repetitive conclusions.
- Explain trade-offs rather than claiming a solution is universally best.
- Separate facts, personal engineering judgments, and future recommendations.
- Keep the article focused on one main engineering problem.

8. Metadata and File Naming

Every post must follow the metadata conventions used by existing posts.

Use a descriptive, lowercase, hyphen-separated filename, for example:

"evidence-before-generation.md"

Before introducing new metadata fields or changing category conventions, inspect the current post loader and existing articles to confirm compatibility.

Do not assume a new frontmatter field will automatically be rendered by the application.

9. Publishing Workflow

1. Create a new Markdown file under "src/posts/".
2. Copy the canonical template into the new file.
3. Replace all placeholders and remove irrelevant example material.
4. Verify technical accuracy, diagrams, code, links, and metadata.
5. Review for confidential or sensitive information.
6. Commit the file to the repository.
7. Check the GitHub Actions build and deployment result.
8. Open the live article and verify formatting, links, and navigation.
9. Fix any issues before considering the article published.

10. Template Change Policy

The canonical template should evolve deliberately.

When proposing a template change:

1. Identify a recurring problem with the current template.
2. Explain how the proposed change improves article quality or consistency.
3. Update the canonical template once.
4. Update these guidelines if the publishing rules change.
5. Apply the change to new articles going forward.
6. Update older articles only when the improvement materially benefits them.

Do not modify the canonical template just to accommodate one unusual article. Prefer article-specific adaptations unless the improvement is broadly reusable.

11. Final Quality Checklist

Before publishing, confirm:

- [ ] The title describes the actual engineering topic.
- [ ] Metadata matches existing portfolio conventions.
- [ ] The problem and constraints are clear.
- [ ] The design decisions and trade-offs are explained.
- [ ] Code and diagrams accurately represent the described system.
- [ ] Implementation status is explicit.
- [ ] Testing claims are truthful.
- [ ] Results are supported by evidence.
- [ ] Limitations and future work are distinguished.
- [ ] Links and formatting work on mobile.
- [ ] No confidential or sensitive information is exposed.
- [ ] The article builds and renders correctly in the deployed portfolio.

12. Scope of These Guidelines

These rules govern editorial consistency. They do not replace code review, security review, testing, or the application's actual rendering requirements.

When a guideline conflicts with the existing portfolio implementation, verify the implementation before changing application code or introducing new content conventions.
