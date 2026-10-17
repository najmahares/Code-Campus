"use client";

import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Placeholder from "@tiptap/extension-placeholder";
import Link from "@tiptap/extension-link";
import { useEffect } from "react";
import {
  Bold,
  Italic,
  List,
  ListOrdered,
  Code2,
  Heading2,
  Link as LinkIcon,
  Undo2,
  Redo2,
} from "lucide-react";
import editorStyles from "./RichTextEditor.module.css";

type Props = {
  content: string;
  onChange: (html: string) => void;
  placeholder?: string;
  minHeight?: number;
};

export default function RichTextEditor({
  content,
  onChange,
  placeholder = "Start typing...",
  minHeight = 240,
}: Props) {
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: { levels: [2, 3] },
      }),
      Placeholder.configure({ placeholder }),
      Link.configure({ openOnClick: false, autolink: true }),
    ],
    content,
    immediatelyRender: false,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
    editorProps: {
      attributes: {
        class: editorStyles.prose,
        style: `min-height: ${minHeight}px`,
      },
    },
  });

  useEffect(() => {
    if (editor && content !== editor.getHTML()) {
      editor.commands.setContent(content, { emitUpdate: false });
    }
  }, []);

  if (!editor) return null;

  const btnClass = (active: boolean) =>
    `${editorStyles.toolbarBtn} ${active ? editorStyles.toolbarBtnActive : ""}`;

  return (
    <div className={editorStyles.wrapper}>
      <div className={editorStyles.toolbar}>
        <button
          type="button"
          className={btnClass(editor.isActive("bold"))}
          onClick={() => editor.chain().focus().toggleBold().run()}
          title="Bold (⌘B)"
        >
          <Bold size={15} />
        </button>
        <button
          type="button"
          className={btnClass(editor.isActive("italic"))}
          onClick={() => editor.chain().focus().toggleItalic().run()}
          title="Italic (⌘I)"
        >
          <Italic size={15} />
        </button>
        <button
          type="button"
          className={btnClass(editor.isActive("heading", { level: 2 }))}
          onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
          title="Heading"
        >
          <Heading2 size={15} />
        </button>
        <div className={editorStyles.toolbarDivider} />
        <button
          type="button"
          className={btnClass(editor.isActive("bulletList"))}
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          title="Bullet list"
        >
          <List size={15} />
        </button>
        <button
          type="button"
          className={btnClass(editor.isActive("orderedList"))}
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          title="Numbered list"
        >
          <ListOrdered size={15} />
        </button>
        <button
          type="button"
          className={btnClass(editor.isActive("codeBlock"))}
          onClick={() => editor.chain().focus().toggleCodeBlock().run()}
          title="Code block"
        >
          <Code2 size={15} />
        </button>
        <button
          type="button"
          className={btnClass(editor.isActive("link"))}
          onClick={() => {
            const url = window.prompt("Enter URL");
            if (url) editor.chain().focus().setLink({ href: url }).run();
            else editor.chain().focus().unsetLink().run();
          }}
          title="Link"
        >
          <LinkIcon size={15} />
        </button>
        <div className={editorStyles.toolbarDivider} />
        <button
          type="button"
          className={editorStyles.toolbarBtn}
          onClick={() => editor.chain().focus().undo().run()}
          disabled={!editor.can().undo()}
          title="Undo"
        >
          <Undo2 size={15} />
        </button>
        <button
          type="button"
          className={editorStyles.toolbarBtn}
          onClick={() => editor.chain().focus().redo().run()}
          disabled={!editor.can().redo()}
          title="Redo"
        >
          <Redo2 size={15} />
        </button>
      </div>
      <EditorContent editor={editor} />
    </div>
  );
}
