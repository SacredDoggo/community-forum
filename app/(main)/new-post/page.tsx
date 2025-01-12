"use client";

import { useMemo, useState } from "react";
import dynamic from "next/dynamic";
import { useRouter } from "next/navigation";

import { useUser } from "@clerk/nextjs";
import { toast } from "sonner";
import { TriangleAlertIcon } from "lucide-react";
import { ContentState, convertToRaw, EditorState, RawDraftContentState } from "draft-js";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Spinner } from "@/components/spinner";

import { createNewOrSavePost } from "@/db/api-controller";

const NewPostPage = () => {
    const Editor = useMemo(() => dynamic(() => import("@/components/editor"), { ssr: false }), []);
    const { isSignedIn, user, isLoaded } = useUser();
    const router = useRouter();

    const [content, setContent] = useState<EditorState>(EditorState.createEmpty());
    const [title, setTitle] = useState("");

    const [titleEmptyWarning, setTitleEmptyWarning] = useState(false);
    const [contentEmptyWarning, setcontentEmptyWarning] = useState(false);

    const [saving, setSaving] = useState(false);

    // Convert content to raw JSON for saving or debugging
    const getRawContent = (): RawDraftContentState => {
        const contentState: ContentState = content.getCurrentContent();
        return convertToRaw(contentState);
    };

    const handlePostSubmitClick = () => {
        if (!isSignedIn) return;

        if (!title.length) setTitleEmptyWarning(true);
        if (!content.getCurrentContent().getPlainText().length) setcontentEmptyWarning(true);

        if (!title.length || !content.getCurrentContent().getPlainText().length) return;

        const createNewPost = async () => {
            try {
                setSaving(true);

                const data = await createNewOrSavePost({
                    user_id: user.id,
                    title,
                    content: JSON.stringify(getRawContent()),
                });

                if (!data) throw new Error;

                router.push(`/post/${data.post_id}`);

                toast.success("New post created");

            } catch (error) {
                toast.error("Cannot create post.");
                console.log(error);

                setSaving(false);
            }
        }

        createNewPost();

        setTitleEmptyWarning(false);
        setcontentEmptyWarning(false);
    }

    const handlePostSaveDraftClick = () => {
        if (!isSignedIn) return;

        if (!title.length) setTitleEmptyWarning(true);

        if (!title.length) return;

        const createNewDraftPost = async () => {
            try {
                setSaving(true);

                const data = await createNewOrSavePost({
                    user_id: user.id,
                    title,
                    content: JSON.stringify(getRawContent()),
                    draft: true
                });

                if (!data) throw new Error;

                router.push(`/post/${data.post_id}?editing=true`);

                toast.success("Post draft saved.");

            } catch (error) {
                toast.error("Cannot create draft.");
                console.log(error);

                setSaving(false);
            }
        }

        createNewDraftPost();

        setTitleEmptyWarning(false);
        setcontentEmptyWarning(false);
    }

    if (!isLoaded) {
        return <div className="flex h-full w-full items-center justify-center">
            <Spinner size="lg" />
        </div>
    }

    return (
        <div className="flex justify-center p-4">
            <div className="w-full max-w-[700px]">
                <div className="flex justify-end gap-x-4 mb-4">
                    <Button
                        variant="secondary"
                        className="bg-[rgb(255,200,0)] text-black hover:bg-[rgb(215,160,0)]"
                        onClick={handlePostSaveDraftClick}
                        disabled={saving}
                    >
                        Save as Draft
                    </Button>
                    <Button
                        variant="secondary"
                        className="bg-[rgb(40,160,30)] text-white hover:bg-[rgb(40,120,30)]"
                        onClick={handlePostSubmitClick}
                        disabled={saving}
                    >
                        Post
                    </Button>
                </div>
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
                        />
                    </div>
                </div>
            </div>
        </div>
    );
}

export default NewPostPage;