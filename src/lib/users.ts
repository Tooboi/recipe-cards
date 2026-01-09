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


