# ARCHITECTURE RULES

- Use ES Modules (import/export) exclusively.
- Decouple Logic from UI: Math/Business logic goes in `logic.js`, DOM manipulation goes in `main.js`.
- No inline styles; use external CSS with CSS Variables.
- Write clean, "Self-Documenting" variable names (e.g., `wellVolumeInLiters` instead of `vol`).

# QUALITY CONTROL

- Always include a simple 'Smoke Test' function in a separate test file.
- Handle edge cases (null values, string-instead-of-number) in every function.
- Ensure 2026 A11y (accessibility) standards are met (labels, aria-roles).
- Use consistent formatting: Prettier with 2-space indentation, single quotes for strings.
<!-- - Include JSDoc comments for all functions and complex logic.
- Write unit tests for all functions using Jest; aim for 90%+ code coverage.
- Use GitHub Actions for CI: run tests and linting on every pull request. -->

# DOCUMENTATION & TESTING

- Every function must have a JSDoc block explaining parameters and return types.
- Every logic module must have a corresponding Jest test file in the `__tests__` folder.
- Aim for 90% code coverage; prioritize testing edge cases (zeroes, negatives, non-numbers).

# AUTOMATION

- Assume GitHub Actions will run `npm test` and `npm run lint` on every PR.
- Do not suggest code that breaks existing tests.
