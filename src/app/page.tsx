import ShortenerClient from "./shortener-client";

export const dynamic = "force-dynamic";

export default function Home() {
  return (
    <main className="mx-auto w-full max-w-3xl px-6 py-16">
      <header className="text-center">
        <p className="text-xs font-semibold uppercase tracking-[0.3em] text-sky-400">
          Real redirects · Real analytics
        </p>
        <h1 className="mt-3 text-4xl font-black tracking-tight text-white sm:text-5xl">
          Snip<span className="text-sky-400">.</span>link
        </h1>
        <p className="mx-auto mt-3 max-w-lg text-sm text-slate-400">
          Paste any long URL and get a working short link, backed by PostgreSQL.
          Every short link redirects for real and tracks its clicks.
        </p>
      </header>
      <ShortenerClient />
    </main>
  );
}
