import { describe, expect, it } from "vitest";
import { CSV_COLUMNS, parseCsvRow, parseCsvText, type CsvRow } from "../commandCsv";

function row(overrides: Partial<CsvRow> = {}): CsvRow {
  const base: CsvRow = {
    slug: "",
    name: "ls",
    description: "Lists files and directories.",
    aliases: "",
    rationaleText: "",
    rationaleSources: "",
    category: "",
    difficulty: "",
    status: "",
    options: "",
    examples: "",
    platformNotes: "",
  };
  return { ...base, ...overrides };
}

describe("parseCsvText", () => {
  it("parses a well-formed CSV into rows", () => {
    const csv = [CSV_COLUMNS.join(","), "ls,ls,Lists files,,,,,,,,,"].join("\n");
    const result = parseCsvText(csv);
    expect("rows" in result && result.rows).toHaveLength(1);
  });

  it("errors when a required column is missing", () => {
    const columns = CSV_COLUMNS.filter((c) => c !== "description");
    const csv = [columns.join(","), "ls,ls,,,,,,,,,"].join("\n");
    const result = parseCsvText(csv);
    expect("error" in result && result.error).toMatch(/description/);
  });
});

describe("parseCsvRow", () => {
  it("accepts a minimal valid row and derives the slug from name", () => {
    const result = parseCsvRow(row());
    expect("data" in result && result.data.slug).toBe("ls");
    expect("data" in result && result.data.difficulty).toBe("beginner");
    expect("data" in result && result.data.status).toBe("draft");
  });

  it("requires name and description", () => {
    expect("error" in parseCsvRow(row({ name: "" }))).toBe(true);
    expect("error" in parseCsvRow(row({ description: "" }))).toBe(true);
  });

  it("rejects an invalid difficulty or status", () => {
    expect("error" in parseCsvRow(row({ difficulty: "expert" }))).toBe(true);
    expect("error" in parseCsvRow(row({ status: "archived" }))).toBe(true);
  });

  it("parses the pipe/colon convention for options", () => {
    const result = parseCsvRow(row({ options: "-l: Long listing format | -a: Show hidden files" }));
    expect("data" in result && result.data.options).toEqual([
      { flag: "-l", description: "Long listing format" },
      { flag: "-a", description: "Show hidden files" },
    ]);
  });

  it("rejects malformed options missing a colon", () => {
    const result = parseCsvRow(row({ options: "-l Long listing format" }));
    expect("error" in result && result.error).toMatch(/options/);
  });

  it("parses comma-separated aliases and pipe-separated sources", () => {
    const result = parseCsvRow(
      row({ aliases: "dir, list", rationaleSources: "https://a.example | https://b.example" }),
    );
    expect("data" in result && result.data.aliases).toEqual(["dir", "list"]);
    expect("data" in result && result.data.rationaleSources).toEqual([
      "https://a.example",
      "https://b.example",
    ]);
  });

  it("rejects an unknown platform in platformNotes", () => {
    const result = parseCsvRow(row({ platformNotes: "windows: not applicable" }));
    expect("error" in result && result.error).toMatch(/platform/i);
  });

  it("lowercases a valid platform", () => {
    const result = parseCsvRow(row({ platformNotes: "GNU: supports --color=auto" }));
    expect("data" in result && result.data.platformNotes).toEqual([
      { platform: "gnu", notes: "supports --color=auto" },
    ]);
  });
});
