import Link from "next/link";

export default function TermsPage() {
  return (
    <main className="mx-auto max-w-3xl p-6 text-gray-950 dark:text-gray-100">
      <h1 className="text-3xl font-bold">Terms of Service Draft</h1>
      <p className="mt-4 text-sm text-gray-600 dark:text-gray-300">
        This draft is provided for pre-launch review and should be reviewed by counsel before public launch.
      </p>
      <section className="mt-6 space-y-4 rounded-xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-gray-900">
        <p>
          Frontier is business operations software. Users are responsible for reviewing and approving all business records, customer-facing materials, payment details, tax details, routes, documents, AI outputs, and operational decisions before relying on them.
        </p>
        <p>
          Frontier does not provide legal, tax, accounting, payroll, employment, safety, construction, engineering, insurance, or professional advice.
        </p>
        <p>
          Beta and automated features may be inaccurate, incomplete, unavailable, or unsuitable for a specific use. Users remain responsible for compliance with laws, contracts, permits, licenses, privacy obligations, and workplace requirements.
        </p>
        <p>
          Unsafe, abusive, credential-seeking, malicious, or security-bypass use may result in feature restriction, account review, or service suspension.
        </p>
      </section>
      <Link href="/signup" className="mt-6 inline-flex text-blue-600">
        Back to signup
      </Link>
    </main>
  );
}
