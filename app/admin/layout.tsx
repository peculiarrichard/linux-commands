import Link from "next/link";
import { auth, signOut } from "@/auth";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();

  return (
    <div className="mx-auto max-w-5xl px-6 py-6">
      {session?.user && (
        <div className="mb-6 flex items-center justify-between border-b border-border pb-4">
          <nav className="flex items-center gap-4 text-sm">
            <Link href="/admin" className="font-medium text-fg">
              Commands
            </Link>
            <Link href="/admin/recipes" className="text-muted-fg hover:text-accent">
              Recipes
            </Link>
            <Link href="/admin/suggestions" className="text-muted-fg hover:text-accent">
              Suggestions
            </Link>
          </nav>
          <div className="flex items-center gap-3 text-sm text-muted-fg">
            <span>{session.user.login ?? session.user.name}</span>
            <form
              action={async () => {
                "use server";
                await signOut({ redirectTo: "/" });
              }}
            >
              <button type="submit" className="hover:text-accent">
                Sign out
              </button>
            </form>
          </div>
        </div>
      )}
      {children}
    </div>
  );
}
