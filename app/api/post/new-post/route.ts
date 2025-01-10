import sanitizeHtml from 'sanitize-html';

import prisma from '@/lib/prisma';
import { didSomeTimePass } from '@/lib/ddos-protector';


export async function POST(req: Request) {
    if (!didSomeTimePass("post-related")) return Response.json({ message: "Requests too frequent" }, { status: 503 });

    const { user_id, title, content, tags, draft } = await req.json();

    if (!user_id || !title)
        return Response.json({ status: "bad request", message: "Arguments missing" });

    const cleanTitle = sanitizeHtml(title);

    try {
        const post = await prisma.post.create({
            data: {
                user_id: user_id,
                title: cleanTitle,
                content: content,
                tags: tags || [],
                draft: draft || false
            }
        });

        return Response.json({ status: "ok", post_id: post.id });
    } catch (error) {
        return Response.json({ status: "error", message: error });
    }
};