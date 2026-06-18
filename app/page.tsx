import Link from "next/link";

export default function Home() {
  return (
    <main className="flex min-h-full items-center justify-center px-6 py-10">
      <section className="w-full max-w-2xl text-center">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-xl bg-blue-600 text-xl font-black text-white">
          F
        </div>

        <h1 className="mt-6 text-4xl font-bold text-gray-950 dark:text-gray-100 sm:text-5xl">
          Frontier
        </h1>

        <p className="mx-auto mt-4 max-w-xl text-base leading-7 text-gray-600 dark:text-gray-400">
          Create a workspace to manage clients, jobs, invoices, documents,
          inventory, and routes from one operations dashboard.
        </p>

        <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <Link
            href="/signup"
            className="w-full rounded-lg bg-blue-600 px-5 py-3 font-semibold text-white hover:bg-blue-700 sm:w-auto"
          >
            Sign up for free
          </Link>

          <Link
            href="/login"
            className="w-full rounded-lg border border-gray-300 px-5 py-3 font-semibold text-gray-900 hover:bg-gray-100 dark:border-gray-700 dark:text-gray-100 dark:hover:bg-gray-800 sm:w-auto"
          >
            Log in
          </Link>
        </div>
      </section>
    </main>
  );
}
