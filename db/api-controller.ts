import { Post } from "@prisma/client";
import axios from "axios";

axios.defaults.validateStatus = () => true; // Treat all statuses as valid

const fetchFeed = async ({ user_id, cursor }: fetchFeedInterface) => {
    try {

        const data = await axios.get<GetFeedResponse>("/api/get-feed", {
            params: { user_id, cursor },
          });

        return data;
    } catch (error) {
        console.log(error);
    }
};


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
        .then(response => {return {...response.data.post, status: response.status}});

    return data;
};

const updatePost = async (post: Post) => {
    try {
        console.log(post);
        
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
    updatePost,
    fetchFeed
};