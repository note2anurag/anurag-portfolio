---
title: "Time boundaries are product logic, not date formatting"
date: "2026-10-14"
category: "Backend & Data"
excerpt: "Why weeks, fiscal periods, and user time zones need explicit rules instead of scattered date calculations."
---

Time-related bugs often look like display problems: a check-in appears in the wrong week, a dashboard loads the wrong period, or an item disappears at a boundary. Underneath, the system may have more than one definition of “current.”

## Write down the calendar rules

Before implementing date logic, define the business week, the source of truth for fiscal periods, the relevant time zone, and what happens at transitions. If the business week runs Friday through Thursday, a generic Monday-based week helper is not a harmless default. It is a different business rule.

## Separate the instant from the business date

A timestamp represents an instant. A business date is the interpretation of that instant in a chosen time zone and calendar. Converting everything to UTC can be appropriate for storage, but it does not by itself answer which local business week contains an event.

The time zone used to resolve a fiscal period should be deliberate and consistent. A server-wide environment variable, an employee's time zone, and a reporting time zone are different choices. Document which one owns each rule.

## Use one authoritative source for periods

If a database table defines fiscal halves, use it as the authority instead of independently reconstructing those periods from review windows or hard-coded date ranges in multiple modules. Other tables can relate weeks and quarters to those periods, but the ownership of the boundary should remain clear.

## Test the edges

Most ordinary dates are easy. The useful tests are just before, at, and just after a boundary; dates near midnight in the relevant time zone; missing period configuration; and transitions between current and historical views. Include examples that cross a month, year, or daylight-saving boundary where applicable.

## Make empty states intentional

If period resolution fails, returning an empty list can look like a valid absence of data. Decide whether the system should instead surface a configuration error, log a diagnostic, or present a recoverable message. Silent failure makes data issues harder to find.

The general rule is to treat time as a domain concept. Centralise its rules, make the source of truth explicit, and test the boundaries where assumptions become visible.
