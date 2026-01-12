/* eslint-disable @typescript-eslint/no-explicit-any */
"use server";

import prisma from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { revalidatePath, revalidateTag } from "next/cache";

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
  image,
}: {
  email: string;
  username: string;
  password: string;
  image: string;
}) {
  if (!email) {
    throw new Error("Email is required");
  }
  if (!password) {
    throw new Error("Password is required");
  }
  const hashedPassword = await bcrypt.hash(password, 10);
  const normalizedEmail = email.toLowerCase().trim();

  try {
    const user = await prisma.user.create({
      data: {
        email: normalizedEmail,
        username,
        hashedPassword,
        image,
      },
    });

    // Revalidate the home page to show the new user

    revalidatePath("/");
    revalidatePath("/new-recipe");
    return user;
  } catch (error: any) {
    // Handle duplicate email error
    if (error.code === "P2002") {
      throw new Error("A user with this email already exists");
    }
    if (error) {
      console.error("Error creating user:", error);
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

//? UPDATE actions

export async function updateUsername({
  id,
  username,
}: {
  id: string;
  username: string;
}) {
  if (!id) {
    throw new Error("User not authenticated");
  }

  if (!username || username.length < 3) {
    throw new Error("Username must be at least 3 characters");
  }

  try {
    // Ensure username is unique
    const existingUser = await prisma.user.findFirst({
      where: { username },
    });

    if (existingUser) {
      throw new Error("Username already taken");
    }

    await prisma.user.update({
      where: { id: id },
      data: { username },
    });

    revalidatePath("/profile");
    revalidatePath(`/users/${id}`);
    revalidateTag(`user_${id}`);
    revalidateTag("users_list");

    return { success: true };
  } catch (error) {
    console.error("Error updating username:", error);
    throw error;
  }
}

export async function updatePassword({
  id,
  currentPassword,
  newPassword,
}: {
  id: string;
  currentPassword: string;
  newPassword: string;
}) {
  if (!id) {
    throw new Error("User not authenticated");
  }

  if (!currentPassword || !newPassword) {
    throw new Error("All password fields are required");
  }

  if (newPassword.length < 8) {
    throw new Error("Password must be at least 8 characters");
  }

  try {
    const user = await prisma.user.findUnique({
      where: { id: id },
    });

    if (!user || !user.hashedPassword) {
      throw new Error("User not found");
    }

    const passwordMatches = await bcrypt.compare(
      currentPassword,
      user.hashedPassword
    );

    if (!passwordMatches) {
      throw new Error("Current password is incorrect");
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    await prisma.user.update({
      where: { id: id },
      data: { hashedPassword },
    });

    revalidatePath("/profile");

    return { success: true };
  } catch (error) {
    console.error("Error updating password:", error);
    throw error;
  }
}

export async function updateProfileImage({
  id,
  image,
}: {
  id: string;
  image: string;
}) {
  if (!id) {
    throw new Error("User not authenticated");
  }

  if (!image) {
    throw new Error("Image is required");
  }

  try {
    await prisma.user.update({
      where: { id },
      data: { image },
    });

    // Revalidate profile + public pages
    revalidatePath("/profile");
    revalidatePath(`/users/${id}`);

    // Revalidate cached data
    revalidateTag(`user_${id}`);
    revalidateTag("users_list");
    revalidateTag(`user_image`);

    return { success: true };
  } catch (error) {
    console.error("Error updating profile image:", error);
    throw new Error("Failed to update profile image");
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
