"use server";

import prisma from "@/lib/prisma";
import { getDbUserId } from "./user.action";
import { revalidatePath } from "next/cache";

export const createPost = async (content: string, image: string) => {
  try {
    const userId = await getDbUserId();

    const post = await prisma.post.create({
      data: {
        content,
        image,
        authorId: userId,
      },
    });

    // Fungsi ini memastikan halaman utama refresh dan langsung nampilin postingan baru di homepage
    revalidatePath("/"); // purge the cache for the home page
    return { success: true, post };
  } catch (error) {
    console.log("Failed to create post", error);
    return { success: false, error: "Failed to create post" };
  }
};
