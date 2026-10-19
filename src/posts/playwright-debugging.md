---
title: "Debug the behaviour, not just the missing tooltip"
date: "2026-10-15"
category: "Testing & Debugging"
excerpt: "A repeatable browser-debugging loop for UI defects: reproduce, observe, isolate, verify, and preserve the fix."
---

A tooltip that does not appear can have several causes: the trigger never fires, the element is covered, the tooltip is rendered outside the expected container, a delay has not elapsed, a portal is clipped, or the test is looking for the wrong state. Guessing from the screenshot alone is rarely the fastest route to an answer.

## 1. Make the failure repeatable

Start with a reliable reproduction. Record the route, viewport, relevant data, and exact interaction sequence. A test that says “click the icon and expect the tooltip” is more useful when it also establishes the state the component needs before the click.

## 2. Observe the browser state

Use the browser automation trace and developer tools to inspect the element, its computed styles, event handlers, DOM placement, and console errors. Ask a sequence of concrete questions:

- Is the expected trigger present and enabled?
- Does the pointer or focus event reach it?
- Does the tooltip node appear after the interaction?
- If it appears, is it visible, positioned correctly, and above competing layers?
- Is a timer, animation, or asynchronous state update involved?

These checks divide one vague symptom into smaller hypotheses.

## 3. Separate application defects from test defects

An E2E test can fail because the product is broken, but it can also fail because its selector is brittle, its timing assumption is wrong, or the environment differs from the user's browser. Prefer role- and label-based locators where possible, and wait for meaningful state rather than fixed sleeps.

## 4. Change one thing at a time

Once the evidence points to a cause, make the smallest change that tests the hypothesis. Then rerun the failing scenario and nearby cases. If a CSS stacking issue is suspected, inspect the stacking context before adding an arbitrary large `z-index`. If the event is not firing, inspect the event path before changing visibility styles.

## 5. Keep the regression test valuable

The final test should assert the user-visible behaviour, not internal implementation details that are likely to change. Run it in the relevant CI environment and retain traces or screenshots when they make future failures easier to diagnose.

Browser agents can speed up this loop by navigating, interacting, inspecting, and collecting evidence. They are most effective when guided by a testable question and asked to report what they observed—not simply to “fix it.”
