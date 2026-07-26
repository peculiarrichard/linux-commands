export type CommandDetail = {
  name: string;
  description: string;
  aliases: string[];
  rationale: { text: string; sources: string[] };
  options: { flag: string; description: string }[];
  examples: { command: string; explanation: string }[];
  platformNotes: { platform: string; notes: string }[];
};

export type CommandListItem = {
  slug: string;
  name: string;
  description: string;
};

export type PaginatedCommands = {
  items: CommandListItem[];
  page: number;
  pageSize: number;
  totalCount: number;
  totalPages: number;
};

// Fixed page size for `search` — a terminal-friendly result count, not
// user-configurable (only which page to view is).
export const SEARCH_PAGE_SIZE = 10;

export function getApiBaseUrl(): string {
  return process.env.LINUX_COMMANDS_API_URL ?? "http://localhost:3000";
}

async function fetchJson<T>(path: string): Promise<T> {
  const res = await fetch(`${getApiBaseUrl()}${path}`);
  if (!res.ok) {
    const body = (await res.json().catch(() => ({}))) as { error?: string };
    throw new Error(body.error ?? `Request failed with status ${res.status}`);
  }
  return res.json() as Promise<T>;
}

export async function fetchCommand(slug: string): Promise<CommandDetail> {
  const { data } = await fetchJson<{ data: CommandDetail }>(
    `/api/v1/commands/${encodeURIComponent(slug)}`,
  );
  return data;
}

export async function searchCommands(query: string, page = 1): Promise<PaginatedCommands> {
  const json = await fetchJson<{
    data: CommandListItem[];
    page: number;
    pageSize: number;
    totalCount: number;
    totalPages: number;
  }>(`/api/v1/commands?q=${encodeURIComponent(query)}&page=${page}&pageSize=${SEARCH_PAGE_SIZE}`);

  return {
    items: json.data,
    page: json.page,
    pageSize: json.pageSize,
    totalCount: json.totalCount,
    totalPages: json.totalPages,
  };
}
