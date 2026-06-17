import Link from "next/link";

export default function Home() {
  return (
    <main className="flex min-h-full items-center justify-center px-6 py-10">
      <section className="w-full max-w-3xl text-center">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-xl bg-blue-600 text-lg font-black text-white">
          FR
        </div>

        <h1 className="mt-6 text-4xl font-black tracking-wide text-gray-950 dark:text-gray-100 sm:text-6xl">
          FRONTIER
        </h1>

        <p className="mx-auto mt-4 max-w-xl text-lg text-gray-600 dark:text-gray-400">
          Business operations for clients, jobs, invoices, inventory, and routes.
        </p>

        <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <Link
            href="/dashboard"
            className="w-full rounded-lg bg-blue-600 px-5 py-3 font-semibold text-white hover:bg-blue-700 sm:w-auto"
          >
            Open Dashboard
          </Link>

          <Link
            href="/jobs"
            className="w-full rounded-lg border border-gray-300 px-5 py-3 font-semibold text-gray-900 hover:bg-gray-100 dark:border-gray-700 dark:text-gray-100 dark:hover:bg-gray-800 sm:w-auto"
          >
            Review Jobs
          </Link>
        </div>

        <p className="mt-10 text-xs tracking-wide text-gray-500 dark:text-gray-400">
          2026 Thompson Ventures MI. All rights reserved.
        </p>
      </section>
    </main>
  );
}
