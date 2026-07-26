import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { isRateLimited } from "../rateLimit";

describe("isRateLimited", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(0);
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("allows requests under the limit", () => {
    const key = `test-${Math.random()}`;
    for (let i = 0; i < 60; i++) {
      expect(isRateLimited(key)).toBe(false);
    }
  });

  it("blocks once the limit is exceeded within the window", () => {
    const key = `test-${Math.random()}`;
    for (let i = 0; i < 60; i++) {
      isRateLimited(key);
    }
    expect(isRateLimited(key)).toBe(true);
  });

  it("resets once the window has passed", () => {
    const key = `test-${Math.random()}`;
    for (let i = 0; i < 61; i++) {
      isRateLimited(key);
    }
    vi.advanceTimersByTime(61_000);
    expect(isRateLimited(key)).toBe(false);
  });

  it("tracks keys independently", () => {
    const keyA = `a-${Math.random()}`;
    const keyB = `b-${Math.random()}`;
    for (let i = 0; i < 61; i++) {
      isRateLimited(keyA);
    }
    expect(isRateLimited(keyA)).toBe(true);
    expect(isRateLimited(keyB)).toBe(false);
  });
});
