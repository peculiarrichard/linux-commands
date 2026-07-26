import Papa from "papaparse";
import { CSV_COLUMNS } from "@/lib/csv/commandCsv";

const EXAMPLE_ROW = {
  slug: "ls",
  name: "ls",
  description: "Lists files and directories in the current directory.",
  aliases: "dir",
  rationaleText: 'Short for "list"; it lists directory contents.',
  rationaleSources: "https://en.wikipedia.org/wiki/Ls",
  category: "navigation-files",
  difficulty: "beginner",
  status: "published",
  options: "-l: Long listing format | -a: Show hidden files",
  examples: "ls -la: Lists all files, including hidden ones, in long format",
  platformNotes:
    "gnu: supports --color=auto | macos: no --color flag, use CLICOLOR env var instead",
};

export async function GET() {
  const csv = Papa.unparse({
    fields: [...CSV_COLUMNS],
    data: [CSV_COLUMNS.map((column) => EXAMPLE_ROW[column])],
  });

  return new Response(csv, {
    headers: {
      "Content-Type": "text/csv",
      "Content-Disposition": 'attachment; filename="commands-import-template.csv"',
    },
  });
}
