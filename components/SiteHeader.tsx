import Link from "next/link";
import { CommandPaletteTrigger } from "@/components/CommandPaletteTrigger";

export function SiteHeader() {
  return (
    <header className="border-b border-border">
      <div className="mx-auto flex max-w-4xl items-center justify-between px-6 py-4">
        <div className="flex items-center gap-6">
          <Link href="/" className="flex items-baseline gap-2">
            <span className="font-mono text-sm text-accent">$</span>
            <span className="font-semibold tracking-tight text-fg">Linux Commands Hub</span>
          </Link>
          <nav className="flex items-center gap-4 text-sm text-muted-fg">
            <Link href="/recipes" className="hover:text-accent">
              Recipes
            </Link>
          </nav>
        </div>
        <div className="flex items-center gap-4">
          <Link href="/suggest" className="text-sm text-muted-fg hover:text-accent">
            Suggest a command
          </Link>
          <CommandPaletteTrigger />
        </div>
      </div>
    </header>
  );
}
