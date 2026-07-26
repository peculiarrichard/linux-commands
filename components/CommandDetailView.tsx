import type { CommandExample, CommandOption, PlatformNote } from "@/lib/queries/commands";

export type CommandDetailViewData = {
  name: string;
  aliases: string[];
  description: string;
  category: { name: string } | null;
  rationale: { text: string; sources: string[] };
  options: CommandOption[];
  examples: CommandExample[];
  platformNotes: PlatformNote[];
};

export function CommandDetailView({ command }: { command: CommandDetailViewData }) {
  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-col gap-2">
        <div className="flex flex-wrap items-center gap-3">
          <code className="font-mono text-3xl font-semibold text-fg">{command.name || "—"}</code>
          {command.category && (
            <span className="rounded-full bg-muted px-2 py-0.5 text-xs text-muted-fg">
              {command.category.name}
            </span>
          )}
        </div>
        {command.aliases.length > 0 && (
          <p className="text-sm text-muted-fg">
            Also known as: {command.aliases.map((a) => `\`${a}\``).join(", ")}
          </p>
        )}
        <p className="text-base text-fg">{command.description}</p>
      </div>

      {command.rationale.text && (
        <section className="rounded-lg border border-border bg-muted p-4">
          <h2 className="text-sm font-medium text-muted-fg">Why it&apos;s called that</h2>
          <p className="mt-1 text-sm text-fg">{command.rationale.text}</p>
          {command.rationale.sources.length > 0 && (
            <ul className="mt-2 flex flex-col gap-0.5 text-xs text-muted-fg">
              {command.rationale.sources.map((source) => (
                <li key={source} className="truncate">
                  {source}
                </li>
              ))}
            </ul>
          )}
        </section>
      )}

      {command.options.length > 0 && (
        <section>
          <h2 className="text-sm font-medium text-muted-fg">Options</h2>
          <div className="mt-2 overflow-x-auto rounded-lg border border-border">
            <table className="w-full text-left text-sm">
              <tbody>
                {command.options.map((option, index) => (
                  <tr
                    key={`${option.flag}-${index}`}
                    className="border-b border-border last:border-0"
                  >
                    <td className="whitespace-nowrap px-4 py-2 font-mono text-fg">{option.flag}</td>
                    <td className="px-4 py-2 text-muted-fg">{option.description}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}

      {command.examples.length > 0 && (
        <section>
          <h2 className="text-sm font-medium text-muted-fg">Examples</h2>
          <div className="mt-2 flex flex-col gap-3">
            {command.examples.map((example, index) => (
              <div
                key={`${example.command}-${index}`}
                className="rounded-lg border border-border p-3"
              >
                <code className="font-mono text-sm text-fg">{example.command}</code>
                <p className="mt-1 text-sm text-muted-fg">{example.explanation}</p>
              </div>
            ))}
          </div>
        </section>
      )}

      {command.platformNotes.length > 0 && (
        <details className="rounded-lg border border-border p-4">
          <summary className="cursor-pointer text-sm font-medium text-muted-fg">
            Platform differences ({command.platformNotes.length})
          </summary>
          <div className="mt-3 overflow-x-auto rounded-lg border border-border">
            <table className="w-full text-left text-sm">
              <tbody>
                {command.platformNotes.map((note, index) => (
                  <tr
                    key={`${note.platform}-${index}`}
                    className="border-b border-border last:border-0"
                  >
                    <td className="whitespace-nowrap px-4 py-2 font-mono text-fg uppercase">
                      {note.platform}
                    </td>
                    <td className="px-4 py-2 text-muted-fg">{note.notes}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </details>
      )}
    </div>
  );
}
