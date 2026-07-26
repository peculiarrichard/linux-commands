import Link from "next/link";
import type { CommandListItem } from "@/lib/queries/commands";

export function CommandCard({ command }: { command: CommandListItem }) {
  return (
    <Link
      href={`/commands/${command.slug}`}
      className="group flex flex-col gap-1.5 rounded-lg border border-border bg-bg p-4 transition-colors hover:border-accent"
    >
      <div className="flex items-center justify-between gap-2">
        <code className="font-mono text-base font-semibold text-fg">{command.name}</code>
        {command.category && (
          <span className="rounded-full bg-muted px-2 py-0.5 text-xs text-muted-fg">
            {command.category.name}
          </span>
        )}
      </div>
      <p className="text-sm text-muted-fg">{command.description}</p>
    </Link>
  );
}
