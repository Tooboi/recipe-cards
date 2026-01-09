import { NextResponse } from "next/server";
import { createUser } from "@/queries/users";

import bcrypt from "bcryptjs";

export const POST = async (request) => {
  const { username, email, password } = await request.json();

  console.log("Signup attempt:", { username, email, password });

  await connectToDatabase();

  const hashedPassword = await bcrypt.hash(password, 10);

  const newUser = {
    username,
    password: hashedPassword,
    email,
  };
  try {
    await createUser(newUser);
  } catch (error) {
    return new NextResponse(error.message, { status: 500 });
  }

  return new NextResponse("User created", { status: 201 });
};
