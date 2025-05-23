"use server"

import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";

 
export default async function SaveRecipeButton() {

    const handleSaveRecipe = async (formData: FormData) => {


    const title = formData.get('title') as string;
    const description = formData.get('description') as string;
    const font = formData.get('font') as string;
    const pdfSize = formData.get('pdfSize') as string;

    // Create the post using Prisma
    await prisma.card.create({
      data: {
        title,
        description,
        font,
        pdfSize,
      },
    });
  };
  console.log(handleSaveRecipe);
  
  redirect('/my-recipes')
}