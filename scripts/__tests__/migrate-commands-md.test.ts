import { describe, expect, it } from "vitest";
import { parseCommandsMd } from "../migrate-commands-md";

describe("parseCommandsMd", () => {
  it("parses the bullet-style format used by entries 1-30", () => {
    const content = `## 1. ls
- **Rationale:** Short for "list"; it lists directory contents.
- **Description:** Displays files and directories in the current directory.
- **Options:**
  - \`-l\` : Long listing format
  - \`-a\` : Show hidden files
`;
    const [entry] = parseCommandsMd(content);
    expect(entry).toEqual({
      slug: "ls",
      name: "ls",
      rationale: 'Short for "list"; it lists directory contents.',
      description: "Displays files and directories in the current directory.",
      options: [
        { flag: "-l", description: "Long listing format" },
        { flag: "-a", description: "Show hidden files" },
      ],
    });
  });

  it("parses the trailing-space-line-break format used by entries 31-40", () => {
    const content = `### 31. \`man\`
**Rationale**: Short for "manual".
**Description**: Displays the manual page for a command.
**Options**:
- \`-k\` : Search for a keyword in manual pages
`;
    const [entry] = parseCommandsMd(content);
    expect(entry).toEqual({
      slug: "man",
      name: "man",
      rationale: 'Short for "manual".',
      description: "Displays the manual page for a command.",
      options: [{ flag: "-k", description: "Search for a keyword in manual pages" }],
    });
  });

  it("parses every entry independently across a multi-entry file", () => {
    const content = `## 1. ls
- **Rationale:** Short for "list".
- **Description:** Lists things.

## 2. cd
- **Rationale:** Short for "change directory".
- **Description:** Changes directory.
`;
    const entries = parseCommandsMd(content);
    expect(entries).toHaveLength(2);
    expect(entries.map((e) => e.slug)).toEqual(["ls", "cd"]);
  });
});
