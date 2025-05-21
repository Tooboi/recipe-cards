// app/api/cards/route.ts

import { PrismaClient } from '@prisma/client';
import { NextResponse } from 'next/server';

const prisma = new PrismaClient();

export async function POST(req: Request) {
  const body = await req.json();

  try {
    const newCard = await prisma.card.create({
      data: {
        title: body.title,
        description: body.description,
        instructions: body.instructions,
        ingredients: body.ingredients,
        font: body.font,
        pdfSize: body.pdfSize,
        // add any additional fields as needed
      },
    });

    return NextResponse.json(newCard, { status: 201 });
  } catch (error) {
    console.error('Error saving card:', error);
    return NextResponse.json({ error: 'Could not save card' }, { status: 500 });
  }
}
