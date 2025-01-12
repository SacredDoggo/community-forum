import { createPostSuccessResponse, getPostByIdSucessInterface, updateResponse } from "@/types/frontend-api-response";
import { Post } from "@prisma/client";
import axios from "axios";

axios.defaults.validateStatus = () => true; // Treat all statuses as valid

const createNewOrSavePost = async ({ user_id, title, content, draft }: createNewPostInterface) => {
    try {

        const data = await axios.post<createPostSuccessResponse>(
            "/api/post/new-post",
            {
                user_id: user_id,
                title: title,
                content: content,
                draft: draft && true
            }
        ).then((response) => response.data);

        return data;
    } catch (error) {
        console.log(error);
    }
};

const getPostById = async ({ post_id }: getPostByIdInterface) => {
    const data = await axios.get<getPostByIdSucessInterface>(`/api/post/${post_id}`)
        .then(response => response.data.post);

    return data;
};

const updatePost = async (post: Post) => {
    try {

        const data = await axios.post<updateResponse>(
            "/api/post/update-post",
            post
        ).then((response) => response.data);

        return data;
    } catch (error) {
        console.log(error);
    }
};

export {
    createNewOrSavePost,
    getPostById,
    updatePost
};