import UserID from "@/components/UserID";
import prisma from "@/lib/prisma";
import { currentUser } from "@clerk/nextjs/server";
import { getUserById } from "@/app/actions";

export default async function UserIDpage() {
  const loggedUser = await currentUser();
  console.log(loggedUser);

  const user = await prisma.user.findUnique({
  where: { clerkUserId: loggedUser?.id },
});

console.log(user);


  return (
    <div>
      <p>{user?.email}</p>
      {/* {userMongo?.} */}
    </div>
  );
}
