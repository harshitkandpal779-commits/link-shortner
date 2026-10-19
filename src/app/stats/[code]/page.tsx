import Link from "next/link";
import { notFound } from "next/navigation";
import { desc, eq } from "drizzle-orm";
import { db } from "@/db";
import { clicks, links } from "@/db/schema";

export const dynamic = "force-dynamic";

export default async function StatsPage({
  params,
}: {
  params: Promise<{ code: string }>;
}) {
  const { code } = await params;
  const [link] = await db
    .select()
    .from(links)
    .where(eq(links.code, code))
    .limit(1);

  if (!link) notFound();

  const recent = await db
    .select()
    .from(clicks)
    .where(eq(clicks.linkId, link.id))
    .orderBy(desc(clicks.createdAt))
    .limit(25);

  return (
    <main className="mx-auto w-full max-w-3xl px-6 py-14">
      <Link href="/" className="text-sm text-sky-400 hover:underline">
        &larr; Back to shortener
      </Link>

      <h1 className="mt-4 text-3xl font-bold text-white">/{link.code}</h1>
      <a
        href={link.url}
        target="_blank"
        rel="noreferrer"
        className="mt-1 block break-all text-sm text-slate-400 hover:text-sky-300"
      >
        {link.url}
      </a>

      <div className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-3">
        <Stat label="Total clicks" value={String(link.clicks)} />
        <Stat
          label="Created"
          value={new Date(link.createdAt).toLocaleDateString()}
        />
        <Stat
          label="Last visit"
          value={
            link.lastVisitedAt
              ? new Date(link.lastVisitedAt).toLocaleString()
              : "Never"
          }
        />
      </div>

      <h2 className="mt-10 text-lg font-semibold text-white">Recent visits</h2>
      <div className="mt-3 overflow-hidden rounded-xl border border-white/10 bg-white/5">
        {recent.length === 0 ? (
          <p className="p-6 text-sm text-slate-400">No clicks recorded yet.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[36rem] text-left text-sm">
              <thead className="bg-white/5 text-xs uppercase tracking-wide text-slate-400">
                <tr>
                  <th className="px-4 py-3">When</th>
                  <th className="px-4 py-3">Referrer</th>
                  <th className="px-4 py-3">User agent</th>
                </tr>
              </thead>
              <tbody>
                {recent.map((click) => (
                  <tr
                    key={click.id}
                    className="border-t border-white/5 text-slate-300"
                  >
                    <td className="whitespace-nowrap px-4 py-2">
                      {new Date(click.createdAt).toLocaleString()}
                    </td>
                    <td className="max-w-[12rem] truncate px-4 py-2">
                      {click.referrer ?? "direct"}
                    </td>
                    <td className="max-w-[18rem] truncate px-4 py-2">
                      {click.userAgent ?? "unknown"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </main>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-white/10 bg-white/5 p-4">
      <p className="text-xs uppercase tracking-wide text-slate-400">{label}</p>
      <p className="mt-1 text-xl font-semibold text-white">{value}</p>
    </div>
  );
}
