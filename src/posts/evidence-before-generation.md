---
category: AI Engineering
date: 2026-10-19
excerpt: How evidence normalization, provenance, deterministic selection, and guarded generation make AI-written summaries more inspectable.
title: Evidence Before Generation: A Traceable AI Writing Pipeline
---

> **The core design principle:** the application decides what evidence
> is available to the model. The model synthesizes that evidence; it
> does not retrieve directly from application source systems.

The most visible part of an AI writing feature is the generated
paragraph. The hardest engineering work happens before and after that
paragraph.

A model can produce fluent prose from almost any input. That does not
mean the application controlled what the model saw, preserved where
information came from, or checked whether the output was supported. I
explored this problem by building an evidence-grounded generation
pipeline that makes retrieval, filtering, organization, provenance, and
context limits explicit in application code.

This is an engineering case study---not a claim that the system is
hallucination-proof. It provides **partial traceability and
deterministic controls**, while leaving claim-level factual verification
as a future improvement.

## The pipeline at a glance

``` text
Application source systems
          ↓
     Source adapters
          ↓
   Normalized evidence
          ↓
 Quality / privacy filtering
          ↓
 Aspect classification
          ↓
   Output-specific routing
          ↓
 Ranking, limits and tags
          ↓
    Generation context
          ↓
    Guarded generator
          ↓
    Provider adapter
          ↓
     Model response
          ↓
 Structured parsing + validation
          ↓
 ┌──────────────────┬───────────────────┐
 │ Generated content│ Evidence snapshot │
 └──────────────────┴───────────────────┘
          ↓
       API / UI
```

The important architectural decision was to avoid asking the LLM to own
every step. The application has better access to source semantics,
status rules, authorization context, and selection policy. The model's
role is narrower: synthesize the evidence it receives.

## 01 --- Normalize source data before generation

Application records are designed for transactions and queries, not
necessarily for writing. One source may expose a status field, another
free text, and another dates or numeric metadata. Sending raw records
directly to a model makes one probabilistic step responsible for
understanding schemas, deciding relevance, interpreting status, removing
boilerplate, and writing prose.

I introduced a normalized evidence representation:

``` ts
type EvidenceRecord = {
  sourceType: string;
  sourceRef: string;
  text: string;
  field?: string;
  createdAt?: string;
  metadata?: Record<string, unknown>;
};
```

Source adapters query their systems, apply user and time-window filters,
select eligible fields, construct evidence text, attach source
references, and preserve useful metadata.

This boundary also creates a deliberate place to decide what belongs in
the generation input---and what should be excluded, including irrelevant
operational metadata or sensitive information. Normalization has a
trade-off: it can discard source-specific details, so the evidence
contract needs careful design and versioning.

## 02 --- Clean and classify evidence deterministically

Before evidence reaches the model, the pipeline removes obvious
low-value material with deterministic preprocessing:

-   Empty text and excess whitespace
-   Known placeholders and known boilerplate
-   Repeated text
-   Evidence that cannot be ranked or used by the selected output
    profile

A simplified example of the filtering approach:

``` ts
function filterEvidence(items: EvidenceRecord[]): EvidenceRecord[] {
  const seen = new Set<string>();

  return items
    .map((item) => ({
      ...item,
      text: normalizeWhitespace(item.text),
    }))
    .filter((item) => item.text.length > 0)
    .filter((item) => !isPlaceholder(item.text))
    .filter((item) => !isKnownBoilerplate(item.text))
    .filter((item) => {
      const key = `${item.sourceType}:${item.text}`;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
}
```

This is not semantic deduplication or a general quality model. It is a
transparent, testable way to handle predictable data-quality cases
without spending model calls asking the LLM to ignore obvious noise.

The pipeline then classifies evidence into aspects or topics using
keyword matching, source fields, source-type defaults, and explicit
metadata hints. These labels are **routing and ranking signals**, not
authoritative facts. Rule-based classification is inexpensive and
inspectable, but it can misclassify text.

