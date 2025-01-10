import { Post } from "@prisma/client";

interface createPostSuccessResponse {
    feedback: string;
    post_id: string;
}

interface getPostByIdSucessInterface {
    feedback: string;
    post: Post
}

interface updateResponse {
    feedback: string;
    post_id?: string;
    message?: string;
}