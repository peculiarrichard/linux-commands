"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Fuse from "fuse.js";

type IndexedCommand = {
  slug: string;
  name: string;
  description: string;
  aliases: string[];
};

export const OPEN_COMMAND_PALETTE_EVENT = "open-command-palette";

export function CommandPalette() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [commands, setCommands] = useState<IndexedCommand[] | null>(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const openRef = useRef(open);

  useEffect(() => {
    openRef.current = open;
  }, [open]);

  useEffect(() => {
    function openPalette() {
      setQuery("");
      setActiveIndex(0);
      setOpen(true);
    }

    function onKeyDown(event: KeyboardEvent) {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        if (openRef.current) {
          setOpen(false);
        } else {
          openPalette();
        }
      } else if (event.key === "Escape") {
        setOpen(false);
      }
    }

    window.addEventListener("keydown", onKeyDown);
    window.addEventListener(OPEN_COMMAND_PALETTE_EVENT, openPalette);
    return () => {
      window.removeEventListener("keydown", onKeyDown);
      window.removeEventListener(OPEN_COMMAND_PALETTE_EVENT, openPalette);
    };
  }, []);

  useEffect(() => {
    if (open && commands === null) {
      fetch("/api/v1/commands")
        .then((res) => res.json())
        .then((json) => setCommands(json.data ?? []))
        .catch(() => setCommands([]));
    }
  }, [open, commands]);

  useEffect(() => {
    if (open) {
      inputRef.current?.focus();
    }
  }, [open]);

  const fuse = useMemo(() => {
    if (!commands) return null;
    return new Fuse(commands, { keys: ["name", "aliases", "description"], threshold: 0.35 });
  }, [commands]);

  const results = useMemo(() => {
    if (!commands) return [];
    if (!query.trim()) return commands.slice(0, 8);
    return (fuse?.search(query) ?? []).slice(0, 8).map((result) => result.item);
  }, [fuse, commands, query]);

  function navigateTo(slug: string) {
    setOpen(false);
    router.push(`/commands/${slug}`);
  }

  function onInputKeyDown(event: React.KeyboardEvent<HTMLInputElement>) {
    if (event.key === "ArrowDown") {
      event.preventDefault();
      setActiveIndex((index) => Math.min(index + 1, results.length - 1));
    } else if (event.key === "ArrowUp") {
      event.preventDefault();
      setActiveIndex((index) => Math.max(index - 1, 0));
    } else if (event.key === "Enter") {
      event.preventDefault();
      const selected = results[activeIndex];
      if (selected) navigateTo(selected.slug);
    }
  }

  if (!open) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Search commands"
      className="fixed inset-0 z-50 flex items-start justify-center bg-black/40 px-4 pt-24"
      onClick={() => setOpen(false)}
    >
      <div
        className="w-full max-w-lg overflow-hidden rounded-lg border border-border bg-bg shadow-xl"
        onClick={(event) => event.stopPropagation()}
      >
        <input
          ref={inputRef}
          value={query}
          onChange={(event) => {
            setQuery(event.target.value);
            setActiveIndex(0);
          }}
          onKeyDown={onInputKeyDown}
          placeholder="Search commands…"
          aria-label="Search commands"
          className="w-full border-b border-border bg-transparent px-4 py-3 text-sm text-fg placeholder:text-muted-fg focus:outline-none"
        />
        <ul className="max-h-80 overflow-y-auto py-2">
          {commands === null && <li className="px-4 py-2 text-sm text-muted-fg">Loading…</li>}
          {commands !== null && results.length === 0 && (
            <li className="px-4 py-2 text-sm text-muted-fg">No matches.</li>
          )}
          {results.map((command, index) => (
            <li key={command.slug}>
              <button
                type="button"
                onClick={() => navigateTo(command.slug)}
                onMouseEnter={() => setActiveIndex(index)}
                className={`flex w-full flex-col gap-0.5 px-4 py-2 text-left ${
                  index === activeIndex ? "bg-muted" : ""
                }`}
              >
                <code className="font-mono text-sm text-fg">{command.name}</code>
                <span className="text-xs text-muted-fg">{command.description}</span>
              </button>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
