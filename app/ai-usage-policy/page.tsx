import Link from "next/link";

export default function AiUsagePolicyPage() {
  return (
    <main className="mx-auto max-w-3xl p-6 text-gray-950 dark:text-gray-100">
      <h1 className="text-3xl font-bold">AI Usage Policy Draft</h1>
      <p className="mt-4 text-sm text-gray-600 dark:text-gray-300">
        This draft is provided for pre-launch review and should be reviewed by counsel before public launch.
      </p>
      <section className="mt-6 space-y-4 rounded-xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-gray-900">
        <p>
          AI, OCR, speech, and image outputs are drafts for human review. They may be wrong or incomplete and must not be treated as automatically correct.
        </p>
        <p>
          Users may not use Frontier AI features to request credential theft, system prompt disclosure, security bypass, destructive actions, illegal activity, harassment, or other unsafe conduct.
        </p>
        <p>
          Frontier may block AI requests, record limited prompt excerpts and hashes, restrict AI capabilities, and require manual review when unsafe use is detected.
        </p>
      </section>
      <Link href="/signup" className="mt-6 inline-flex text-blue-600">
        Back to signup
      </Link>
    </main>
  );
}
