export function EmptyState({ title, description }: { title: string; description: string }) {
  return (
    <div className="rounded-lg border border-dashed border-border px-6 py-16 text-center">
      <p className="font-medium text-fg">{title}</p>
      <p className="mt-1 text-sm text-muted-fg">{description}</p>
    </div>
  );
}

export function DatabaseSetupNotice() {
  return (
    <EmptyState
      title="No database connected yet"
      description="Copy .env.example to .env, set MONGODB_URI, then run `npm run migrate:commands-md` to seed the first batch of commands."
    />
  );
}
