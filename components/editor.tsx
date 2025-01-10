import React from "react";
import dynamic from "next/dynamic";
import {
  ContentBlock,
  EditorState,
  RichUtils,
} from "draft-js";
import "draft-js/dist/Draft.css";
import {
  BoldIcon,
  CodeIcon,
  Heading1Icon,
  Heading2Icon,
  ItalicIcon,
  ListIcon,
  ListOrderedIcon,
  QuoteIcon,
  UnderlineIcon
} from "lucide-react";

interface TextEditorProps {
  editorState: EditorState;
  setEditorState: (e: EditorState) => void;
  readOnly?: boolean;
}

// Dynamically import Draft.js Editor to prevent SSR issues
const DraftEditor = dynamic(() => import("draft-js").then((mod) => mod.Editor), {
  ssr: false,
});

const TextEditor = ({ editorState, setEditorState, readOnly }: TextEditorProps) => {

  // Custom key binding function
  // const keyBindingFn = (event: React.KeyboardEvent): string | null => {
  //   if (event.key === 'Tab') {
  //     return 'tab-command'; // Define a custom command for the Tab key
  //   }
  //   return getDefaultKeyBinding(event); // Use default key bindings for other keys
  // };

  // Handle key commands like bold, italic, etc.
  const handleKeyCommand = (command: string, state: EditorState): "handled" | "not-handled" => {
    const newState = RichUtils.handleKeyCommand(state, command);
    if (command === 'tab-command') {
      // Apply bullet list style when Tab is pressed
      const newState = RichUtils.toggleBlockType(editorState, 'unordered-list-item');
      setEditorState(newState);
      return 'handled';
    }

    if (newState) {
      setEditorState(newState);
      return "handled";
    }

    return "not-handled";
  };

  // Handle Tab key to manage list indentation
  const handleTab = (e: React.KeyboardEvent): void => {
    e.preventDefault(); // Prevent default tab behavior

    const currentBlockType = editorState.getCurrentContent().getBlockForKey(editorState.getSelection().getStartKey()).getType();
    if (currentBlockType === 'unstyled') {
      // Convert the current block to a bullet point list if it's not already a list
      setEditorState(RichUtils.toggleBlockType(editorState, 'unordered-list-item'));
    } else {
      // Handle increasing indentation for list items
      const newState = RichUtils.onTab(e, editorState, 4); // Set max depth for indentation
      if (newState !== editorState) {
        setEditorState(newState);
      }
    }
  };

  // Custom block style function
  const blockStyleFn = (contentBlock: ContentBlock): string => {
    const type = contentBlock.getType();
    switch (type) {
      case 'header-one':
        return 'header-one';
      case 'header-two':
        return 'header-two';
      case 'blockquote':
        return 'blockquote';
      case 'code-block':
        return 'code-block';
      default:
        return '';
    }
  };

  // Toggle list type (unordered/ordered)
  const toggleBlockType = (blockType: string) => {
    setEditorState(RichUtils.toggleBlockType(editorState, blockType));
  };

  // Apply inline styles (Bold, Italic, Underline)
  const applyInlineStyle = (style: string) => {
    setEditorState(RichUtils.toggleInlineStyle(editorState, style));
  };

  // Apply block styles (Headers, Blockquote, Code Block)
  const applyBlockStyle = (style: string) => {
    setEditorState(RichUtils.toggleBlockType(editorState, style));
  };

  // Check if a specific inline style is active
  const isInlineStyleActive = (style: string): boolean => {
    return editorState.getCurrentInlineStyle().has(style);
  };

  // Check if a specific block type is active
  const isBlockTypeActive = (type: string): boolean => {
    const selection = editorState.getSelection();
    const blockType = editorState
      .getCurrentContent()
      .getBlockForKey(selection.getStartKey())
      .getType();
    return blockType === type;
  };

  return (
    <div style={styles.container} className="bg-white">
      {!readOnly &&
        <div style={styles.toolbar}>
          {/* Inline Styles */}
          <button
            style={{
              ...styles.button,
              ...(isInlineStyleActive("BOLD") ? styles.activeButton : {}),
            }}
            onMouseDown={(e) => {
              e.preventDefault();
              applyInlineStyle("BOLD");
            }}
          >
            <BoldIcon className="h-4 w-4" />
          </button>
          <button
            style={{
              ...styles.button,
              ...(isInlineStyleActive("ITALIC") ? styles.activeButton : {}),
            }}
            onMouseDown={(e) => {
              e.preventDefault();
              applyInlineStyle("ITALIC");
            }}
          >
            <ItalicIcon className="h-4 w-4" />
          </button>
          <button
            style={{
              ...styles.button,
              ...(isInlineStyleActive("UNDERLINE") ? styles.activeButton : {}),
            }}
            onMouseDown={(e) => {
              e.preventDefault();
              applyInlineStyle("UNDERLINE");
            }}
          >
            <UnderlineIcon className="h-4 w-4" />
          </button>

          {/* Block Styles */}
          <button
            style={{
              ...styles.button,
              ...(isBlockTypeActive("header-one") ? styles.activeButton : {}),
            }}
            onMouseDown={(e) => {
              e.preventDefault();
              applyBlockStyle("header-one");
            }}
          >
            <Heading1Icon className="h-4 w-4" />
          </button>
          <button
            style={{
              ...styles.button,
              ...(isBlockTypeActive("header-two") ? styles.activeButton : {}),
            }}
            onMouseDown={(e) => {
              e.preventDefault();
              applyBlockStyle("header-two");
            }}
          >
            <Heading2Icon className="h-4 w-4" />
          </button>
          <button
            style={{
              ...styles.button,
              ...(isBlockTypeActive("blockquote") ? styles.activeButton : {}),
            }}
            onMouseDown={(e) => {
              e.preventDefault();
              applyBlockStyle("blockquote");
            }}
          >
            <QuoteIcon className="h-4 w-4" />
          </button>
          <button
            style={{
              ...styles.button,
              ...(isBlockTypeActive("code-block") ? styles.activeButton : {}),
            }}
            onMouseDown={(e) => {
              e.preventDefault();
              applyBlockStyle("code-block");
            }}
          >
            <CodeIcon className="h-4 w-4" />
          </button>
          <button
            style={{
              ...styles.button,
              ...(isBlockTypeActive("unordered-list-item") ? styles.activeButton : {}),
            }}
            onMouseDown={(e) => {
              e.preventDefault();
              toggleBlockType("unordered-list-item");
            }}
          >
            <ListIcon className="h-4 w-4" />
          </button>
          <button
            style={{
              ...styles.button,
              ...(isBlockTypeActive("ordered-list-item") ? styles.activeButton : {}),
            }}
            onMouseDown={(e) => {
              e.preventDefault();
              toggleBlockType("ordered-list-item");
            }}
          >
            <ListOrderedIcon className="h-4 w-4" />
          </button>
        </div>}
      <div style={{
        ...styles.editor,
        minHeight: readOnly ? "0px" : "300px"
      }}>
        <DraftEditor
          editorState={editorState}
          onChange={setEditorState}
          handleKeyCommand={handleKeyCommand}
          blockStyleFn={blockStyleFn}
          onTab={handleTab}
          placeholder="Start typing..."
          readOnly={readOnly}
        />
      </div>
      {/* <div style={styles.output}>
        <h3>Raw Content State:</h3>
        <pre>{JSON.stringify(getRawContent(), null, 2)}</pre>
      </div> */}
    </div>
  );
};