## 03 --- Treat selection as application policy

Different generated outputs need different evidence. An output profile
can define accepted source types, preferred aspects, strictness,
evidence limits, and generation guidance.

The ranker combines signals such as:

-   Recency
-   Source weighting
-   Alignment with the requested aspect
-   Presence of useful metrics

It then applies output-specific limits and assigns tags to the selected
evidence.

``` ts
function selectEvidence(
  items: EvidenceRecord[],
  policy: SelectionPolicy,
): EvidenceRecord[] {
  return items
    .map((item) => ({ item, score: score(item, policy) }))
    .sort((a, b) => b.score - a.score)
    .slice(0, policy.maxItems)
    .map(({ item }, index) => ({
      ...item,
      tag: `E${index + 1}`,
    }));
}
```

Selection is not merely a performance optimization. It shapes what the
model is able to write about. Changing recency or source weights can
change the generated narrative.

A stronger production version should version selection policies and add
deterministic tie-breakers. Those are recommended improvements, not
guarantees of the current implementation.

## 04 --- Preserve provenance through the pipeline

Selected evidence receives identifiers such as `E1` and `E2`, alongside
source references and useful metadata.

``` json
{
  "tag": "E1",
  "source_type": "record",
  "source_ref": "source-123",
  "text": "Delivered the migration milestone",
  "aspect": "accomplishment"
}
```

That establishes a useful trace:

``` text
Generated text
    → Citation tag
    → Selected evidence
    → Source reference
```

The system validates that returned citation identifiers are known
evidence tags and persists the selected evidence separately from the
generated content.

That is **partial traceability---not complete claim verification**. A
valid citation identifier does not prove that the cited item supports
the exact sentence, and the current design does not guarantee that every
factual sentence has a citation.

The evidence snapshot matters because live source records can change
after generation. It preserves the support set selected at that moment,
although it is not a complete immutable copy of every original source
field and does not guarantee byte-for-byte regeneration.

## 05 --- Build a bounded, provider-neutral context

After filtering, classification, routing, and ranking, the context
builder creates a `GenerationContext` containing the output type,
guidance, selected evidence, citation tags, source metadata, status
where relevant, and optional user context.

``` ts
type GenerationContext = {
  outputType: string;
  guidance: string;
  evidence: Array<{
    tag: string;
    sourceType: string;
    sourceRef?: string;
    text: string;
    topic?: string;
    status?: string;
  }>;
  userContext?: Record<string, unknown>;
};
```

This is the grounding boundary: application code determines what the
model receives. Keeping the transformation inspectable is safer than
hiding it inside ad hoc string concatenation.

The guarded generator applies shared evidence and token limits before
calling a provider adapter. The adapter translates a provider-neutral
request into the provider's HTTP or SDK format; it does not retrieve
source records or decide which evidence is eligible.

## 06 --- Keep model providers behind one contract

The domain service depends on a provider-neutral generator contract:

``` ts
interface GenerationModel {
  generate(request: GenerationRequest): Promise<GenerationResult>;
  identity(): GenerationIdentity;
}
```

The implementation includes a deterministic mock and remote provider
adapters. The current provider options include Gemini and Vertex, with
room for an OpenAI-compatible or other adapter behind the same contract.

Provider-specific authentication, request and response formats, finish
reasons, token accounting, and safety failures remain inside adapters.
This reduces provider coupling, but it does not make providers behave
identically. A new adapter still needs contract tests and operational
validation.

## 07 --- Validate structure and guardrails

The shared guardrail layer applies evidence and token limits, timeouts,
non-empty output checks, one bounded truncation retry, first-person
voice checks, long verbatim-copy rejection, and citation-identifier
validation.

The model is asked for structured output, for example:

``` json
{
  "narrative": "I delivered the migration milestone [E1].",
  "citations": ["E1"]
}
```

