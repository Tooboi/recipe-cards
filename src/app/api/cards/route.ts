import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import getServerSession from 'next-auth';
import { authOptions } from '../../../lib/auth';

const prisma = new PrismaClient();

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  console.log(session);
  

  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const data = await req.json();
  const { title, description, ingredients, instructions, font, pdfSize } = data;

  try {
    const card = await prisma.card.create({
      data: {
        title,
        description,
        font,
        pdfSize,
        user: {
          connect: { email: session.user.email },
        },
        ingredients: {
          create: ingredients.map((ingredient: any) => ({
            quantity: ingredient.quantity,
            unit: ingredient.unit,
            item: ingredient.item,
          })),
        },
        instructions: {
          create: instructions.map((step: string, index: number) => ({
            step,
            order: index,
          })),
        },
      },
    });

    return NextResponse.json(card);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Something went wrong' }, { status: 500 });
  }
}
