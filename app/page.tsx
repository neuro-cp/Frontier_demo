export default function Home() {
  return (
    <main className="flex min-h-[calc(100dvh-8rem)] items-center justify-center px-4 py-6 sm:px-6 sm:py-8">
      <div className="mx-auto flex w-full max-w-2xl flex-col items-center text-center">
        <div className="text-6xl font-black text-blue-500 sm:text-7xl md:text-8xl">
          ⌖
        </div>

        <h1 className="mt-3 text-3xl font-black tracking-[0.1em] text-gray-950 dark:text-gray-100 sm:mt-4 sm:text-5xl md:text-6xl">
          FRONTIER
        </h1>

        <p className="mt-3 text-base text-gray-500 dark:text-gray-400 sm:mt-4 sm:text-lg">
          Business Operations Platform
        </p>

        <div className="mt-6 inline-flex rounded-full border border-green-500 px-5 py-2 sm:mt-8">
          <span className="animate-pulse font-mono text-sm text-green-400">
            SYSTEM ONLINE _
          </span>
        </div>

        <div className="mt-8 text-sm tracking-widest text-gray-500 dark:text-gray-400 sm:mt-10">
          Built for the New Frontier.
        </div>

        <p className="mt-8 text-center text-xs tracking-wide text-gray-500 dark:text-gray-400 sm:mt-12">
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
