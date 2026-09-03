'use client';

import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Link from '@tiptap/extension-link';
import { useEffect, useCallback } from 'react';

type Props = {
  content: string;
  onChange: (html: string) => void;
};

type ToolbarButtonProps = {
  onClick: () => void;
  isActive?: boolean;
  title: string;
  children: React.ReactNode;
};

function ToolbarButton({ onClick, isActive, title, children }: ToolbarButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      title={title}
      className={`px-2 py-1 rounded text-sm font-medium transition-colors ${
        isActive
          ? 'bg-amber-100 text-amber-800'
          : 'text-neutral-600 hover:bg-neutral-100 hover:text-neutral-900'
      }`}
    >
      {children}
    </button>
  );
}

export default function TiptapEditor({ content, onChange }: Props) {
  const editor = useEditor({
    extensions: [
      StarterKit,
      Link.configure({ openOnClick: false }),
    ],
    content,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
  });

  useEffect(() => {
    if (editor && content !== editor.getHTML()) {
      editor.commands.setContent(content);
    }
  }, [content, editor]);

  const setLink = useCallback(() => {
    if (!editor) return;
    const previousUrl = editor.getAttributes('link').href as string | undefined;
    const url = window.prompt('URL du lien', previousUrl ?? '');
    if (url === null) return;
    if (url === '') {
      editor.chain().focus().extendMarkRange('link').unsetLink().run();
      return;
    }
    editor.chain().focus().extendMarkRange('link').setLink({ href: url }).run();
  }, [editor]);

  if (!editor) return null;

  return (
    <div className="border border-neutral-300 rounded-lg overflow-hidden">
      {/* Toolbar */}
      <div className="flex flex-wrap gap-1 p-2 border-b border-neutral-200 bg-neutral-50">
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleBold().run()}
          isActive={editor.isActive('bold')}
          title="Gras"
        >
          <strong>G</strong>
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleItalic().run()}
          isActive={editor.isActive('italic')}
          title="Italique"
        >
          <em>I</em>
        </ToolbarButton>
        <div className="w-px bg-neutral-200 mx-1" />
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
          isActive={editor.isActive('heading', { level: 2 })}
          title="Titre H2"
        >
          H2
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
          isActive={editor.isActive('heading', { level: 3 })}
          title="Titre H3"
        >
          H3
        </ToolbarButton>
        <div className="w-px bg-neutral-200 mx-1" />
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          isActive={editor.isActive('bulletList')}
          title="Liste à puces"
        >
          • Liste
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          isActive={editor.isActive('orderedList')}
          title="Liste numérotée"
        >
          1. Liste
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleBlockquote().run()}
          isActive={editor.isActive('blockquote')}
          title="Citation"
        >
          ❝
        </ToolbarButton>
        <div className="w-px bg-neutral-200 mx-1" />
        <ToolbarButton
          onClick={setLink}
          isActive={editor.isActive('link')}
          title="Lien"
        >
          Lien
        </ToolbarButton>
      </div>

      {/* Editor content */}
      <style>{`
        .tiptap-content { outline: none; }
        .tiptap-content h2 { font-size: 1.5rem; font-weight: 700; margin: 1rem 0 0.5rem; }
        .tiptap-content h3 { font-size: 1.25rem; font-weight: 600; margin: 0.75rem 0 0.4rem; }
        .tiptap-content p { margin: 0.5rem 0; }
        .tiptap-content ul { list-style: disc; padding-left: 1.5rem; margin: 0.5rem 0; }
        .tiptap-content ol { list-style: decimal; padding-left: 1.5rem; margin: 0.5rem 0; }
        .tiptap-content blockquote { border-left: 3px solid #d97706; padding-left: 1rem; color: #6b7280; margin: 0.5rem 0; }
        .tiptap-content a { color: #d97706; text-decoration: underline; }
        .tiptap-content p.is-editor-empty:first-child::before {
          content: attr(data-placeholder);
          float: left;
          color: #9ca3af;
          pointer-events: none;
          height: 0;
        }
      `}</style>
      <EditorContent
        editor={editor}
        className="tiptap-content p-4 min-h-[300px] text-neutral-800 text-sm"
      />
    </div>
  );
}
