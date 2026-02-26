import { describe, it, expect } from "vitest";
import { toggleInSet } from "./utils.ts";

describe("toggleInSet", () => {
  it("adds a value that is not in the set", () => {
    const set = new Set(["a", "b"]);
    const result = toggleInSet(set, "c");
    expect(result).toEqual(new Set(["a", "b", "c"]));
  });

  it("removes a value that is already in the set", () => {
    const set = new Set(["a", "b", "c"]);
    const result = toggleInSet(set, "b");
    expect(result).toEqual(new Set(["a", "c"]));
  });

  it("returns a new set (does not mutate the original)", () => {
    const set = new Set(["a"]);
    const result = toggleInSet(set, "b");
    expect(result).not.toBe(set);
    expect(set).toEqual(new Set(["a"]));
  });

  it("works with an empty set", () => {
    const set = new Set<string>();
    const result = toggleInSet(set, "x");
    expect(result).toEqual(new Set(["x"]));
  });
});
