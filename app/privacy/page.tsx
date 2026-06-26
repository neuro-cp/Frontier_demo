import Link from "next/link";

export default function PrivacyPage() {
  return (
    <main className="mx-auto max-w-3xl p-6 text-gray-950 dark:text-gray-100">
      <h1 className="text-3xl font-bold">Privacy Policy Draft</h1>
      <p className="mt-4 text-sm text-gray-600 dark:text-gray-300">
        This draft is provided for pre-launch review and should be reviewed by counsel before public launch.
      </p>
      <section className="mt-6 space-y-4 rounded-xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-gray-900">
        <p>
          Frontier stores account, workspace, customer, job, invoice, payment, document, employee, portal, notification, activity, and review-draft information needed to operate the service.
        </p>
        <p>
          Some features may send limited data to configured service providers, including payment processors, storage providers, OCR providers, speech transcription providers, image analysis providers, routing providers, and AI providers.
        </p>
        <p>
          Frontier uses audit records and abuse-event logs to protect the platform, investigate unsafe use, and support account recovery or reinstatement review.
        </p>
      </section>
      <Link href="/signup" className="mt-6 inline-flex text-blue-600">
        Back to signup
      </Link>
    </main>
  );
}
