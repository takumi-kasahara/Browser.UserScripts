---
name: typescript-browser-scripts
description: "TypeScript coding conventions for Greasemonkey user script source and build scripts. Use when writing or editing *.ts files in src/ or .tools/ for bookmarklets, user scripts, or user styles — covers ES module style, variable/function naming, JSDoc, and array iteration patterns."
license: Complete terms in LICENSE.txt
---

# TypeScript Browser Scripts

Coding conventions for authoring browser bookmarklets, Greasemonkey user scripts, and user styles in this workspace. These projects are TypeScript (ES modules) compiled/bundled with esbuild, targeting the latest Firefox.

## When to Use This Skill

- Creating or modifying a `.ts` source file under `src/` (modules or scripts)
- Writing or editing a build script under `.tools/`
- Adding a new bookmarklet, user script, or user style
- Reviewing TypeScript for naming, JSDoc, or iteration-style consistency

## Compatibility Requirements

1. Use the latest ECMAScript features. Target modern JavaScript syntax (`target: ESNext` in `tsconfig.json`).
2. Target the latest Firefox.
3. Avoid deprecated APIs. Use current Web APIs only.
4. Use ES module `import`/`export`.

## Variable Declarations

1. Start variable names with nouns (for example: `elementCount`, `pageUrl`, `userData`).
2. Use `const` by default. Use `let` only when reassignment is necessary.
3. Minimize scope. Declare variables as close to usage as possible.
4. Avoid reassignment when possible.

## Function Definitions

1. Start function names with verbs (for example: `fetchData()`, `validateInput()`, `autoClickButton()`).
2. Use `function` declarations and place helper functions at the end of the file.
3. Prefer pure functions with minimal side effects.
4. Add JSDoc type hints for parameters.
5. Let TypeScript infer return types (do not annotate unless needed for clarity or `@ts-expect-error` workarounds).

### Example

```typescript
/**
 * @param {string} url
 * @param {string} text
 */
export function createLink(url: string, text: string): HTMLAnchorElement {
  const a = document.createElement("a");
  a.href = url;
  a.textContent = text || url;
  return a;
}
```

## Array Operations

1. Use `Array.prototype.at()` for array element access.
2. Use `for...of` for iteration instead of index-based loops.

### Example

```typescript
// Good
for (const item of items) {
  console.log(item);
}
// Bad
for (let i = 0; i < items.length; i++) {
  console.log(items[i]);
}
```

## Gotchas

- **Do not annotate return types unless necessary** — the project relies on inference; only add explicit types for clarity or to satisfy `@ts-expect-error` DOM-lib gaps.
- **`strict: true` is enabled** — all code must pass strict type checking; avoid `any` and ensure null-safety.
- **`allowImportingTsExtensions: true`** — imports may include the `.ts` extension; keep them consistent within a file.
- **Build scripts are also TypeScript** — `.tools/*.ts` follow the same conventions, not loose Node scripting.

## References

- Project guidelines: `AGENTS.md`
- ESLint rules: `eslint.config.mjs`
- TypeScript config: `tsconfig.json`
