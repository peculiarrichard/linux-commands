import { describe, expect, it } from "vitest";
import { parseArgs } from "../args";

describe("parseArgs", () => {
  it("defaults to help with no arguments", () => {
    expect(parseArgs([])).toEqual({ mode: "help" });
  });

  it("treats --help and -h as help", () => {
    expect(parseArgs(["--help"])).toEqual({ mode: "help" });
    expect(parseArgs(["-h"])).toEqual({ mode: "help" });
  });

  it("parses search with a query, defaulting to page 1", () => {
    expect(parseArgs(["search", "list files"])).toEqual({
      mode: "search",
      query: "list files",
      page: 1,
    });
  });

  it("flags a missing search query", () => {
    expect(parseArgs(["search"])).toEqual({ mode: "search-missing-query" });
  });

  it("treats any other first argument as a command slug", () => {
    expect(parseArgs(["grep"])).toEqual({ mode: "show", slug: "grep" });
  });

  it("parses a --page flag for search", () => {
    expect(parseArgs(["search", "grep", "--page", "3"])).toEqual({
      mode: "search",
      query: "grep",
      page: 3,
    });
  });

  it("falls back to page 1 for a missing or non-numeric --page value", () => {
    expect(parseArgs(["search", "grep", "--page"])).toEqual({
      mode: "search",
      query: "grep",
      page: 1,
    });
    expect(parseArgs(["search", "grep", "--page", "nope"])).toEqual({
      mode: "search",
      query: "grep",
      page: 1,
    });
  });

  it("falls back to page 1 for a zero or negative --page value", () => {
    expect(parseArgs(["search", "grep", "--page", "0"])).toEqual({
      mode: "search",
      query: "grep",
      page: 1,
    });
    expect(parseArgs(["search", "grep", "--page", "-1"])).toEqual({
      mode: "search",
      query: "grep",
      page: 1,
    });
  });
});
