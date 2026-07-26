import { signIn } from "@/auth";

export default async function AdminSignInPage({
  searchParams,
}: {
  searchParams: Promise<{ callbackUrl?: string }>;
}) {
  const { callbackUrl } = await searchParams;

  return (
    <main className="mx-auto flex max-w-sm flex-col gap-6 px-6 py-24 text-center">
      <div>
        <h1 className="text-xl font-semibold text-fg">Admin sign in</h1>
        <p className="mt-1 text-sm text-muted-fg">
          Access is restricted to allowlisted maintainer GitHub accounts.
        </p>
      </div>
      <form
        action={async () => {
          "use server";
          await signIn("github", { redirectTo: callbackUrl ?? "/admin" });
        }}
      >
        <button
          type="submit"
          className="w-full rounded-lg border border-border bg-fg px-4 py-2 text-sm font-medium text-bg transition-colors hover:bg-accent"
        >
          Sign in with GitHub
        </button>
      </form>
    </main>
  );
}
