/* eslint-disable @typescript-eslint/no-explicit-any */
"use server";

import prisma from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { revalidatePath } from "next/cache";
// import crypto from "crypto";

// READ actions
// export async function getUsersRecipes() {
//   try {
//     const usersRecipes = await prisma.recipe.findMany({
//       where: {

//       }
//     })
//   } catch (error) {

//   }
// }

// const tempClerkUserId = `temp_${crypto.randomUUID()}`;


export async function getUsers() {
  try {
    const users = await prisma.user.findMany({
      include: {
        Recipe: true,
        _count: {
          select: { Recipe: true },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
      cacheStrategy: {
        ttl: 60, // Cache is fresh for 60 seconds
        tags: ["users_list"], // Tag for cache invalidation
      },
    });

    return users;
  } catch (error) {
    console.error("Error fetching users:", error);
    throw new Error("Failed to fetch users");
  }
}

export async function getUserById(id: string) {
  try {
    const user = await prisma.user.findUnique({
      where: { id: id },
      include: {
        Recipe: {
          orderBy: {
            createdAt: "desc",
          },
        },
      },
      cacheStrategy: {
        ttl: 30, // Fresh for 30 seconds
        swr: 60, // Then stale but acceptable for 60 more seconds
        tags: [`user_${id}`], // User-specific tag
      },
    });

    if (!user) {
      throw new Error("User not found");
    }

    return user;
  } catch (error) {
    console.error(`Error fetching user with ID ${id}:`, error);
    throw error;
  }
}

export async function getUserByEmail(email: string) {
  const user = await prisma.user.findUnique({
    where: { email },
    include: {
      Recipe: {
        orderBy: { createdAt: "desc" },
      },
    },
    cacheStrategy: {
      ttl: 30,
      swr: 60,
      tags: [`user_${email}`],
    },
  });

  if (!user) throw new Error("User not found");
  return user;
}

// CREATE actions
export async function createUser({
  email,
  username,
  password,
}: {
  email: string;
  username?: string;
  password: string;
}) {
  if (!email) {
    throw new Error("Email is required");
  }
  if (!password) {
    throw new Error("Password is required");
  }
  const hashedPassword = await bcrypt.hash(password, 10);

  // const clerkUserId = `temp_${crypto.randomUUID()}`;

  try {
    const user = await prisma.user.create({
      data: {
        email,
        username,
        hashedPassword,
        // clerkUserId
      },
    });

    // Revalidate the home page to show the new user
    revalidatePath("/");

    return user;
  } catch (error: any) {
    // Handle duplicate email error
    if (error.code === "P2002") {
      throw new Error("A user with this email already exists");
    }

    throw new Error("Failed to create user");
  }
}

// Post actions
export async function createRecipe({
  title,
  description,
  ingredients,
  instructions,
  font,
  pdfSize,
  hidden,
  id,
  imageId,
  author,
  serving,
}: {
  title: string;
  description?: string;
  ingredients: string[];
  instructions: string[];
  font: string;
  pdfSize: string;
  hidden: boolean;
  id: string;
  imageId?: string;
  author?: string;
  serving: string;
}) {
  if (!title) {
    throw new Error("Title is required");
  }
  try {
    // Ensure the author exists
    const userExists = await prisma.user.findUnique({
      where: { id: id },
    });
    if (!userExists) {
      throw new Error("User not found");
    }

    const post = await prisma.recipe.create({
      data: {
        title,
        description,
        ingredients,
        instructions,
        font,
        pdfSize,
        hidden,
        user: {
          connect: { id: id },
        },
        imageId,
        author,
        serving,
      },
    });

    // Revalidate the home page to show the new post
    revalidatePath("/");

    return post;
  } catch (error) {
    console.error("Error creating post:", error);
    throw error;
  }
}

export async function updateRecipe({
  id,
  title,
  description,
  ingredients,
  instructions,
  font,
  pdfSize,
  hidden,
  imageId,
  author,
}: {
  id: string;
  title: string;
  description?: string;
  ingredients: string[];
  instructions: string[];
  font: string;
  pdfSize: string;
  hidden: boolean;
  imageId?: string;
  author?: string;
}) {
  if (!title) {
    throw new Error("Title is required");
  }
  //
  //   // Ensure the author exists
  //   const userExists = await prisma.user.findUnique({
  //     where: { clerkUserId: clerkUserId },
  //   }
  // )
  //   if (!userExists) {
  //     throw new Error('User not found');
  //   }
  try {
    const post = await prisma.recipe.update({
      where: { id: id },
      data: {
        title,
        description,
        ingredients,
        instructions,
        font,
        pdfSize,
        hidden,
        imageId,
        author,
      },
    });

    // Revalidate the home page to show the new post
    revalidatePath(`/`);

    return post;
  } catch (error) {
    console.error("Error creating post:", error);
    throw error;
  }
}

// Comment actions
// export async function createComment({ content, postId, authorId }: { content: string; postId: string; authorId: string }) {
//   if (!content || !postId || !authorId) {
//     throw new Error('Content, post, and author are required');
//   }

//   try {
//     // Ensure both the post and author exist
//     const postExists = await prisma.recipe.findUnique({
//       where: { id: postId },
//     });

//     const authorExists = await prisma.user.findUnique({
//       where: { id: authorId },
//     });

//     if (!postExists) {
//       throw new Error('Post not found');
//     }

//     if (!authorExists) {
//       throw new Error('Author not found');
//     }

//     const comment = await prisma.comment.create({
//       data: {
//         content,
//         post: {
//           connect: { id: postId },
//         },
//         author: {
//           connect: { id: authorId },
//         },
//       },
//       include: {
//         author: true,
//         post: true,
//       },
//     });

//     // Revalidate the home page to show the new comment
//     revalidatePath('/');

//     return comment;
//   } catch (error) {
//     console.error('Error creating comment:', error);
//     throw error;
//   }
// }
