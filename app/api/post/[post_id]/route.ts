import { didSomeTimePass } from "@/lib/ddos-protector";
import prisma from "@/lib/prisma";

export async function GET(
    req: Request,
    { params }: { params: Promise<{ post_id: string }> }
) {
    if (!didSomeTimePass("post-related")) return Response.json({ message: "Requests too frequent" }, { status: 503 });

    const post_id = (await params).post_id;

    if (!post_id)
        return Response.json({ feedback: "bad request", message: "Arguments missing" }, { status: 400 });

    try {
        const post = await prisma.post.findUnique({
            where: {
                id: post_id
            }
        });

        if (post == null) return Response.json({ feedback: "post not found" }, { status: 404 });

        return Response.json({ status: "ok", post });
    } catch (error) {
        return Response.json({ feedback: "error", message: error }, { status: 500 });
    }
}