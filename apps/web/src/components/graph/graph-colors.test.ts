import { describe, it, expect } from "vitest";
import { SCOPE_PALETTE, scopeColor } from "./graph-colors.ts";

describe("scopeColor", () => {
  it("returns first palette color for first scope alphabetically", () => {
    expect(scopeColor("api", ["api", "web"])).toBe(SCOPE_PALETTE[0]);
  });

  it("returns second palette color for second scope alphabetically", () => {
    expect(scopeColor("web", ["api", "web"])).toBe(SCOPE_PALETTE[1]);
  });

  it("assignment is based on alphabetical order regardless of input order", () => {
    const color1 = scopeColor("api", ["web", "api"]);
    const color2 = scopeColor("api", ["api", "web"]);
    expect(color1).toBe(color2);
  });

  it("returns first palette color for unknown scope", () => {
    expect(scopeColor("unknown", ["api", "web"])).toBe(SCOPE_PALETTE[0]);
  });

  it("wraps around palette for more scopes than palette entries", () => {
    const manyScopes = Array.from({ length: SCOPE_PALETTE.length + 1 }, (_, i) => `scope-${i}`);
    const firstColor = scopeColor("scope-0", manyScopes);
    const wrappedColor = scopeColor(`scope-${SCOPE_PALETTE.length}`, manyScopes);
    expect(firstColor).toBe(wrappedColor);
  });

  it("is deterministic — same scope always gets same color", () => {
    const scopes = ["api", "cli", "web"];
    const c1 = scopeColor("cli", scopes);
    const c2 = scopeColor("cli", scopes);
    expect(c1).toBe(c2);
  });
});
