import { NextResponse, type NextRequest } from "next/server";
import { auth } from "@/auth";
import prisma from "@/lib/prisma";

/** The installed app's start page: your recipes (or Saved with ?tab=saved), or sign-in. */
export async function GET(req: NextRequest) {
  const session = await auth();
  const go = (path: string) => NextResponse.redirect(new URL(path, req.url));
  if (!session?.user) return go("/signin");

  let id = session.user.id && /^[a-f0-9]{24}$/i.test(session.user.id) ? session.user.id : null;
  if (!id && session.user.email) {
    const user = await prisma.user
      .findUnique({ where: { email: session.user.email }, select: { id: true } })
      .catch(() => null);
    id = user?.id ?? null;
  }
  if (!id) return go("/signin");

  const saved = req.nextUrl.searchParams.get("tab") === "saved";
  return go(saved ? `/users/${id}/bookmarks` : `/users/${id}`);
}

export const dynamic = "force-dynamic";
