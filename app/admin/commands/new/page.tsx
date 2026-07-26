import { DatabaseNotConfiguredError } from "@/lib/db";
import { DatabaseSetupNotice } from "@/components/EmptyState";
import { createCommand } from "@/lib/actions/commands";
import { emptyCommandFormValues } from "@/lib/queries/admin-commands";
import { listCategories } from "@/lib/queries/commands";
import { CommandForm } from "@/app/admin/commands/CommandForm";

export const dynamic = "force-dynamic";

export default async function NewCommandPage({
  searchParams,
}: {
  searchParams: Promise<{ name?: string; description?: string; rationaleText?: string }>;
}) {
  const prefill = await searchParams;

  let categories;
  try {
    categories = await listCategories();
  } catch (err) {
    if (err instanceof DatabaseNotConfiguredError) {
      return <DatabaseSetupNotice />;
    }
    throw err;
  }

  const initialValues = {
    ...emptyCommandFormValues,
    name: prefill.name ?? "",
    description: prefill.description ?? "",
    rationaleText: prefill.rationaleText ?? "",
  };

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-xl font-semibold text-fg">Add a command</h1>
      <CommandForm
        mode="create"
        initialValues={initialValues}
        categories={categories}
        action={createCommand}
      />
    </div>
  );
}
