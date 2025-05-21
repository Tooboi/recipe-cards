// app/api/recipes/route.ts
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function POST(req: Request) {
  const body = await req.json();

  try {
    const card = await prisma.card.create({
      data: {
        title: body.title,
        description: body.description,
        instructions: body.instructions,
        ingredients: body.ingredients,
        font: body.font,
        pdfSize: body.pdfSize,
      },
    });

    return new Response(JSON.stringify(card), { status: 200 });
  } catch (error) {
    console.error(error);
    return new Response('Error creating recipe', { status: 500 });
  }
}
