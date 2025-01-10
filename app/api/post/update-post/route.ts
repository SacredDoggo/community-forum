import sanitizeHtml from 'sanitize-html';

import prisma from '@/lib/prisma';
import { Post } from '@prisma/client';
import { didSomeTimePass } from '@/lib/ddos-protector';


export async function POST(req: Request) {
    if (!didSomeTimePass("post-related")) return Response.json({ feedback: "Service unavailable", message: "Requests too frequent" }, { status: 503 });

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