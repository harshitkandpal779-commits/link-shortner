import { NextResponse } from "next/server";
import { desc, eq } from "drizzle-orm";
import { db } from "@/db";
import { clicks, links } from "@/db/schema";

export const dynamic = "force-dynamic";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ code: string }> },
) {
  const { code } = await params;
  const [link] = await db
    .select()
    .from(links)
    .where(eq(links.code, code))
    .limit(1);

  if (!link) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const recent = await db
    .select()
    .from(clicks)
    .where(eq(clicks.linkId, link.id))
    .orderBy(desc(clicks.createdAt))
    .limit(20);

  return NextResponse.json({ link, recent });
}

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ code: string }> },
) {
  const { code } = await params;
  const deleted = await db
    .delete(links)
    .where(eq(links.code, code))
    .returning({ id: links.id });

  if (deleted.length === 0) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  return NextResponse.json({ ok: true });
}
