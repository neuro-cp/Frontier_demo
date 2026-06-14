export default function Home() {
  return (
    <main className="flex min-h-screen items-center justify-center px-6">
      <div className="text-center">
        <div className="mt-6 text-8xl font-black text-blue-500">
          ⌖
        </div>

        <h1 className="mt-4 text-6xl font-black tracking-[0.25em] text-gray-950 dark:text-gray-100">
          FRONTIER
        </h1>

        <p className="mt-4 text-lg text-gray-500 dark:text-gray-400">
          Business Operations Platform
        </p>

        <div className="mt-8 inline-flex rounded-full border border-green-500 px-5 py-2">
          <span className="animate-pulse font-mono text-sm text-green-400">
            SYSTEM ONLINE _
          </span>
        </div>

        <div className="mt-10 text-sm tracking-widest text-gray-500 dark:text-gray-400">
          Built for the New Frontier.
        </div>

        <p className="mt-16 text-center text-xs tracking-wide text-gray-500 dark:text-gray-400">
          © 2026 Thompson Ventures MI. All Rights Reserved.
        </p>

        <p className="mt-3 text-center">
          <a
            href="https://mail.google.com/mail/?view=cm&fs=1&to=thompsonrelay@proton.me"
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm font-medium text-blue-500 hover:text-blue-400 hover:underline"
          >
            Contact Us
          </a>
        </p>

      </div>
    </main>
  );
}