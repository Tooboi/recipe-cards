// 'use server';

// import prisma from '@/lib/prisma';
// import bcrypt from 'bcryptjs';
// import { revalidatePath } from 'next/cache';

// // READ actions
// export async function getUsers() {
//   try {
//     const users = await prisma.user.findMany({
//       include: {
//         Recipe: true,
//         _count: {
//           select: { Recipe: true },
//         },
//       },
//       orderBy: {
//         createdAt: 'desc',
//       },
//       cacheStrategy: {
//         ttl: 60, // Cache is fresh for 60 seconds
//         tags: ['users_list'], // Tag for cache invalidation
//       },
//     });

//     return users;
//   } catch (error) {
//     console.error('Error fetching users:', error);
//     throw new Error('Failed to fetch users');
//   }
// }

// export async function getRecipes(limit = 5) {
//   try {
//     const recipes = await prisma.recipe.findMany({
//       include: {
//         title: true,
//         comments: {
//           include: {
//             user: true,
//           },
//           orderBy: {
//             createdAt: 'desc',
//           },
//         },
//         _count: {
//           select: { comments: true },
//         },
//       },
//       orderBy: {
//         createdAt: 'desc',
//       },
//       take: limit,
//       //   cacheStrategy: {
//       //     swr: 120, // Serve stale data for up to 120 seconds while revalidating
//       //     tags: ['recipes_list'], // Tag for cache invalidation
//       //   },
//     });

//     return recipes;
//   } catch (error) {
//     console.error('Error fetching recipes:', error);
//     throw new Error('Failed to fetch recipes');
//   }
// }

// export async function getUserById(id: string) {
//   try {
//     const user = await prisma.user.findUnique({
//       where: { id },
//       include: {
//         Recipe: {
//           orderBy: {
//             createdAt: 'desc',
//           },
//         },
//         // recipes: {
//         //   orderBy: {
//         //     createdAt: 'desc',
//         //   },
//         //   take: 10,
//         // },
//         // _count: {
//         //   select: { posts: true },
//         // },
//       },
//       cacheStrategy: {
//         ttl: 30, // Fresh for 30 seconds
//         swr: 60, // Then stale but acceptable for 60 more seconds
//         tags: [`user_${id}`], // User-specific tag
//       },
//     });

//     if (!user) {
//       throw new Error('User not found');
//     }

//     return user;
//   } catch (error) {
//     console.error(`Error fetching user with ID ${id}:`, error);
//     throw error;
//   }
// }

// // CREATE actions
// export async function createUser({ email, name, password }: { email: string; name?: string; password: string }) {
//   if (!email) {
//     throw new Error('Email is required');
//   }
//   if (!password) {
//     throw new Error('Password is required');
//   }
//   const hashedPassword = await bcrypt.hash(password, 10);

//   try {
//     const user = await prisma.user.create({
//       data: {
//         email,
//         name,
//         hashedPassword,
//       },
//     });

//     // Revalidate the home page to show the new user
//     revalidatePath('/');

//     return user;
//   } catch (error: any) {
//     // Handle duplicate email error
//     if (error.code === 'P2002') {
//       throw new Error('A user with this email already exists');
//     }

//     throw new Error('Failed to create user');
//   }
// }

// // Post actions
// export async function createRecipe({ title, description, ingredients, instructions, font, pdfSize, hidden, userId }: { title: string; description?: string; ingredients: string[]; instructions: string[]; font: string; pdfSize: string; hidden: boolean; userId: string }) {
//   // if (!title || !userId) {
//   //   throw new Error('Title is required');
//   // }

//   try {
//     // Ensure the author exists
//     const userExists = await prisma.user.findUnique({
//       where: { id: userId },
//     }
  
//   );

//     if (!userExists) {
//       throw new Error('User not found');
//     }
// console.log(userExists)
//     const post = await prisma.recipe.create({
//       data: {
//         title,
//         description,
//         ingredients,
//         instructions,
//         font,
//         pdfSize,
//         hidden,
//         user: {
//           connect: { id: userId },
//         },
//       }
//     });

//     // Revalidate the home page to show the new post
//     revalidatePath('/');

//     return post;
//   } catch (error) {
//     console.error('Error creating post:', error);
//     throw error;
//   }
// }

// // Comment actions
// // export async function createComment({ content, postId, authorId }: { content: string; postId: string; authorId: string }) {
// //   if (!content || !postId || !authorId) {
// //     throw new Error('Content, post, and author are required');
// //   }

// //   try {
// //     // Ensure both the post and author exist
// //     const postExists = await prisma.recipe.findUnique({
// //       where: { id: postId },
// //     });

// //     const authorExists = await prisma.user.findUnique({
// //       where: { id: authorId },
// //     });

// //     if (!postExists) {
// //       throw new Error('Post not found');
// //     }

// //     if (!authorExists) {
// //       throw new Error('Author not found');
// //     }

// //     const comment = await prisma.comment.create({
// //       data: {
// //         content,
// //         post: {
// //           connect: { id: postId },
// //         },
// //         author: {
// //           connect: { id: authorId },
// //         },
// //       },
// //       include: {
// //         author: true,
// //         post: true,
// //       },
// //     });

// //     // Revalidate the home page to show the new comment
// //     revalidatePath('/');

// //     return comment;
// //   } catch (error) {
// //     console.error('Error creating comment:', error);
// //     throw error;
// //   }
// // }
