import { NextResponse } from "next/server";
import { desc, eq } from "drizzle-orm";
import { db } from "@/db";
import { links } from "@/db/schema";
import { generateCode, isValidSlug, normalizeUrl } from "@/lib/links";

export const dynamic = "force-dynamic";

function baseUrl(req: Request) {
  const headers = new Headers(req.headers);
  const proto =
    headers.get("x-forwarded-proto") ??
    new URL(req.url).protocol.replace(":", "");
  const host =
    headers.get("x-forwarded-host") ??
    headers.get("host") ??
    new URL(req.url).host;
  return `${proto}://${host}`;
}

export async function GET(req: Request) {
  const rows = await db
    .select()
    .from(links)
    .orderBy(desc(links.createdAt))
    .limit(25);

  const base = baseUrl(req);
  return NextResponse.json({
    links: rows.map((row) => ({
      ...row,
      shortUrl: `${base}/${row.code}`,
    })),
  });
}

export async function POST(req: Request) {
  let body: { url?: string; slug?: string };

  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const url = normalizeUrl(String(body.url ?? ""));
  if (!url) {
    return NextResponse.json(
      { error: "Please enter a valid http(s) URL." },
      { status: 400 },
    );
  }

  const base = baseUrl(req);
  const customSlug = String(body.slug ?? "").trim();

  if (customSlug) {
    if (!isValidSlug(customSlug)) {
      return NextResponse.json(
        {
          error:
            "Custom alias must be 3-64 characters (letters, numbers, - and _) and not reserved.",
        },
        { status: 400 },
      );
    }

    const existing = await db
      .select({ id: links.id })
      .from(links)
      .where(eq(links.code, customSlug))
      .limit(1);

    if (existing.length > 0) {
      return NextResponse.json(
        { error: "That alias is already taken." },
        { status: 409 },
      );
    }

    try {
      const [created] = await db
        .insert(links)
        .values({ code: customSlug, url })
        .returning();

      return NextResponse.json(
        { link: { ...created, shortUrl: `${base}/${created.code}` } },
        { status: 201 },
      );
    } catch {
      return NextResponse.json(
        { error: "That alias is already taken." },
        { status: 409 },
      );
    }
  }

  for (let attempt = 0; attempt < 6; attempt += 1) {
    const code = generateCode(attempt < 3 ? 6 : 8);

    try {
      const [created] = await db
        .insert(links)
        .values({ code, url })
        .returning();

      return NextResponse.json(
        { link: { ...created, shortUrl: `${base}/${created.code}` } },
        { status: 201 },
      );
    } catch {
      // Retry if a generated code collides with an existing record.
    }
  }

  return NextResponse.json(
    { error: "Could not generate a unique code, please try again." },
    { status: 500 },
  );
}
