"use client";

import { OPEN_COMMAND_PALETTE_EVENT } from "@/components/CommandPalette";

export function CommandPaletteTrigger() {
  return (
    <button
      type="button"
      onClick={() => window.dispatchEvent(new Event(OPEN_COMMAND_PALETTE_EVENT))}
      className="flex items-center gap-2 rounded-lg border border-border px-3 py-1.5 text-sm text-muted-fg transition-colors hover:border-accent"
    >
      Search
      <kbd className="rounded border border-border px-1.5 py-0.5 font-mono text-xs text-muted-fg">
        ⌘K
      </kbd>
    </button>
  );
}
