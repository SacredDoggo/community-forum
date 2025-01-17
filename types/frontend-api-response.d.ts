
interface createPostSuccessResponse {
    feedback: string;
    post_id: string;
}

interface getPostByIdSucessInterface {
    feedback: string;
    post: Post;
    status: number;
}

interface updateResponse {
    feedback: string;
    post_id?: string;
    message?: string;
}

interface GetFeedResponse {
    error?: string;
    posts?: Post[];
    nextCursor?: string;
}