interface createNewPostInterface {
    user_id: string;
    title: string;
    content: string;
    draft?: boolean;
};

interface getPostByIdInterface {
    post_id: string;
}

interface fetchFeedInterface {
    user_id: string | null;
    cursor: string | null;
}