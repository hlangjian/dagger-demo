import { describe, it, expect } from "vitest";
import { greet, now } from "./index.js";

describe("greet", () => {
  it("returns a greeting string", () => {
    expect(greet("World")).toBe("Hello, World!");
  });

  it("works with empty string", () => {
    expect(greet("")).toBe("Hello, !");
  });
});

describe("now", () => {
  it("returns an ISO timestamp", () => {
    const ts = now();
    expect(ts).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/);
    expect(new Date(ts).toISOString()).toBe(ts);
  });
});
