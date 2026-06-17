import Link from "next/link";

import { maybeCreateServerSupabaseClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

type PlatformAdminSummary = {
  admin_email: string;
  auth_user_count: number;
  profile_count: number;
  workspace_count: number;
  client_count: number;
  job_count: number;
  invoice_count: number;
  document_count: number;
  route_plan_count: number;
};

const futureViewModeLabels = {
  owner: "Owner view",
  employee: "Employee view",
  clientPortal: "Client portal view",
  customerToggle: "Customer view toggle",
} as const;

function AccessPanel({
  title,
  message,
}: {
  title: string;
  message: string;
}) {
  return (
    <main className="mx-auto flex min-h-[60vh] max-w-2xl flex-col justify-center p-6 text-gray-950 dark:text-gray-100">
      <section className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-900">
        <h1 className="text-2xl font-bold">{title}</h1>
        <p className="mt-3 text-gray-500 dark:text-gray-400">{message}</p>
        <Link
          href="/dashboard"
          className="mt-6 inline-flex rounded-lg bg-blue-600 px-4 py-2 font-semibold text-white hover:bg-blue-700"
        >
          Back to Dashboard
        </Link>
      </section>
    </main>
  );
}

function CountCard({
  label,
  value,
}: {
  label: string;
  value: number;
}) {
  return (
    <div className="rounded-lg border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-800 dark:bg-gray-900">
      <div className="text-sm font-medium text-gray-500 dark:text-gray-400">
        {label}
      </div>
      <div className="mt-3 text-3xl font-bold text-gray-950 dark:text-gray-100">
        {value.toLocaleString()}
      </div>
    </div>
  );
}

export default async function FrontierAdminPage() {
  const supabase = await maybeCreateServerSupabaseClient();

  if (!supabase) {
    return (
      <AccessPanel
        title="Admin Unavailable"
        message="Supabase is not configured for this environment."
      />
    );
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return (
      <AccessPanel
        title="Sign In Required"
        message="You must be signed in before Frontier can verify platform admin access."
      />
    );
  }

  const { data, error } = await supabase
    .rpc("get_platform_admin_summary")
    .returns<PlatformAdminSummary[]>()
    .maybeSingle();

  if (error) {
    console.error("Unable to load platform admin summary.", error);
  }

  if (!data) {
    return (
      <AccessPanel
        title="Access Denied"
        message="This account is not a Frontier platform admin."
      />
    );
  }

  const counts = [
    { label: "Auth Users", value: data.auth_user_count },
    { label: "Profiles", value: data.profile_count },
    { label: "Workspaces", value: data.workspace_count },
    { label: "Clients", value: data.client_count },
    { label: "Jobs", value: data.job_count },
    { label: "Invoices", value: data.invoice_count },
    { label: "Documents", value: data.document_count },
    { label: "Route Plans", value: data.route_plan_count },
  ];

  return (
    <main className="space-y-6 text-gray-950 dark:text-gray-100">
      <section className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-900">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <h1 className="text-3xl font-bold">Frontier Admin</h1>
            <p className="mt-2 text-gray-500 dark:text-gray-400">
              Signed in as {data.admin_email}
            </p>
          </div>
          <span className="rounded-lg bg-blue-50 px-3 py-2 text-sm font-semibold text-blue-700 dark:bg-blue-950/40 dark:text-blue-200">
            Platform access
          </span>
        </div>
      </section>

      <section className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
        {counts.map((item) => (
          <CountCard key={item.label} label={item.label} value={item.value} />
        ))}
      </section>

      <section className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-900">
        <h2 className="text-xl font-bold">Roadmap Hold</h2>
        <p className="mt-2 text-gray-500 dark:text-gray-400">
          Support tools and customer inspection are not built yet.
        </p>

        <div className="mt-5 flex flex-wrap gap-2">
          {Object.values(futureViewModeLabels).map((label) => (
            <span
              key={label}
              className="rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-500 dark:border-gray-800 dark:text-gray-400"
            >
              {label}
            </span>
          ))}
        </div>
      </section>
    </main>
  );
}