Structured output makes malformed responses easier to reject. It does
**not** establish factual correctness: a response could include a valid
citation tag and still add an unsupported number. Sentence-level
entailment checking and claim coverage are not implemented in this
version.

The pipeline also fails closed when no rankable evidence remains and
handles provider timeouts, empty responses, invalid structured output,
truncation, and unknown citations.

## 08 --- Persist output, evidence, and generation identity

Generated sections persist generated content, user-edited content,
generation time, evidence hash, provider, model, generation fingerprint,
token counts, and version. Selected evidence is persisted separately
with source references and ranking data.

The fingerprint includes provider, model, prompt version, and guardrail
configuration. This helps prevent stale cached output from being reused
after important generation configuration changes.

On a new request, the service recomputes ranked evidence and its hash,
then compares the generation identity. If the evidence and generation
identity still match, it can return the persisted section instead of
calling the model again. A force-regeneration request bypasses that
reuse path.

This is an application-level reuse check, not provider-side prompt
caching. There are important limitations:

-   Concurrent identical requests can race because there is no
    distributed lock.
-   User-context changes may matter even when the evidence is unchanged.
-   Content persistence and evidence replacement are separate
    operations, so a failure between them can leave the two
    inconsistent.
-   The current fingerprint does not capture every input needed for
    complete reproducibility.

Atomic persistence, fuller generation records, and more complete cache
identity are sensible next steps.

## 09 --- What the tests establish---and what they don't

Focused tests cover filtering, tagging, routing, ranking limits, context
construction, provider translation, invalid responses, unknown
citations, style validation, cache invalidation, and no-evidence
behavior.

These tests validate pipeline mechanics, not factual quality. A more
complete evaluation programme should measure:

  -----------------------------------------------------------------------
  Measure                             What it helps evaluate
  ----------------------------------- -----------------------------------
  Citation precision                  Whether cited evidence is relevant
                                      to the claims it accompanies

  Citation coverage                   How much factual output is linked
                                      to evidence

  Unsupported-claim rate              How often output introduces claims
                                      the evidence does not support

  Evidence diversity                  Whether selection over-relies on
                                      one source or category

  Output stability                    Whether similar inputs and
                                      configurations produce acceptably
                                      stable results

  Human usefulness                    Whether the narrative helps the
                                      intended reader

  Latency, token usage, and cost      Whether the feature is
                                      operationally sustainable
  -----------------------------------------------------------------------

Other known gaps include incomplete review-ownership enforcement at the
service boundary, submission-completeness validation, audit-history
write errors that are not always propagated, and future work on provider
retry and backoff.

## The next engineering improvements

The highest-value next steps are to:

1.  Represent output as structured claims with explicit evidence
    references.
2.  Validate citation coverage and claim-to-evidence relationships.
3.  Add entailment evaluation or human-reviewed factuality checks.
4.  Persist the full context and selection-policy versions.
5.  Commit generated content and its evidence snapshot atomically.
6.  Enforce ownership authorization at the service boundary.
7.  Add deterministic ranking tie-breakers.
8.  Introduce privacy redaction and metadata allowlists.
9.  Add bounded retry and backoff for transient provider failures.
10. Expose evidence links in the consumer interface.

## What I took away

Evidence-grounded generation is not primarily a prompt-writing
technique. It is an application architecture.

The reusable pattern is:

**Retrieve with application policy → normalize into evidence → preserve
provenance → filter and organize → select and bound context → generate
through an adapter → parse structured output → validate deterministic
properties → persist output and support.**

The practical principle is simple: **use deterministic application code
to control what the model can see, and use explicit validation and
evaluation to measure how faithfully it stayed within that boundary.**

The current design makes the evidence path more inspectable and the
generation process more controlled. It does not eliminate hallucinations
or replace claim-level verification---but it creates a clearer
foundation on which those stronger guarantees can be built.
