export type ParsedArgs =
  | { mode: "help" }
  | { mode: "search"; query: string; page: number }
  | { mode: "search-missing-query" }
  | { mode: "show"; slug: string };

export function parseArgs(argv: string[]): ParsedArgs {
  // Pull out `--page N` from anywhere in argv first, so it doesn't interfere
  // with positional parsing below (search query is still a single arg —
  // callers quote multi-word queries, same as before this flag existed).
  const pageIndex = argv.indexOf("--page");
  let page = 1;
  let rest = argv;

  if (pageIndex !== -1) {
    const pageValue = Number(argv[pageIndex + 1]);
    page = Number.isInteger(pageValue) && pageValue > 0 ? pageValue : 1;
    rest = [...argv.slice(0, pageIndex), ...argv.slice(pageIndex + 2)];
  }

  const [first, second] = rest;

  if (!first || first === "--help" || first === "-h") {
    return { mode: "help" };
  }

  if (first === "search") {
    if (!second) return { mode: "search-missing-query" };
    return { mode: "search", query: second, page };
  }

  return { mode: "show", slug: first };
}
