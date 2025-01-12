"use server";

import prisma from "@/lib/prisma";
import { auth, currentUser } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";

export const syncUser = async () => {
  try {
    const { userId } = await auth();
    const user = await currentUser();

    // kalau user tidak authenticated
    if (!userId || !user) return;

    // check kalau userId sudah ada di db
    const userExist = await prisma.user.findUnique({
      where: {
        clerkId: userId,
      },
    });

    if (userExist) return userExist;

    // kalau user authenticated tapi belum ada di db maka create
    const dbUser = await prisma.user.create({
      data: {
        clerkId: userId,
        name: `${user.firstName || ""} ${user.lastName || ""}`,
        username:
          user.username ?? user.emailAddresses[0].emailAddress.split("@")[0],
        email: user.emailAddresses[0].emailAddress,
        image: user.imageUrl,
      },
    });

    return dbUser;
  } catch (error) {
    console.log("Error in syncUser", error);
  }
};

export const getUserByClerkId = async (clerkId: string) => {
  return prisma.user.findUnique({
    where: {
      clerkId,
    },
    // Include bagian ini
    include: {
      // _count Ngitung beberapa hal yang nyambung ke user ini seperti followers, following, dan posts
      _count: {
        select: {
          followers: true,
          following: true,
          posts: true,
        },
      },
    },
  });
};

// function untuk mengambil user ID
export const getDbUserId = async () => {
  const { userId: clerkId } = await auth();
  if (!clerkId) throw new Error("Unauthenticated");

  const user = await getUserByClerkId(clerkId);
  if (!user) throw new Error("User not Found!");

  return user.id;
};

export const getRandomUser = async () => {
  try {
    const userId = await getDbUserId();

    // cari 3 random users kecuali kita sendiri dan users yang sudah difollow
    const randomUser = await prisma.user.findMany({
      where: {
        AND: [
          { NOT: { id: userId } },
          {
            NOT: {
              followers: { some: { followerId: userId } },
            },
          },
        ],
      },
      select: {
        id: true,
        name: true,
        username: true,
        image: true,
        _count: {
          select: {
            followers: true,
          },
        },
      },
      take: 3,
    });

    return randomUser;
  } catch (error) {
    console.log("Error fetching random users", error);
    return [];
  }
};

export const toggleFollow = async (targetUserId: string) => {
  try {
    const userId = await getDbUserId();

    if (userId === targetUserId) throw new Error("You cannot follow yourself");

    const existingFollow = await prisma.follows.findUnique({
      where: {
        followerId_followingId: {
          followerId: userId,
          followingId: targetUserId,
        },
      },
    });

    if (existingFollow) {
      // unfollow
      await prisma.follows.delete({
        where: {
          followerId_followingId: {
            followerId: userId,
            followingId: targetUserId,
          },
        },
      });
    } else {
      // follow
      // $transaction digunakan untuk menjalankan beberapa query dalam satu transaksi
      // kalau satu query error maka semua query akan di error
      await prisma.$transaction([
        prisma.follows.create({
          data: {
            followerId: userId,
            followingId: targetUserId,
          },
        }),

        prisma.notification.create({
          data: {
            type: "FOLLOW",
            userId: targetUserId, // user yang difollow
            creatorId: userId, // user yang mengfollow
          },
        }),
      ]);
    }

    revalidatePath("/");
    return { success: true };
  } catch (error) {
    console.log("Error toggling follow", error);
    return { success: false, error: "Error toggling follow" };
  }
};
