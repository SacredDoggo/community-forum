import { NextRequest } from "next/server";

import sanitizeHtml from 'sanitize-html';

import prisma from '@/lib/prisma';
import { Post } from '@prisma/client';
import { timeCheckFunction } from '@/lib/ddos-protector';


export async function POST(req: NextRequest) {
    const forwarded = req.headers.get("x-forwarded-for");
    const clientId = Array.isArray(forwarded) ? forwarded[0] : forwarded || "unknown";

    const isAllowed = timeCheckFunction(clientId as string);
    if (!isAllowed)
        return Response.json({ message: "Requests too frequent" }, { status: 429 });


    let post: Post;
    try {
        post = await req.json();
    } catch {
        return Response.json({ feedback: "bad request", message: "Invalid JSON" }, { status: 400 });
    }

    if (!post)
        return Response.json({ feedback: "bad request", message: "Arguments missing" });

    const { id, ...updateData } = post;

    const cleanTitle = sanitizeHtml(post.title);

    const validFields = ["title", "content", "likes", "dislikes", "draft", "tags", "archived", "total_comments"];
    const sanitizedUpdatedata = Object.fromEntries(
        Object.entries(updateData).filter(([key]) => validFields.includes(key))
    );

    try {
        const updatedPost = await prisma.post.update({
            where: {
                id: id
            },
            data: {
                ...sanitizedUpdatedata,
                title: cleanTitle
            }
        });

        return Response.json({ feedback: "ok", post_id: updatedPost.id });
    } catch (error) {
        console.log(JSON.stringify(error));

        return Response.json({ feedback: "error", message: error });
    }
};