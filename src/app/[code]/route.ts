import { NextResponse } from "next/server";
import { eq, sql } from "drizzle-orm";
import { db } from "@/db";
import { clicks, links } from "@/db/schema";
import { RESERVED } from "@/lib/links";

export const dynamic = "force-dynamic";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ code: string }> },
) {
  const { code } = await params;

  if (!code || RESERVED.has(code.toLowerCase())) {
    return NextResponse.redirect(new URL("/", req.url), 307);
  }

  const [link] = await db
    .select()
    .from(links)
    .where(eq(links.code, code))
    .limit(1);

  if (!link) {
    const safeCode = code.replace(/[<>&"']/g, "");
    return new NextResponse(
      `<!doctype html><html><head><meta charset="utf-8"><title>Link not found</title><style>body{font-family:ui-sans-serif,system-ui,sans-serif;background:#0f172a;color:#e2e8f0;display:grid;place-items:center;height:100vh;margin:0}a{color:#38bdf8}</style></head><body><div style="text-align:center"><h1 style="font-size:3rem;margin:0">404</h1><p>No short link exists for <code>/${safeCode}</code>.</p><p><a href="/">Create one &rarr;</a></p></div></body></html>`,
      { status: 404, headers: { "content-type": "text/html; charset=utf-8" } },
    );
  }

  try {
    await db
      .update(links)
      .set({
        clicks: sql`${links.clicks} + 1`,
        lastVisitedAt: new Date(),
      })
      .where(eq(links.id, link.id));

    await db.insert(clicks).values({
      linkId: link.id,
      referrer: req.headers.get("referer"),
      userAgent: req.headers.get("user-agent"),
    });
  } catch {
    // Analytics failures must not prevent a valid redirect.
  }

  return NextResponse.redirect(link.url, {
    status: 302,
    headers: { "cache-control": "no-store" },
  });
}
