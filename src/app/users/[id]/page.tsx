import UserID from '@/components/UserID';
import prisma from '@/lib/prisma';
import {currentUser} from '@clerk/nextjs/server';


export default async function UserIDpage() {
  const loggedUser = await currentUser();
  console.log(currentUser);
  
  const userMongo = await prisma.recipe.findUnique({
    where: {
      id:  loggedUser?.id  }
  })
  return (
    <div><p>{loggedUser?.username}</p>
      {/* <UserID /> */}
    </div>
  );
}
