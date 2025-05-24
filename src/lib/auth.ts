// import { User } from "next-auth";
// import prisma from "./prisma";

// import { compare } from "bcryptjs";

// type LoginFn = (username: string, password: string) => Promise<User>;

// export const login: LoginFn = async (username, password) => {
//   const user = await prisma.user.findFirst({
//     where: {
//       email: username,
//     },
//   });
//   if (user && (await compare(password, user.hashedPassword))) {
//     user.hashedPassword = "";
//     return user;
//   } else throw new Error("User Not Found!");
// };