// Add CSS styles dynamically
const cssStyles = `
.header-one {
  font-size: 2em;
  font-weight: bold;
  margin-bottom: 0.5em;
}

.header-two {
  font-size: 1.5em;
  font-weight: bold;
  margin-bottom: 0.5em;
}

.blockquote {
  font-style: italic;
  border-left: 4px solid #ccc;
  padding-left: 10px;
  margin: 10px 0;
  color: #666;
}


.code-block {
  font-family: monospace;
  background-color: #f5f5f5;
  border: 1px solid #ddd;
  border-radius: 4px;
  padding: 10px;
  margin: 10px 0;
  white-space: pre-wrap;
}
`;

// Dynamically inject styles into the document
if (typeof document !== 'undefined') {
  const styleTag = document.createElement('style');
  styleTag.innerHTML = cssStyles;
  document.head.appendChild(styleTag);
}

// Inline styles for simplicity
const styles: { [key: string]: React.CSSProperties } = {
  container: {
    border: "1px solid #ccc",
    padding: "10px",
    borderRadius: "4px",
    maxWidth: "700px",
    margin: "20px auto",
    fontFamily: "Arial, sans-serif",
  },
  toolbar: {
    marginBottom: "10px",
    display: "flex",
    gap: "5px",
  },
  button: {
    padding: "5px 10px",
    cursor: "pointer",
    borderWidth: "1px",
    borderStyle: "solid",
    borderColor: "#ddd",
    borderRadius: "4px",
    backgroundColor: "#f5f5f5",
    fontSize: "14px",
    transition: "background-color 0.2s, color 0.2s",
  },
  activeButton: {
    backgroundColor: "#007BFF",
    color: "#fff",
    borderColor: "#0056b3", // Only override `borderColor`
  },
  editor: {
    minHeight: "300px",
    border: "1px solid #ddd",
    borderRadius: "4px",
    padding: "10px",
    cursor: "text",
  },
  output: {
    marginTop: "20px",
    backgroundColor: "#f9f9f9",
    padding: "10px",
    borderRadius: "4px",
    border: "1px solid #ddd",
  }
};

export default TextEditor;
