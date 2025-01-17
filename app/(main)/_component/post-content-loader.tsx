import React from "react";
import { Editor, EditorState, convertFromRaw } from "draft-js";

interface PostContentProps {
  content: string; // Stored content as JSON string
}

const PostContentLoader: React.FC<PostContentProps> = ({ content }) => {
  const editorState = React.useMemo(() => {
    try {
      const contentState = convertFromRaw(JSON.parse(content));
      return EditorState.createWithContent(contentState);
    } catch (error) {
      console.error("Invalid content format:", error);
      return EditorState.createEmpty();
    }
  }, [content]);

  return <Editor editorState={editorState} readOnly={true} onChange={() => {}} />;
};

export default PostContentLoader;
