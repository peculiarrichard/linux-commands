import { describe, expect, it } from "vitest";
import { resolvePage, totalPagesFor } from "../pagination";

describe("resolvePage", () => {
  it("defaults to 1 when no input is given", () => {
    expect(resolvePage()).toBe(1);
  });

  it("floors fractional input", () => {
    expect(resolvePage(2.9)).toBe(2);
  });

  it("clamps zero, negative, or non-finite input to 1", () => {
    expect(resolvePage(0)).toBe(1);
    expect(resolvePage(-5)).toBe(1);
    expect(resolvePage(NaN)).toBe(1);
  });
});

describe("totalPagesFor", () => {
  it("computes the ceiling of totalCount / pageSize", () => {
    expect(totalPagesFor(41, 20)).toBe(3);
    expect(totalPagesFor(40, 20)).toBe(2);
  });

  it("never returns fewer than 1 page, even for zero results", () => {
    expect(totalPagesFor(0, 20)).toBe(1);
  });
});
