---
title: "Designing a frontend that can live on more than one surface"
date: "2026-10-18"
category: "Frontend Architecture"
excerpt: "Why the host environment should be a boundary in your architecture—not a reason to duplicate the product."
---

A web application may run in a normal browser today and inside an embedded environment tomorrow. The tempting shortcut is to let host-specific assumptions spread through the UI. That works until the second surface arrives and every component starts asking where it is running.

## Separate the product from its host

The product should own its domain workflows and presentation. The host integration should own the details that differ between environments: launch context, authentication hand-off, available host SDKs, and lifecycle behaviour.

A useful mental model is to keep a narrow boundary between the application and the surface that contains it. Components should not need to know every detail of the embedding platform just to render a form or show a summary.

## Make the boundary explicit

A small host adapter or capability layer can expose what the application actually needs. For example, it might provide the current surface, a safe way to request host actions, or a consistent signal that authentication is ready. Keep this contract intentionally small; do not create an abstraction for hypothetical needs without evidence.

The important part is ownership. Host-specific logic belongs at the edge, while reusable product logic stays independent.

## Authentication deserves special care

Embedded browsers and regular browsers can differ in cookie behaviour, redirect handling, storage restrictions, and lifecycle. Treat authentication as an explicit flow with observable states rather than a single boolean. Test the actual host environment; success in a normal browser is not proof that the embedded surface behaves the same way.

## Test the seams

The most valuable tests often sit at the boundary: initial launch, expired sessions, blocked or delayed redirects, missing host capabilities, and returning from a host-driven navigation. Keep the business workflow tests focused on the product and add targeted integration tests for each host.

## The trade-off

An abstraction that is too thin leaks environment details everywhere. One that is too broad becomes a mini-framework nobody needs. Aim for the smallest stable contract that allows the same product to work across surfaces without pretending the surfaces are identical.

The broader lesson: scalability is not only about supporting more users. It can also mean supporting more contexts without multiplying complexity.
