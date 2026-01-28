---
description: 'Combined guidelines for GitHub Copilot: Node.js/Vitest rules and self-explanatory commenting'
applyTo: '**'
---

# Copilot Combined Guidelines

This file merges the Node.js / Vitest coding & testing guidelines and the Self-explanatory Code Commenting guidelines into a single reference for GitHub Copilot behavior in this repository.

---

## 1. Code Generation Guidelines (Node.js & JavaScript with Vitest)

- Use JavaScript with ES2022 features and Node.js (20+) ESM modules.
- Prefer built-in Node.js modules and avoid adding external dependencies unless explicitly requested by the user.
- Ask the user before introducing any new dependency.
- Use async/await for asynchronous code. When adapting callback-style APIs, prefer `node:util`'s `promisify` instead of callbacks.
- Keep code simple, readable, and maintainable.
- Use descriptive variable and function names; prefer small, focused functions over large ones.
- Avoid comments where code can be self-explanatory; reserve comments for WHY, not WHAT.
- For optional values, prefer `undefined` over `null`.
- Prefer functions over classes unless a class is clearly the better abstraction.

### Testing

- Use Vitest for testing.
- Write tests for new features and bug fixes; cover edge cases and error handling.
- Do not change existing production code solely to make it easier to test; write tests that exercise the existing behaviors.

### Documentation

- When adding features or significant changes, update `README.md` where relevant.

### User Interactions

- Ask clarifying questions if implementation details are unclear.
- Answer the user in the same language as their question, but generate code, comments, and documentation in English.

---

## 2. Self-explanatory Code Commenting Instructions

**Core Principle**: Write code that speaks for itself. Comment only to explain WHY, not WHAT.

### Avoid these comment types

- Obvious comments that restate the code.
- Redundant comments that mirror the implementation.
- Outdated comments that are not updated with the code.

### Preferred comments

- Explain non-obvious business logic and the reason behind design choices.
- Document algorithm choices (why this algorithm was used).
- Explain complex regular expressions or tricky edge cases.
- Note external constraints or API gotchas (e.g., rate limits, external timeouts).

### Decision framework for adding comments

1. Is the code self-explanatory? → No comment needed.
2. Could a better name or small refactor remove the need for a comment? → Refactor instead.
3. Does the comment explain WHY (not WHAT)? → Good comment.
4. Will this help future maintainers? → Good comment.

### Special cases

- Public APIs: provide clear, concise JSDoc-style comments describing parameters and behavior.
- Configuration/constants: explain source or rationale for values.
- Use TODO/FIXME/BUG/NOTE annotations for actionable items.

### Anti-patterns

- Dead code commented out in production.
- Changelog/history in comments.
- Decorative divider comments.

### Quality checklist for comments

- Explain WHY, not WHAT.
- Are grammatically correct and clear.
- Will remain accurate as code evolves.
- Add genuine value to code understanding.
- Placed appropriately (above the code they describe).

---

## 3. How to use this file

- This combined file applies repository-wide (`applyTo: '**'`). Use it as the primary reference for Copilot behavior when authoring JavaScript/Node.js code and when deciding whether to add comments.
- If a case requires deviation from these rules (e.g., different language guidelines, repository-specific constraints), ask the user before making changes.

---

_If you want me to also replace the two original files with this combined one or keep them and add a pointer, tell me which option you prefer and I'll make the edits._
