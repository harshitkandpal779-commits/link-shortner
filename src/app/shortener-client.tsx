"use client";

import { useCallback, useEffect, useState } from "react";

type LinkRow = {
  id: number;
  code: string;
  url: string;
  clicks: number;
  createdAt: string;
  lastVisitedAt: string | null;
  shortUrl: string;
};

export default function ShortenerClient() {
  const [url, setUrl] = useState("");
  const [slug, setSlug] = useState("");
  const [showCustom, setShowCustom] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [created, setCreated] = useState<LinkRow | null>(null);
  const [list, setList] = useState<LinkRow[]>([]);
  const [copied, setCopied] = useState<string | null>(null);

  const load = useCallback(async () => {
    const response = await fetch("/api/links", { cache: "no-store" });
    if (!response.ok) return;
    const data = (await response.json()) as { links: LinkRow[] };
    setList(data.links);
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError(null);
    setCreated(null);

    try {
      const response = await fetch("/api/links", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ url, slug: showCustom ? slug : "" }),
      });
      const data = (await response.json()) as {
        link?: LinkRow;
        error?: string;
      };

      if (!response.ok || !data.link) {
        setError(data.error ?? "Something went wrong.");
        return;
      }

      setCreated(data.link);
      setUrl("");
      setSlug("");
      await load();
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  async function copy(text: string) {
    try {
      await navigator.clipboard.writeText(text);
    } catch {
      const textarea = document.createElement("textarea");
      textarea.value = text;
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand("copy");
      textarea.remove();
    }

    setCopied(text);
    window.setTimeout(() => {
      setCopied((current) => (current === text ? null : current));
    }, 1600);
  }

  async function remove(code: string) {
    await fetch(`/api/links/${encodeURIComponent(code)}`, { method: "DELETE" });
    if (created?.code === code) setCreated(null);
    await load();
  }

  return (
    <section className="mt-10">
      <form
        onSubmit={submit}
        className="rounded-2xl border border-white/10 bg-white/5 p-5 shadow-2xl backdrop-blur"
      >
        <div className="flex flex-col gap-3 sm:flex-row">
          <input
            required
            type="url"
            value={url}
            onChange={(event) => setUrl(event.target.value)}
            placeholder="https://example.com/a/very/long/url"
            className="w-full flex-1 rounded-xl border border-white/10 bg-slate-900/70 px-4 py-3 text-sm text-white outline-none placeholder:text-slate-500 focus:border-sky-400"
          />
          <button
            type="submit"
            disabled={loading || url.trim().length === 0}
            className="rounded-xl bg-sky-500 px-6 py-3 text-sm font-semibold text-slate-950 transition hover:bg-sky-400 disabled:cursor-not-allowed disabled:opacity-40"
          >
            {loading ? "Shortening…" : "Shorten"}
          </button>
        </div>

        <button
          type="button"
          onClick={() => setShowCustom((value) => !value)}
          className="mt-3 text-xs text-slate-400 hover:text-sky-300"
        >
          {showCustom ? "− Hide custom alias" : "+ Use a custom alias"}
        </button>

        {showCustom && (
          <div className="mt-3 flex items-center gap-2 rounded-xl border border-white/10 bg-slate-900/70 px-4 py-2">
            <span className="text-sm text-slate-500">/</span>
            <input
              value={slug}
              onChange={(event) => setSlug(event.target.value)}
              placeholder="my-link"
              pattern="[a-zA-Z0-9_-]{3,64}"
              className="w-full bg-transparent py-1 text-sm text-white outline-none placeholder:text-slate-600"
            />
          </div>
        )}

        {error && (
          <p className="mt-3 rounded-lg bg-red-500/10 px-3 py-2 text-sm text-red-300">
            {error}
          </p>
        )}
      </form>

      {created && (
        <div className="mt-4 rounded-2xl border border-sky-400/30 bg-sky-400/10 p-5">
          <p className="text-xs uppercase tracking-wide text-sky-300">
            Your short link is live
          </p>
          <div className="mt-2 flex flex-wrap items-center gap-3">
            <a
              href={created.shortUrl}
              target="_blank"
              rel="noreferrer"
              className="break-all text-lg font-semibold text-white hover:text-sky-300"
            >
              {created.shortUrl}
            </a>
            <button
              type="button"
              onClick={() => void copy(created.shortUrl)}
              className="rounded-lg border border-white/20 px-3 py-1 text-xs text-slate-200 hover:bg-white/10"
            >
              {copied === created.shortUrl ? "Copied!" : "Copy"}
            </button>
          </div>
          <p className="mt-1 break-all text-xs text-slate-400">→ {created.url}</p>
        </div>
      )}

      <h2 className="mt-12 text-sm font-semibold uppercase tracking-wide text-slate-400">
        Recent links
      </h2>

      <ul className="mt-3 space-y-2">
        {list.length === 0 && (
          <li className="rounded-xl border border-white/10 bg-white/5 p-5 text-sm text-slate-400">
            Nothing yet — shorten your first URL above.
          </li>
        )}
        {list.map((link) => (
          <li
            key={link.id}
            className="flex flex-wrap items-center gap-3 rounded-xl border border-white/10 bg-white/5 p-4"
          >
            <div className="min-w-0 flex-1">
              <a
                href={link.shortUrl}
                target="_blank"
                rel="noreferrer"
                className="font-medium text-sky-300 hover:underline"
              >
                /{link.code}
              </a>
              <p className="truncate text-xs text-slate-400">{link.url}</p>
            </div>
            <span className="rounded-full bg-white/10 px-3 py-1 text-xs text-slate-300">
              {link.clicks} click{link.clicks === 1 ? "" : "s"}
            </span>
            <button
              type="button"
              onClick={() => void copy(link.shortUrl)}
              className="rounded-lg border border-white/20 px-3 py-1 text-xs hover:bg-white/10"
            >
              {copied === link.shortUrl ? "Copied!" : "Copy"}
            </button>
            <a
              href={`/stats/${encodeURIComponent(link.code)}`}
              className="rounded-lg border border-white/20 px-3 py-1 text-xs hover:bg-white/10"
            >
              Stats
            </a>
            <button
              type="button"
              onClick={() => void remove(link.code)}
              className="rounded-lg border border-red-400/30 px-3 py-1 text-xs text-red-300 hover:bg-red-500/10"
            >
              Delete
            </button>
          </li>
        ))}
      </ul>
    </section>
  );
}
