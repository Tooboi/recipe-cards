import { auth } from "@/auth";
import prisma from "@/lib/prisma";

export default async function GetUserID() {
      // Find user object ID from session
  const session = await auth();
//   const isSignedIn = !!session?.user;

  let internalUserId: string | null = null;

  if (session?.user?.email) {
    const dbUser = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { id: true },
    });
    internalUserId = dbUser?.id ?? null;
    console.log(internalUserId);
    return internalUserId;
  } else {
    console.log("No user email found in session.");
    return null;
  }
}