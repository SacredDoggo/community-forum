import { NextRequest } from "next/server";

import sanitizeHtml from 'sanitize-html';

import prisma from '@/lib/prisma';
import { Post } from '@prisma/client';
import { timeCheckFunction } from '@/lib/ddos-protector';


export async function POST(req: NextRequest) {
    const forwarded = req.headers.get("x-forwarded-for");
    const clientId = Array.isArray(forwarded) ? forwarded[0] : forwarded || "unknown";

    const isAllowed = await timeCheckFunction(clientId as string);
    if (!isAllowed)
        return Response.json({ message: "Requests too frequent" }, { status: 429 });
    const post: Post = await req.json();
    const { id, ...updateData } = post;

    if (!post)
        return Response.json({ feedback: "bad request", message: "Arguments missing" });

    const cleanTitle = sanitizeHtml(post.title);

    try {
        const updatedPost = await prisma.post.update({
            where: {
                id: id
            },
            data: {
                ...updateData,
                title: cleanTitle
            }
        });

        return Response.json({ feedback: "ok", post_id: updatedPost.id });
    } catch (error) {
        return Response.json({ feedback: "error", message: error });
    }
};