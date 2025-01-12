"use client";

import { useEffect, useMemo, useState } from "react";
import dynamic from "next/dynamic";
import { useParams, useRouter, useSearchParams } from "next/navigation";

import { toast } from "sonner";
import { useUser } from "@clerk/nextjs";
import { ContentState, convertFromRaw, convertToRaw, EditorState, RawDraftContentState } from "draft-js";
import { TriangleAlertIcon } from "lucide-react";

import { Spinner } from "@/components/spinner";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";

import { getPostById, updatePost } from "@/db/api-controller";

import { Post } from "@prisma/client";

const PostByIdPage = () => {
    const Editor = useMemo(() => dynamic(() => import("@/components/editor"), { ssr: false }), []);

    const router = useRouter();
    const params = useParams();
    const searchParams = useSearchParams();

    const { isSignedIn, user, isLoaded } = useUser();

    const [editing, setEditing] = useState(searchParams.get("editing") === "true");

    const [postLoading, setPostLoading] = useState(true);

    const [content, setContent] = useState<EditorState>(EditorState.createEmpty());
    const [title, setTitle] = useState("");

    const [titleEmptyWarning, setTitleEmptyWarning] = useState(false);
    const [contentEmptyWarning, setcontentEmptyWarning] = useState(false);

    const [saving, setSaving] = useState(false);

    const [post, setPost] = useState<Post>({
        title: "",
        id: "",
        user_id: "",
        content: "",
        tags: [],
        draft: false,
        archived: false,
        likes: 0,
        dislikes: 0,
        total_comments: 0,
        created_at: new Date(),
        updated_at: new Date()
    });

    useEffect(() => {
        const loadPost = async () => {
            const fetchedPost = await getPostById({
                post_id: params.post_id as string
            });

            if (!!!fetchedPost) router.push("/not-found");

            setPost(fetchedPost);
            setTitle(fetchedPost.title);

            const rawContent = await JSON.parse(fetchedPost.content);
            const contentState = convertFromRaw(rawContent);

            setContent(EditorState.createWithContent(contentState));

            setPostLoading(false);
        }

        loadPost();
    }, [params.post_id, router]);


    // Convert content to raw JSON for saving or debugging
    const getRawContent = (): RawDraftContentState => {
        const contentState: ContentState = content.getCurrentContent();
        return convertToRaw(contentState);
    };

    const handleSubmitClick = (draft?: boolean) => {
        if (!isSignedIn) return;

        if (!title.length) setTitleEmptyWarning(true);
        if (!content.getCurrentContent().getPlainText().length) setcontentEmptyWarning(true);

        if (!title.length || !content.getCurrentContent().getPlainText().length) return;

        const updateThePost = async () => {
            try {
                setSaving(true);

                const data = await updatePost({
                    ...post,
                    title,
                    content: JSON.stringify(getRawContent()),
                    draft: !!draft
                });

                if (data?.message === "Requests too frequent") {
                    toast.error("Please wait a moment before making another request.")
                    setSaving(false);
                    return;
                }

                if (!data || data.feedback !== "ok") throw new Error;

                setSaving(false);
                setEditing(false || !!draft);

                toast.success(!!draft ? "Post saved sucessfully" : "Post updated sucessfully");

            } catch (error) {
                toast.error(!!draft ? "Cannot save post." : "Cannot update post.");
                console.log(error);

                setSaving(false);
            }
        }

        updateThePost();

        setTitleEmptyWarning(false);
        setcontentEmptyWarning(false);
    }


    if (postLoading && !isLoaded)
        return <div className="flex h-full w-full items-center justify-center">
            <Spinner size="lg" />
        </div>

    return (
        <div className="flex justify-center p-4">
            <div className="w-full max-w-[700px]">
                {user && user.id == post.user_id &&
                    <div className="flex justify-between mb-4">
                        <div className="h-9 flex items-center">
                            <span className="font-medium mr-4">Edit mode</span>
                            <Switch checked={editing} onCheckedChange={setEditing} />
                        </div>
                        {editing &&
                            <div className="flex justify-end gap-x-4">
                                <Button
                                    variant="secondary"
                                    className="bg-[rgb(255,200,0)] text-black hover:bg-[rgb(215,160,0)]"
                                    onClick={() => handleSubmitClick(true)}
                                    disabled={saving}
                                >
                                    Save as Draft
                                </Button>
                                <Button
                                    variant="secondary"
                                    className="bg-[rgb(40,160,30)] text-white hover:bg-[rgb(40,120,30)]"
                                    onClick={() => handleSubmitClick()}
                                    disabled={saving}
                                >
                                    Post
                                </Button>
                            </div>
                        }
                    </div>
                }
                <div className="flex flex-col">
                    <div className="space-y-1">
                        {titleEmptyWarning &&
                            <p className="flex text-red-600 items-center text-xs">
                                <TriangleAlertIcon className="h-3 w-3 mr-1" /> Title cannot be empty...
                            </p>
                        }
                        <Input
                            placeholder="Enter title..."
                            type="text"
                            readOnly={!(editing && user && user.id == post.user_id)}
                            value={title}
                            className="bg-white border-4 h-12 lg:h-16 focus-visible:ring-transparent font-semibold lg:text-3xl"
                            onChange={(e) => setTitle(e.target.value)}
                        />

                    </div>
                    <div className="space-y-1">
                        {contentEmptyWarning &&
                            <p className="flex text-red-600 items-center text-xs">
                                <TriangleAlertIcon className="h-3 w-3 mr-1" /> Description cannot be empty...
                            </p>
                        }
                        <Editor
                            editorState={content}
                            setEditorState={setContent}
                            readOnly={!(editing && user && user.id == post.user_id)}
                        />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PostByIdPage;