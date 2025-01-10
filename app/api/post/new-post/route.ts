import { NextRequest } from "next/server";

import sanitizeHtml from 'sanitize-html';

import prisma from '@/lib/prisma';
import { timeCheckFunction } from '@/lib/ddos-protector';


export async function POST(req: NextRequest) {
    const forwarded = req.headers.get("x-forwarded-for");
    const clientId = Array.isArray(forwarded) ? forwarded[0] : forwarded || "unknown";

    const isAllowed = timeCheckFunction(clientId as string);
    if (!isAllowed)
        return Response.json({ message: "Requests too frequent" }, { status: 429 });

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