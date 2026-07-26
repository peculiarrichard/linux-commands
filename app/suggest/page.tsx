import { SuggestForm } from "@/components/SuggestForm";

export default function SuggestPage() {
  return (
    <main className="mx-auto flex max-w-lg flex-col gap-6 px-6 py-10">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-fg text-balance">
          Suggest a command
        </h1>
        <p className="mt-1 text-sm text-muted-fg">
          Don&apos;t use Git? Suggest a command here instead of opening a pull request. A maintainer
          reviews every suggestion before anything is published.
        </p>
      </div>
      <SuggestForm />
    </main>
  );
}
