import prisma from '@/lib/prisma'
import { User } from '@prisma/client'

export async function createUser(data: User) {
  try {
    const user = await prisma.user.create({ data })
    return { user }
  } catch (error) {
    return { error }
  }
}

export async function getUserById({
  id,
  clerkUserId
}: {
  id?: string
  clerkUserId?: string
}) {
  try {
    if (!id && !clerkUserId) {
      throw new Error('id or clerkUserId is required')
    }

    const query = id ? { id } : { clerkUserId }

    const user = await prisma.user.findUnique({ where: query })
    return { user }
  } catch (error) {
    return { error }
  }
}

export async function UpdateUser(clerkUserId: string, data: Partial<User>) {
  try {
    const user = await prisma.user.update({
      where: { clerkUserId },
      data
    })
    return { user }
  } catch (error) {
    return { error }
  }
}

export async function deleteUser(clerkUserId: string) {
  try {
    const user = await prisma.user.delete({
      where: { clerkUserId },
    });
    return { user };
  } catch (error) {
    return { error };
  }
}
