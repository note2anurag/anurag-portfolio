---
title: "MCP tools need product contracts, not just handlers"
date: "2026-10-17"
category: "AI Engineering"
excerpt: "A practical way to think about tool names, inputs, ownership, and predictable behaviour when exposing application capabilities to agents."
---

Connecting an agent to an application is not simply a matter of wrapping existing API calls. The tools become a contract between the application and a system that may call them in unexpected sequences, with incomplete context, or for purposes the original UI never anticipated.

## Start with the user's task

A useful tool should represent a coherent capability. Its name should communicate intent, its input schema should make required context explicit, and its output should be predictable enough for an agent to use without guessing.

Tools that are too broad can hide important choices. Tools that are too granular can force an agent to orchestrate a long sequence of low-level operations. The right boundary follows the domain and the questions a user is trying to answer.

## Freeze the contract before multiplying implementations

A disciplined workflow is to agree on canonical names, schemas, response shapes, error behaviour, and authorization assumptions before implementing every handler. Then build against those contracts, test them, and reconcile changes deliberately rather than letting similar tools drift independently.

Documentation is part of the interface. If a tool has surprising defaults or needs a particular identifier, that should be clear from its description and schema.

## Identity and authorization are not optional details

An agent's ability to request a tool must not automatically grant it unrestricted access to application data. The server should establish the acting user's identity through a trusted authentication mechanism and enforce authorization at the point where data is accessed. Do not treat a caller-supplied username or custom header as proof of identity.

Keep credentials and privileged data out of tool descriptions and outputs. Return only the information required for the task, and make failures understandable without exposing secrets.

## Design for observability

Log tool invocation metadata that helps diagnose failures while avoiding sensitive payloads. Distinguish invalid input, unauthenticated requests, forbidden access, missing records, and unexpected server errors. These distinctions make it easier to improve both the tool and the agent's recovery behaviour.

## Test behaviour, not only registration

A tool being registered does not prove that it is useful. Test valid calls, missing identifiers, unauthorized access, empty results, boundary conditions, and errors. Also test sequences of calls because an agent experiences the toolset as a system, not a list of isolated functions.

The key principle is simple: an agent-facing tool is a public contract inside your architecture. Give it the same design discipline you would give a human-facing API.
