import { useEffect, type ReactNode } from "react";
import { EditorContent, useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Placeholder from "@tiptap/extension-placeholder";
import Underline from "@tiptap/extension-underline";
import TextAlign from "@tiptap/extension-text-align";
import { AlignCenter, AlignLeft, AlignRight, Bold, Italic, List, ListOrdered, Underline as UnderlineIcon } from "lucide-react";

type RichTextEditorProps = {
  id?: string;
  value: string;
  onChange: (html: string) => void;
  placeholder?: string;
  disabled?: boolean;
  invalid?: boolean;
  describedBy?: string;
};

function ToolbarButton({
  label,
  active,
  disabled,
  onClick,
  children,
}: {
  label: string;
  active?: boolean;
  disabled?: boolean;
  onClick: () => void;
  children: ReactNode;
}) {
  return (
    <button
      type="button"
      title={label}
      aria-label={label}
      aria-pressed={active}
      disabled={disabled}
      onClick={onClick}
      className={`inline-flex size-8 items-center justify-center rounded-md transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-secondary/40 disabled:cursor-not-allowed disabled:opacity-40 ${
        active ? "bg-primary text-white" : "text-primary hover:bg-primary-light"
      }`}
    >
      {children}
    </button>
  );
}

export function RichTextEditor({ id, value, onChange, placeholder = "اكتب هنا...", disabled = false, invalid = false, describedBy }: RichTextEditorProps) {
  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      StarterKit.configure({
        heading: false,
        codeBlock: false,
        blockquote: false,
        horizontalRule: false,
      }),
      Underline,
      Placeholder.configure({ placeholder }),
      TextAlign.configure({ types: ["paragraph"] }),
    ],
    content: value || "",
    editable: !disabled,
    editorProps: {
      attributes: {
        id: id ?? "",
        dir: "rtl",
        "aria-invalid": invalid ? "true" : "false",
        "aria-describedby": describedBy ?? "",
        class: "rich-text-editor-content min-h-40 px-3 py-2.5 text-sm leading-relaxed text-gray-800 outline-none",
      },
    },
    onUpdate: ({ editor: current }) => {
      onChange(current.getHTML());
    },
  });

  useEffect(() => {
    editor?.setEditable(!disabled);
  }, [disabled, editor]);

  if (!editor) {
    return <div className="min-h-52 rounded-lg border border-primary/15 bg-white" aria-hidden="true" />;
  }

  return (
    <div className={`overflow-hidden rounded-lg border bg-white transition focus-within:border-secondary focus-within:ring-2 focus-within:ring-secondary/20 ${invalid ? "border-red-500" : "border-primary/15"} ${disabled ? "opacity-70" : ""}`}>
      <div className="flex flex-wrap items-center gap-0.5 border-b border-primary/10 bg-primary-light/50 p-1.5" role="toolbar" aria-label="أدوات تنسيق الرد">
        <ToolbarButton label="عريض" active={editor.isActive("bold")} disabled={disabled} onClick={() => editor.chain().focus().toggleBold().run()}>
          <Bold className="size-3.5" aria-hidden="true" />
        </ToolbarButton>
        <ToolbarButton label="مائل" active={editor.isActive("italic")} disabled={disabled} onClick={() => editor.chain().focus().toggleItalic().run()}>
          <Italic className="size-3.5" aria-hidden="true" />
        </ToolbarButton>
        <ToolbarButton label="تسطير" active={editor.isActive("underline")} disabled={disabled} onClick={() => editor.chain().focus().toggleUnderline().run()}>
          <UnderlineIcon className="size-3.5" aria-hidden="true" />
        </ToolbarButton>
        <span className="mx-1 h-4 w-px bg-primary/15" aria-hidden="true" />
        <ToolbarButton label="قائمة نقطية" active={editor.isActive("bulletList")} disabled={disabled} onClick={() => editor.chain().focus().toggleBulletList().run()}>
          <List className="size-3.5" aria-hidden="true" />
        </ToolbarButton>
        <ToolbarButton label="قائمة رقمية" active={editor.isActive("orderedList")} disabled={disabled} onClick={() => editor.chain().focus().toggleOrderedList().run()}>
          <ListOrdered className="size-3.5" aria-hidden="true" />
        </ToolbarButton>
        <span className="mx-1 h-4 w-px bg-primary/15" aria-hidden="true" />
        <ToolbarButton label="محاذاة لليمين" active={editor.isActive({ textAlign: "right" })} disabled={disabled} onClick={() => editor.chain().focus().setTextAlign("right").run()}>
          <AlignRight className="size-3.5" aria-hidden="true" />
        </ToolbarButton>
        <ToolbarButton label="توسيط" active={editor.isActive({ textAlign: "center" })} disabled={disabled} onClick={() => editor.chain().focus().setTextAlign("center").run()}>
          <AlignCenter className="size-3.5" aria-hidden="true" />
        </ToolbarButton>
        <ToolbarButton label="محاذاة لليسار" active={editor.isActive({ textAlign: "left" })} disabled={disabled} onClick={() => editor.chain().focus().setTextAlign("left").run()}>
          <AlignLeft className="size-3.5" aria-hidden="true" />
        </ToolbarButton>
      </div>
      <EditorContent editor={editor} />
    </div>
  );
}
