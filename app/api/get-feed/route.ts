import { NextResponse } from "next/server";

import prisma from "@/lib/prisma";
import { Prisma } from "@prisma/client";

const PAGE_SIZE = 10;

export async function GET(req: Request) {
  // const forwarded = req.headers.get("x-forwarded-for");
  // const clientId = Array.isArray(forwarded) ? forwarded[0] : forwarded || "unknown";

  // const isAllowed = timeCheckFunction(clientId as string, 100);
  // if (!isAllowed)
  //   return Response.json({ message: "Requests too frequent" }, { status: 429 });

  const { searchParams } = new URL(req.url);
  const userId = searchParams.get("userId");
  const cursor = searchParams.get("cursor");

  try {
    const parsedCursor = cursor ? new Date(cursor) : undefined;

    let posts;
    if (userId) {
      const userTags = await prisma.user.findUnique({
        where: { id: userId },
        select: {
          interested_tags: { include: { tag: true } },
          uninterested_tags: { include: { tag: true } },
        },
      });

      const interestedTagIds = userTags?.interested_tags.map((t: Prisma.UserTagGetPayload<{ include: { tag: true } }>) => t.tag?.id) || [];
      const uninterestedTagIds = userTags?.uninterested_tags.map((t: Prisma.UserTagGetPayload<{ include: { tag: true } }>) => t.tag?.id) || [];

      posts = await prisma.post.findMany({
        where: {
          AND: [
            { tags: { hasSome: interestedTagIds.length > 0 ? interestedTagIds : undefined } },
            { tags: { not: { hasSome: uninterestedTagIds } } },
            { draft: false },
            { archived: false },
            ...(parsedCursor ? [{ created_at: { lt: parsedCursor } }] : []),
          ],
        },
        orderBy: { created_at: "desc" },
        take: 10,
      });
    } else {
      posts = await prisma.post.findMany({
        where: {
          draft: false,
          archived: false,
          ...(parsedCursor ? { created_at: { lt: parsedCursor } } : {}),
        },
        orderBy: { created_at: "desc" },
        take: PAGE_SIZE,
      });
    }

    return NextResponse.json({
      posts,
      nextCursor: posts.length > 0 ? posts[posts.length - 1].created_at.toISOString() : null,
    });
  } catch (error) {
    console.error("Error fetching feed:", error);

    // Always return a valid JSON object
    return NextResponse.json(
      { error: "Internal server error", details: String(error) },
      { status: 500 }
    );
  }
}
