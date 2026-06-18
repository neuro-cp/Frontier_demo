import Link from "next/link";

import AdminConsole from "@/app/frontier-admin/AdminConsole";
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

  return <AdminConsole summary={data} />;
}
