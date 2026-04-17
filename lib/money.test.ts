import { describe, it, expect } from "vitest";
import { formatInr } from "./money";

describe("formatInr", () => {
  it("formats whole rupees", () => {
    expect(formatInr(99)).toBe("₹99");
  });

  it("formats thousands with Indian grouping", () => {
    expect(formatInr(12500)).toBe("₹12,500");
  });

  it("rejects negative amounts", () => {
    expect(() => formatInr(-1)).toThrow();
  });

  it("rejects non-integers", () => {
    expect(() => formatInr(10.5)).toThrow();
  });
});
