---
title: "AI summaries need a call policy before they need a better prompt"
date: "2026-10-16"
category: "AI Engineering"
excerpt: "Preventing repeated model calls starts with product behaviour, cache keys, and explicit freshness rules."
---

When a user opens an AI summary tab, switches away, and returns, should the application call the model again? If the answer is unclear, the implementation will often make the decision accidentally—through component mounting, effect dependencies, or a refetch default.

Before tuning prompts, define the product's call policy.

## Decide what makes a summary reusable

A cached result is useful only if the application can explain when it remains valid. Depending on the feature, a cache key might depend on the user, the period being summarised, the relevant source-data version, and the prompt or model version. Avoid a key so broad that one person's result can leak into another context, or so narrow that every render creates a new entry.

## Separate loading from generation

Opening a tab should not automatically mean generating a new summary. Model generation is an explicit operation with cost, latency, and failure modes. The UI should distinguish a cached summary, an in-progress request, a failed attempt, and a deliberate refresh.

A query cache can help with request deduplication and lifecycle management, while a server-side cache is often needed if results should survive navigation, reloads, or multiple clients. The correct choice depends on freshness, privacy, and persistence requirements.

## Prevent duplicate work

Common safeguards include:

- Reuse an in-flight request for the same cache key.
- Keep effect dependencies stable and avoid triggering generation as an incidental render side effect.
- Make refresh an explicit user action when appropriate.
- Apply sensible timeouts, cancellation where supported, and retry rules.
- Track generation status so multiple callers do not create competing jobs.

## Make freshness visible

A summary can become stale when its underlying data changes. Define what invalidates it: a new review period, updated evidence, a changed prompt version, or an explicit refresh. If the summary is evidence-backed, retaining the data version or generation timestamp can help explain why it looks the way it does.

## Measure the behaviour

Useful metrics include cache hit rate, generation latency, failures, duplicate requests, and the number of generations per user action. These reveal whether the feature behaves as intended rather than merely whether the model returned text.

The best prompt cannot compensate for an unclear product lifecycle. Decide when generation should happen, who owns that decision, and how the result stays fresh—then improve the prompt and response quality.
